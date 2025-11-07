import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { analyzeWithOllama } from '../services/ollama.service';
import { generateMeetingMinutes } from '../services/markdown.service';

export const analyzeMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        transcriptions: {
          orderBy: { segmentIndex: 'asc' }
        }
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.status !== 'transcribed') {
      return res.status(400).json({ error: 'Meeting must be transcribed before analysis' });
    }

    // Update status
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'analyzing' }
    });

    // Perform analysis asynchronously
    performAnalysisAsync(meetingId).catch(console.error);

    res.json({ 
      success: true, 
      message: 'Analysis started',
      meetingId 
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
};

async function performAnalysisAsync(meetingId: string) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        transcriptions: {
          orderBy: { segmentIndex: 'asc' }
        }
      }
    });

    if (!meeting) return;

    const fullTranscript = meeting.transcriptions.map(t => t.text).join(' ');

    // Analyze with Ollama LLM
    const analysis = await analyzeWithOllama(fullTranscript, meeting);

    // Save speakers
    for (const speaker of analysis.speakers) {
      await prisma.speaker.create({
        data: {
          meetingId,
          speakerLabel: speaker.label,
          speakerName: speaker.name || speaker.label,
          totalSpeakingTimeSeconds: speaker.speakingTime
        }
      });
    }

    // Save action items
    for (const item of analysis.actionItems) {
      await prisma.actionItem.create({
        data: {
          meetingId,
          title: item.title,
          assignee: item.assignee,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          priority: item.priority || 'medium'
        }
      });
    }

    // Save decisions
    for (const decision of analysis.decisions) {
      await prisma.decision.create({
        data: {
          meetingId,
          decisionText: decision.text,
          decisionTime: decision.timestamp ? new Date(decision.timestamp) : null,
          participants: decision.participants ? JSON.stringify(decision.participants) : null,
          consensusType: decision.consensusType
        }
      });
    }

    // Generate meeting minutes markdown
    const markdownContent = await generateMeetingMinutes(meetingId);

    // Save meeting minutes
    await prisma.meetingMinute.create({
      data: {
        meetingId,
        markdownContent,
        executiveSummary: analysis.summary
      }
    });

    // Update meeting status
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'completed' }
    });

    console.log(`Analysis completed for meeting ${meetingId}`);
  } catch (error) {
    console.error('Async analysis error:', error);
    
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'error' }
    });
  }
}

export const getAnalysis = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    
    const data = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        speakers: true,
        actionItems: true,
        decisions: true,
        meetingMinutes: true
      }
    });

    if (!data) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const regenerateSection = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { section } = req.body; // 'summary', 'actionItems', 'decisions'
    
    // Implementation for regenerating specific sections
    res.json({ 
      success: true, 
      message: `Regenerating ${section} for meeting ${meetingId}` 
    });
  } catch (error: any) {
    console.error('Regenerate error:', error);
    res.status(500).json({ error: error.message });
  }
};

import prisma from '../utils/prisma';

export async function generateMeetingMinutes(meetingId: string): Promise<string> {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      speakers: true,
      transcriptions: {
        orderBy: { segmentIndex: 'asc' },
        include: { speaker: true }
      },
      actionItems: {
        orderBy: { createdAt: 'asc' }
      },
      decisions: {
        orderBy: { createdAt: 'asc' }
      },
      meetingMinutes: true
    }
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  const frontMatter = generateYAMLFrontMatter(meeting);
  const executiveSummary = meeting.meetingMinutes?.executiveSummary || 'Meeting summary pending analysis.';
  const attendeesSection = generateAttendeesSection(meeting);
  const content = generateContent(meeting);
  const actionItemsSection = generateActionItemsSection(meeting.actionItems);
  const decisionsSection = generateDecisionsSection(meeting.decisions);
  const metadata = generateMetadata(meeting);

  return `${frontMatter}

# Meeting Minutes

## Executive Summary
${executiveSummary}

${attendeesSection}

---

${content}

---

${actionItemsSection}

---

${decisionsSection}

---

${metadata}

---

*End of Meeting Minutes*
*Document Version: 1.0*
*Generated: ${new Date().toISOString()}*
`;
}

function generateYAMLFrontMatter(meeting: any): string {
  const participants = meeting.participants ? JSON.parse(meeting.participants) : [];
  const participantsList = Array.isArray(participants)
    ? participants.map((p: any) => `  - "${typeof p === 'string' ? p : p.name}"`).join('\n')
    : '';

  return `---
title: "${meeting.title}"
date: "${new Date(meeting.meetingDate).toISOString().split('T')[0]}"
time: "${meeting.startTime || 'N/A'} - ${meeting.endTime || 'N/A'}"
duration: "${meeting.durationMinutes ? Math.floor(meeting.durationMinutes / 60) + 'h ' + (meeting.durationMinutes % 60) + 'm' : 'N/A'}"
location: "${meeting.location || 'Virtual'}"
participants:
${participantsList || '  - "Participants pending"'}
recording_status: "${meeting.audioFilePath ? 'Audio recorded' : 'No recording'}"
transcription_engine: "OpenAI Whisper"
analysis_timestamp: "${new Date().toISOString()}"
confidence_score: "${meeting.confidenceScore ? (meeting.confidenceScore * 100).toFixed(1) + '%' : 'N/A'}"
---`;
}

function generateAttendeesSection(meeting: any): string {
  let section = '## Attendees\n\n';

  const participants = meeting.participants ? JSON.parse(meeting.participants) : [];

  if (participants && participants.length > 0) {
    participants.forEach((participant: any) => {
      const name = typeof participant === 'string' ? participant : participant.name;
      section += `- **${name}**\n`;
    });
  } else if (meeting.speakers && meeting.speakers.length > 0) {
    // Fallback to identified speakers if no participants provided
    meeting.speakers.forEach((speaker: any) => {
      section += `- **${speaker.speakerName || speaker.speakerLabel}** (identified via voice)\n`;
    });
  } else {
    section += '*No attendees recorded*\n';
  }

  return section;
}

function generateContent(meeting: any): string {
  let content = '## Meeting Discussion\n\n';

  if (meeting.transcriptions && meeting.transcriptions.length > 0) {
    const segments = meeting.transcriptions;
    let currentTime = '';
    
    segments.forEach((seg: any, index: number) => {
      const timeLabel = seg.startTimeSeconds 
        ? formatTimestamp(seg.startTimeSeconds)
        : '';
      
      if (timeLabel && timeLabel !== currentTime) {
        currentTime = timeLabel;
        content += `\n### [${timeLabel}]\n`;
      }
      
      const speaker = seg.speaker?.speakerName || 'Speaker';
      content += `**${speaker}:** ${seg.text}\n\n`;
    });
  } else {
    content += 'Transcription pending or unavailable.\n\n';
  }

  return content;
}

function generateActionItemsSection(actionItems: any[]): string {
  if (actionItems.length === 0) {
    return '## Action Items\n\nNo action items identified.';
  }

  let section = '## Action Items\n\n';
  
  const highPriority = actionItems.filter(item => item.priority === 'high');
  const mediumPriority = actionItems.filter(item => item.priority === 'medium' || !item.priority);
  const lowPriority = actionItems.filter(item => item.priority === 'low');

  if (highPriority.length > 0) {
    section += '### High Priority\n';
    highPriority.forEach(item => {
      section += formatActionItem(item);
    });
    section += '\n';
  }

  if (mediumPriority.length > 0) {
    section += '### Medium Priority\n';
    mediumPriority.forEach(item => {
      section += formatActionItem(item);
    });
    section += '\n';
  }

  if (lowPriority.length > 0) {
    section += '### Low Priority\n';
    lowPriority.forEach(item => {
      section += formatActionItem(item);
    });
  }

  return section;
}

function formatActionItem(item: any): string {
  let line = `* [ ] **${item.title}**`;
  
  if (item.assignee) {
    line += ` (${item.assignee}`;
    if (item.dueDate) {
      line += `, ${new Date(item.dueDate).toISOString().split('T')[0]}`;
    }
    line += ')';
  }
  
  return line + '\n';
}

function generateDecisionsSection(decisions: any[]): string {
  if (decisions.length === 0) {
    return '## Decisions Made\n\nNo decisions identified.';
  }

  let section = '## Decisions Made\n\n';
  
  decisions.forEach(decision => {
    section += `> **${decision.decisionText}**\n`;
    
    if (decision.consensusType) {
      section += `> Consensus type: ${decision.consensusType}\n`;
    }
    
    if (decision.decisionTime) {
      const timestamp = new Date(decision.decisionTime);
      section += `> *Time: ${timestamp.toLocaleTimeString()}*\n`;
    }
    
    section += '\n';
  });

  return section;
}

function generateMetadata(meeting: any): string {
  return `## Meeting Metadata

**Generated by:** Voice-to-Note Taking Agent v1.0
**Processing Time:** ${meeting.processingTimeSeconds || 'N/A'} seconds
**Audio Quality:** ${meeting.audioQualityScore ? (meeting.audioQualityScore * 100).toFixed(1) + '%' : 'N/A'}
**Transcription Accuracy:** ${meeting.confidenceScore ? (meeting.confidenceScore * 100).toFixed(1) + '%' : 'N/A'}
**Speakers Identified:** ${meeting.speakers?.length || 0}
**Action Items:** ${meeting.actionItems?.length || 0}
**Decisions Documented:** ${meeting.decisions?.length || 0}

**Status:** Ready for review
**Meeting ID:** ${meeting.id}`;
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

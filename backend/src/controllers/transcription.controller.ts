import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { transcribeAudio } from '../services/whisper.service';
import path from 'path';

export const processTranscription = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (!meeting.audioFilePath) {
      return res.status(400).json({ error: 'No audio file found for this meeting' });
    }

    // Update meeting status
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'transcribing' }
    });

    // Process transcription (this will be done asynchronously)
    processTranscriptionAsync(meetingId, meeting.audioFilePath).catch(console.error);

    res.json({ 
      success: true, 
      message: 'Transcription processing started',
      meetingId 
    });
  } catch (error: any) {
    console.error('Process transcription error:', error);
    res.status(500).json({ error: error.message });
  }
};

async function processTranscriptionAsync(meetingId: string, audioFilePath: string) {
  try {
    const startTime = Date.now();
    
    // Call Whisper API for transcription
    const transcriptionResult = await transcribeAudio(audioFilePath);
    
    if (!transcriptionResult || !transcriptionResult.segments) {
      throw new Error('Transcription failed or returned no segments');
    }

    // Save transcription segments to database
    for (let i = 0; i < transcriptionResult.segments.length; i++) {
      const segment = transcriptionResult.segments[i];
      
      await prisma.transcription.create({
        data: {
          meetingId,
          segmentIndex: i,
          text: segment.text,
          startTimeSeconds: segment.start,
          endTimeSeconds: segment.end,
          confidenceScore: segment.confidence || null
        }
      });
    }

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    // Update meeting with transcription results
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'transcribed',
        processingTimeSeconds: processingTime,
        confidenceScore: transcriptionResult.confidence || null
      }
    });

    console.log(`Transcription completed for meeting ${meetingId} in ${processingTime}s`);
  } catch (error) {
    console.error('Async transcription error:', error);
    
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'error' }
    });
  }
}

export const getTranscriptionByMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    
    const transcriptions = await prisma.transcription.findMany({
      where: { meetingId },
      orderBy: { segmentIndex: 'asc' },
      include: { speaker: true }
    });

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { status: true, confidenceScore: true }
    });

    res.json({ 
      success: true, 
      transcriptions,
      status: meeting?.status,
      confidenceScore: meeting?.confidenceScore
    });
  } catch (error: any) {
    console.error('Get transcription error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSegment = async (req: Request, res: Response) => {
  try {
    const { segmentId } = req.params;
    const { text, speakerId } = req.body;
    
    const segment = await prisma.transcription.update({
      where: { id: segmentId },
      data: {
        ...(text && { text }),
        ...(speakerId && { speakerId })
      }
    });

    res.json({ success: true, segment });
  } catch (error: any) {
    console.error('Update segment error:', error);
    res.status(500).json({ error: error.message });
  }
};

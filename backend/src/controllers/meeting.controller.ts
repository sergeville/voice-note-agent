import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import path from 'path';
import fs from 'fs';

export const uploadAudio = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const { title, meetingDate, participants, location, meetingType } = req.body;
    
    const meeting = await prisma.meeting.create({
      data: {
        title: title || 'Untitled Meeting',
        meetingDate: new Date(meetingDate || Date.now()),
        participants: participants || null,
        location: location || null,
        meetingType: meetingType || 'general',
        audioFilePath: req.file.path,
        audioFileSize: req.file.size,
        status: 'uploaded'
      }
    });

    res.json({ 
      success: true, 
      meeting,
      message: 'Audio file uploaded successfully. Processing will begin shortly.'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { title, meetingDate, participants, location, meetingType } = req.body;
    
    const meeting = await prisma.meeting.create({
      data: {
        title: title || 'Live Recording',
        meetingDate: new Date(meetingDate || Date.now()),
        participants: participants || null,
        location: location || null,
        meetingType: meetingType || 'live',
        status: 'recording'
      }
    });

    res.json({ success: true, meeting });
  } catch (error: any) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllMeetings = async (req: Request, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    const where = status ? { status: status as string } : {};
    
    const meetings = await prisma.meeting.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            transcriptions: true,
            actionItems: true,
            decisions: true
          }
        }
      }
    });

    const total = await prisma.meeting.count({ where });

    res.json({ 
      success: true, 
      meetings,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error: any) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        transcriptions: {
          orderBy: { segmentIndex: 'asc' },
          include: { speaker: true }
        },
        speakers: true,
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
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ success: true, meeting });
  } catch (error: any) {
    console.error('Get meeting error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    res.json({ success: true, meeting });
  } catch (error: any) {
    console.error('Update meeting error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Delete associated audio file if exists
    if (meeting.audioFilePath && fs.existsSync(meeting.audioFilePath)) {
      fs.unlinkSync(meeting.audioFilePath);
    }

    await prisma.meeting.delete({ where: { id } });

    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error: any) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMeetingStats = async (req: Request, res: Response) => {
  try {
    const totalMeetings = await prisma.meeting.count();
    const completedMeetings = await prisma.meeting.count({ where: { status: 'completed' } });
    const processingMeetings = await prisma.meeting.count({ where: { status: 'processing' } });
    const totalActionItems = await prisma.actionItem.count();
    const totalDecisions = await prisma.decision.count();

    res.json({
      success: true,
      stats: {
        totalMeetings,
        completedMeetings,
        processingMeetings,
        totalActionItems,
        totalDecisions
      }
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

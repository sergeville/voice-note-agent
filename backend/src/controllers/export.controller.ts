import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { generateMeetingMinutes } from '../services/markdown.service';
import fs from 'fs';
import path from 'path';

export const exportMarkdown = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    
    let markdown = '';
    const existingMinutes = await prisma.meetingMinute.findUnique({
      where: { meetingId }
    });

    if (existingMinutes) {
      markdown = existingMinutes.markdownContent;
    } else {
      markdown = await generateMeetingMinutes(meetingId);
    }

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    const fileName = `${meeting?.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.md`;
    const filePath = path.join('./uploads/exports', fileName);

    fs.writeFileSync(filePath, markdown);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      fs.unlinkSync(filePath);
    });
  } catch (error: any) {
    console.error('Export markdown error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const exportPDF = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    
    // For PDF export, we would need a library like puppeteer or pdfkit
    // For now, return markdown with instructions
    const markdown = await generateMeetingMinutes(meetingId);
    
    res.json({
      success: true,
      message: 'PDF export requires additional setup. Please use markdown export for now.',
      markdown
    });
  } catch (error: any) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const exportDocx = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    
    // For DOCX export, we would need a library like docx
    // For now, return markdown with instructions
    const markdown = await generateMeetingMinutes(meetingId);
    
    res.json({
      success: true,
      message: 'DOCX export requires additional setup. Please use markdown export for now.',
      markdown
    });
  } catch (error: any) {
    console.error('Export DOCX error:', error);
    res.status(500).json({ error: error.message });
  }
};

import { Router } from 'express';
import * as transcriptionController from '../controllers/transcription.controller';

const router = Router();

// Process audio file for transcription
router.post('/process/:meetingId', transcriptionController.processTranscription);

// Get transcription for a meeting
router.get('/meeting/:meetingId', transcriptionController.getTranscriptionByMeeting);

// Update transcription segment
router.put('/segment/:segmentId', transcriptionController.updateSegment);

export default router;

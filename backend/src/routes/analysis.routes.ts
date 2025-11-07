import { Router } from 'express';
import * as analysisController from '../controllers/analysis.controller';

const router = Router();

// Analyze meeting transcription with LLM
router.post('/meeting/:meetingId', analysisController.analyzeMeeting);

// Get analysis results
router.get('/meeting/:meetingId', analysisController.getAnalysis);

// Regenerate specific sections
router.post('/regenerate/:meetingId', analysisController.regenerateSection);

export default router;

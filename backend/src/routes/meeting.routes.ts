import { Router } from 'express';
import { upload } from '../config/multer.config';
import * as meetingController from '../controllers/meeting.controller';

const router = Router();

// Create new meeting with audio upload
router.post('/upload', upload.single('audio'), meetingController.uploadAudio);

// Create meeting for live recording
router.post('/create', meetingController.createMeeting);

// Get all meetings
router.get('/', meetingController.getAllMeetings);

// Get meeting by ID
router.get('/:id', meetingController.getMeetingById);

// Update meeting
router.put('/:id', meetingController.updateMeeting);

// Delete meeting
router.delete('/:id', meetingController.deleteMeeting);

// Get meeting statistics
router.get('/stats/overview', meetingController.getMeetingStats);

export default router;

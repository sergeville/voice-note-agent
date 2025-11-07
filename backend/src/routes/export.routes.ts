import { Router } from 'express';
import * as exportController from '../controllers/export.controller';

const router = Router();

// Export meeting minutes as markdown
router.get('/markdown/:meetingId', exportController.exportMarkdown);

// Export meeting minutes as PDF
router.get('/pdf/:meetingId', exportController.exportPDF);

// Export meeting minutes as Word document
router.get('/docx/:meetingId', exportController.exportDocx);

export default router;

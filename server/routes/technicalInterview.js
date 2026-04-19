import express from 'express';
import { getTechnicalQuestions, technicalInterviewWebhook } from '../controllers/technicalInterviewController.js';
import { authMiddleware as protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/questions', protect, getTechnicalQuestions);
router.post('/chat', protect, technicalInterviewWebhook);

export default router;


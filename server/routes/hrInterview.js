import express from 'express';
import { hrInterviewWebhook } from '../controllers/hrInterviewController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/hr-interview - Proxy to n8n HR interview webhook
router.post('/', authMiddleware, hrInterviewWebhook);

export default router;

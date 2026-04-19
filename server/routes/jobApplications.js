import express from 'express';
import {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    updateApplicationStatus,
    deleteApplication,
    getApplicationStats,
    exportApplications,
    generateInterviewQuiz
} from '../controllers/jobApplicationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/job-applications', authMiddleware, getApplications);
router.get('/job-applications/stats', authMiddleware, getApplicationStats);
router.get('/job-applications/export', authMiddleware, exportApplications);
router.get('/job-applications/:id', authMiddleware, getApplicationById);
router.post('/job-applications', authMiddleware, createApplication);
router.put('/job-applications/:id', authMiddleware, updateApplication);
router.patch('/job-applications/:id/status', authMiddleware, updateApplicationStatus);
router.delete('/job-applications/:id', authMiddleware, deleteApplication);
router.post('/job-applications/:id/quiz', authMiddleware, generateInterviewQuiz);

export default router;

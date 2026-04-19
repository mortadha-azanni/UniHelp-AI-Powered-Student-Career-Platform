import express from 'express';
import {
    getPrograms,
    getProgramById,
    createProgramFromRoadmap,
    deleteProgram,
    chatWithLesson,
    toggleLessonComplete,
    getLessonChat
} from '../controllers/programController.js';
import { authMiddleware as protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Program CRUD
router.get('/', getPrograms);
router.post('/from-roadmap', createProgramFromRoadmap);

router.route('/:id')
    .get(getProgramById)
    .delete(deleteProgram);

// Lesson chat with AI tutor
router.post('/:id/modules/:moduleId/lessons/:lessonId/chat', chatWithLesson);
router.get('/:id/modules/:moduleId/lessons/:lessonId/chat', getLessonChat);

// Toggle lesson completion
router.patch('/:id/modules/:moduleId/lessons/:lessonId/toggle', toggleLessonComplete);

export default router;

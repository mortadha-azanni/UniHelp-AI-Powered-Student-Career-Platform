import express from 'express';
import {
    getRoadmaps,
    getRoadmapById,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap,
    generateRoadmap,
    generateNodeContent,
    getPublicRoadmaps,
    cloneRoadmap,
    toggleRoadmapVisibility,
    likeRoadmap,
    generateStudySchedule,
    getStudySchedule,
    toggleScheduleTask
} from '../controllers/roadmapController.js';
import { authMiddleware as protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Community Routes (must come before /:id to avoid conflict)
router.get('/public/all', getPublicRoadmaps);

router.route('/')
    .get(getRoadmaps)
    .post(createRoadmap);

// Full AI Roadmap Generation
router.post('/generate', generateRoadmap);

router.route('/:id')
    .get(getRoadmapById)
    .put(updateRoadmap)
    .delete(deleteRoadmap);

// Node AI Generation
router.post('/:id/nodes/:nodeId/generate', generateNodeContent);

// Community Interaction Routes
router.post('/:id/clone', cloneRoadmap);
router.patch('/:id/visibility', toggleRoadmapVisibility);
router.post('/:id/like', likeRoadmap);

// AI Study Schedule Routes
router.post('/:id/schedule/generate', generateStudySchedule);
router.get('/:id/schedule', getStudySchedule);
router.patch('/:id/schedule/tasks/:taskId/toggle', toggleScheduleTask);

export default router;

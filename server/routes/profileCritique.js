import express from 'express';
import { critiqueProfile } from '../controllers/profileCritiqueController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/profile-critique/:jobApplicationId - Get profile critique
router.post('/:jobApplicationId', authMiddleware, critiqueProfile);

export default router;

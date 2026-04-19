import express from 'express';
import {
    getProfile,
    updateProfile,
    updateSection,
    validateProfile,
    getSkillSuggestions
} from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.patch('/profile/:section', authMiddleware, updateSection);
router.get('/profile/validate', authMiddleware, validateProfile);
router.get('/profile/skills/suggestions', authMiddleware, getSkillSuggestions);

export default router;

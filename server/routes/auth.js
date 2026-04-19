import express from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);

// Protected routes
router.get('/me', authMiddleware, getMe);
import { getUserGamification } from '../controllers/gamificationController.js';
router.get('/gamification', authMiddleware, getUserGamification);

export default router;

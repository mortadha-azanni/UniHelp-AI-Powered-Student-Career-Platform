/**
 * app.js — Express application factory
 *
 * This file builds and configures the Express app (middleware, routes, error
 * handlers) but does NOT call app.listen(). Separating app creation from
 * server startup makes it possible to:
 *   1. Import the app in tests without binding a real port.
 *   2. Let server.js be the single place that calls listen(), preventing
 *      accidental double-starts.
 *
 * WHY THE LOOP HAPPENED (kept here for future readers):
 *   The original index.js both configured the app AND called app.listen() at
 *   module level. nodemon was watching ALL files in server/, including
 *   server/data/users.json and server/data/refreshTokens.json. Every time a
 *   user logged in or registered, fileStorage.js wrote to those JSON files,
 *   nodemon detected the change, restarted the process, and the startup logs
 *   ("Initializing server…" / "Server running on port 5000") appeared again.
 *
 *   The fix has two parts:
 *     a) nodemon.json — tells nodemon to IGNORE the data/ directory entirely.
 *     b) This app.js / server.js split — keeps listen() in one place and makes
 *        the architecture cleaner.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import jobApplicationRoutes from './routes/jobApplications.js';
import cvRoutes from './routes/cvs.js';
import todoRoutes from './routes/todos.js';
import profileCritiqueRoutes from './routes/profileCritique.js';
import hrInterviewRoutes from './routes/hrInterview.js';
import technicalInterviewRoutes from './routes/technicalInterview.js';
import cvAutoFillRoutes from './routes/cvAutoFill.js';
import roadmapRoutes from './routes/roadmap.js';
import programRoutes from './routes/programs.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables as early as possible so every module that imports
// app.js can rely on process.env being populated.
dotenv.config();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
    ],
    credentials: true
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                   // 5 requests per window per IP
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Authentication API is running',
        storage: process.env.MONGO_URI && process.env.MONGO_URI !== 'your_mongodb_cluster_uri'
            ? 'MongoDB'
            : 'JSON File'
    });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/profile', cvAutoFillRoutes);
app.use('/api', profileRoutes);
app.use('/api', jobApplicationRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api', todoRoutes);
app.use('/api/profile-critique', profileCritiqueRoutes);
app.use('/api/hr-interview', hrInterviewRoutes);
app.use('/api/technical-interview', technicalInterviewRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/programs', programRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;

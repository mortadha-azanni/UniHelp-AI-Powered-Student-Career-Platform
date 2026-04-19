/**
 * server.js — Single entry point that starts the HTTP server.
 *
 * Only this file calls app.listen(). This prevents the double-start problem
 * that occurred when the original index.js both configured the app and called
 * listen() at module level. Now nodemon points here, and listen() is called
 * exactly once per process.
 *
 * See nodemon.json for the ignore rules that prevent restarts when
 * server/data/*.json files are written during authentication operations.
 */

import app from './app.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

// ── Database connection ───────────────────────────────────────────────────────
const connectDB = async () => {
    if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_cluster_uri') {
        console.log('⚠️  MONGO_URI not configured — using JSON file storage');
        console.log('📁 Users stored in: server/data/users.json');
        console.log('📁 Tokens stored in: server/data/refreshTokens.json');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('⚠️  Falling back to JSON file storage');
    }
};

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const start = async () => {
    console.log('🔧 Initializing server… (PID:', process.pid, ')');

    try {
        await connectDB();
    } catch (err) {
        console.error('❌ Fatal: could not connect to database:', err.message);
        process.exit(1);
    }

    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}  [PID: ${process.pid}]`);
        console.log(`📍 API URL: http://localhost:${PORT}`);
        console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    });

    // Graceful shutdown — keeps nodemon restarts clean
    const shutdown = (signal) => {
        console.log(`\n🛑 ${signal} received — shutting down gracefully`);
        server.close(() => {
            console.log('✅ HTTP server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

start();

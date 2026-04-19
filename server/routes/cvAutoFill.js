import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import { autoFillProfileFromCV } from '../controllers/cvAutoFillController.js';

const router = express.Router();

// Store PDF in memory (no disk writes needed)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are accepted'), false);
        }
    }
});

// POST /api/profile/autofill-cv
router.post('/autofill-cv', authMiddleware, upload.single('cv'), autoFillProfileFromCV);

export default router;

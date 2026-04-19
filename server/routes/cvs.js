import express from 'express';
import { generateCV, getCVs, saveGeneratedCV } from '../controllers/cvController.js';
import { authMiddleware } from '../middleware/auth.js';
import { draftEmail, sendEmail } from "../controllers/emailController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/', authMiddleware, getCVs);

router.post('/generate', authMiddleware, generateCV);

router.post('/save', authMiddleware, saveGeneratedCV);


router.post("/draft", authMiddleware, draftEmail);
router.post("/send-email", authMiddleware, upload.single("cvFile"), sendEmail);

export default router;
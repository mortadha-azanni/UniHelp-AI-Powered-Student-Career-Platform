import Program from '../models/Program.js';
import Roadmap from '../models/Roadmap.js';
import mongoose from 'mongoose';
import { chatWithLessonTutor } from '../services/programChatChain.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── Create a program from a roadmap (called from "Sauvegarder" on roadmaps) ──
export const createProgramFromRoadmap = async (req, res) => {
    try {
        const { roadmapId } = req.body;

        if (!roadmapId) {
            return res.status(400).json({ success: false, message: 'roadmapId is required' });
        }

        const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user.id });
        if (!roadmap) {
            return res.status(404).json({ success: false, message: 'Roadmap not found' });
        }

        // Check if a program already exists for this roadmap
        const existing = await Program.findOne({ roadmapId: roadmapId, user: req.user.id });
        if (existing) {
            return res.json({ success: true, data: existing, message: 'Program already exists for this roadmap' });
        }

        // Group nodes into modules based on edges (connected components / sequential chains)
        // Simple approach: each node becomes a lesson, grouped into modules of ~3-4 lessons
        const nodes = roadmap.nodes || [];
        const moduleSize = 3;
        const modules = [];

        for (let i = 0; i < nodes.length; i += moduleSize) {
            const chunk = nodes.slice(i, i + moduleSize);
            const moduleIndex = Math.floor(i / moduleSize);

            modules.push({
                id: `mod_${moduleIndex + 1}`,
                title: chunk.length === 1
                    ? chunk[0].data?.label || `Module ${moduleIndex + 1}`
                    : `Module ${moduleIndex + 1}: ${chunk[0].data?.label || 'Apprentissage'}`,
                description: chunk.map(n => n.data?.label).join(' → '),
                duration: `${chunk.length * 45}min`,
                lessons: chunk.map((node, j) => ({
                    id: `lesson_${i + j + 1}`,
                    title: node.data?.label || `Leçon ${i + j + 1}`,
                    description: node.data?.description || '',
                    completed: node.data?.status === 'completed',
                    chatHistory: [],
                    completedAt: node.data?.status === 'completed' ? new Date() : undefined
                }))
            });
        }

        const newProgram = new Program({
            user: req.user.id,
            roadmapId: roadmap._id,
            title: roadmap.title,
            description: roadmap.description || `Programme d'apprentissage basé sur la roadmap "${roadmap.title}"`,
            category: roadmap.category || 'General',
            difficulty: roadmap.difficulty || 'Intermediate',
            modules
        });

        const saved = await newProgram.save();
        res.status(201).json({ success: true, data: saved });
    } catch (error) {
        console.error('Error creating program from roadmap:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ── Get all programs for the logged-in user ──
export const getPrograms = async (req, res) => {
    try {
        const programs = await Program.find({ user: req.user.id })
            .select('-modules.lessons.chatHistory') // Exclude chat history for list view
            .sort({ updatedAt: -1 });
        res.json({ success: true, count: programs.length, data: programs });
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ── Get a single program by ID (with full data) ──
export const getProgramById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid program ID' });
        }
        const program = await Program.findOne({ _id: req.params.id, user: req.user.id });
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.json({ success: true, data: program });
    } catch (error) {
        console.error('Error fetching program:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ── Delete a program ──
export const deleteProgram = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid program ID' });
        }
        const program = await Program.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.json({ success: true, message: 'Program deleted successfully' });
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ── Chat with AI tutor for a specific lesson ──
export const chatWithLesson = async (req, res) => {
    try {
        const { id, moduleId, lessonId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const program = await Program.findOne({ _id: id, user: req.user.id });
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const module = program.modules.find(m => m.id === moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const lesson = module.lessons.find(l => l.id === lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        // Add user message to history
        lesson.chatHistory.push({
            role: 'user',
            content: message
        });

        // Call AI tutor
        const aiResponse = await chatWithLessonTutor({
            programTitle: program.title,
            moduleTitle: module.title,
            lessonTitle: lesson.title,
            lessonDescription: lesson.description,
            userMessage: message,
            chatHistory: lesson.chatHistory
        });

        // Add AI response to history
        lesson.chatHistory.push({
            role: 'assistant',
            content: aiResponse.content
        });

        await program.save();

        res.json({
            success: true,
            data: {
                response: aiResponse.content,
                chatHistory: lesson.chatHistory
            }
        });
    } catch (error) {
        console.error('Error in lesson chat:', error);
        res.status(500).json({ success: false, message: 'Failed to get AI response', error: error.message });
    }
};

// ── Toggle lesson completion ──
export const toggleLessonComplete = async (req, res) => {
    try {
        const { id, moduleId, lessonId } = req.params;

        const program = await Program.findOne({ _id: id, user: req.user.id });
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const module = program.modules.find(m => m.id === moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const lesson = module.lessons.find(l => l.id === lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        lesson.completed = !lesson.completed;
        lesson.completedAt = lesson.completed ? new Date() : undefined;

        await program.save(); // pre-save hook recalculates progress

        res.json({ success: true, data: program });
    } catch (error) {
        console.error('Error toggling lesson:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ── Get chat history for a lesson ──
export const getLessonChat = async (req, res) => {
    try {
        const { id, moduleId, lessonId } = req.params;

        const program = await Program.findOne({ _id: id, user: req.user.id });
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const module = program.modules.find(m => m.id === moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const lesson = module.lessons.find(l => l.id === lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        res.json({
            success: true,
            data: {
                lesson: {
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    completed: lesson.completed
                },
                chatHistory: lesson.chatHistory
            }
        });
    } catch (error) {
        console.error('Error fetching lesson chat:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

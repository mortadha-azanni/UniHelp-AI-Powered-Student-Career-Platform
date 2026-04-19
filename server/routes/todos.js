import express from 'express';
import {
    getTodos,
    getTodoById,
    createTodo,
    updateTodo,
    toggleTodoStatus,
    deleteTodo,
    getTodoStats,
    generateSkillGapTodos,
    updateTodoProgress
} from '../controllers/todoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/todos', authMiddleware, getTodos);
router.get('/todos/stats', authMiddleware, getTodoStats);
router.get('/todos/:id', authMiddleware, getTodoById);
router.post('/todos', authMiddleware, createTodo);
router.post('/todos/generate-skill-gaps', authMiddleware, generateSkillGapTodos);
router.put('/todos/:id', authMiddleware, updateTodo);
router.patch('/todos/:id/toggle', authMiddleware, toggleTodoStatus);
router.patch('/todos/:id/progress', authMiddleware, updateTodoProgress);
router.delete('/todos/:id', authMiddleware, deleteTodo);

export default router;

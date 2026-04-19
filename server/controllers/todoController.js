import TodoItem from '../models/TodoItem.js';
import Profile from '../models/Profile.js';
import JobApplication from '../models/JobApplication.js';

// Get all todos for user
export const getTodos = async (req, res) => {
    try {
        const { status, category, sortBy = '-createdAt' } = req.query;

        const query = { user: req.user.id };

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        const todos = await TodoItem.find(query)
            .populate('relatedApplication', 'company position')
            .sort(sortBy);

        res.json({
            success: true,
            count: todos.length,
            data: todos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching todos',
            error: error.message
        });
    }
};

// Get single todo by ID
export const getTodoById = async (req, res) => {
    try {
        const todo = await TodoItem.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('relatedApplication', 'company position');

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        res.json({
            success: true,
            data: todo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching todo',
            error: error.message
        });
    }
};

// Create new todo
export const createTodo = async (req, res) => {
    try {
        // Clean up the data
        const cleanData = { ...req.body, user: req.user.id };

        // Remove empty optional fields
        if (!cleanData.description) delete cleanData.description;
        if (!cleanData.relatedSkill) delete cleanData.relatedSkill;
        if (!cleanData.relatedApplication) delete cleanData.relatedApplication;
        if (!cleanData.dueDate) delete cleanData.dueDate;
        if (!cleanData.resources || cleanData.resources.length === 0) delete cleanData.resources;

        const todo = await TodoItem.create(cleanData);

        const populatedTodo = await TodoItem.findById(todo._id)
            .populate('relatedApplication', 'company position');

        res.status(201).json({
            success: true,
            message: 'Todo created successfully',
            data: populatedTodo
        });
    } catch (error) {
        console.error('Create todo error:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating todo',
            error: error.message
        });
    }
};

// Update todo
export const updateTodo = async (req, res) => {
    try {
        const todo = await TodoItem.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        ).populate('relatedApplication', 'company position');

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        res.json({
            success: true,
            message: 'Todo updated successfully',
            data: todo
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating todo',
            error: error.message
        });
    }
};

// Toggle todo status
export const toggleTodoStatus = async (req, res) => {
    try {
        const todo = await TodoItem.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        await todo.toggleComplete();

        const populatedTodo = await TodoItem.findById(todo._id)
            .populate('relatedApplication', 'company position');

        res.json({
            success: true,
            message: 'Todo status toggled successfully',
            data: populatedTodo
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error toggling todo status',
            error: error.message
        });
    }
};

// Delete todo
export const deleteTodo = async (req, res) => {
    try {
        const todo = await TodoItem.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        res.json({
            success: true,
            message: 'Todo deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting todo',
            error: error.message
        });
    }
};

// Get todo statistics
export const getTodoStats = async (req, res) => {
    try {
        const stats = await TodoItem.getStats(req.user.id);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching todo statistics',
            error: error.message
        });
    }
};

// Auto-generate skill gap todos
export const generateSkillGapTodos = async (req, res) => {
    try {
        const { applicationId } = req.body;

        if (!applicationId) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required'
            });
        }

        // Get the job application
        const application = await JobApplication.findOne({
            _id: applicationId,
            user: req.user.id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Get user's profile
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Extract current skills
        const currentSkills = [
            ...profile.skills.technical.map(s => s.name),
            ...profile.skills.soft.map(s => s.name)
        ];

        // Generate skill gap todos
        const gapTodos = await TodoItem.generateSkillGaps(
            req.user.id,
            application.jobRequirements || [],
            currentSkills
        );

        // Add application reference
        const todosWithApp = gapTodos.map(todo => ({
            ...todo,
            relatedApplication: applicationId
        }));

        // Create todos in database
        const createdTodos = await TodoItem.insertMany(todosWithApp);

        res.status(201).json({
            success: true,
            message: `Generated ${createdTodos.length} skill gap todos`,
            data: createdTodos
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error generating skill gap todos',
            error: error.message
        });
    }
};

// Bulk update todo progress
export const updateTodoProgress = async (req, res) => {
    try {
        const { progress } = req.body;

        if (progress === undefined || progress < 0 || progress > 100) {
            return res.status(400).json({
                success: false,
                message: 'Progress must be between 0 and 100'
            });
        }

        const todo = await TodoItem.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        todo.progress = progress;

        // Auto-update status based on progress
        if (progress === 0) {
            todo.status = 'Todo';
        } else if (progress === 100) {
            todo.status = 'Completed';
        } else {
            todo.status = 'In Progress';
        }

        await todo.save();

        res.json({
            success: true,
            message: 'Todo progress updated successfully',
            data: todo
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating todo progress',
            error: error.message
        });
    }
};

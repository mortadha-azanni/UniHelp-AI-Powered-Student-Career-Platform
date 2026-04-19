import mongoose from 'mongoose';

const todoItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['Skill Gap', 'Learning Objective', 'Application Follow-up', 'General'],
        default: 'General',
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Todo', 'In Progress', 'Completed'],
        default: 'Todo'
    },
    relatedSkill: {
        type: String,
        trim: true
    },
    relatedApplication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication'
    },
    dueDate: {
        type: Date
    },
    completedDate: {
        type: Date
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    resources: [{
        type: {
            type: String,
            enum: ['Link', 'Course', 'Book', 'Video', 'Article'],
            default: 'Link'
        },
        title: String,
        url: String,
        notes: String
    }]
}, {
    timestamps: true
});

// Indexes for efficient queries
todoItemSchema.index({ user: 1, status: 1 });
todoItemSchema.index({ user: 1, category: 1 });
todoItemSchema.index({ user: 1, dueDate: 1 });
todoItemSchema.index({ user: 1, priority: 1, status: 1 });

// Auto-set completedDate when status changes to Completed
todoItemSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === 'Completed' && !this.completedDate) {
            this.completedDate = new Date();
            this.progress = 100;
        } else if (this.status !== 'Completed') {
            this.completedDate = null;
        }
    }
    next();
});

// Virtual for checking if overdue
todoItemSchema.virtual('isOverdue').get(function () {
    if (!this.dueDate || this.status === 'Completed') return false;
    return new Date() > this.dueDate;
});

// Virtual for display priority color
todoItemSchema.virtual('priorityColor').get(function () {
    const colors = {
        'Low': '#10b981',
        'Medium': '#f59e0b',
        'High': '#ef4444'
    };
    return colors[this.priority] || colors.Medium;
});

// Static method to get skill gaps from profile analysis
todoItemSchema.statics.generateSkillGaps = async function (userId, targetSkills, currentSkills) {
    const missingSkills = targetSkills.filter(skill =>
        !currentSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
    );

    const todos = missingSkills.map(skill => ({
        user: userId,
        title: `Learn ${skill}`,
        description: `Develop proficiency in ${skill} to meet job requirements`,
        category: 'Skill Gap',
        relatedSkill: skill,
        priority: 'High',
        status: 'Todo'
    }));

    return todos;
};

// Static method to get summary statistics
todoItemSchema.statics.getStats = async function (userId) {
    const total = await this.countDocuments({ user: userId });
    const completed = await this.countDocuments({ user: userId, status: 'Completed' });
    const inProgress = await this.countDocuments({ user: userId, status: 'In Progress' });
    const overdue = await this.countDocuments({
        user: userId,
        status: { $ne: 'Completed' },
        dueDate: { $lt: new Date() }
    });

    const byCategory = await this.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);

    return {
        total,
        completed,
        inProgress,
        pending: total - completed - inProgress,
        overdue,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
        byCategory: byCategory.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {})
    };
};

// Method to toggle completion
todoItemSchema.methods.toggleComplete = function () {
    if (this.status === 'Completed') {
        this.status = 'Todo';
        this.progress = 0;
    } else {
        this.status = 'Completed';
        this.progress = 100;
    }
    return this.save();
};

const TodoItem = mongoose.model('TodoItem', todoItemSchema);

export default TodoItem;

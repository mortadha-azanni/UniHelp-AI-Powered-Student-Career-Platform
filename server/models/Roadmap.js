import mongoose from 'mongoose';

const roadmapNodeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, default: 'default' }, // 'default', 'input', 'output', 'customNode'
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    data: {
        label: { type: String, required: true },
        description: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
        resources: [{
            title: String,
            url: String,
            type: { type: String, enum: ['article', 'video', 'github', 'documentation', 'other'] }
        }],
        estimatedMinutes: { type: Number, default: 0 },
        xpReward: { type: Number, default: 10 }
    }
});

const roadmapEdgeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    type: { type: String, default: 'smoothstep' },
    animated: { type: Boolean, default: false }
});

const roadmapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    clonedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    nodes: [roadmapNodeSchema],
    edges: [roadmapEdgeSchema],
    progress: {
        completedNodes: { type: Number, default: 0 },
        totalNodes: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model('Roadmap', roadmapSchema);

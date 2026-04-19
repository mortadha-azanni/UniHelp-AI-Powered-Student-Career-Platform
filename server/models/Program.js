import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const lessonSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    chatHistory: [chatMessageSchema],
    completedAt: { type: Date }
});

const moduleSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    duration: { type: String, default: '' },
    lessons: [lessonSchema],
    progress: { type: Number, default: 0 }
});

const programSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roadmapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap'
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
        default: 'Intermediate'
    },
    status: {
        type: String,
        enum: ['En cours', 'Terminé', 'Brouillon'],
        default: 'En cours'
    },
    modules: [moduleSchema],
    progress: {
        type: Number,
        default: 0
    },
    totalLessons: {
        type: Number,
        default: 0
    },
    completedLessons: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Auto-calculate progress before save
programSchema.pre('save', function (next) {
    let total = 0;
    let completed = 0;

    this.modules.forEach(mod => {
        mod.lessons.forEach(lesson => {
            total++;
            if (lesson.completed) completed++;
        });
        // Update module progress
        const modTotal = mod.lessons.length;
        const modCompleted = mod.lessons.filter(l => l.completed).length;
        mod.progress = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
    });

    this.totalLessons = total;
    this.completedLessons = completed;
    this.progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (this.progress === 100 && total > 0) {
        this.status = 'Terminé';
    } else if (this.progress > 0) {
        this.status = 'En cours';
    }

    next();
});

export default mongoose.model('Program', programSchema);

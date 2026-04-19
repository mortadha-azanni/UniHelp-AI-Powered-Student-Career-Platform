import mongoose from 'mongoose';

const studyTaskSchema = new mongoose.Schema({
    nodeId: { type: String, required: true }, // The ID of the node from the roadmap
    taskDescription: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 30 },
    completed: { type: Boolean, default: false }
});

const studyDaySchema = new mongoose.Schema({
    dayNumber: { type: Number, required: true },
    focusArea: { type: String, required: true },
    tasks: [studyTaskSchema]
});

const studyScheduleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roadmap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
        required: true
    },
    days: [studyDaySchema],
    progress: { type: Number, default: 0 } // Percentage of completion 0-100
}, { timestamps: true });

export default mongoose.model('StudySchedule', studyScheduleSchema);

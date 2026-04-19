import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    applicationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
        default: 'Applied',
        required: true
    },
    cvVersion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CV'
    },
    jobDescription: {
        type: String,
        required: [true, 'Job description is required'],
        trim: true
    },
    applicationUrl: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    interviewDates: [{
        date: Date,
        type: {
            type: String,
            enum: ['Phone', 'Video', 'In-Person', 'Technical', 'HR', 'Final'],
            default: 'Video'
        },
        notes: String
    }],
    salary: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'EUR'
        }
    },
    jobType: {
        type: String,
        enum: ['Internship', 'Full-Time', 'Part-Time', 'Contract', 'Freelance'],
        default: 'Full-Time'
    }
}, {
    timestamps: true
});

// Index for efficient queries
jobApplicationSchema.index({ user: 1, status: 1 });
jobApplicationSchema.index({ user: 1, applicationDate: -1 });

// Virtual for friendly ID
jobApplicationSchema.virtual('displayId').get(function () {
    return `APP-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Method to check if application is active
jobApplicationSchema.methods.isActive = function () {
    return !['Rejected', 'Withdrawn'].includes(this.status);
};

// Static method to get statistics
jobApplicationSchema.statics.getStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const total = await this.countDocuments({ user: userId });
    const offers = stats.find(s => s._id === 'Offer')?.count || 0;
    const interviews = stats.find(s => s._id === 'Interview')?.count || 0;

    return {
        total,
        byStatus: stats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {}),
        successRate: total > 0 ? ((offers / total) * 100).toFixed(1) : 0,
        interviewRate: total > 0 ? ((interviews / total) * 100).toFixed(1) : 0
    };
};

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;

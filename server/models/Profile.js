import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    gpa: String,
    achievements: [String]
});

const workExperienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    responsibilities: [String],
    achievements: [String]
});

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    technologies: [String],
    url: String,
    github: String,
    startDate: Date,
    endDate: Date
});

const technicalSkillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        enum: ['Frontend', 'Backend', 'Mobile', 'Database', 'DevOps', 'Testing', 'Design', 'Other']
    },
    proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
    }
});

const softSkillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
    }
});

const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issuer: String,
    date: Date,
    expirationDate: Date,
    url: String
});

const languageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    proficiency: {
        type: String,
        enum: ['Native', 'Fluent', 'Professional', 'Limited'],
        default: 'Professional'
    }
});

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    personalInfo: {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        country: String,
        linkedin: String,
        github: String,
        website: String,
        summary: String
    },
    education: [educationSchema],
    workExperience: [workExperienceSchema],
    projects: [projectSchema],
    skills: {
        technical: [technicalSkillSchema],
        soft: [softSkillSchema]
    },
    certifications: [certificationSchema],
    languages: [languageSchema],
    completeness: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update lastUpdated on save
profileSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

// Method to calculate profile completeness
profileSchema.methods.calculateCompleteness = function () {
    let score = 0;

    // Personal Info (20%)
    const personalFields = ['fullName', 'phone', 'summary'];
    const personalFilled = personalFields.filter(field => this.personalInfo[field]).length;
    score += (personalFilled / personalFields.length) * 20;

    // Education (20%)
    if (this.education.length > 0) score += 20;

    // Work Experience (25%)
    if (this.workExperience.length > 0) score += 25;

    // Skills (20%)
    if (this.skills.technical.length >= 5 && this.skills.soft.length >= 3) {
        score += 20;
    } else if (this.skills.technical.length > 0 || this.skills.soft.length > 0) {
        score += 10;
    }

    // Projects (10%)
    if (this.projects.length > 0) score += 10;

    // Certifications & Languages (5%)
    if (this.certifications.length > 0 || this.languages.length > 0) score += 5;

    this.completeness = Math.round(score);
    return this.completeness;
};

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;

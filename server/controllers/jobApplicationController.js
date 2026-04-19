import JobApplication from '../models/JobApplication.js';
import CV from '../models/CV.js';
import mongoose from 'mongoose';

// Get all applications for a user
export const getApplications = async (req, res) => {
    try {
        const { status, sortBy = '-applicationDate', search } = req.query;

        const query = { user: req.user.id };

        // Filter by status if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        // Search by company or position
        if (search) {
            query.$or = [
                { company: { $regex: search, $options: 'i' } },
                { position: { $regex: search, $options: 'i' } }
            ];
        }

        const applications = await JobApplication.find(query)
            .populate('cvVersion', 'versionName generatedDate latexCode')
            .sort(sortBy);

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
};

// Get single application by ID
export const getApplicationById = async (req, res) => {
    try {
        const application = await JobApplication.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('cvVersion');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching application',
            error: error.message
        });
    }
};

// Create new application
export const createApplication = async (req, res) => {
    try {
        // Clean up the data before creating
        const cleanData = { ...req.body, user: req.user.id };

        // Remove empty fields
        if (!cleanData.cvVersion) delete cleanData.cvVersion;
        if (!cleanData.location) delete cleanData.location;
        if (!cleanData.applicationUrl) delete cleanData.applicationUrl;
        if (!cleanData.notes) delete cleanData.notes;

        // Clean salary object
        if (cleanData.salary) {
            if (!cleanData.salary.min) delete cleanData.salary.min;
            if (!cleanData.salary.max) delete cleanData.salary.max;
            // Remove entire salary object if both min and max are missing
            if (!cleanData.salary.min && !cleanData.salary.max) {
                delete cleanData.salary;
            }
        }

        const application = await JobApplication.create(cleanData);

        // Increment CV usage count if CV version is specified
        if (application.cvVersion) {
            const cv = await CV.findById(application.cvVersion);
            if (cv) {
                await cv.incrementUsage();
            }
        }

        const populatedApplication = await JobApplication.findById(application._id)
            .populate('cvVersion', 'versionName generatedDate latexCode');

        res.status(201).json({
            success: true,
            message: 'Application created successfully',
            data: populatedApplication
        });
    } catch (error) {
        console.error('Create application error:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating application',
            error: error.message
        });
    }
};

// Update application
export const updateApplication = async (req, res) => {
    try {
        // Clean up the data before updating
        const cleanData = { ...req.body };

        // Remove empty fields
        if (!cleanData.cvVersion) delete cleanData.cvVersion;
        if (!cleanData.location) delete cleanData.location;
        if (!cleanData.applicationUrl) delete cleanData.applicationUrl;
        if (!cleanData.notes) delete cleanData.notes;

        // Clean salary object
        if (cleanData.salary) {
            if (!cleanData.salary.min) delete cleanData.salary.min;
            if (!cleanData.salary.max) delete cleanData.salary.max;
            // Remove entire salary object if both min and max are missing
            if (!cleanData.salary.min && !cleanData.salary.max) {
                delete cleanData.salary;
            }
        }

        const application = await JobApplication.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            cleanData,
            { new: true, runValidators: true }
        ).populate('cvVersion', 'versionName generatedDate latexCode');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Application updated successfully',
            data: application
        });
    } catch (error) {
        console.error('Update application error:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating application',
            error: error.message
        });
    }
};

// Update application status (for drag-and-drop)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const application = await JobApplication.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { status },
            { new: true, runValidators: true }
        ).populate('cvVersion', 'versionName generatedDate latexCode');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: application
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating status',
            error: error.message
        });
    }
};

// Delete application
export const deleteApplication = async (req, res) => {
    try {
        const application = await JobApplication.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting application',
            error: error.message
        });
    }
};

// Get application statistics
export const getApplicationStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const stats = await JobApplication.getStats(userId);

        // Calculate additional metrics
        const recentApplications = await JobApplication.find({ user: req.user.id })
            .sort('-applicationDate')
            .limit(5)
            .select('company position status applicationDate');

        res.json({
            success: true,
            data: {
                ...stats,
                recentActivity: recentApplications
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

// Export applications (CSV format)
export const exportApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find({ user: req.user.id })
            .populate('cvVersion', 'versionName')
            .sort('-applicationDate');

        // Create CSV
        const headers = ['Company', 'Position', 'Location', 'Status', 'Application Date', 'CV Version', 'Notes'];
        const rows = applications.map(app => [
            app.company,
            app.position,
            app.location || '',
            app.status,
            new Date(app.applicationDate).toLocaleDateString(),
            app.cvVersion?.versionName || 'N/A',
            (app.notes || '').replace(/,/g, ';') // Escape commas
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=job-applications.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error exporting applications',
            error: error.message
        });
    }
};

// Generate interview quiz
export const generateInterviewQuiz = async (req, res) => {
    try {
        const application = await JobApplication.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('cvVersion');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const questions = [];

        // CV-based questions (50%)
        if (application.cvVersion) {
            const cv = application.cvVersion;
            const skills = cv.extractSkills();
            const experienceKeywords = cv.extractExperienceKeywords();

            // Technical skills questions
            if (skills.length > 0) {
                const selectedSkills = skills.slice(0, 5);
                selectedSkills.forEach(skill => {
                    questions.push({
                        type: 'cv',
                        category: 'Technical Skills',
                        question: `Describe your experience with ${skill} and provide a specific example of how you've used it.`,
                        relatedTo: skill
                    });
                });
            }

            // Experience-based questions
            if (cv.profileSnapshot.workExperience && cv.profileSnapshot.workExperience.length > 0) {
                const recentExp = cv.profileSnapshot.workExperience[0];
                questions.push({
                    type: 'cv',
                    category: 'Experience',
                    question: `Tell me about your role as ${recentExp.position} at ${recentExp.company}. What were your main achievements?`,
                    relatedTo: `${recentExp.company} - ${recentExp.position}`
                });
            }

            // Project questions
            if (cv.profileSnapshot.projects && cv.profileSnapshot.projects.length > 0) {
                const project = cv.profileSnapshot.projects[0];
                questions.push({
                    type: 'cv',
                    category: 'Projects',
                    question: `Walk me through your ${project.name} project. What challenges did you face and how did you overcome them?`,
                    relatedTo: project.name
                });
            }
        }

        // Job description questions (50%)
        if (application.jobDescription && application.jobDescription.trim().length > 0) {
            // Extract key requirements from description (split by common delimiters)
            const requirements = application.jobDescription
                .split(/[,;\n]/)
                .map(req => req.trim())
                .filter(req => req.length > 10) // Filter out very short fragments
                .slice(0, 5); // Limit to 5 main requirements

            requirements.forEach(req => {
                questions.push({
                    type: 'requirement',
                    category: 'Job Requirements',
                    question: `How does your background align with this requirement: "${req}"?`,
                    relatedTo: req
                });

                questions.push({
                    type: 'requirement',
                    category: 'Practical Application',
                    question: `Can you provide an example of when you've worked with or demonstrated: ${req}?`,
                    relatedTo: req
                });
            });
        }

        // Common interview questions
        const commonQuestions = [
            {
                type: 'general',
                category: 'Behavioral',
                question: `Why are you interested in the ${application.position} position at ${application.company}?`,
                relatedTo: 'Motivation'
            },
            {
                type: 'general',
                category: 'Behavioral',
                question: 'What are your salary expectations for this role?',
                relatedTo: 'Compensation'
            },
            {
                type: 'general',
                category: 'Career Goals',
                question: 'Where do you see yourself in 5 years?',
                relatedTo: 'Future Planning'
            }
        ];

        questions.push(...commonQuestions);

        // Shuffle and limit to reasonable number
        const shuffled = questions.sort(() => 0.5 - Math.random());
        const finalQuestions = shuffled.slice(0, 15);

        res.json({
            success: true,
            data: {
                application: {
                    company: application.company,
                    position: application.position
                },
                questions: finalQuestions,
                totalQuestions: finalQuestions.length,
                breakdown: {
                    cvBased: finalQuestions.filter(q => q.type === 'cv').length,
                    requirementBased: finalQuestions.filter(q => q.type === 'requirement').length,
                    general: finalQuestions.filter(q => q.type === 'general').length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating quiz',
            error: error.message
        });
    }
};

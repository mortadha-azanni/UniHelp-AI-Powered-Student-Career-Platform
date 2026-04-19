import Profile from '../models/Profile.js';
import JobApplication from '../models/JobApplication.js';
import CV from '../models/CV.js';
import { generateCVLatex } from '../services/cvChain.js';

// Get all CVs for the user
export const getCVs = async (req, res) => {
    try {
        const cvs = await CV.find({ user: req.user.id })
            .sort({ generatedDate: -1 });

        res.json({
            success: true,
            count: cvs.length,
            data: cvs
        });
    } catch (error) {
        console.error('Error fetching CVs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching CVs',
            error: error.message
        });
    }
};

export const generateCV = async (req, res) => {
    try {
        const userId = req.user.id;
        const { jobApplicationId } = req.body;

        // Validate input
        if (!jobApplicationId) {
            return res.status(400).json({
                success: false,
                message: 'Job application ID is required.'
            });
        }

        // Fetch the profile
        const profile = await Profile.findOne({ user: userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please complete your profile first.'
            });
        }

        // Fetch the job application
        const jobApplication = await JobApplication.findOne({
            _id: jobApplicationId,
            user: userId
        });

        if (!jobApplication) {
            return res.status(404).json({
                success: false,
                message: 'Job application not found.'
            });
        }

        const jobDescription = jobApplication.jobDescription;

        try {
            console.log('Generating CV with LangChain...');
            const latexCode = await generateCVLatex(profile, jobDescription);

            res.json({
                success: true,
                latex: latexCode
            });

        } catch (aiError) {
            console.error('LangChain CV Generation Error:', aiError);
            return res.status(502).json({
                success: false,
                message: 'Failed to generate CV. Please try again.',
                error: aiError.message
            });
        }

    } catch (error) {
        console.error('CV Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

// Save generated CV to database
export const saveGeneratedCV = async (req, res) => {
    try {
        const userId = req.user.id;
        const { versionName, description, latexCode, jobApplicationId } = req.body;

        // Validation
        if (!versionName || !latexCode) {
            return res.status(400).json({
                success: false,
                message: 'Version name and LaTeX code are required.'
            });
        }

        // Fetch the profile for snapshot
        const profile = await Profile.findOne({ user: userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please complete your profile first.'
            });
        }

        // Create CV document
        const cv = new CV({
            user: userId,
            versionName,
            description: description || '',
            latexCode,
            jobApplication: jobApplicationId || null,
            profileSnapshot: {
                personalInfo: profile.personalInfo,
                education: profile.education,
                workExperience: profile.workExperience,
                projects: profile.projects,
                skills: profile.skills,
                certifications: profile.certifications,
                languages: profile.languages
            }
        });

        await cv.save();

        // If jobApplicationId is provided, attach CV to the job application
        if (jobApplicationId) {
            const jobApplication = await JobApplication.findOneAndUpdate(
                { _id: jobApplicationId, user: userId },
                { cvVersion: cv._id },
                { new: true, runValidators: false }
            ).populate('cvVersion', 'versionName generatedDate latexCode');

            if (!jobApplication) {
                return res.status(404).json({
                    success: false,
                    message: 'Job application not found.',
                    cvId: cv._id
                });
            }

            return res.status(201).json({
                success: true,
                message: 'CV saved and attached to job application successfully.',
                data: {
                    cv,
                    jobApplication: {
                        id: jobApplication._id,
                        company: jobApplication.company,
                        position: jobApplication.position,
                        cvVersion: jobApplication.cvVersion
                    },
                    attachedToApplication: true
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'CV saved successfully.',
            data: {
                cv,
                attachedToApplication: false
            }
        });

    } catch (error) {
        console.error('Save CV Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving CV',
            error: error.message
        });
    }
};
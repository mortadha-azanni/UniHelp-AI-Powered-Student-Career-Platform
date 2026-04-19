import Profile from '../models/Profile.js';
import JobApplication from '../models/JobApplication.js';
import { critiqueProfileWithLangChain } from '../services/profileCritiqueChain.js';

// Critique user profile using LangChain
export const critiqueProfile = async (req, res) => {
    try {
        const { jobApplicationId } = req.params;
        const userId = req.user.id;

        // Fetch user profile
        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please complete your profile first.'
            });
        }

        // Fetch job application
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

        const profileData = {
            personalInfo: profile.personalInfo,
            education: profile.education,
            workExperience: profile.workExperience,
            projects: profile.projects,
            skills: profile.skills,
            certifications: profile.certifications,
            languages: profile.languages
        };

        const jobDescription = jobApplication.jobDescription || '';

        console.log('Running profile critique with LangChain...');
        const critique = await critiqueProfileWithLangChain(profileData, jobDescription);

        res.json({
            success: true,
            data: {
                critique,
                jobApplication: {
                    id: jobApplication._id,
                    position: jobApplication.position,
                    company: jobApplication.company
                }
            }
        });

    } catch (error) {
        console.error('Profile critique error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing profile critique',
            error: error.message
        });
    }
};

import Profile from '../models/Profile.js';
import JobApplication from '../models/JobApplication.js';
import { generateTechnicalQuiz } from '../services/technicalQuizChain.js';
import { technicalInterviewChat } from '../services/technicalInterviewChain.js';

export const getTechnicalQuestions = async (req, res) => {
    try {
        const { jobApplicationId } = req.body;

        if (!jobApplicationId) {
            return res.status(400).json({
                success: false,
                message: 'jobApplicationId is required in the request body'
            });
        }

        const userId = req.user.id;

        // Fetch the profile to get technical skills
        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please complete your profile first.'
            });
        }

        // Fetch the job application for job description
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

        const technicalSkills = profile.skills?.technical || [];
        const jobDescription = jobApplication.jobDescription || '';

        console.log('Generating technical quiz with LangChain...');
        const data = await generateTechnicalQuiz(technicalSkills, jobDescription);

        if (!data) {
            return res.status(502).json({
                success: false,
                message: 'Received empty response from quiz service'
            });
        }

        res.json(data);

    } catch (error) {
        console.error('Technical Quiz error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error processing quiz request',
            error: error.message
        });
    }
};

export const technicalInterviewWebhook = async (req, res) => {
    try {
        const { sessionId, message, step, history, jobApplicationId } = req.body;

        if (!sessionId || message === undefined || step === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: sessionId, message, or step'
            });
        }

        const userId = req.user.id;

        // Fetch profile
        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found.'
            });
        }

        // Fetch job application if provided
        let jobDescription = '';
        if (jobApplicationId) {
            const jobApp = await JobApplication.findOne({ _id: jobApplicationId, user: userId });
            if (jobApp) {
                jobDescription = jobApp.jobDescription || '';
            }
        }

        const technicalSkills = profile.skills?.technical || [];

        console.log('Technical Interview Chat:', { sessionId, step });
        const result = await technicalInterviewChat({
            technicalSkills,
            jobDescription,
            message,
            step,
            history: history || []
        });

        res.json(result);

    } catch (error) {
        console.error('Technical Interview error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing technical interview request',
            error: error.message
        });
    }
};


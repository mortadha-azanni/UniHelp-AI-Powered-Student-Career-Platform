import Profile from '../models/Profile.js';
import { hrInterviewChat } from '../services/hrInterviewChain.js';

export const hrInterviewWebhook = async (req, res) => {
    try {
        const { sessionId, message, step, history } = req.body;

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
                message: 'Profile not found. Please complete your profile first.'
            });
        }

        console.log('HR Interview Chat:', { sessionId, step });
        const result = await hrInterviewChat({
            profile,
            message,
            step,
            history: history || []
        });

        res.json(result);

    } catch (error) {
        console.error('HR Interview error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing HR interview request',
            error: error.message
        });
    }
};

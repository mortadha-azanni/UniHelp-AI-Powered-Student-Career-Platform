import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';

// Calculate and get user Gamification stats
export const getUserGamification = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all roadmaps for the user
        const roadmaps = await Roadmap.find({ user: userId });

        let totalXP = 0;

        // Calculate XP from all completed nodes
        roadmaps.forEach(roadmap => {
            if (roadmap.nodes && Array.isArray(roadmap.nodes)) {
                roadmap.nodes.forEach(node => {
                    if (node.data && node.data.status === 'completed') {
                        // Default to 10 XP if xpReward is not explicitly set
                        totalXP += (node.data.xpReward || 10);
                    }
                });
            }
        });

        // Calculate level (1 Level = 100 XP)
        const currentLevel = 1 + Math.floor(totalXP / 100);

        // Update the user document
        const user = await User.findByIdAndUpdate(
            userId,
            {
                gamification: {
                    xp: totalXP,
                    level: currentLevel
                }
            },
            { new: true, runValidators: false }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            data: user.gamification
        });

    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

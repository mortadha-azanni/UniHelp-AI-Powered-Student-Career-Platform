import api from './axios';

/**
 * Get profile critique from n8n webhook
 * @param {string} jobApplicationId - The ID of the job application to critique profile against
 * @returns {Promise} - Critique results
 */
export const critiqueProfile = async (jobApplicationId) => {
    const response = await api.post(`/profile-critique/${jobApplicationId}`);
    return response.data;
};

export default {
    critiqueProfile
};

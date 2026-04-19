import api from './axios';

// Get user's profile
export const getProfile = async () => {
    const response = await api.get('/profile');
    return response.data;
};

// Update entire profile
export const updateProfile = async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
};

// Update specific section
export const updateSection = async (section, sectionData) => {
    const response = await api.patch(`/profile/${section}`, sectionData);
    return response.data;
};

// Validate profile completeness
export const validateProfile = async () => {
    const response = await api.get('/profile/validate');
    return response.data;
};

// Get skill suggestions
export const getSkillSuggestions = async (category = '', type = 'technical') => {
    const response = await api.get('/profile/skills/suggestions', {
        params: { category, type }
    });
    return response.data;
};

export default {
    getProfile,
    updateProfile,
    updateSection,
    validateProfile,
    getSkillSuggestions
};

import api from './axios';

export const getRoadmaps = async () => {
    const response = await api.get('/roadmaps');
    // Using the same structure as existing APIs: { data: { data: [...] } } or { data: [...] }
    return response.data?.data || response.data || [];
};

export const getRoadmapById = async (id) => {
    const response = await api.get(`/roadmaps/${id}`);
    return response.data?.data || response.data;
};

export const createRoadmap = async (roadmapData) => {
    const response = await api.post('/roadmaps', roadmapData);
    return response.data?.data || response.data;
};

export const generateRoadmapAI = async (goalData) => {
    const response = await api.post('/roadmaps/generate', goalData);
    return response.data?.data || response.data;
};

export const updateRoadmap = async (id, roadmapData) => {
    const response = await api.put(`/roadmaps/${id}`, roadmapData);
    return response.data?.data || response.data;
};

export const deleteRoadmap = async (id) => {
    const response = await api.delete(`/roadmaps/${id}`);
    return response.data;
};

export const generateNodeContent = async (roadmapId, nodeId) => {
    const response = await api.post(`/roadmaps/${roadmapId}/nodes/${nodeId}/generate`);
    return response.data?.data || response.data;
};

// --- Community Features ---

export const getPublicRoadmaps = async () => {
    const response = await api.get('/roadmaps/public/all');
    return response.data?.data || response.data || [];
};

export const cloneRoadmap = async (id) => {
    const response = await api.post(`/roadmaps/${id}/clone`);
    return response.data?.data || response.data;
};

export const toggleRoadmapVisibility = async (id) => {
    const response = await api.patch(`/roadmaps/${id}/visibility`);
    return response.data?.data || response.data;
};

export const likeRoadmap = async (id) => {
    const response = await api.post(`/roadmaps/${id}/like`);
    // Server returns { success, likesCount, data: roadmap } — return the roadmap
    return response.data?.data || response.data;
};

// --- AI Study Schedule Features ---

export const generateStudySchedule = async (id, data) => {
    const response = await api.post(`/roadmaps/${id}/schedule/generate`, data);
    return response.data?.data || response.data;
};

export const getStudySchedule = async (id) => {
    const response = await api.get(`/roadmaps/${id}/schedule`);
    return response.data?.data || response.data;
};

export const toggleScheduleTask = async (id, taskId) => {
    const response = await api.patch(`/roadmaps/${id}/schedule/tasks/${taskId}/toggle`);
    return response.data?.data || response.data;
};

import api from './axios';

// ── Program CRUD ──────────────────────────────────────────────────────────────

export const getPrograms = async () => {
    const response = await api.get('/programs');
    return response.data?.data || response.data || [];
};

export const getProgramById = async (id) => {
    const response = await api.get(`/programs/${id}`);
    return response.data?.data || response.data;
};

export const createProgramFromRoadmap = async (roadmapId) => {
    const response = await api.post('/programs/from-roadmap', { roadmapId });
    return response.data?.data || response.data;
};

export const deleteProgram = async (id) => {
    const response = await api.delete(`/programs/${id}`);
    return response.data;
};

// ── Lesson Chat ───────────────────────────────────────────────────────────────

export const sendLessonChat = async (programId, moduleId, lessonId, message) => {
    const response = await api.post(
        `/programs/${programId}/modules/${moduleId}/lessons/${lessonId}/chat`,
        { message }
    );
    return response.data?.data || response.data;
};

export const getLessonChat = async (programId, moduleId, lessonId) => {
    const response = await api.get(
        `/programs/${programId}/modules/${moduleId}/lessons/${lessonId}/chat`
    );
    return response.data?.data || response.data;
};

// ── Lesson Completion ─────────────────────────────────────────────────────────

export const toggleLessonComplete = async (programId, moduleId, lessonId) => {
    const response = await api.patch(
        `/programs/${programId}/modules/${moduleId}/lessons/${lessonId}/toggle`
    );
    return response.data?.data || response.data;
};

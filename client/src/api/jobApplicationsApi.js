import api from './axios.js';

// Get all job applications
export const getApplications = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }
    if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
    }
    if (filters.search) {
        params.append('search', filters.search);
    }

    const response = await api.get(`/job-applications?${params.toString()}`);
    return response.data;
};

// Get single application
export const getApplicationById = async (id) => {
    const response = await api.get(`/job-applications/${id}`);
    return response.data;
};

// Create new application
export const createApplication = async (applicationData) => {
    const response = await api.post('/job-applications', applicationData);
    return response.data;
};

// Update application
export const updateApplication = async (id, applicationData) => {
    const response = await api.put(`/job-applications/${id}`, applicationData);
    return response.data;
};

// Update application status (for drag-and-drop)
export const updateApplicationStatus = async (id, status) => {
    const response = await api.patch(`/job-applications/${id}/status`, { status });
    return response.data;
};

// Delete application
export const deleteApplication = async (id) => {
    const response = await api.delete(`/job-applications/${id}`);
    return response.data;
};

// Get application statistics
export const getApplicationStats = async () => {
    const response = await api.get('/job-applications/stats');
    return response.data;
};

// Export applications to CSV
export const exportApplications = async () => {
    const response = await api.get('/job-applications/export', {
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'job-applications.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'File downloaded successfully' };
};

// Generate interview quiz
export const generateInterviewQuiz = async (applicationId) => {
    const response = await api.post(`/job-applications/${applicationId}/quiz`);
    return response.data;
};

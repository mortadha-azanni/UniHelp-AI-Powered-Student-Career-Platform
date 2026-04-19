import api from './axios.js';

// Get all CV versions
export const getCVs = async () => {
    const response = await api.get('/cvs');
    return response.data;
};

// Get single CV
export const getCVById = async (id) => {
    const response = await api.get(`/cvs/${id}`);
    return response.data;
};

// Create new CV version from current profile
export const createCV = async (cvData) => {
    const response = await api.post('/cvs', cvData);
    return response.data;
};

// Update CV metadata
export const updateCV = async (id, cvData) => {
    const response = await api.put(`/cvs/${id}`, cvData);
    return response.data;
};

// Set CV as default
export const setDefaultCV = async (id) => {
    const response = await api.patch(`/cvs/${id}/set-default`);
    return response.data;
};

// Delete CV
export const deleteCV = async (id) => {
    const response = await api.delete(`/cvs/${id}`);
    return response.data;
};

// Download CV
export const downloadCV = async (id, versionName) => {
    const response = await api.get(`/cvs/${id}/download`, {
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const fileName = `cv-${versionName.replace(/\s/g, '-')}.json`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'CV downloaded successfully' };
};

// Get CV statistics
export const getCVStats = async () => {
    const response = await api.get('/cvs/stats');
    return response.data;
};

// Save generated CV with LaTeX code
export const saveGeneratedCV = async (cvData) => {
    const response = await api.post('/cvs/save', cvData);
    return response.data;
};


// New: Draft the application email
export const draftEmail = async (draftData) => {
    const response = await api.post('/cvs/draft', draftData);
    return response.data;
};

// New: Send the email with the PDF attachment
export const sendEmail = async (formData) => {
    const response = await api.post('/cvs/send-email', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
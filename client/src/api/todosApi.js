import api from './axios.js';

// Get all todos
export const getTodos = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }
    if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
    }
    if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
    }

    const response = await api.get(`/todos?${params.toString()}`);
    return response.data;
};

// Get single todo
export const getTodoById = async (id) => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
};

// Create new todo
export const createTodo = async (todoData) => {
    const response = await api.post('/todos', todoData);
    return response.data;
};

// Update todo
export const updateTodo = async (id, todoData) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
};

// Toggle todo status
export const toggleTodoStatus = async (id) => {
    const response = await api.patch(`/todos/${id}/toggle`);
    return response.data;
};

// Update todo progress
export const updateTodoProgress = async (id, progress) => {
    const response = await api.patch(`/todos/${id}/progress`, { progress });
    return response.data;
};

// Delete todo
export const deleteTodo = async (id) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
};

// Get todo statistics
export const getTodoStats = async () => {
    const response = await api.get('/todos/stats');
    return response.data;
};

// Generate skill gap todos from job application
export const generateSkillGapTodos = async (applicationId) => {
    const response = await api.post('/todos/generate-skill-gaps', { applicationId });
    return response.data;
};

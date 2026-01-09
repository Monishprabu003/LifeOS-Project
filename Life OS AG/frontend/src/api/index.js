import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('lifeos_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

export const kernelAPI = {
    getEvents: () => api.get('/kernel/events'),
    getStatus: () => api.get('/kernel/status'),
    logGenericEvent: (data) => api.post('/kernel/event', data),
    deleteEvent: (id) => api.delete(`/kernel/events/${id}`),
    deleteAllLogs: () => api.delete('/kernel/logs'),
};

export const habitsAPI = {
    getHabits: () => api.get('/habits'),
    createHabit: (data) => api.post('/habits', data),
    completeHabit: (id) => api.post(`/habits/${id}/complete`),
    deleteHabit: (id) => api.delete(`/habits/${id}`),
};

export const financeAPI = {
    getTransactions: () => api.get('/finance'),
    createTransaction: (data) => api.post('/finance', data),
    deleteTransaction: (id) => api.delete(`/finance/${id}`),
};

export const goalsAPI = {
    getGoals: () => api.get('/goals'),
    createGoal: (data) => api.post('/goals', data),
    updateProgress: (id, progress) => api.patch(`/goals/${id}/progress`, { progress }),
    deleteGoal: (id) => api.delete(`/goals/${id}`),
};

export const healthAPI = {
    getLogs: () => api.get('/health'),
    createLog: (data) => api.post('/health', data),
    deleteLog: (id) => api.delete(`/health/${id}`),
};

export const socialAPI = {
    getRelationships: () => api.get('/social'),
    createRelationship: (data) => api.post('/social', data),
    logInteraction: (id, data) => api.post(`/social/${id}/interact`, data),
    deleteRelationship: (id) => api.delete(`/social/${id}`),
};

export const tasksAPI = {
    getTasks: () => api.get('/tasks'),
    createTask: (data) => api.post('/tasks', data),
    toggleTask: (id) => api.post(`/tasks/${id}/toggle`),
    deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const userAPI = {
    updateProfile: (data) => api.put('/users/profile', data),
    updateSettings: (data) => api.put('/users/settings', data),
    changePassword: (data) => api.put('/users/password', data),
};

export default api;

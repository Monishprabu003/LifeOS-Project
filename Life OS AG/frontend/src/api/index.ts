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
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

export const kernelAPI = {
    getEvents: () => api.get('/kernel/events'),
    getStatus: () => api.get('/kernel/status'),
    logGenericEvent: (data: any) => api.post('/kernel/event', data),
    deleteEvent: (id: string) => api.delete(`/kernel/events/${id}`),
    deleteAllLogs: () => api.delete('/kernel/logs'),
};

export const habitsAPI = {
    getHabits: () => api.get('/habits'),
    createHabit: (data: any) => api.post('/habits', data),
    completeHabit: (id: string) => api.post(`/habits/${id}/complete`),
    deleteHabit: (id: string) => api.delete(`/habits/${id}`),
};

export const financeAPI = {
    getTransactions: () => api.get('/finance'),
    createTransaction: (data: any) => api.post('/finance', data),
    deleteTransaction: (id: string) => api.delete(`/finance/${id}`),
};

export const goalsAPI = {
    getGoals: () => api.get('/goals'),
    createGoal: (data: any) => api.post('/goals', data),
    updateProgress: (id: string, progress: number) => api.patch(`/goals/${id}/progress`, { progress }),
    deleteGoal: (id: string) => api.delete(`/goals/${id}`),
};

export const healthAPI = {
    getLogs: () => api.get('/health'),
    createLog: (data: any) => api.post('/health', data),
    deleteLog: (id: string) => api.delete(`/health/${id}`),
};

export const socialAPI = {
    getRelationships: () => api.get('/social'),
    createRelationship: (data: any) => api.post('/social', data),
    logInteraction: (id: string, data: any) => api.post(`/social/${id}/interact`, data),
    deleteRelationship: (id: string) => api.delete(`/social/${id}`),
};

export const tasksAPI = {
    createTask: (data: any) => api.post('/tasks', data),
    toggleTask: (id: string) => api.post(`/tasks/${id}/toggle`),
};

export const aiAPI = {
    getInsight: () => api.get('/ai/insight'),
    chat: (message: string) => api.post('/ai/chat', { message }),
};

export default api;

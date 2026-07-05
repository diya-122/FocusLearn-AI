import api from './api';

const courseService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.difficulty && filters.difficulty !== 'All') params.append('difficulty', filters.difficulty);
    if (filters.search) params.append('search', filters.search);
    
    // In a real app, sorting might be handled by the backend
    // For now, we'll fetch all and let the component handle sorting if backend doesn't support it
    const response = await api.get(`/courses/?${params.toString()}`);
    
    let filtered = response.data.results || response.data;
    if (Array.isArray(filtered)) {
      if (filters.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
      if (filters.sort === 'students') filtered.sort((a, b) => b.students - a.students);
      if (filters.sort === 'newest') filtered.sort((a, b) => b.id - a.id);
    }
    
    return { data: filtered };
  },

  getById: async (id) => {
    const response = await api.get(`/courses/${id}/`);
    return { data: response.data };
  },

  delete: async (id) => {
    const response = await api.delete(`/courses/${id}/`);
    return { data: response.data };
  },

  enroll: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll/`);
    return { data: response.data };
  },

  getEnrolled: async () => {
    const response = await api.get('/courses/my/');
    return { data: response.data.results || response.data };
  },

  updateProgress: async (courseId, progress) => {
    // Optional: a real backend might track progress per lesson instead of just a number
    // For this prototype, we'll just return success.
    return { data: { courseId, progress } };
  },

  importVideo: async (formData) => {
    const response = await api.post('/courses/import-video/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { data: response.data };
  },

  getLesson: async (lessonId) => {
    const response = await api.get(`/courses/lessons/${lessonId}/`);
    return { data: response.data };
  },

  generateSummary: async (lessonId) => {
    const response = await api.post(`/courses/lessons/${lessonId}/summarize/`);
    return { data: response.data };
  },

  chatWithLesson: async (lessonId, message) => {
    const response = await api.post(`/courses/lessons/${lessonId}/chat/`, { message });
    return { data: response.data };
  },

  getNotes: async (lessonId) => {
    const response = await api.get(`/courses/lessons/${lessonId}/notes/`);
    return { data: response.data };
  },

  saveNotes: async (lessonId, content) => {
    const response = await api.put(`/courses/lessons/${lessonId}/notes/`, { content });
    return { data: response.data };
  },

  getChatHistory: async (lessonId) => {
    const response = await api.get(`/courses/lessons/${lessonId}/chat-history/`);
    return { data: response.data };
  },
};

export default courseService;

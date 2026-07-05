import api from './api';

const summaryService = {
  getByCourse: async (courseId) => {
    // Currently summaries might not be directly linked to courses in the backend DB unless implemented
    // This assumes there's an endpoint or we filter
    // For now we'll fetch all and filter client side if no course filter endpoint exists
    return { data: [] }; // Replace with real call when summary backend is ready
  },

  getAll: async () => {
    // Replace with real call when summary backend is ready
    return { data: [] };
  },

  getById: async (id) => {
    // Replace with real call when summary backend is ready
    return { data: null };
  },

  generate: async (lessonId, transcript) => {
    // Replace with real call to /api/summaries/generate/
    // Assuming you build a summary app similarly:
    // const response = await api.post('/summaries/generate/', { lesson_id: lessonId, transcript });
    return {
      data: {
        id: Date.now(),
        lessonId,
        generatedAt: new Date().toISOString(),
        sections: [
          { title: 'Key Concepts', content: 'AI generation will go here once the summary backend is linked.', isKey: true },
        ],
      },
    };
  },

  downloadPdf: async (summaryId) => {
    return { data: { url: '#', message: 'PDF download initiated' } };
  },
};

export default summaryService;

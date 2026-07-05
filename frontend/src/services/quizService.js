import api from './api';

const quizService = {
  getByCourse: async (courseId) => {
    const response = await api.get(`/quiz/?course=${courseId}`);
    return { data: response.data };
  },

  getAll: async () => {
    const response = await api.get('/quiz/');
    return { data: response.data };
  },

  getById: async (id) => {
    const response = await api.get(`/quiz/${id}/`);
    return { data: response.data };
  },

  submit: async (quizId, answers) => {
    // The backend expects an object for answers_json: { question_id: chosen_index }
    // The frontend's answers array maps exactly to question indices or IDs?
    // In original code: answers was an array of chosen indices mapping to quiz.questions order
    // Let's format it for the backend:
    const quizResponse = await api.get(`/quiz/${quizId}/`);
    const questions = quizResponse.data.questions;
    
    let answersJson = {};
    if (questions) {
      questions.forEach((q, index) => {
        if (answers[index] !== undefined) {
           answersJson[q.id.toString()] = answers[index];
        }
      });
    }

    const response = await api.post(`/quiz/${quizId}/submit/`, {
      answers_json: answersJson,
      time_taken: 120, // default placeholder
    });
    
    // Convert backend's attempt response back into a format the frontend UI understands
    const attempt = response.data;
    
    return {
      data: {
        quizId,
        score: attempt.score,
        results: [], // We might not get full explanations back from the backend attempt yet
        weakAreas: [],
        recommendations: [],
      }
    };
  },

  generate: async (lessonId, percentageWatched = null) => {
    const payload = { lesson_id: lessonId };
    if (percentageWatched !== null) {
      payload.percentage_watched = percentageWatched;
    }
    const response = await api.post('/quiz/generate/', payload);
    return { data: response.data };
  },
};

export default quizService;

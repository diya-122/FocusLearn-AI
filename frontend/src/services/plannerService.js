import api from './api';

const plannerService = {
  // Calendar Events
  getEvents: async () => {
    const res = await api.get('/planner/events/');
    return { ...res, data: res.data.results || res.data };
  },
  
  createEvent: async (eventData) => {
    return await api.post('/planner/events/', eventData);
  },

  updateEvent: async (id, eventData) => {
    return await api.put(`/planner/events/${id}/`, eventData);
  },

  deleteEvent: async (id) => {
    return await api.delete(`/planner/events/${id}/`);
  },

  // Notes
  getNotes: async (search = '') => {
    const params = search ? { search } : {};
    const res = await api.get('/planner/notes/', { params });
    return { ...res, data: res.data.results || res.data };
  },

  createNote: async (noteData) => {
    return await api.post('/planner/notes/', noteData);
  },

  updateNote: async (id, noteData) => {
    return await api.put(`/planner/notes/${id}/`, noteData);
  },

  deleteNote: async (id) => {
    return await api.delete(`/planner/notes/${id}/`);
  },
};

export default plannerService;

import api from './api';

// Mock delay
const delay = (ms = 500) => new Promise(r => setTimeout(r, ms));

const authService = {
  login: async (email, password) => {
    await delay();
    // In production: return api.post('/auth/login', { email, password });
    return {
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          name: 'Diya Agarwal',
          email,
          role: 'student',
          avatar: null,
        },
      },
    };
  },

  register: async (userData) => {
    await delay();
    // In production: return api.post('/auth/register', userData);
    return {
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: Date.now(),
          ...userData,
          role: 'student',
          avatar: null,
        },
      },
    };
  },

  logout: async () => {
    await delay(200);
    // In production: return api.post('/auth/logout');
    localStorage.removeItem('focuslearn_token');
    return { data: { message: 'Logged out successfully' } };
  },

  getProfile: async () => {
    await delay();
    // In production: return api.get('/auth/profile');
    return {
      data: {
        id: 1,
        name: 'Diya Agarwal',
        email: 'diya@focuslearn.ai',
        role: 'student',
        focusScore: 87,
        streak: 12,
      },
    };
  },

  updateProfile: async (data) => {
    await delay();
    // In production: return api.put('/auth/profile', data);
    return { data: { ...data, message: 'Profile updated' } };
  },
};

export default authService;

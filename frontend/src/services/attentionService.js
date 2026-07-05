import api from './api';

const attentionService = {
  getCurrentFocus: async (userId) => {
    // This would typically interface with the webcam/MediaPipe logic in the frontend 
    // rather than polling a backend. We'll leave the random logic here for demonstration 
    // of the monitoring module until we integrate the real OpenCV/MediaPipe JS SDK.
    let mockFocusScore = Math.min(100, Math.max(40, 87 + (Math.random() - 0.45) * 10));
    return {
      data: {
        userId,
        focusScore: Math.round(mockFocusScore),
        isDistracted: mockFocusScore < 50,
        timestamp: new Date().toISOString(),
        status: mockFocusScore >= 80 ? 'focused' : mockFocusScore >= 50 ? 'reengaging' : 'distracted',
      },
    };
  },

  reportDistraction: async (userId, timestamp, lessonId) => {
    // Send distraction event to backend to save in AttentionLog
    const response = await api.post('/analytics/attention/', {
        focus_score: 40,
        is_distracted: true,
        lesson: lessonId
    });
    return { data: response.data };
  },
};

export default attentionService;

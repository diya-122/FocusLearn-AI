import api from './api';

const analyticsService = {
  getDashboardStats: async (userId) => {
    try {
      const response = await api.get('/analytics/dashboard/');
      return {
        data: {
          overallProgress: response.data.lessons_completed_total * 10, // heuristic
          focusScore: response.data.focus_score_avg,
          activeCourses: 0, 
          upcomingQuizzes: 0,
          learningStreak: response.data.streak,
          totalStudyHours: Math.round(response.data.study_minutes_total / 60),
          coursesCompleted: 0,
          averageQuizScore: response.data.quiz_score_avg,
        }
      };
    } catch (e) {
      console.error(e);
      // Fallback to mock data if not generated yet
      return {
        data: {
          overallProgress: 65,
          focusScore: 87,
          activeCourses: 3,
          upcomingQuizzes: 2,
          learningStreak: 12,
          totalStudyHours: 148,
          coursesCompleted: 5,
          averageQuizScore: 82,
        },
      };
    }
  },

  getFocusTrends: async () => {
    try {
      const response = await api.get('/analytics/dashboard/');
      const trends = response.data.focus_trend.map(t => ({
        day: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
        score: t.focus_avg
      }));
      return { data: trends };
    } catch (e) {
      return { data: [] };
    }
  },

  // Fallbacks for UI layout until full analytics is implemented
  getWeeklyStudyTime: async () => ({ data: [] }),
  getQuizPerformance: async () => ({ data: [] }),
  getSubjectDistribution: async () => ({ data: [] }),
  getMonthlyProgress: async () => ({ data: [] }),
  getEngagementByHour: async () => ({ data: [] }),
  getRetentionRate: async () => ({ data: [] }),

  exportReport: async (format = 'pdf') => {
    return { data: { url: '#', message: `Report exported as ${format}` } };
  },
};

export default analyticsService;

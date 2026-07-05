import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaBookOpen, FaBrain, FaPuzzlePiece, FaChartLine, FaFire, FaRobot, FaCog, FaUpload, FaPlay, FaTrash } from 'react-icons/fa';
import { HiOutlineLightBulb } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { getTopicImage } from '../../utils/getTopicImage';

import analyticsService from '../../services/analyticsService';
import courseService from '../../services/courseService';
import VideoImportModal from '../../components/VideoImportModal/VideoImportModal';
import styles from './Dashboard.module.css';

const tips = [
  "🧠 Studies show that taking a 5-minute break every 25 minutes boosts retention by 30%.",
  "📝 Writing notes by hand helps you remember concepts 40% better than typing.",
  "🎯 Focus on understanding concepts, not memorizing — it leads to deeper learning.",
  "💡 Teaching what you've learned to someone else is the fastest way to master it.",
  "⏰ Your brain is most alert 2-4 hours after waking up — schedule hard topics then!",
  "🔄 Spaced repetition: review material after 1 day, 3 days, and 7 days for best retention.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        const res = await analyticsService.getDashboardStats(user.id);
        setDashboardStats(res.data);
      }
    };
    fetchStats();
  }, [user]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseService.getEnrolled();
        setCourses(res.data?.slice(0, 6) || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCourses();
  }, []);

  const displayStats = dashboardStats ? [
    { label: 'Overall Progress', value: `${dashboardStats.overallProgress}%`, icon: <FaChartLine />, color: '#4F46E5', bg: '#EEF2FF', up: true },
    { label: 'Focus Score', value: dashboardStats.focusScore, icon: <FaBrain />, color: '#7C3AED', bg: '#F5F3FF', up: true },
    { label: 'Average Quiz Score', value: `${dashboardStats.averageQuizScore}%`, icon: <FaPuzzlePiece />, color: '#F59E0B', bg: '#FEF3C7', up: true },
    { label: 'Total Study Hours', value: dashboardStats.totalStudyHours, icon: <FaBookOpen />, color: '#10B981', bg: '#ECFDF5', up: true },
    { label: 'Learning Streak', value: dashboardStats.learningStreak, icon: <FaFire />, color: '#EF4444', bg: '#FEE2E2', change: '🔥', up: true },
  ] : [
    { label: 'Overall Progress', value: '65%', icon: <FaChartLine />, color: '#4F46E5', bg: '#EEF2FF', up: true },
    { label: 'Focus Score', value: '87', icon: <FaBrain />, color: '#7C3AED', bg: '#F5F3FF', up: true },
    { label: 'Active Courses', value: String(courses.length || 0), icon: <FaBookOpen />, color: '#10B981', bg: '#ECFDF5', up: true },
    { label: 'Quiz Score', value: '82%', icon: <FaPuzzlePiece />, color: '#F59E0B', bg: '#FEF3C7', up: true },
    { label: 'Learning Streak', value: '12', icon: <FaFire />, color: '#EF4444', bg: '#FEE2E2', change: '🔥', up: true },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeBar}>
        <div className={styles.welcomeText}>
          <h2>Welcome back, {(user?.full_name || user?.username || 'Student').split(' ')[0]}! 👋</h2>
          <p>Ready to focus and learn today?</p>
        </div>
        <div className={styles.welcomeActions}>
          <button className="btn btn-primary" onClick={() => setIsImportModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUpload /> Import Video
          </button>
        </div>
      </div>

      {/* Tip of the Day */}
      <div className={styles.tipCard}>
        <HiOutlineLightBulb className={styles.tipIcon} />
        <div>
          <span className={styles.tipLabel}>Tip of the Day</span>
          <p className={styles.tipText}>{tip}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {displayStats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
              {stat.change && (
                <span className={`${styles.statChange} ${stat.up ? styles.statUp : styles.statDown}`}>
                  {stat.up && <FaArrowUp />} {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Your Courses */}
      {courses.length > 0 && (
        <div className={styles.coursesSection}>
          <div className={styles.sectionHeader}>
            <h3><FaBookOpen style={{ marginRight: '8px', color: 'var(--color-primary)' }} /> Your Courses</h3>
          </div>
          <div className={styles.coursesGrid}>
            {courses.map(course => (
              <div key={course.id} className={styles.courseCard} style={{ position: 'relative' }} onClick={() => {
                if (course.first_lesson_id) {
                  navigate(`/course/${course.first_lesson_id}`);
                } else if (course.lessons && course.lessons.length > 0) {
                  navigate(`/course/${course.lessons[0].id || course.lessons[0]}`);
                } else {
                  navigate(`/course/${course.id}`);
                }
              }}>
                <button 
                  className={styles.deleteBtn}
                  title="Delete Lesson"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if(window.confirm('Are you sure you want to delete this lesson?')) {
                      try {
                        await courseService.delete(course.id);
                        setCourses(courses.filter(c => c.id !== course.id));
                      } catch (err) {
                        alert('Failed to delete lesson.');
                      }
                    }
                  }}
                >
                  <FaTrash />
                </button>
                <div className={styles.courseThumbWrap}>
                  <img
                    src={course.thumbnail_url || course.thumbnail || getTopicImage(course.title)}
                    alt={course.title}
                    className={styles.courseThumbImg}
                  />
                  <div className={styles.coursePlayOverlay}>
                    <FaPlay />
                  </div>
                </div>
                <div className={styles.courseCardBody}>
                  <h4>{course.title}</h4>
                  <p>{course.category || 'General'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.dashGrid}>
        <div>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3>Quick Actions</h3>
            </div>
            <div className={styles.quickActions}>
              <div className={styles.quickAction} onClick={() => navigate('/quizzes')}>
                <FaPuzzlePiece className={styles.quickActionIcon} />
                <span>Take Quiz</span>
              </div>
              <div className={styles.quickAction} onClick={() => navigate('/summaries')}>
                <FaRobot className={styles.quickActionIcon} />
                <span>AI Reports</span>
              </div>
              <div className={styles.quickAction} onClick={() => navigate('/analytics')}>
                <FaChartLine className={styles.quickActionIcon} />
                <span>Analytics</span>
              </div>
              <div className={styles.quickAction} onClick={() => navigate('/profile')}>
                <FaCog className={styles.quickActionIcon} />
                <span>Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VideoImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  );
}

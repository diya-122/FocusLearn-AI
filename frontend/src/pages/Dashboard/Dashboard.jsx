import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaBookOpen, FaBrain, FaPuzzlePiece, FaChartLine, FaFire, FaRobot, FaCog, FaUpload, FaPlay, FaTrash } from 'react-icons/fa';
import { HiOutlineLightBulb } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getTopicImage } from '../../utils/getTopicImage';
import analyticsService from '../../services/analyticsService';
import courseService from '../../services/courseService';
import VideoImportModal from '../../components/VideoImportModal/VideoImportModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

const mockFocusData = [
  { name: 'Mon', focus: 75, hours: 2 },
  { name: 'Tue', focus: 82, hours: 3.5 },
  { name: 'Wed', focus: 68, hours: 1 },
  { name: 'Thu', focus: 88, hours: 4 },
  { name: 'Fri', focus: 92, hours: 5 },
  { name: 'Sat', focus: 70, hours: 2.5 },
  { name: 'Sun', focus: 85, hours: 3 },
];

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
  const { t } = useLanguage();
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
    { label: t('stat_progress'), value: `${dashboardStats.overallProgress}%`, icon: <FaChartLine />, color: '#4F46E5', bg: '#EEF2FF', up: true },
    { label: t('stat_focus'),    value: dashboardStats.focusScore,             icon: <FaBrain />,    color: '#7C3AED', bg: '#F5F3FF', up: true },
    { label: t('stat_quiz'),     value: `${dashboardStats.averageQuizScore}%`, icon: <FaPuzzlePiece />, color: '#F59E0B', bg: '#FEF3C7', up: true },
    { label: t('stat_hours'),    value: dashboardStats.totalStudyHours,        icon: <FaBookOpen />, color: '#10B981', bg: '#ECFDF5', up: true },
    { label: t('stat_streak'),   value: dashboardStats.learningStreak,         icon: <FaFire />,     color: '#EF4444', bg: '#FEE2E2', change: '🔥', up: true },
  ] : [
    { label: t('stat_progress'), value: '65%',              icon: <FaChartLine />, color: '#4F46E5', bg: '#EEF2FF', up: true },
    { label: t('stat_focus'),    value: '87',               icon: <FaBrain />,    color: '#7C3AED', bg: '#F5F3FF', up: true },
    { label: t('stat_courses'),  value: String(courses.length || 0), icon: <FaBookOpen />, color: '#10B981', bg: '#ECFDF5', up: true },
    { label: t('stat_quiz'),     value: '82%',              icon: <FaPuzzlePiece />, color: '#F59E0B', bg: '#FEF3C7', up: true },
    { label: t('stat_streak'),   value: '12',               icon: <FaFire />,     color: '#EF4444', bg: '#FEE2E2', change: '🔥', up: true },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeBar}>
        <div className={styles.welcomeText}>
          <h2>{t('welcome_title')}, {(user?.full_name || user?.username || 'Student').split(' ')[0]}! 👋</h2>
          <p>{t('welcome_subtitle')}</p>
        </div>
        <div className={styles.welcomeActions}>
          <button className="btn btn-primary" onClick={() => setIsImportModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUpload /> {t('import_video')}
          </button>
        </div>
      </div>

      {/* Tip of the Day */}
      <div className={styles.tipCard}>
        <HiOutlineLightBulb className={styles.tipIcon} />
        <div>
          <span className={styles.tipLabel}>{t('tip_label')}</span>
          <p className={styles.tipText}>{tip}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {displayStats.map((stat, i) => (
          <div key={i} className={styles.statCard} style={{ color: stat.color }}>
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

      {/* Analytics Overview Section */}
      <div className={styles.analyticsSection}>
        <div className={styles.sectionHeader}>
          <h3><FaChartLine style={{ marginRight: '8px', color: 'var(--color-primary)' }} /> Analytics Overview</h3>
        </div>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockFocusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--color-text-light)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-light)" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: 'var(--color-text)' }}
              />
              <Area type="monotone" dataKey="focus" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Your Courses */}
      {courses.length > 0 && (
        <div className={styles.coursesSection}>
          <div className={styles.sectionHeader}>
            <h3><FaBookOpen style={{ marginRight: '8px', color: 'var(--color-primary)' }} /> {t('your_courses')}</h3>
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
                    if(window.confirm(t('delete_confirm'))) {
                      try {
                        await courseService.delete(course.id);
                        setCourses(courses.filter(c => c.id !== course.id));
                      } catch (err) {
                        alert(t('delete_error'));
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
              <h3>{t('quick_actions')}</h3>
            </div>
            <div className={styles.quickActions}>
              <div className={styles.quickAction} onClick={() => navigate('/quizzes')}>
                <FaPuzzlePiece className={styles.quickActionIcon} />
                <span>{t('action_quiz')}</span>
              </div>
              <div className={styles.quickAction} onClick={() => navigate('/summaries')}>
                <FaRobot className={styles.quickActionIcon} />
                <span>{t('action_reports')}</span>
              </div>
              <div className={styles.quickAction} onClick={() => navigate('/analytics')}>
                <FaChartLine className={styles.quickActionIcon} />
                <span>{t('action_analytics')}</span>
              </div>
              <div className={styles.quickAction} onClick={() => navigate('/profile')}>
                <FaCog className={styles.quickActionIcon} />
                <span>{t('action_settings')}</span>
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

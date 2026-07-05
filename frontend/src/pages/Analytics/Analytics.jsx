import { useState, useEffect } from 'react';
import { FaBrain, FaClock, FaTrophy, FaChartLine, FaDownload } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import { useAuth } from '../../context/AuthContext';
import styles from './Analytics.module.css';

const summaryStats = [
  { label: 'Avg Focus Score', value: '87%', icon: <FaBrain />, color: '#4F46E5', bg: '#EEF2FF' },
  { label: 'Total Study Hours', value: '148h', icon: <FaClock />, color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Quiz Average', value: '82%', icon: <FaTrophy />, color: '#10B981', bg: '#ECFDF5' },
  { label: 'Retention Rate', value: '91%', icon: <FaChartLine />, color: '#F59E0B', bg: '#FEF3C7' },
];

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(summaryStats);
  const [focusTrends, setFocusTrends] = useState([]);
  const [weeklyStudyTime, setWeeklyStudyTime] = useState([]);
  const [quizPerformance, setQuizPerformance] = useState([]);
  const [subjectDistribution, setSubjectDistribution] = useState([]);
  const [engagementByHour, setEngagementByHour] = useState([]);
  const [retentionRate, setRetentionRate] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    analyticsService.getDashboardStats(user.id).then(res => {
      if (res.data) {
        setStats([
          { label: 'Avg Focus Score', value: `${res.data.focusScore || 0}%`, icon: <FaBrain />, color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Total Study Hours', value: `${res.data.totalStudyHours || 0}h`, icon: <FaClock />, color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Quiz Average', value: `${res.data.averageQuizScore || 0}%`, icon: <FaTrophy />, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Learning Streak', value: `${res.data.learningStreak || 0}`, icon: <FaChartLine />, color: '#F59E0B', bg: '#FEF3C7' },
        ]);
      }
    });

    analyticsService.getFocusTrends().then(res => setFocusTrends(res.data));
    analyticsService.getWeeklyStudyTime().then(res => setWeeklyStudyTime(res.data));
    analyticsService.getQuizPerformance().then(res => setQuizPerformance(res.data));
    analyticsService.getSubjectDistribution().then(res => setSubjectDistribution(res.data));
    analyticsService.getEngagementByHour().then(res => setEngagementByHour(res.data));
    analyticsService.getRetentionRate().then(res => setRetentionRate(res.data));
  }, [user]);

  return (
    <div className={styles.analyticsPage}>
      <div className={styles.pageHeader}>
        <h2>Learning Analytics</h2>
        <button className="btn btn-secondary btn-sm"><FaDownload /> Export Report</button>
      </div>

      <div className={styles.summaryCards}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.summaryCard}>
            <div className={styles.summaryIcon} style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.summaryInfo}>
              <h4>{stat.value}</h4>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Focus Trends</h3>
            <span className={styles.chartBadge}>This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={focusTrends}>
              <defs>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="score" stroke="#4F46E5" fill="url(#focusGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Weekly Study Time</h3>
            <span className={styles.chartBadge}>Hours</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyStudyTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="hours" fill="#7C3AED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Quiz Performance</h3>
            <span className={styles.chartBadge}>vs Average</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={quizPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="quiz" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Legend />
              <Bar dataKey="score" name="Your Score" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="avg" name="Class Average" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Subject Distribution</h3>
            <span className={styles.chartBadge}>Study Time</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={subjectDistribution} cx="50%" cy="50%"
                innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {subjectDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styles.chartCard} ${styles.full}`}>
          <div className={styles.chartHeader}>
            <h3>Engagement by Time of Day</h3>
            <span className={styles.chartBadge}>Today</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={engagementByHour}>
              <defs>
                <linearGradient id="engageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="hour" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="engagement" stroke="#10B981" fill="url(#engageGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styles.chartCard} ${styles.full}`}>
          <div className={styles.chartHeader}>
            <h3>Retention Rate</h3>
            <span className={styles.chartBadge}>8 Weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={retentionRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} domain={[70, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
              <Line type="monotone" dataKey="rate" stroke="#EC4899" strokeWidth={2} dot={{ fill: '#EC4899', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

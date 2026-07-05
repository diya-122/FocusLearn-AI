import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import styles from './Profile.module.css';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.full_name || user?.username || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    bio: 'Computer Science student passionate about AI and machine learning.',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    quiz: true,
    summary: false,
    weekly: true,
  });

  const [goals] = useState([
    'Complete ML course',
    'Improve focus score to 90%',
    'Take 5 quizzes this week',
    'Study 3 hours daily',
  ]);

  const toggleNotif = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.pageHeader}>
        <h2>Profile Settings</h2>
      </div>

      <div className={styles.profileGrid}>
        <div className={styles.profileSidebar}>
          <div className={styles.avatarLarge}>
            {user ? getInitials(user.full_name || user.username || 'U') : 'U'}
          </div>
          <h3>{user?.full_name || user?.username || 'Student'}</h3>
          <p>{user?.email}</p>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Change Photo</button>
          <div className={styles.profileStats}>
            <div className={styles.profileStat}>
              <h4>87%</h4>
              <p>Focus Score</p>
            </div>
            <div className={styles.profileStat}>
              <h4>12</h4>
              <p>Day Streak</p>
            </div>
            <div className={styles.profileStat}>
              <h4>5</h4>
              <p>Courses</p>
            </div>
            <div className={styles.profileStat}>
              <h4>148h</h4>
              <p>Study Time</p>
            </div>
          </div>
        </div>

        <div className={styles.profileContent}>
          <div className={styles.section}>
            <h3>Personal Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input className={styles.formInput} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input className={styles.formInput} value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input className={styles.formInput} value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <input className={styles.formInput} value="Student" disabled style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginTop: 'var(--space-5)' }}>
              <label>Bio</label>
              <textarea className={styles.formInput} rows={3} value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                style={{ resize: 'vertical' }} />
            </div>
            <button className={`btn btn-primary ${styles.saveBtn}`}>Save Changes</button>
          </div>

          <div className={styles.section}>
            <h3>Learning Goals</h3>
            <div className={styles.goalTags}>
              {goals.map((goal, i) => (
                <span key={i} className={styles.goalTag}>
                  {goal}
                  <FaTimes className={styles.removeTag} />
                </span>
              ))}
            </div>
            <div className={styles.formGroup} style={{ marginTop: 'var(--space-4)' }}>
              <input className={styles.formInput} placeholder="Add a new goal..." />
            </div>
          </div>

          <div className={styles.section}>
            <h3>Notification Settings</h3>
            {[
              { key: 'email', title: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'push', title: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'quiz', title: 'Quiz Reminders', desc: 'Get notified about upcoming quizzes' },
              { key: 'summary', title: 'Summary Alerts', desc: 'When AI summaries are generated' },
              { key: 'weekly', title: 'Weekly Reports', desc: 'Weekly learning analytics digest' },
            ].map(item => (
              <div key={item.key} className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
                <button className={`${styles.toggle} ${notifications[item.key] ? styles.active : ''}`}
                  onClick={() => toggleNotif(item.key)} />
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <h3>Preferences</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Language</label>
                <select className={styles.formInput}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Timezone</label>
                <select className={styles.formInput}>
                  <option>Asia/Kolkata (IST)</option>
                  <option>America/New_York (EST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

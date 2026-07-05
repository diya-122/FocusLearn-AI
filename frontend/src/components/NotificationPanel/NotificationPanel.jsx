import { useState, useRef, useEffect } from 'react';
import { FaBell, FaCheck, FaInfoCircle, FaStar, FaExclamationTriangle } from 'react-icons/fa';
import styles from './NotificationPanel.module.css';

const notifications = [];

const typeColors = {
  quiz: '#7C3AED',
  course: '#4F46E5',
  achievement: '#F59E0B',
  summary: '#10B981',
  reminder: '#3B82F6',
};

const typeIcons = {
  quiz: '🧩',
  course: '📚',
  achievement: '🏆',
  summary: '🤖',
  reminder: '⏰',
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(notifications);
  const ref = useRef();

  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  return (
    <div className={styles.notifPanel} ref={ref}>
      <button className={styles.notifBtn} onClick={() => setOpen(!open)}>
        <FaBell />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <span className={styles.markAllBtn} onClick={markAllRead}>
                Mark all read
              </span>
            )}
          </div>
          <div className={styles.notifList}>
            {notifs.map(n => (
              <div key={n.id} className={`${styles.notifItem} ${!n.read ? styles.unread : ''}`}>
                <div
                  className={styles.notifIcon}
                  style={{ background: `${typeColors[n.type]}15`, color: typeColors[n.type] }}
                >
                  {typeIcons[n.type]}
                </div>
                <div className={styles.notifContent}>
                  <p className={styles.notifMessage}>{n.message}</p>
                  <span className={styles.notifTime}>{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

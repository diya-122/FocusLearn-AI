import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import Sidebar from '../components/Sidebar/Sidebar';
import SearchBar from '../components/SearchBar/SearchBar';
import NotificationPanel from '../components/NotificationPanel/NotificationPanel';
import UserProfileDropdown from '../components/UserProfileDropdown/UserProfileDropdown';
import { useTheme } from '../context/ThemeContext';
import styles from './DashboardLayout.module.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/courses': 'Course Catalog',
  '/summaries': 'AI Reports',
  '/analytics': 'Analytics',
  '/quizzes': 'Quizzes',
  '/instructor': 'Instructor Dashboard',
  '/profile': 'Profile',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className={styles.dashLayout}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={styles.dashMain}>
        <header className={styles.topNav}>
          <div className={styles.topNavLeft}>
            <h1 className={styles.pageTitle}>{title}</h1>
            <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." />
          </div>
          <div className={styles.topNavRight}>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
            </button>
            <NotificationPanel />
            <UserProfileDropdown />
          </div>
        </header>

        <div className={styles.dashContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

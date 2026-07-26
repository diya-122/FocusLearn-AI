import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import Sidebar from '../components/Sidebar/Sidebar';
import SearchBar from '../components/SearchBar/SearchBar';
import NotificationPanel from '../components/NotificationPanel/NotificationPanel';
import UserProfileDropdown from '../components/UserProfileDropdown/UserProfileDropdown';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();

  const pageTitles = {
    '/dashboard': t('sidebar_dashboard'),
    '/courses':   t('sidebar_my_lessons'),
    '/summaries': t('sidebar_ai_reports'),
    '/analytics': t('sidebar_analytics'),
    '/quizzes':   t('sidebar_quizzes'),
    '/profile':   t('sidebar_profile'),
  };

  const title = pageTitles[location.pathname] || t('sidebar_dashboard');

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
            <LanguageSwitcher />
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
          <Outlet context={{ search }} />
        </div>
      </div>
    </div>
  );
}

import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineAcademicCap, HiOutlineSquares2X2, HiOutlineBookOpen,
  HiOutlineDocumentText, HiOutlineChartBarSquare, HiOutlinePuzzlePiece,
  HiOutlineCog6Tooth, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle,
  HiOutlineCalendar, HiOutlinePencil
} from 'react-icons/hi2';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getInitials } from '../../utils/helpers';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const studentNav = [
    { to: '/dashboard', icon: HiOutlineSquares2X2,    labelKey: 'sidebar_dashboard' },
    { to: '/courses',   icon: HiOutlineBookOpen,       labelKey: 'sidebar_my_lessons' },
    { to: '/summaries', icon: HiOutlineDocumentText,   labelKey: 'sidebar_ai_reports' },
    { to: '/analytics', icon: HiOutlineChartBarSquare, labelKey: 'sidebar_analytics' },
    { to: '/quizzes',   icon: HiOutlinePuzzlePiece,    labelKey: 'sidebar_quizzes' },
    { to: '/calendar',  icon: HiOutlineCalendar,       labelKey: 'Calendar' },
    { to: '/notes',     icon: HiOutlinePencil,         labelKey: 'Notes' },
  ];

  const bottomNav = [
    { to: '/profile', icon: HiOutlineUserCircle, labelKey: 'sidebar_profile' },
    { to: '/profile', icon: HiOutlineCog6Tooth,  labelKey: 'sidebar_settings' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <button className={styles.mobileToggle} onClick={onToggle}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onToggle} />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}><HiOutlineAcademicCap /></div>
            FocusLearn AI
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <span className={styles.navLabel}>{t('sidebar_main_menu')}</span>
          {studentNav.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onToggle && window.innerWidth <= 1024 && onToggle()}
            >
              <item.icon className={styles.navIcon} />
              {t(item.labelKey)}
            </NavLink>
          ))}

          <span className={styles.navLabel}>{t('sidebar_account')}</span>
          {bottomNav.map((item, i) => (
            <NavLink key={i} to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <item.icon className={styles.navIcon} />
              {t(item.labelKey)}
            </NavLink>
          ))}

          <button className={styles.navItem} onClick={handleLogout}>
            <HiOutlineArrowRightOnRectangle className={styles.navIcon} />
            {t('sidebar_logout')}
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div style={{ padding: '0.5rem 0.25rem 0.75rem' }}>
            <LanguageSwitcher />
          </div>
          <div className={styles.userCard} onClick={() => navigate('/profile')}>
            <div className={styles.userAvatar}>
              {user ? getInitials(user.full_name || user.username || 'U') : 'U'}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.full_name || user?.username || 'Student'}</div>
              <div className={styles.userRole}>{user?.role || t('sidebar_student')}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineAcademicCap,
  HiOutlineSquares2X2,
  HiOutlineBookOpen,
  HiOutlineRectangleStack,
  HiOutlineDocumentText,
  HiOutlineChartBarSquare,
  HiOutlinePuzzlePiece,
  HiOutlineCog6Tooth,
  HiOutlineUserCircle,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import styles from './Sidebar.module.css';

const studentNav = [
  { to: '/dashboard', icon: HiOutlineSquares2X2, label: 'Dashboard' },
  { to: '/courses', icon: HiOutlineBookOpen, label: 'My Lessons' },
  { to: '/summaries', icon: HiOutlineDocumentText, label: 'AI Reports' },
  { to: '/analytics', icon: HiOutlineChartBarSquare, label: 'Analytics' },
  { to: '/quizzes', icon: HiOutlinePuzzlePiece, label: 'Quizzes' },
];

const bottomNav = [
  { to: '/profile', icon: HiOutlineUserCircle, label: 'Profile' },
  { to: '/profile', icon: HiOutlineCog6Tooth, label: 'Settings' },
];

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <button className={styles.mobileToggle} onClick={onToggle}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onToggle} />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <HiOutlineAcademicCap />
            </div>
            FocusLearn AI
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <span className={styles.navLabel}>Main Menu</span>
          {studentNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => onToggle && window.innerWidth <= 1024 && onToggle()}
            >
              <item.icon className={styles.navIcon} />
              {item.label}
              {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
            </NavLink>
          ))}

          <span className={styles.navLabel}>Account</span>
          {bottomNav.map((item, i) => (
            <NavLink
              key={i}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <item.icon className={styles.navIcon} />
              {item.label}
            </NavLink>
          ))}

          <button className={styles.navItem} onClick={handleLogout}>
            <HiOutlineArrowRightOnRectangle className={styles.navIcon} />
            Logout
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard} onClick={() => navigate('/profile')}>
            <div className={styles.userAvatar}>
              {user ? getInitials(user.full_name || user.username || 'U') : 'U'}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.full_name || user?.username || 'Student'}</div>
              <div className={styles.userRole}>{user?.role || 'student'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

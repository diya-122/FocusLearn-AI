import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { HiOutlineChartBarSquare } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import styles from './UserProfileDropdown.module.css';

export default function UserProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.profileDropdown} ref={ref}>
      <button className={styles.profileBtn} onClick={() => setOpen(!open)}>
        <div className={styles.avatar}>
          {user ? getInitials(user.full_name || user.username || 'U') : 'U'}
        </div>
        <span className={styles.userName}>{user?.full_name || user?.username || 'Student'}</span>
        <FaChevronDown className={`${styles.chevron} ${open ? styles.open : ''}`} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <button className={styles.dropdownItem} onClick={() => { navigate('/profile'); setOpen(false); }}>
            <FaUser /> My Profile
          </button>
          <button className={styles.dropdownItem} onClick={() => { navigate('/analytics'); setOpen(false); }}>
            <HiOutlineChartBarSquare /> Analytics
          </button>
          <button className={styles.dropdownItem} onClick={() => { navigate('/profile'); setOpen(false); }}>
            <FaCog /> Settings
          </button>
          <div className={styles.divider} />
          <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

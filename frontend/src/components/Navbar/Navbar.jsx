import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineAcademicCap, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navbarInner}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <HiOutlineAcademicCap />
          </div>
          <span className={styles.logoText}>
            Focus<span className={styles.logoAccent}>Learn</span> AI
          </span>
        </Link>

        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/features" className={styles.navLink}>Features</Link>
          <a href="#how-it-works" className={styles.navLink}>How It Works</a>
        </div>

        <div className={styles.navActions}>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{ marginRight: '4px' }}
          >
            {theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
          </button>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => navigate('/login')}>
                Log In
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Get Started
              </button>
            </>
          )}
        </div>

        <div
          className={`${styles.hamburger} ${menuOpen ? styles.active : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        <Link to="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/features" className={styles.navLink} onClick={() => setMenuOpen(false)}>Features</Link>
        <a href="#how-it-works" className={styles.navLink} onClick={() => setMenuOpen(false)}>How It Works</a>
        <div className={styles.navActions}>
          <button
            className="btn btn-secondary"
            onClick={toggleTheme}
            style={{ width: '100%', gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {theme === 'light' ? (
              <>
                <HiOutlineMoon style={{ fontSize: '1.15rem' }} /> Dark Mode
              </>
            ) : (
              <>
                <HiOutlineSun style={{ fontSize: '1.15rem' }} /> Light Mode
              </>
            )}
          </button>
          {user ? (
            <button className="btn btn-primary" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
              Dashboard
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => { navigate('/login'); setMenuOpen(false); }}>Log In</button>
              <button className="btn btn-primary" onClick={() => { navigate('/register'); setMenuOpen(false); }}>Get Started</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

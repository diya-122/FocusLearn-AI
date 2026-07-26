import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineAcademicCap, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navbarInner}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}><HiOutlineAcademicCap /></div>
          <span className={styles.logoText}>
            Focus<span className={styles.logoAccent}>Learn</span> AI
          </span>
        </Link>

        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>{t('nav_home')}</Link>
          <a href="#features" className={styles.navLink}>{t('nav_features')}</a>
          <a href="#how-it-works" className={styles.navLink}>{t('nav_how_it_works')}</a>
        </div>

        <div className={styles.navActions}>
          <LanguageSwitcher />
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={theme === 'light' ? t('nav_dark_mode') : t('nav_light_mode')}
            style={{ marginLeft: '4px' }}
          >
            {theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
          </button>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              {t('nav_dashboard')}
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => navigate('/login')}>{t('nav_login')}</button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>{t('nav_get_started')}</button>
            </>
          )}
        </div>

        <div
          className={`${styles.hamburger} ${menuOpen ? styles.active : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </div>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        <Link to="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>{t('nav_home')}</Link>
        <a href="#features" className={styles.navLink} onClick={() => setMenuOpen(false)}>{t('nav_features')}</a>
        <a href="#how-it-works" className={styles.navLink} onClick={() => setMenuOpen(false)}>{t('nav_how_it_works')}</a>
        <div className={styles.navActions}>
          <LanguageSwitcher />
          <button
            className="btn btn-secondary"
            onClick={toggleTheme}
            style={{ width: '100%', gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {theme === 'light' ? <><HiOutlineMoon /> {t('nav_dark_mode')}</> : <><HiOutlineSun /> {t('nav_light_mode')}</>}
          </button>
          {user ? (
            <button className="btn btn-primary" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
              {t('nav_dashboard')}
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => { navigate('/login'); setMenuOpen(false); }}>{t('nav_login')}</button>
              <button className="btn btn-primary" onClick={() => { navigate('/register'); setMenuOpen(false); }}>{t('nav_get_started')}</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

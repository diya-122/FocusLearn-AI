import { Link } from 'react-router-dom';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import { FaTwitter, FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <Link to="/" className={styles.footerLogo}>
            <div className={styles.footerLogoIcon}>
              <HiOutlineAcademicCap />
            </div>
            FocusLearn AI
          </Link>
          <p className={styles.footerDesc}>
            AI-powered attention monitoring and adaptive learning for enhanced educational outcomes.
            Stay Focused. Learn Smarter.
          </p>
          <div className={styles.footerSocials}>
            <span className={styles.socialIcon}><FaTwitter /></span>
            <span className={styles.socialIcon}><FaGithub /></span>
            <span className={styles.socialIcon}><FaLinkedin /></span>
            <span className={styles.socialIcon}><FaYoutube /></span>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <h4>Product</h4>
          <ul>
            <li><Link to="/features">Features</Link></li>
            <li><a href="#">Enterprise</a></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4>Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">GDPR</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} FocusLearn AI. All rights reserved.</p>
        <div className={styles.footerBottomLinks}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}

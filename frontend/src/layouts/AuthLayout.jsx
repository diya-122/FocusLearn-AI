import { Outlet } from 'react-router-dom';
import { FaBrain, FaChartLine, FaRobot, FaShieldAlt } from 'react-icons/fa';
import styles from './AuthLayout.module.css';

const features = [
  { icon: <FaBrain />, text: 'AI-Powered Attention Monitoring' },
  { icon: <FaRobot />, text: 'Smart Summaries & Quiz Generation' },
  { icon: <FaChartLine />, text: 'Personalized Learning Analytics' },
  { icon: <FaShieldAlt />, text: 'ADHD-Aware Adaptive Learning' },
];

export default function AuthLayout() {
  return (
    <div className={styles.authLayout}>
      <div className={styles.authLeft}>
        <div className={styles.authBranding}>
          <h1>FocusLearn AI</h1>
          <p>Stay Focused. Learn Smarter.</p>
          <div className={styles.features}>
            {features.map((f, i) => (
              <div key={i} className={styles.feature}>
                <div className={styles.featureIcon}>{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.authRight}>
        <Outlet />
      </div>
    </div>
  );
}

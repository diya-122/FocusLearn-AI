import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ fullPage = false }) {
  return (
    <div className={`${styles.spinner} ${fullPage ? styles.fullPage : ''}`}>
      <div className={styles.spinnerDot}></div>
      <div className={styles.spinnerDot}></div>
      <div className={styles.spinnerDot}></div>
    </div>
  );
}

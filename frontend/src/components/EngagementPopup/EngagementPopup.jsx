import { useState, useEffect } from 'react';
import styles from './EngagementPopup.module.css';

export default function EngagementPopup({ isOpen, onContinue, onReview, onTimeout }) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(60);
      return;
    }

    if (timeLeft <= 0) {
      if (onTimeout) onTimeout();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isOpen, timeLeft, onTimeout]);

  if (!isOpen) return null;

  return (
    <div id="engagement-popup" className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.alertIcon}>👀</div>
        <h3 className={styles.title}>Are you still paying attention?</h3>
        <p className={styles.message}>
          We noticed you might have been distracted. Take a moment to refocus, 
          or review the AI-generated summary to catch up on what you missed.
        </p>
        
        <div style={{ color: 'var(--color-danger)', fontWeight: 'bold', margin: 'var(--space-3) 0' }}>
          Auto-pausing and generating quiz in {timeLeft}s...
        </div>

        <div className={styles.actions}>
          <button className={styles.continueBtn} onClick={onContinue}>
            Continue Learning
          </button>
          <button className={styles.reviewBtn} onClick={onReview}>
            Review Summary
          </button>
        </div>
      </div>
    </div>
  );
}

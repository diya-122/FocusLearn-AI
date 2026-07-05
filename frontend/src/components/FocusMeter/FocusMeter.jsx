import { getFocusColor, getFocusLabel } from '../../utils/helpers';
import styles from './FocusMeter.module.css';

export default function FocusMeter({ score = 87 }) {
  const color = getFocusColor(score);
  const label = getFocusLabel(score);

  return (
    <div className={styles.focusMeter}>
      <div className={styles.header}>
        <span className={styles.label}>
          <span className={styles.statusDot} style={{ background: color }} />
          Focus Score
        </span>
        <span className={styles.scoreValue} style={{ color }}>{score}%</span>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className={styles.statusLabel} style={{ color }}>{label}</span>
    </div>
  );
}

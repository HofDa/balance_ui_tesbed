import styles from './ProgressState.module.css';

interface ProgressStateProps {
  completed: number;
  total: number;
}

export default function ProgressState({ completed, total }: ProgressStateProps) {
  const ratio = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));

  return (
    <div className={styles.progressWrap} aria-live="polite">
      <p className={styles.progressCopy}>
        Fortschritt: {completed} von {total} Objekten erledigt
      </p>
      <div className={styles.progressBar} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}>
        <div className={styles.progressFill} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}

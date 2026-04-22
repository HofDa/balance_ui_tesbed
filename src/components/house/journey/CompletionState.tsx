import styles from './BathroomScene.module.css';

interface CompletionStateProps {
  message?: string;
}

export default function CompletionState({ message }: CompletionStateProps) {
  return (
    <aside className={styles.completionCard} role="status" aria-live="polite">
      {message ?? 'Badezimmer abgeschlossen. Sehr gut, weiter zum nächsten Raum.'}
    </aside>
  );
}

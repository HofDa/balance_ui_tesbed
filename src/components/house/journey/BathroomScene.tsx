import styles from './BathroomScene.module.css';
import BathtubFillInteraction from './BathtubFillInteraction';

interface BathroomSceneProps {
  onBack: () => void;
}

export default function BathroomScene({ onBack }: BathroomSceneProps) {
  return (
    <section className={styles.bathroomScene} aria-label="Badezimmer Szene">
      <div className={styles.bathroomTopBar}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Zur Fassade
        </button>

        <div>
          <h2 className={styles.roomTitle}>Badezimmer</h2>
          <p className={styles.roomSubtitle}>Fülle die Badewanne über Bewegung oder Ziehen.</p>
        </div>
      </div>

      <div className={styles.bathroomCanvas}>
        <div className={styles.wallSurface} aria-hidden="true" />
        <div className={styles.tileWainscot} aria-hidden="true" />
        <div className={styles.baseboard} aria-hidden="true" />
        <div className={styles.floorPlane} aria-hidden="true" />
        <div className={styles.ambientLight} aria-hidden="true" />
        <div className={styles.floorGlow} />
        <BathtubFillInteraction />
      </div>
    </section>
  );
}

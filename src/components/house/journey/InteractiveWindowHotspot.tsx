import { forwardRef } from 'react';
import styles from './InteractiveWindowHotspot.module.css';

interface InteractiveWindowHotspotProps {
  ariaLabel: string;
  disabled?: boolean;
  onActivate: () => void;
}

const InteractiveWindowHotspot = forwardRef<HTMLButtonElement, InteractiveWindowHotspotProps>(
  ({ ariaLabel, disabled = false, onActivate }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onActivate}
        className={styles.windowHotspotButton}
      >
        <span className={styles.windowHotspotGlow} aria-hidden="true" />
        <span className={styles.windowHotspotInner} aria-hidden="true" />
        <span className={styles.windowHotspotShimmer} aria-hidden="true" />
      </button>
    );
  },
);

InteractiveWindowHotspot.displayName = 'InteractiveWindowHotspot';

export default InteractiveWindowHotspot;

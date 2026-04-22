import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import '@/lib/gsap-setup';
import styles from './BathroomScene.module.css';

interface InteractiveObjectHotspotProps {
  label: string;
  shortLabel: string;
  iconSrc: string;
  position: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}

export default function InteractiveObjectHotspot({
  label,
  shortLabel,
  iconSrc,
  position,
  isActive,
  isCompleted,
  onSelect,
}: InteractiveObjectHotspotProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const doneBadgeRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!buttonRef.current) {
        return;
      }

      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      if (isCompleted || isActive) {
        gsap.set(buttonRef.current, { clearProps: 'transform' });
        return;
      }

      const timeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } });
      timeline
        .to(buttonRef.current, { scale: 1.018, duration: 1.15 }, 0)
        .to(buttonRef.current, { rotation: 0.65, duration: 0.9 }, 0)
        .to(buttonRef.current, { rotation: -0.45, duration: 0.9 }, 0.9);

      return () => timeline.kill();
    },
    { scope: buttonRef, dependencies: [isCompleted, isActive] },
  );

  useGSAP(
    () => {
      if (!doneBadgeRef.current || !isCompleted) {
        return;
      }

      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.fromTo(
        doneBadgeRef.current,
        { scale: 0.65, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' },
      );
    },
    { scope: buttonRef, dependencies: [isCompleted] },
  );

  const stateClass = isCompleted
    ? styles.hotspotButtonCompleted
    : styles.hotspotButtonPending;

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`${styles.hotspotButton} ${stateClass} ${isActive ? styles.hotspotButtonActive : ''}`.trim()}
      onClick={onSelect}
      style={position}
      aria-label={`${label}${isCompleted ? ', beantwortet' : ', offen'}`}
      aria-pressed={isActive}
    >
      <Image
        src={iconSrc}
        alt=""
        width={220}
        height={220}
        className={styles.hotspotIcon}
        aria-hidden="true"
      />
      <span className={styles.hotspotLabel}>{shortLabel}</span>
      {isCompleted ? <span ref={doneBadgeRef} className={styles.hotspotDoneBadge}>✓</span> : null}
    </button>
  );
}

/* eslint-disable @next/next/no-img-element */
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import '@/lib/gsap-setup';
import { publicPath } from '@/lib/publicPath';
import styles from './HouseFacadeScene.module.css';

interface SceneZoomTransitionProps {
  onComplete: () => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function SceneZoomTransition({ onComplete }: SceneZoomTransitionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const completedRef = useRef(false);

  useGSAP(
    () => {
      const safeComplete = () => {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      };

      if (prefersReducedMotion()) {
        const delayed = gsap.delayedCall(0.18, safeComplete);
        return () => delayed.kill();
      }

      const timeline = gsap.timeline({ onComplete: safeComplete });
      timeline
        .fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.95, ease: 'power2.inOut' }, 0)
        .fromTo(textRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.14)
        .fromTo(
          houseRef.current,
          { scale: 1, xPercent: 0, yPercent: 0, opacity: 1 },
          { scale: 3.15, xPercent: 18, yPercent: 22, opacity: 0.78, duration: 1.18, ease: 'power3.inOut' },
          0,
        );

      return () => timeline.kill();
    },
    { scope: containerRef, dependencies: [onComplete] },
  );

  return (
    <section ref={containerRef} className={styles.transitionScene} aria-label="Zoom ins Badezimmer" aria-live="polite">
      <div ref={houseRef} className={styles.transitionHouse}>
        <img
          src={publicPath('/assets/house_closed.svg')}
          alt="Zoom auf das Hausfenster"
          className={styles.transitionHouseImage}
        />
      </div>
      <div ref={overlayRef} className={styles.transitionOverlay} />
      <p ref={textRef} className={styles.transitionText}>Ein kurzer Blick hinein ...</p>
    </section>
  );
}

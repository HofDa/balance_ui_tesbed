/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import '@/lib/gsap-setup';
import { publicPath } from '@/lib/publicPath';
import { zoomCameraToTarget } from '@/lib/zoomCameraToTarget';
import styles from './HouseFacadeScene.module.css';
import InteractiveWindowHotspot from './InteractiveWindowHotspot';

interface HouseFacadeSceneProps {
  onEnterBathroom: () => void;
}

export default function HouseFacadeScene({ onEnterBathroom }: HouseFacadeSceneProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cameraStageRef = useRef<HTMLDivElement>(null);
  const targetWindowRef = useRef<HTMLButtonElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (cameraStageRef.current) {
      gsap.set(cameraStageRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        transformOrigin: '0 0',
      });
    }

    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
  }, []);

  const handleStart = () => {
    if (isAnimating || !viewportRef.current || !cameraStageRef.current || !targetWindowRef.current) {
      return;
    }

    setIsAnimating(true);
    tweenRef.current?.kill();
    tweenRef.current = zoomCameraToTarget({
      sceneEl: cameraStageRef.current,
      containerEl: viewportRef.current,
      targetEl: targetWindowRef.current,
      duration: 1.45,
      ease: 'power3.inOut',
      onComplete: onEnterBathroom,
    });
  };

  return (
    <section className={styles.facadeScene} aria-label="Hausfassade">
      <div ref={viewportRef} className={styles.facadeViewport}>
        <div ref={cameraStageRef} className={styles.cameraStage}>
          <div className={styles.housePlane}>
            <img
              src={publicPath('/assets/house_closed.svg')}
              alt="Fassade eines Hauses"
              className={styles.houseGraphic}
            />

            <img
              src={publicPath('/assets/window.svg')}
              alt=""
              className={styles.windowGraphic}
              aria-hidden="true"
            />

            <InteractiveWindowHotspot
              ref={targetWindowRef}
              ariaLabel="Ins Badezimmer zoomen"
              disabled={isAnimating}
              onActivate={handleStart}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { type KeyboardEvent, type PointerEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import styles from './BathtubFillInteraction.module.css';

const FULL_BATH_LITERS = 160;
const MAX_MONTHLY_LITERS = FULL_BATH_LITERS * 8;
const litersFormatter = new Intl.NumberFormat('de-DE');

const BATH_FREQUENCIES = [
  { id: 'rare', label: 'selten', hint: 'alle paar Monate', monthlyBaths: 0.25 },
  { id: 'monthly', label: '1x', hint: 'pro Monat', monthlyBaths: 1 },
  { id: 'twiceMonthly', label: '2x', hint: 'pro Monat', monthlyBaths: 2 },
  { id: 'weekly', label: '1x', hint: 'pro Woche', monthlyBaths: 4 },
  { id: 'twiceWeekly', label: '2x', hint: 'pro Woche', monthlyBaths: 8 },
] as const;

type BathFrequencyId = (typeof BATH_FREQUENCIES)[number]['id'];

const clampFillLevel = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export default function BathtubFillInteraction() {
  const waterClipId = useId().replace(/:/g, '');
  const waterGradientId = `${waterClipId}-water-gradient`;
  const [fillLevel, setFillLevel] = useState(8);
  const [bathFrequencyId, setBathFrequencyId] = useState<BathFrequencyId>('monthly');
  const [tiltState, setTiltState] = useState<'idle' | 'enabled' | 'blocked'>('idle');
  const controlRef = useRef<HTMLDivElement | null>(null);
  const fillLevelRef = useRef(fillLevel);
  const isDraggingRef = useRef(false);
  const tiltBaselineRef = useRef<number | null>(null);
  const tiltFillBaselineRef = useRef(fillLevel);

  const updateFillLevel = useCallback((nextFillLevel: number) => {
    const clampedFillLevel = clampFillLevel(nextFillLevel);
    fillLevelRef.current = clampedFillLevel;
    setFillLevel(clampedFillLevel);
  }, []);

  const updateFillFromPointer = useCallback(
    (clientY: number) => {
      const controlRect = controlRef.current?.getBoundingClientRect();

      if (!controlRect) {
        return;
      }

      updateFillLevel(((controlRect.bottom - clientY) / controlRect.height) * 100);
    },
    [updateFillLevel],
  );

  const requestTiltAccess = useCallback(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setTiltState('blocked');
      return;
    }

    const orientationEvent = window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;
    tiltBaselineRef.current = null;
    tiltFillBaselineRef.current = fillLevelRef.current;

    if (typeof orientationEvent.requestPermission !== 'function') {
      setTiltState('enabled');
      return;
    }

    void orientationEvent
      .requestPermission()
      .then((permissionState) => setTiltState(permissionState === 'granted' ? 'enabled' : 'blocked'))
      .catch(() => setTiltState('blocked'));
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    requestTiltAccess();
    updateFillFromPointer(event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    updateFillFromPointer(event.clientY);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keyActions: Record<string, number | 'min' | 'max'> = {
      ArrowUp: 5,
      ArrowRight: 5,
      PageUp: 12,
      ArrowDown: -5,
      ArrowLeft: -5,
      PageDown: -12,
      Home: 'min',
      End: 'max',
    };

    const action = keyActions[event.key];

    if (action === undefined) {
      return;
    }

    event.preventDefault();
    requestTiltAccess();

    if (action === 'min') {
      updateFillLevel(0);
      return;
    }

    if (action === 'max') {
      updateFillLevel(100);
      return;
    }

    updateFillLevel(fillLevelRef.current + action);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      return undefined;
    }

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null) {
        return;
      }

      setTiltState('enabled');

      if (tiltBaselineRef.current === null) {
        tiltBaselineRef.current = event.beta;
        tiltFillBaselineRef.current = fillLevelRef.current;
      }

      const tiltDelta = event.beta - tiltBaselineRef.current;
      updateFillLevel(tiltFillBaselineRef.current + tiltDelta * 1.35);
    };

    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [updateFillLevel]);

  const statusCopy = 'Ziehe nach oben oder kippe dein Smartphone.';
  const selectedFrequency =
    BATH_FREQUENCIES.find((frequency) => frequency.id === bathFrequencyId) ?? BATH_FREQUENCIES[0];
  const bathLiters = Math.round((fillLevel / 100) * FULL_BATH_LITERS);
  const monthlyLiters = Math.round(bathLiters * selectedFrequency.monthlyBaths);
  const bathLitersLabel = litersFormatter.format(bathLiters);
  const monthlyLitersLabel = litersFormatter.format(monthlyLiters);
  const bathBarPercent = Math.round((bathLiters / FULL_BATH_LITERS) * 100);
  const monthlyBarPercent = Math.min(100, Math.round((monthlyLiters / MAX_MONTHLY_LITERS) * 100));
  const waterTopY = 132 - (fillLevel / 100) * 58;
  const waterHeight = 140 - waterTopY;

  return (
    <div className={styles.bathtubInteraction}>
      <div className={styles.statusPanel} aria-live="polite">
        <div
          className={styles.consumptionChart}
          aria-label={`Wasserverbrauch: ${bathLitersLabel} Liter pro Bad und ${monthlyLitersLabel} Liter pro Monat.`}
        >
          <div className={styles.chartHeader}>
            <span className={styles.statusLabel}>Wasserverbrauch</span>
            <span className={styles.chartScale}>volle Wanne: {FULL_BATH_LITERS} l</span>
          </div>

          <div className={styles.chartRows}>
            <div className={styles.chartRow}>
              <div className={styles.chartMeta}>
                <span className={styles.chartLabel}>pro Bad</span>
                <strong className={styles.chartValue}>{bathLitersLabel} l</strong>
              </div>
              <div className={styles.barTrack} aria-hidden="true">
                <span className={styles.barFill} style={{ width: `${bathBarPercent}%` }} />
              </div>
            </div>

            <div className={styles.chartRow}>
              <div className={styles.chartMeta}>
                <span className={styles.chartLabel}>pro Monat</span>
                <strong className={styles.chartValue}>{monthlyLitersLabel} l</strong>
              </div>
              <div className={styles.barTrack} aria-hidden="true">
                <span
                  className={`${styles.barFill} ${styles.barFillMonthly}`}
                  style={{ width: `${monthlyBarPercent}%` }}
                />
              </div>
            </div>
          </div>

          <span className={styles.chartNote}>Balken reagieren auf Füllstand und Badehäufigkeit.</span>
        </div>

        <div className={styles.frequencyControl} aria-label="Wie oft badest du?">
          <span className={styles.frequencyPrompt}>Wie oft badest du?</span>
          <div className={styles.frequencyOptions}>
            {BATH_FREQUENCIES.map((frequency) => (
              <button
                key={frequency.id}
                type="button"
                className={`${styles.frequencyButton} ${
                  frequency.id === bathFrequencyId ? styles.frequencyButtonActive : ''
                }`}
                aria-pressed={frequency.id === bathFrequencyId}
                onClick={() => setBathFrequencyId(frequency.id)}
              >
                <span className={styles.frequencyBubble}>{frequency.label}</span>
                <span className={styles.frequencyHint}>{frequency.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={controlRef}
        className={styles.fillControl}
        role="slider"
        tabIndex={0}
        aria-label="Wasserstand der Badewanne"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={fillLevel}
        aria-valuetext={`${fillLevel}% gefüllt`}
        aria-orientation="vertical"
        aria-describedby="bathtub-fill-hint"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.bathtubShadow} aria-hidden="true" />
        <div className={styles.bathtubIllustration}>
          <svg
            className={styles.waterSvg}
            viewBox="0 0 203.28313 154.30243"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id={waterGradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(139, 211, 230, 0.86)" />
                <stop offset="56%" stopColor="rgba(85, 171, 198, 0.84)" />
                <stop offset="100%" stopColor="rgba(49, 126, 158, 0.8)" />
              </linearGradient>
              <clipPath id={waterClipId} clipPathUnits="userSpaceOnUse">
                <path d="M 12.05 72.2 H 191.7 C 191.1 88.2 178.9 135.8 149 135.6 L 54 135.25 C 24 135.15 12.4 88.2 12.05 72.2 Z" />
              </clipPath>
            </defs>

            <g clipPath={`url(#${waterClipId})`}>
              <rect
                className={styles.waterBody}
                x="8"
                y={waterTopY}
                width="188"
                height={waterHeight}
                fill={`url(#${waterGradientId})`}
              />
              <ellipse className={styles.waterSurfaceSvg} cx="101.6" cy={waterTopY} rx="88" ry="3.2" />
            </g>
          </svg>
          <Image
            src="/assets/bathtube_base.svg"
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 82vw, 620px"
            className={styles.bathtubImage}
          />
        </div>
      </div>

      <p id="bathtub-fill-hint" className={styles.interactionHint}>
        Smartphone kippen. Auf Desktop von unten nach oben ziehen.
        {tiltState === 'blocked' ? ' Neigung ist auf diesem Gerät nicht verfügbar.' : ''}
        {' '}
        {statusCopy}
      </p>
    </div>
  );
}

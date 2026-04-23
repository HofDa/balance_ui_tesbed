import { type KeyboardEvent, type PointerEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { publicPath } from '@/lib/publicPath';
import styles from './BathtubFillInteraction.module.css';

const FULL_BATH_LITERS = 160;
const MAX_MONTHLY_LITERS = FULL_BATH_LITERS * 8;
const DEFAULT_FILL_LEVEL = 8;
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
  const [fillLevel, setFillLevel] = useState(0);
  const [bathFrequencyId, setBathFrequencyId] = useState<BathFrequencyId>('monthly');
  const [tiltState, setTiltState] = useState<'idle' | 'enabled' | 'blocked' | 'unsupported'>('idle');
  const [needsPermission, setNeedsPermission] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const fillLevelRef = useRef(fillLevel);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartFillRef = useRef(fillLevel);
  const tiltBaselineRef = useRef<number | null>(null);
  const tiltFillBaselineRef = useRef(fillLevel);
  const tiltSmoothedRef = useRef<number | null>(null);
  const hasUserInteractedRef = useRef(false);
  const [tiltPaused, setTiltPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const updateFillLevel = useCallback((nextFillLevel: number) => {
    const clampedFillLevel = clampFillLevel(nextFillLevel);
    const previousFillLevel = fillLevelRef.current;

    if (
      clampedFillLevel !== previousFillLevel &&
      (clampedFillLevel === 0 || clampedFillLevel === 100) &&
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      navigator.vibrate(12);
    }

    fillLevelRef.current = clampedFillLevel;
    setFillLevel(clampedFillLevel);
  }, []);

  const updateFillFromDrag = useCallback(
    (clientY: number) => {
      const controlRect = controlRef.current?.getBoundingClientRect();

      if (!controlRect) {
        return;
      }

      const dragDelta = ((dragStartYRef.current - clientY) / controlRect.height) * 100;
      updateFillLevel(dragStartFillRef.current + dragDelta);
    },
    [updateFillLevel],
  );

  const requestTiltAccess = useCallback(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setTiltState('unsupported');
      return;
    }

    const orientationEvent = window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;
    tiltBaselineRef.current = null;
    tiltFillBaselineRef.current = fillLevelRef.current;

    if (typeof orientationEvent.requestPermission !== 'function') {
      setTiltState('enabled');
      setNeedsPermission(false);
      return;
    }

    void orientationEvent
      .requestPermission()
      .then((permissionState) => {
        if (permissionState === 'granted') {
          setTiltState('enabled');
          setNeedsPermission(false);
        } else {
          setTiltState('blocked');
        }
      })
      .catch(() => setTiltState('blocked'));
  }, []);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth > 900);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    const introTarget = DEFAULT_FILL_LEVEL;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      fillLevelRef.current = introTarget;
      setFillLevel(introTarget);
      return undefined;
    }

    const duration = 650;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      if (hasUserInteractedRef.current) {
        return;
      }

      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = eased * introTarget;
      fillLevelRef.current = next;
      setFillLevel(next);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    hasUserInteractedRef.current = true;
    setHasInteracted(true);
    isDraggingRef.current = true;
    dragStartYRef.current = event.clientY;
    dragStartFillRef.current = fillLevelRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    updateFillFromDrag(event.clientY);
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
    hasUserInteractedRef.current = true;
    setHasInteracted(true);

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

  const handleReset = () => {
    hasUserInteractedRef.current = true;
    setHasInteracted(true);
    tiltBaselineRef.current = null;
    tiltFillBaselineRef.current = DEFAULT_FILL_LEVEL;
    updateFillLevel(DEFAULT_FILL_LEVEL);
  };

  useEffect(() => {
    if (tiltState !== 'enabled') {
      return undefined;
    }

    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      return undefined;
    }

    tiltBaselineRef.current = null;
    tiltSmoothedRef.current = null;

    const TILT_SMOOTHING = 0.18;
    const TILT_DEAD_ZONE_DEG = 1.5;
    const TILT_CURVE = 0.11;
    const TILT_MAX_DEG = 35;

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || tiltPaused) {
        return;
      }

      const rawBeta = event.beta;
      const previousSmoothed = tiltSmoothedRef.current;
      const smoothedBeta =
        previousSmoothed === null
          ? rawBeta
          : previousSmoothed + (rawBeta - previousSmoothed) * TILT_SMOOTHING;
      tiltSmoothedRef.current = smoothedBeta;

      if (tiltBaselineRef.current === null) {
        tiltBaselineRef.current = smoothedBeta;
        tiltFillBaselineRef.current = fillLevelRef.current;
        return;
      }

      const rawDelta = smoothedBeta - tiltBaselineRef.current;
      const clampedDelta = Math.max(-TILT_MAX_DEG, Math.min(TILT_MAX_DEG, rawDelta));
      const absDelta = Math.abs(clampedDelta);

      if (absDelta < TILT_DEAD_ZONE_DEG) {
        return;
      }

      if (Math.abs(rawDelta) > 2) {
        hasUserInteractedRef.current = true;
        setHasInteracted(true);
      }

      const effectiveDeg = absDelta - TILT_DEAD_ZONE_DEG;
      const shapedDelta = Math.sign(clampedDelta) * effectiveDeg * effectiveDeg * TILT_CURVE;

      updateFillLevel(tiltFillBaselineRef.current + shapedDelta);
    };

    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [tiltState, tiltPaused, updateFillLevel]);

  const statusCopy =
    isDesktop
      ? 'Ziehe das Wasser nach oben oder unten.'
      : tiltState === 'enabled' && tiltPaused
      ? 'Wasserstand gesperrt. Tippe erneut auf das Schloss, um ihn zu ändern.'
      : tiltState === 'enabled'
      ? 'Neigung aktiv – kippe dein Smartphone, um den Wasserstand zu ändern.'
      : tiltState === 'blocked'
      ? 'Zugriff auf die Neigung wurde abgelehnt. Bitte in den Safari-Einstellungen unter „Bewegung & Ausrichtung“ erlauben.'
      : tiltState === 'unsupported'
      ? 'Neigung ist auf diesem Gerät nicht verfügbar. Ziehe das Wasser nach oben oder unten.'
      : needsPermission
      ? 'Tippe auf „Neigung aktivieren“, um dein Smartphone als Sensor zu nutzen – oder ziehe das Wasser.'
      : 'Ziehe das Wasser nach oben oder unten.';
  const hudStatus =
    tiltState === 'enabled' && tiltPaused
      ? 'gesperrt'
      : tiltState === 'enabled'
      ? 'Smartphone kippen'
      : 'Ziehen';
  const selectedFrequency =
    BATH_FREQUENCIES.find((frequency) => frequency.id === bathFrequencyId) ?? BATH_FREQUENCIES[0];
  const bathLitersRaw = (fillLevel / 100) * FULL_BATH_LITERS;
  const bathLiters = Math.round(bathLitersRaw / 5) * 5;
  const monthlyLiters = Math.round((bathLiters * selectedFrequency.monthlyBaths) / 5) * 5;
  const bathLitersLabel = litersFormatter.format(bathLiters);
  const monthlyLitersLabel = litersFormatter.format(monthlyLiters);
  const bathBarPercent = Math.round((bathLitersRaw / FULL_BATH_LITERS) * 100);
  const monthlyBarPercent = Math.min(
    100,
    Math.round((bathLitersRaw * selectedFrequency.monthlyBaths) / MAX_MONTHLY_LITERS * 100),
  );
  const waterTopY = 132 - (fillLevel / 100) * 58;
  const waterHeight = 140 - waterTopY;

  return (
    <div className={styles.bathtubInteraction}>
      <div className={styles.statusPanel}>
        <div className={styles.consumptionChart}>
          <div className={styles.chartHeader}>
            <span className={styles.statusLabel}>Wasserverbrauch</span>
            <span className={styles.chartScale}>volle Wanne: {FULL_BATH_LITERS} l</span>
          </div>

          <div
            className={styles.chartRows}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Wasserverbrauch: ${bathLitersLabel} Liter pro Bad und ${monthlyLitersLabel} Liter pro Monat.`}
          >
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
        <span className={styles.fillBadge} aria-hidden="true">
          {fillLevel}%
        </span>
        <div className={styles.bathtubShadow} aria-hidden="true" />
        <div className={styles.bathtubIllustration}>
          {tiltState === 'enabled' ? (
            <button
              type="button"
              className={styles.tiltPauseFab}
              onClick={(event) => {
                event.stopPropagation();
                setTiltPaused((paused) => !paused);
              }}
              onPointerDown={(event) => event.stopPropagation()}
              aria-pressed={tiltPaused}
              aria-label={tiltPaused ? 'Wasserstand entsperren' : 'Wasserstand sperren'}
            >
              <svg
                className={styles.tiltPauseFabSvg}
                viewBox="0 0 48 36"
                aria-hidden="true"
                focusable="false"
              >
                <g className={`${styles.tiltPauseFabLever} ${tiltPaused ? styles.tiltPauseFabLeverClosed : ''}`}>
                  <path
                    className={styles.tiltPauseFabBody}
                    d="M2 14 H20 A2 2 0 0 1 20 22 H2 A2 2 0 0 1 2 14 Z"
                    fill="#ffffff"
                    stroke="#172329"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                </g>
                <circle
                  className={styles.tiltPauseFabBody}
                  cx="32"
                  cy="18"
                  r="14"
                  fill="#ffffff"
                  stroke="#172329"
                  strokeWidth="2.4"
                />
                <g transform="translate(32.6 18)">
                  <rect
                    x="-5.6"
                    y="-0.6"
                    width="11.2"
                    height="8.4"
                    rx="1.6"
                    fill="none"
                    stroke="#172329"
                    strokeWidth="1.9"
                  />
                  <path
                    d={tiltPaused ? 'M-3.3 -0.6 V-3.8 a3.3 3.3 0 0 1 6.6 0 V-0.6' : 'M-3.3 -0.6 V-3.8 a3.3 3.3 0 0 1 6.2 -1.6'}
                    fill="none"
                    stroke="#172329"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="3.6" r="1.05" fill="#172329" />
                </g>
              </svg>
            </button>
          ) : null}
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
          <img
            src={publicPath('/assets/bathtube_base.svg')}
            alt=""
            className={styles.bathtubImage}
          />
          <div className={styles.tubHud} aria-hidden="true">
            <span className={styles.tubHudValue}>{fillLevel}%</span>
            <span className={styles.tubHudStatus}>{hudStatus}</span>
          </div>
        </div>
        <p
          id="bathtub-fill-hint"
          className={`${styles.interactionHint} ${hasInteracted ? styles.interactionHintMuted : ''}`}
        >
          {statusCopy}
        </p>
      </div>

      <div className={styles.hintRow}>
        <div className={styles.actionButtons}>
          {!isDesktop && needsPermission && tiltState !== 'enabled' ? (
            <button
              type="button"
              className={styles.tiltPermissionButton}
              onClick={requestTiltAccess}
            >
              Neigung aktivieren
            </button>
          ) : null}
          {hasInteracted && fillLevel !== DEFAULT_FILL_LEVEL ? (
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
              aria-label="Wasserstand zurücksetzen"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M4 9 L4 4 M4 9 L9 9 M4 9 C6.5 5.5 10.2 4 14 4.5 C18.4 5.1 21.5 8.5 21.5 13 C21.5 17.7 17.7 21.5 13 21.5 C8.9 21.5 5.4 18.5 4.7 14.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

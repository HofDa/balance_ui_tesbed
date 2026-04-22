import gsap from 'gsap';

interface ZoomCameraToTargetArgs {
  sceneEl: HTMLElement;
  containerEl: HTMLElement;
  targetEl: Element;
  scale?: number;
  duration?: number;
  ease?: string;
  onComplete?: () => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getAutoScale(containerRect: DOMRect, targetRect: DOMRect): number {
  const targetWidthGoal = containerRect.width * 0.34;
  const targetHeightGoal = containerRect.height * 0.3;

  const scaleX = targetWidthGoal / targetRect.width;
  const scaleY = targetHeightGoal / targetRect.height;

  return clamp(Math.max(scaleX, scaleY), 1.4, 4.6);
}

export function zoomCameraToTarget({
  sceneEl,
  containerEl,
  targetEl,
  scale,
  duration = 1.45,
  ease = 'power3.inOut',
  onComplete,
}: ZoomCameraToTargetArgs): gsap.core.Tween | null {
  gsap.set(sceneEl, { transformOrigin: '0 0', force3D: true });

  const containerRect = containerEl.getBoundingClientRect();
  const sceneRect = sceneEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const containerCenterX = containerRect.left + containerRect.width / 2;
  const containerCenterY = containerRect.top + containerRect.height / 2;

  const finalScale = scale ?? getAutoScale(containerRect, targetRect);

  const targetLocalX = targetCenterX - sceneRect.left;
  const targetLocalY = targetCenterY - sceneRect.top;

  const translateX = containerCenterX - sceneRect.left - targetLocalX * finalScale;
  const translateY = containerCenterY - sceneRect.top - targetLocalY * finalScale;

  if (prefersReducedMotion()) {
    gsap.set(sceneEl, { x: translateX, y: translateY, scale: finalScale });
    onComplete?.();
    return null;
  }

  return gsap.to(sceneEl, {
    x: translateX,
    y: translateY,
    scale: finalScale,
    duration,
    ease,
    onComplete,
  });
}

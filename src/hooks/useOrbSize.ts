import { useState, useEffect, useCallback } from 'react';

export interface OrbSizeOptions {
  fallbackSize?: number;
  minSize?: number;
  maxSize?: number;
  scaleFactor?: number;
}

const DEFAULT_OPTIONS: Required<OrbSizeOptions> = {
  fallbackSize: 300,
  minSize: 200,
  maxSize: 600,
  scaleFactor: 0.7,
};

/**
 * Calculate responsive orb size based on viewport dimensions
 */
export function getResponsiveOrbSize(options: OrbSizeOptions = {}): number {
  const { fallbackSize, minSize, maxSize, scaleFactor } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (typeof window === 'undefined') {
    return fallbackSize;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const minDimension = Math.min(vw, vh);

  // Scale orb to percentage of smallest viewport dimension
  const calculatedSize = minDimension * scaleFactor;

  // Clamp to min/max bounds
  return Math.min(Math.max(calculatedSize, minSize), maxSize);
}

/**
 * Hook that returns responsive orb size and updates on resize
 */
export function useOrbSize(options: OrbSizeOptions = {}): number {
  const [size, setSize] = useState(() => getResponsiveOrbSize(options));

  const updateSize = useCallback(() => {
    setSize(getResponsiveOrbSize(options));
  }, [options]);

  useEffect(() => {
    // Initial size
    updateSize();

    // Listen for resize
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, [updateSize]);

  return size;
}

/**
 * Preset size configurations
 */
export const ORB_SIZE_PRESETS = {
  small: { minSize: 150, maxSize: 250, scaleFactor: 0.4 },
  medium: { minSize: 200, maxSize: 400, scaleFactor: 0.55 },
  large: { minSize: 280, maxSize: 560, scaleFactor: 0.7 },
  fullscreen: { minSize: 300, maxSize: 800, scaleFactor: 0.85 },
} as const;

export function useOrbSizePreset(preset: keyof typeof ORB_SIZE_PRESETS): number {
  return useOrbSize(ORB_SIZE_PRESETS[preset]);
}

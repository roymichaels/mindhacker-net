import { useCallback } from 'react';

type HapticIntensity = 'light' | 'medium' | 'heavy';
type HapticPattern = 'success' | 'warning' | 'error' | 'selection' | 'impact';

/**
 * Hook for providing haptic feedback on supported devices
 * Falls back gracefully when Vibration API is not available
 */
export function useHaptics() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!isSupported) return false;
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }, [isSupported]);

  const impact = useCallback((intensity: HapticIntensity = 'medium') => {
    const durations: Record<HapticIntensity, number> = {
      light: 10,
      medium: 25,
      heavy: 50,
    };
    return vibrate(durations[intensity]);
  }, [vibrate]);

  const pattern = useCallback((type: HapticPattern) => {
    const patterns: Record<HapticPattern, number[]> = {
      success: [15, 50, 15, 50, 30],
      warning: [30, 100, 30],
      error: [50, 100, 50, 100, 50],
      selection: [10],
      impact: [25],
    };
    return vibrate(patterns[type]);
  }, [vibrate]);

  const notification = useCallback(() => {
    return vibrate([50, 100, 50]);
  }, [vibrate]);

  const heartbeat = useCallback(() => {
    return vibrate([20, 100, 20, 200, 20, 100, 20]);
  }, [vibrate]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    navigator.vibrate(0);
  }, [isSupported]);

  return {
    isSupported,
    vibrate,
    impact,
    pattern,
    notification,
    heartbeat,
    stop,
  };
}

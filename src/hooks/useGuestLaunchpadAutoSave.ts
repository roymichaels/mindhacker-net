import { useCallback, useRef, useEffect } from 'react';

const STORAGE_PREFIX = 'guest_launchpad_';

interface AutoSaveConfig {
  stepKey: string;
  debounceMs?: number;
}

export function useGuestLaunchpadAutoSave({ stepKey, debounceMs = 500 }: AutoSaveConfig) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const saveData = useCallback((data: unknown) => {
    const storageKey = `${STORAGE_PREFIX}${stepKey}`;
    const serialized = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (serialized === lastSavedRef.current) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounced save
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, serialized);
        lastSavedRef.current = serialized;
        console.log(`[GuestAutoSave] Saved ${stepKey}`);
      } catch (e) {
        console.error(`[GuestAutoSave] Failed to save ${stepKey}:`, e);
      }
    }, debounceMs);
  }, [stepKey, debounceMs]);

  const loadData = useCallback(<T>(): T | null => {
    const storageKey = `${STORAGE_PREFIX}${stepKey}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        lastSavedRef.current = stored;
        return parsed as T;
      }
    } catch (e) {
      console.error(`[GuestAutoSave] Failed to load ${stepKey}:`, e);
    }
    return null;
  }, [stepKey]);

  const clearData = useCallback(() => {
    const storageKey = `${STORAGE_PREFIX}${stepKey}`;
    try {
      localStorage.removeItem(storageKey);
      lastSavedRef.current = '';
    } catch (e) {
      console.error(`[GuestAutoSave] Failed to clear ${stepKey}:`, e);
    }
  }, [stepKey]);

  // Immediate save (no debounce)
  const saveImmediate = useCallback((data: unknown) => {
    const storageKey = `${STORAGE_PREFIX}${stepKey}`;
    const serialized = JSON.stringify(data);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    try {
      localStorage.setItem(storageKey, serialized);
      lastSavedRef.current = serialized;
    } catch (e) {
      console.error(`[GuestAutoSave] Failed immediate save ${stepKey}:`, e);
    }
  }, [stepKey]);

  return {
    saveData,
    loadData,
    clearData,
    saveImmediate,
  };
}

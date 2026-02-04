/**
 * Shared Auto-Save Hook for Journey Steps
 * Replaces 20+ duplicate useEffect patterns across step components
 */
import { useEffect, useRef, useCallback } from 'react';

export interface UseAutoSaveOptions {
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Automatically saves data after a debounce period
 * 
 * @param data - The data to save
 * @param onSave - Callback function to save the data
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const MyStep = ({ onAutoSave }: StepProps) => {
 *   const [formData, setFormData] = useState({});
 *   
 *   useAutoSave(formData, onAutoSave, { debounceMs: 500 });
 *   
 *   return <form>...</form>;
 * };
 * ```
 */
export function useAutoSave<T extends Record<string, unknown>>(
  data: T,
  onSave?: (data: T) => void,
  options: UseAutoSaveOptions = {}
): void {
  const { debounceMs = 500, enabled = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip auto-save if disabled or no save callback
    if (!enabled || !onSave) return;

    // Skip first render to avoid saving initial state
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedRef.current = JSON.stringify(data);
      return;
    }

    // Check if data actually changed
    const currentDataString = JSON.stringify(data);
    if (currentDataString === lastSavedRef.current) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      onSave(data);
      lastSavedRef.current = currentDataString;
    }, debounceMs);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, debounceMs, enabled]);
}

/**
 * Hook that returns a debounced save function
 * Useful when you need more control over when saves happen
 */
export function useDebouncedSave<T extends Record<string, unknown>>(
  onSave?: (data: T) => void,
  debounceMs = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback((data: T) => {
    if (!onSave) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSave(data);
    }, debounceMs);
  }, [onSave, debounceMs]);

  const saveImmediately = useCallback((data: T) => {
    if (!onSave) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    onSave(data);
  }, [onSave]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { save, saveImmediately, cancel };
}

export default useAutoSave;

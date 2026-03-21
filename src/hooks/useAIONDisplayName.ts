/**
 * useAIONDisplayName — Returns the user's personal AION name for UI display.
 *
 * RULE: In user-facing interactive surfaces, always use this hook
 * instead of hardcoding "AION". The personal name makes the AI feel
 * like the user's own future self, not a generic system.
 *
 * Fallback: "AION" when no personal name is set or user is not logged in.
 */
import { useAION } from '@/identity';

export function useAIONDisplayName() {
  const { aion, isLoading } = useAION();
  // aion.name already falls back to 'AION' in useAION if no name is set
  return {
    displayName: aion.name,
    isLoading,
  };
}

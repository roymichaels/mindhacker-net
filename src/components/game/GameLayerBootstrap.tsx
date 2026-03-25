import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { featureFlags } from '@/lib/featureFlags';

/**
 * Initializes the MMO/game layer progressively.
 * No UI is rendered yet; this only ensures a game profile exists
 * when the flag is enabled.
 */
export default function GameLayerBootstrap() {
  const { user } = useAuth();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!featureFlags.enableGameLayer || !user?.id || startedRef.current) return;
    startedRef.current = true;

    supabase.rpc('init_game_profile').then(({ error }) => {
      if (error) {
        console.warn('[GameLayer] Failed to initialize game profile:', error.message);
      }
    });
  }, [user?.id]);

  return null;
}

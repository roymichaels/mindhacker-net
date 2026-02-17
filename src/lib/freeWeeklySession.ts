import { supabase } from '@/integrations/supabase/client';

const FREE_SESSION_INTERVAL_DAYS = 7;

/**
 * Check if user has a free weekly hypnosis session available.
 * Returns true if no energy_events spend from 'hypnosis' source in the last 7 days,
 * OR if user has never spent energy on hypnosis.
 */
export async function hasFreeWeeklySession(userId: string): Promise<boolean> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - FREE_SESSION_INTERVAL_DAYS);

  const { count, error } = await supabase
    .from('energy_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', 'hypnosis')
    .lt('change', 0)
    .gte('created_at', weekAgo.toISOString());

  if (error) return false;
  return (count ?? 0) === 0;
}

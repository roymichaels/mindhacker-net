/**
 * Coach matching — read-only (Phase 2 · Batch 2).
 *
 * Surfaces practitioners from the marketplace so AION can recommend or
 * "match" without sending the user to /coaches. Pure read; never writes.
 */
import { supabase } from '@/integrations/supabase/client';

export interface CoachRecommendation {
  id: string;
  display_name: string;
  title: string;
  slug: string;
  is_featured: boolean;
}

export interface CoachMatchResult {
  total: number;
  pick: CoachRecommendation | null;
  samples: CoachRecommendation[];
  text: string;
}

export async function recommendCoaches(query?: string, limit = 5): Promise<CoachMatchResult> {
  let q = supabase
    .from('practitioners')
    .select('id, display_name, title, slug, is_featured', { count: 'exact' })
    .order('is_featured', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (query && query.trim()) {
    const term = `%${query.trim().slice(0, 60)}%`;
    q = q.or(`display_name.ilike.${term},title.ilike.${term},bio.ilike.${term}`);
  }

  const { data, count } = await q;
  const samples = (data ?? []) as CoachRecommendation[];
  const pick = samples[0] ?? null;
  const text = samples.length
    ? `נמצאו ${count ?? samples.length} מאמנים${query ? ` עבור "${query.slice(0, 30)}"` : ''}${pick ? ` · מומלץ: ${pick.display_name}` : ''}.`
    : 'אין כרגע מאמנים זמינים שמתאימים.';
  return { total: count ?? samples.length, pick, samples, text };
}
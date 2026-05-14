/**
 * Hypnosis Catalog service — Phase 2 Batch 1.
 *
 * Read-only access to the shared `hypnosis_audios` catalog. Powers the
 * `hypnosis.recommend` capability without coupling the executor to raw
 * Supabase queries. Script generation + audio caching still live in their
 * dedicated edge functions; `hypnosis.start` remains preview-only until
 * Phase 3 wires a canonical "start session" mutation.
 */
import { supabase } from '@/integrations/supabase/client';

export interface HypnosisAudioLite {
  id: string;
  title: string;
  duration_seconds: number | null;
}

export async function listHypnosisAudios(limit = 3): Promise<{
  total: number;
  samples: HypnosisAudioLite[];
}> {
  const { data, count, error } = await supabase
    .from('hypnosis_audios')
    .select('id, title, duration_seconds', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return {
    total: count ?? data?.length ?? 0,
    samples: (data ?? []) as unknown as HypnosisAudioLite[],
  };
}

export interface HypnosisRecommendation {
  total: number;
  pick: HypnosisAudioLite | null;
  samples: HypnosisAudioLite[];
  text: string;
}

export async function recommendHypnosis(): Promise<HypnosisRecommendation> {
  const { total, samples } = await listHypnosisAudios(3);
  const pick = samples[0] ?? null;
  const text = pick
    ? `${total} מפגשי היפנוזה זמינים. למשל: "${pick.title}".`
    : 'אין כרגע מפגשי היפנוזה זמינים.';
  return { total, pick, samples, text };
}
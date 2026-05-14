/**
 * Business domain — read-only summary service (Phase 2 · Batch 2).
 *
 * Surfaces the most recent business journey + active plan so AION can
 * answer "what's my business?" without depending on /business UI.
 * Pure read; never writes.
 */
import { supabase } from '@/integrations/supabase/client';

export interface BusinessSummary {
  hasJourney: boolean;
  journey?: { id: string; name: string; type?: string | null; complete?: boolean } | null;
  plan?: { id: string; title: string; current_week?: number | null; total_weeks?: number | null } | null;
  branding?: { id: string } | null;
  text: string;
}

export async function summarizeBusiness(userId: string): Promise<BusinessSummary> {
  if (!userId) return { hasJourney: false, text: 'אין משתמש.' };

  const [{ data: journeys }, { data: plans }] = await Promise.all([
    supabase
      .from('business_journeys')
      .select('id, business_name, journey_complete, current_step')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('business_plans')
      .select('id, title, current_week, total_weeks, status, business_id')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1),
  ]);

  const j = journeys?.[0];
  const p = plans?.[0];

  let b: { id: string } | null = null;
  if (j?.id) {
    const { data: brand } = await supabase
      .from('business_branding')
      .select('id')
      .eq('business_id', j.id)
      .maybeSingle();
    b = brand ? { id: brand.id } : null;
  }

  const name = j?.business_name ?? 'העסק שלך';
  const text = j
    ? `${name}${p ? ` · שבוע ${p.current_week ?? 1}/${p.total_weeks ?? 12}` : j.journey_complete ? ' · אשף הושלם' : ` · שלב ${j.current_step ?? 1}/10`}`
    : 'עוד אין עסק רשום. אפשר להתחיל טיוטה.';

  return {
    hasJourney: !!j,
    journey: j ? { id: j.id, name, complete: j.journey_complete } : null,
    plan: p ? { id: p.id, title: p.title, current_week: p.current_week, total_weeks: p.total_weeks } : null,
    branding: b,
    text,
  };
}

export interface LandingPagePreview {
  total: number;
  recent: Array<{ id: string; title: string; status: string; slug: string }>;
  text: string;
}

export async function previewLandingPages(userId: string): Promise<LandingPagePreview> {
  if (!userId) return { total: 0, recent: [], text: 'אין משתמש.' };
  const { data, count } = await supabase
    .from('coach_landing_pages')
    .select('id, title, status, slug', { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(3);
  const total = count ?? data?.length ?? 0;
  const recent = (data ?? []) as LandingPagePreview['recent'];
  const text = total
    ? `${total} דפי נחיתה. אחרון: "${recent[0]?.title ?? '—'}".`
    : 'אין עדיין דפי נחיתה. אפשר ליצור טיוטה.';
  return { total, recent, text };
}
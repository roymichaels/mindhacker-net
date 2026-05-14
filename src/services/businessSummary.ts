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
  journey?: { id: string; name: string; type?: string | null } | null;
  plan?: { id: string; title: string; current_week?: number | null; total_weeks?: number | null } | null;
  branding?: { id: string } | null;
  text: string;
}

export async function summarizeBusiness(userId: string): Promise<BusinessSummary> {
  if (!userId) return { hasJourney: false, text: 'אין משתמש.' };

  const [{ data: journeys }, { data: plans }, { data: branding }] = await Promise.all([
    supabase
      .from('business_journeys')
      .select('id, name, business_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('business_plans')
      .select('id, title, current_week, total_weeks, status')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1),
    supabase
      .from('business_branding')
      .select('id')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1),
  ]);

  const j = journeys?.[0];
  const p = plans?.[0];
  const b = branding?.[0];

  const text = j
    ? `העסק: ${j.name}${p ? ` · שבוע ${p.current_week ?? 1}/${p.total_weeks ?? 12}` : ' · אין תוכנית פעילה'}`
    : 'עוד אין עסק רשום. אפשר להתחיל טיוטה.';

  return {
    hasJourney: !!j,
    journey: j ? { id: j.id, name: j.name, type: (j as { business_type?: string }).business_type ?? null } : null,
    plan: p ? { id: p.id, title: p.title, current_week: p.current_week, total_weeks: p.total_weeks } : null,
    branding: b ? { id: b.id } : null,
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
  const [coachQ, generalQ] = await Promise.all([
    supabase
      .from('coach_landing_pages')
      .select('id, title, status, slug', { count: 'exact' })
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(3),
    supabase
      .from('landing_pages')
      .select('id, title, status, slug', { count: 'exact' })
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(3),
  ]);
  const total = (coachQ.count ?? 0) + (generalQ.count ?? 0);
  const recent = [
    ...(coachQ.data ?? []),
    ...(generalQ.data ?? []),
  ].slice(0, 3) as LandingPagePreview['recent'];
  const text = total
    ? `${total} דפי נחיתה. אחרון: "${recent[0]?.title ?? '—'}".`
    : 'אין עדיין דפי נחיתה. אפשר ליצור טיוטה.';
  return { total, recent, text };
}
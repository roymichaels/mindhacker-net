/**
 * Free Market service — Phase 2 Batch 3.
 * Read-only adapters around fm_gigs / fm_bounties for AION capabilities.
 */
import { supabase } from '@/integrations/supabase/client';

export interface FMListingSummary {
  id: string;
  title: string | null;
  reward: number | null;
  category: string | null;
  source: 'gig' | 'bounty';
}

export async function searchListings(query?: string, limit = 5): Promise<{
  text: string;
  samples: FMListingSummary[];
  total: number;
}> {
  const q = (query ?? '').trim();
  let gigQ = supabase
    .from('fm_gigs')
    .select('id, title, reward_mos, category, status', { count: 'exact' })
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (q) gigQ = gigQ.ilike('title', `%${q.slice(0, 60)}%`);
  const { data: gigs, count: gigCount } = await gigQ;

  let bQ = supabase
    .from('fm_bounties')
    .select('id, title, reward_mos, category, status', { count: 'exact' })
    .eq('status', 'active')
    .order('reward_mos', { ascending: false })
    .limit(limit);
  if (q) bQ = bQ.ilike('title', `%${q.slice(0, 60)}%`);
  const { data: bounties, count: bCount } = await bQ;

  const samples: FMListingSummary[] = [
    ...(gigs ?? []).map((g: any) => ({ id: g.id, title: g.title, reward: g.reward_mos, category: g.category, source: 'gig' as const })),
    ...(bounties ?? []).map((b: any) => ({ id: b.id, title: b.title, reward: b.reward_mos, category: b.category, source: 'bounty' as const })),
  ].slice(0, limit);
  const total = (gigCount ?? gigs?.length ?? 0) + (bCount ?? bounties?.length ?? 0);
  const text = total
    ? `${total} הזדמנויות בשוק החופשי${samples[0]?.title ? ` · "${samples[0].title}"` : ''}`
    : 'אין כרגע הזדמנויות פתוחות בשוק החופשי.';
  return { text, samples, total };
}

export async function previewListing(id: string): Promise<{ text: string; listing: any | null }> {
  if (!id) return { text: 'מזהה חסר.', listing: null };
  const { data: gig } = await supabase.from('fm_gigs').select('*').eq('id', id).maybeSingle();
  if (gig) return { text: `מודעה: ${gig.title ?? ''}`, listing: { ...gig, source: 'gig' } };
  const { data: bounty } = await supabase.from('fm_bounties').select('*').eq('id', id).maybeSingle();
  if (bounty) return { text: `באונטי: ${bounty.title ?? ''}`, listing: { ...bounty, source: 'bounty' } };
  return { text: 'מודעה לא נמצאה.', listing: null };
}

export async function summarizeFM(userId: string): Promise<{ text: string; openGigs: number; activeBounties: number; myClaims: number }> {
  const [gQ, bQ, cQ] = await Promise.all([
    supabase.from('fm_gigs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('fm_bounties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('fm_bounty_claims').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  const openGigs = gQ.count ?? 0;
  const activeBounties = bQ.count ?? 0;
  const myClaims = cQ.count ?? 0;
  return {
    text: `שוק חופשי · ${openGigs} גיגים · ${activeBounties} באונטיז · ${myClaims} תביעות שלך`,
    openGigs, activeBounties, myClaims,
  };
}
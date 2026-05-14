/**
 * AION Safe Read Executor — Phase F · Step 3.
 *
 * Performs READ-only queries against existing tables for capabilities whose
 * `effectiveMode === 'read' | 'suggest'`. Never writes user data. Each
 * branch returns a structured `ReadResult` with:
 *   - `summary`  : short HE string for the artifact body
 *   - `rows`     : raw row count (per source) — never the rows themselves
 *   - `sources`  : list of `table:column` queried
 *   - `data`     : a small typed payload the bridge may reference
 *
 * RLS is enforced by Supabase — the user's own JWT scopes everything.
 *
 * NOTE: this module does NOT import the artifact bus or tracer. The caller
 * (chat hook) wires the result into the bridge + trace marks.
 */
import { supabase } from '@/integrations/supabase/client';
import type { CapabilityId } from '@/orchestration/capabilities/registry';
import {
  getNextOpenAction,
  summarizeJourney,
  summarizePlan,
  previewDailyQueue,
} from '@/services/journeyPlan';
import { summarizeBrain } from '@/services/brainQuery';
import { recommendHypnosis } from '@/services/hypnosisCatalog';
import { searchJournalEntries } from '@/services/journalEntries';
import { summarizeBusiness, previewLandingPages } from '@/services/businessSummary';
import { recommendCoaches } from '@/services/coachMatch';
import { recommendCourses, summarizeCurriculum } from '@/services/courseCatalog';
import { identityBootstrapStatus, getAvatarConfig } from '@/services/avatarConfig';
import { searchListings, previewListing, summarizeFM } from '@/services/fmMarket';
import { getWalletStatus } from '@/services/walletStatus';
import { getFeed, getThread } from '@/services/communityFeed';
import { searchMessages } from '@/services/messaging';
import { getSubscriptionStatus } from '@/services/subscriptionStatus';
import { describeVoiceCapture } from '@/services/voiceCapture';
import { previewTTS } from '@/services/ttsSpeak';
import { summarizeWorkToday } from '@/services/workSummary';
import { summarizeUpcomingBlocks } from '@/services/scheduleBlocks';

export interface ReadResult {
  ok: boolean;
  capability: CapabilityId;
  durationMs: number;
  sources: string[];
  rowCounts: Record<string, number>;
  summary: string;
  data?: Record<string, unknown>;
  error?: string;
}

function nowMs() { return Date.now(); }

function fail(capability: CapabilityId, t0: number, error: string): ReadResult {
  return { ok: false, capability, durationMs: nowMs() - t0, sources: [], rowCounts: {}, summary: '', error };
}

/* ───────────────────────────── individual reads ───────────────────────────── */

async function readBrain(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const s = await summarizeBrain(userId);
  return {
    sources: ['aurora_memory_graph:active', 'pillar_confidence:top3'],
    rowCounts: { aurora_memory_graph: s.nodes.length, pillar_confidence: s.pillars.length },
    summary: s.text,
    data: { topPillars: s.topPillars, topNodes: s.topNodes },
  };
}

async function readJourneyNext(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const r = await getNextOpenAction(userId);
  return {
    sources: ['action_items:open'],
    rowCounts: { action_items: r.total },
    summary: r.pick ? `הצעד הבא: ${r.pick.title}` : 'אין משימות פתוחות כרגע.',
    data: { pick: r.pick, total: r.total, todayCount: r.todayCount },
  };
}

async function readJourneySummary(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const s = await summarizeJourney(userId);
  return {
    sources: ['life_plans:latest', 'action_items:counts'],
    rowCounts: { life_plans: s.plan ? 1 : 0, open: s.open, completed: s.completed },
    summary: s.text,
    data: { plan: s.plan, openCount: s.open, doneCount: s.completed },
  };
}

async function readPlanSummary(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const s = await summarizePlan(userId);
  return {
    sources: ['life_plans:latest', 'action_items:counts'],
    rowCounts: { life_plans: s.plan ? 1 : 0, open: s.open, completed: s.completed },
    summary: s.text,
    data: { plan: s.plan },
  };
}

async function readDailyPreview(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const p = await previewDailyQueue(userId);
  return {
    sources: ['action_items:today-preview'],
    rowCounts: { action_items: p.items.length },
    summary: p.text,
    data: { items: p.items, todayCount: p.todayCount, mode: 'preview' },
  };
}

async function readProfile(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, level, experience, active_ego_state, subscription_tier, session_streak')
    .eq('id', userId)
    .maybeSingle();

  const { data: identity } = await supabase
    .from('aurora_identity_elements')
    .select('element_type, content')
    .eq('user_id', userId)
    .limit(8);

  const titles = (identity ?? []).filter((i) => i.element_type === 'identity_title').map((i) => i.content);
  const archetypes = (identity ?? []).filter((i) => i.element_type === 'ai_archetype').map((i) => i.content);

  return {
    sources: ['profiles:self', 'aurora_identity_elements:self'],
    rowCounts: { profiles: profile ? 1 : 0, identity: identity?.length ?? 0 },
    summary: profile
      ? `${profile.full_name ?? 'אתה'} · רמה ${profile.level ?? 1} · ${profile.active_ego_state ?? 'guardian'}${titles[0] ? ' · ' + titles[0] : ''}`
      : 'אין עדיין פרופיל מלא.',
    data: { profile, titles, archetypes },
  };
}

async function readHypnosis(): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const r = await recommendHypnosis();
  return {
    sources: ['hypnosis_audios:catalog'],
    rowCounts: { hypnosis_audios: r.total },
    summary: r.text,
    data: { samples: r.samples, pick: r.pick },
  };
}

async function readJournalPreview(userId: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const { data: entries, count } = await supabase
    .from('journal_entries')
    .select('id, title, journal_type, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);
  return {
    sources: ['journal_entries:recent'],
    rowCounts: { journal_entries: count ?? entries?.length ?? 0 },
    summary: entries && entries.length
      ? `${count ?? entries.length} רשומות יומן. אחרונה: "${entries[0].title ?? entries[0].journal_type}".`
      : 'עוד אין רשומות יומן. אפשר להתחיל.',
    data: { recent: entries ?? [] },
  };
}

async function readJournalSearch(userId: string, query?: string): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  const entries = await searchJournalEntries(userId, query, 5);
  const top = entries[0];
  const summary = entries.length
    ? `נמצאו ${entries.length} רשומות יומן${query ? ` עבור "${query.slice(0, 40)}"` : ''}${top ? ` · אחרונה: "${(top.title ?? top.content ?? '').slice(0, 60)}"` : ''}.`
    : query
      ? `לא נמצאו רשומות יומן עבור "${query.slice(0, 40)}".`
      : 'אין עדיין רשומות יומן.';
  return {
    sources: ['journal_entries:search'],
    rowCounts: { journal_entries: entries.length },
    summary,
    data: { entries, query: query ?? null },
  };
}

async function readOuterWorld(): Promise<Pick<ReadResult, 'sources' | 'rowCounts' | 'summary' | 'data'>> {
  // Lightweight availability probe — counts only, no PII.
  const [coachesQ, postsQ] = await Promise.all([
    supabase.from('coach_landing_pages').select('id', { count: 'exact', head: true }),
    supabase.from('community_posts').select('id', { count: 'exact', head: true }),
  ]);
  const coaches = coachesQ.count ?? 0;
  const posts = postsQ.count ?? 0;
  return {
    sources: ['coach_landing_pages:count', 'community_posts:count'],
    rowCounts: { coaches, posts },
    summary: `עולם חיצון · ${coaches} מאמנים · ${posts} פוסטים בקהילה`,
    data: { coaches, posts },
  };
}

/* ─── Phase 2 · Batch 2 reads ─── */

async function readBusiness(userId: string) {
  const s = await summarizeBusiness(userId);
  return {
    sources: ['business_journeys:latest', 'business_plans:latest', 'business_branding:latest'],
    rowCounts: { business_journeys: s.journey ? 1 : 0, business_plans: s.plan ? 1 : 0, business_branding: s.branding ? 1 : 0 },
    summary: s.text,
    data: { journey: s.journey, plan: s.plan, hasBranding: !!s.branding },
  };
}

async function readLanding(userId: string) {
  const s = await previewLandingPages(userId);
  return {
    sources: ['coach_landing_pages:recent'],
    rowCounts: { coach_landing_pages: s.total },
    summary: s.text,
    data: { recent: s.recent, total: s.total },
  };
}

async function readCourses(query?: string) {
  const r = await recommendCourses(query);
  return {
    sources: ['content_products:courses-published'],
    rowCounts: { content_products: r.total },
    summary: r.text,
    data: { samples: r.samples, pick: r.pick },
  };
}

async function readCurriculum(userId: string) {
  const r = await summarizeCurriculum(userId);
  return {
    sources: ['learning_curricula:latest'],
    rowCounts: { learning_curricula: r.curriculum ? 1 : 0 },
    summary: r.text,
    data: { curriculum: r.curriculum },
  };
}

async function readCoaches(query?: string) {
  const r = await recommendCoaches(query);
  return {
    sources: ['practitioners:featured'],
    rowCounts: { practitioners: r.total },
    summary: r.text,
    data: { samples: r.samples, pick: r.pick },
  };
}

async function readIdentity(userId: string) {
  const s = await identityBootstrapStatus(userId);
  return {
    sources: ['profiles:self', 'aurora_identity_elements:count', 'avatar_customizations:self'],
    rowCounts: { profile: s.hasProfile ? 1 : 0, identity: s.hasIdentityElements ? 1 : 0, avatar: s.hasAvatar ? 1 : 0 },
    summary: s.text,
    data: { ...s },
  };
}

async function readAvatar(userId: string) {
  const s = await getAvatarConfig(userId);
  return {
    sources: ['avatar_customizations:self'],
    rowCounts: { avatar_customizations: s.hasCustomization ? 1 : 0 },
    summary: s.text,
    data: { hasCustomization: s.hasCustomization },
  };
}

/* ───────────────────────────── public dispatcher ───────────────────────────── */

export interface ReadCapabilityOptions {
  query?: string;
  id?: string;
  text?: string;
}

export async function executeReadCapability(
  capability: CapabilityId,
  userId: string,
  options: ReadCapabilityOptions = {},
): Promise<ReadResult> {
  const t0 = nowMs();
  if (!userId) return fail(capability, t0, 'no-user');

  try {
    switch (capability) {
      case 'brain.query':
      case 'brain.openRoom':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readBrain(userId)) };
      case 'journey.nextAction':
      case 'task.suggest':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readJourneyNext(userId)) };
      case 'daily.generate':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readDailyPreview(userId)) };
      case 'journey.summarize':
      case 'plan.suggest':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readJourneySummary(userId)) };
      case 'plan.summarize':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readPlanSummary(userId)) };
      case 'profile.summarize':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readProfile(userId)) };
      case 'hypnosis.recommend':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readHypnosis()) };
      case 'journal.capture':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readJournalPreview(userId)) };
      case 'journal.search':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readJournalSearch(userId, options.query)) };
      case 'outerWorld.open':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readOuterWorld()) };
      case 'business.summarize':
      case 'business.createDraft':
      case 'creator.content.generate':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readBusiness(userId)) };
      case 'landing.preview':
      case 'landing.generate':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readLanding(userId)) };
      case 'course.recommend':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readCourses(options.query)) };
      case 'curriculum.generate':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readCurriculum(userId)) };
      case 'coach.recommend':
      case 'coach.match':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readCoaches(options.query)) };
      case 'identity.bootstrap':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readIdentity(userId)) };
      case 'avatar.configure':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readAvatar(userId)) };
      // Phase 2 · Batch 3
      case 'fm.search':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readFMSearch(options.query)) };
      case 'fm.listing.preview':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readFMListing(options.id)) };
      case 'fm.listing.create':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readFMSummary(userId)) };
      case 'wallet.open':
      case 'wallet.status':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readWallet(userId)) };
      case 'community.feed':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readCommunityFeed(options.query)) };
      case 'community.thread':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readCommunityThread(options.id)) };
      case 'message.search':
      case 'message.send':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readMessages(userId, options.query)) };
      case 'subscription.status':
      case 'subscription.portal':
      case 'checkout.create':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readSubscription(userId)) };
      case 'voice.transcribe':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(readVoice()) };
      case 'tts.speak':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(readTTS(options.text ?? options.query)) };
      case 'work.summarize':
      case 'work.startSession':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readWorkToday(userId)) };
      case 'schedule.block':
        return { ok: true, capability, durationMs: nowMs() - t0, ...(await readScheduleBlocks(userId)) };
      default:
        return fail(capability, t0, 'no-read-handler');
    }
  } catch (e) {
    return fail(capability, t0, (e as Error)?.message ?? 'unknown-error');
  }
}

/* ─── Phase 2 · Batch 3 reads ─── */

async function readFMSearch(query?: string) {
  const r = await searchListings(query);
  return {
    sources: ['fm_gigs:open', 'fm_bounties:active'],
    rowCounts: { listings: r.total },
    summary: r.text,
    data: { samples: r.samples, total: r.total, query: query ?? null },
  };
}

async function readFMListing(id?: string) {
  const r = await previewListing(id ?? '');
  return {
    sources: ['fm_gigs:by-id', 'fm_bounties:by-id'],
    rowCounts: { listing: r.listing ? 1 : 0 },
    summary: r.text,
    data: { listing: r.listing },
  };
}

async function readFMSummary(userId: string) {
  const r = await summarizeFM(userId);
  return {
    sources: ['fm_gigs:count', 'fm_bounties:count', 'fm_bounty_claims:count'],
    rowCounts: { gigs: r.openGigs, bounties: r.activeBounties, claims: r.myClaims },
    summary: r.text,
    data: { ...r },
  };
}

async function readWallet(userId: string) {
  const r = await getWalletStatus(userId);
  return {
    sources: ['fm_wallets:self', 'fm_transactions:recent'],
    rowCounts: { wallet: r.wallet ? 1 : 0, transactions: r.recent.length },
    summary: r.text,
    data: { wallet: r.wallet, recent: r.recent },
  };
}

async function readCommunityFeed(query?: string) {
  const r = await getFeed(query);
  return {
    sources: ['community_posts:approved'],
    rowCounts: { community_posts: r.total },
    summary: r.text,
    data: { posts: r.posts, total: r.total },
  };
}

async function readCommunityThread(id?: string) {
  const r = await getThread(id ?? '');
  return {
    sources: ['community_posts:by-id', 'community_comments:by-post'],
    rowCounts: { post: r.post ? 1 : 0, comments: r.comments.length },
    summary: r.text,
    data: { post: r.post, comments: r.comments },
  };
}

async function readMessages(userId: string, query?: string) {
  const r = await searchMessages(userId, query);
  return {
    sources: ['conversations:self', 'messages:recent'],
    rowCounts: { messages: r.total },
    summary: r.text,
    data: { messages: r.messages, total: r.total },
  };
}

async function readSubscription(userId: string) {
  const r = await getSubscriptionStatus(userId);
  return {
    sources: ['profiles:subscription'],
    rowCounts: { subscription: r.tier ? 1 : 0 },
    summary: r.text,
    data: { tier: r.tier, active: r.active },
  };
}

function readVoice() {
  const r = describeVoiceCapture();
  return {
    sources: ['edge:elevenlabs-transcribe'],
    rowCounts: {},
    summary: r.text,
    data: { endpoint: r.endpoint },
  };
}

function readTTS(text?: string) {
  const r = previewTTS(text ?? '');
  return {
    sources: ['edge:elevenlabs-tts'],
    rowCounts: { chars: r.charCount },
    summary: r.text,
    data: { ...r },
  };
}

async function readWorkToday(userId: string) {
  const r = await summarizeWorkToday(userId);
  return {
    sources: ['work_sessions:today', 'work_scores:today'],
    rowCounts: { sessions: r.sessions, total_min: r.totalMinutes, deep_min: r.deepWorkMinutes },
    summary: r.text,
    data: { ...r },
  };
}

async function readScheduleBlocks(userId: string) {
  const r = await summarizeUpcomingBlocks(userId);
  return {
    sources: ['action_items:schedule_blocks'],
    rowCounts: { blocks: r.blocks.length },
    summary: r.text,
    data: { date: r.date, blocks: r.blocks },
  };
}
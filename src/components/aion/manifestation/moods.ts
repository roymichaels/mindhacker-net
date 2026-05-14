/**
 * Manifestation moods — kind → ambient color mapping.
 *
 * Pure presentation. Used by the manifestation aura, pulse and shell glow.
 * Token names mirror existing `--aion-*` variables in `src/index.css`.
 */
import type { ArtifactKind as AionArtifactKind } from '@/components/aion/artifacts/artifactBus';
import type { ArtifactKind as SummonArtifactKind } from '@/lib/aion/artifactBus';
import type { AtmoArtifactKind } from '@/components/aion/artifacts/AtmoArtifact';

export type ManifestationMood = 'cyan' | 'violet' | 'indigo' | 'gold' | 'soft' | 'danger';

const AION_KIND_MOOD: Record<AionArtifactKind, ManifestationMood> = {
  next_action: 'cyan',
  plan_summary: 'cyan',
  journey_workspace: 'cyan',
  schedule_block_preview: 'cyan',
  work_session: 'cyan',
  hypnosis_player: 'violet',
  journal_capture: 'indigo',
  journal_preview: 'indigo',
  identity_summary: 'indigo',
  profile_triad: 'indigo',
  avatar_configurator: 'indigo',
  business_canvas: 'gold',
  landing_preview: 'gold',
  marketplace_card: 'gold',
  wallet_sheet: 'gold',
  subscription_card: 'gold',
  checkout_confirmation: 'gold',
  coach_recommendation: 'gold',
  course_card: 'gold',
  curriculum_preview: 'gold',
  community_preview: 'soft',
  message_preview: 'soft',
  insight: 'soft',
  note: 'soft',
  capability: 'soft',
  confirm: 'cyan',
};

const SUMMON_KIND_MOOD: Record<SummonArtifactKind, ManifestationMood> = {
  assessment: 'soft',
  'today-list': 'cyan',
  plan: 'cyan',
  journey: 'cyan',
  'landing-builder': 'gold',
  'business-canvas': 'gold',
  'job-mode': 'gold',
  // Phase 2 — legacy hubs summoned as artifacts.
  journal: 'indigo',
  hypnosis: 'violet',
  'business-dashboard': 'gold',
  'business-journey': 'gold',
  freelancer: 'gold',
  creator: 'gold',
  therapist: 'soft',
  'pillar-assess': 'cyan',
  'pillar-results': 'cyan',
  'pillar-history': 'soft',
  quest: 'cyan',
  missions: 'cyan',
  'profile-stats': 'indigo',
};

const ATMO_KIND_MOOD: Record<AtmoArtifactKind, ManifestationMood> = {
  default: 'soft',
  read: 'cyan',
  plan: 'violet',
  confirm: 'cyan',
  warn: 'gold',
};

export type AnyManifestationKind =
  | AionArtifactKind
  | SummonArtifactKind
  | AtmoArtifactKind
  | string;

export function moodForKind(kind?: AnyManifestationKind): ManifestationMood {
  if (!kind) return 'soft';
  if (kind in AION_KIND_MOOD) return AION_KIND_MOOD[kind as AionArtifactKind];
  if (kind in SUMMON_KIND_MOOD) return SUMMON_KIND_MOOD[kind as SummonArtifactKind];
  if (kind in ATMO_KIND_MOOD) return ATMO_KIND_MOOD[kind as AtmoArtifactKind];
  return 'soft';
}

/** HSL var name for the mood — used as `hsl(var(--aion-cyan) / a)`. */
export const MOOD_HSL_VAR: Record<ManifestationMood, string> = {
  cyan: '--aion-cyan',
  violet: '--aion-violet',
  indigo: '--aion-violet',
  gold: '--aion-gold',
  soft: '--aion-violet',
  danger: '--destructive',
};

/** Tailwind glow utility per mood (already defined in index.css). */
export const MOOD_GLOW_CLASS: Record<ManifestationMood, string> = {
  cyan: 'aion-glow-cyan',
  violet: 'aion-glow-violet',
  indigo: 'aion-glow-violet',
  gold: 'aion-glow-gold',
  soft: 'aion-glow-soft',
  danger: 'aion-glow-danger',
};

export function isStickyKind(kind?: AnyManifestationKind): boolean {
  if (!kind) return false;
  if (kind === 'confirm' || kind === 'warn') return true;
  if (kind === 'checkout_confirmation') return true;
  return false;
}
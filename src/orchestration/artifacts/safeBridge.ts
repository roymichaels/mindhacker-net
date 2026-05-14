/**
 * AION Safe Artifact Bridge — Phase F · Step 2.
 *
 * Translates a router `RouterDecision` into an existing safe artifact and
 * emits it through the artifact bus. Strictly non-destructive:
 *   - never writes to plans / tasks / profile / DB
 *   - never invokes capability execution
 *   - only renders artifact KINDS that already have a registered renderer
 *   - one artifact maximum per turn (caller enforces single invocation)
 *
 * Trace contract:
 *   - emits `artifact.candidate` with `rendered:true|false`
 *   - emits `artifact.skipped` with a structured reason when not rendered
 *   - artifact `id` embeds the `traceId` so renderer ↔ trace are linkable
 */
import type { RouterDecision } from '@/orchestration/router/observeRouter';
import { CAPABILITIES } from '@/orchestration/capabilities/registry';
import { emitArtifact, type ArtifactKind } from '@/components/aion/artifacts/artifactBus';
import type { TurnTracer } from '@/diagnostics/aionTrace';
import type { ReadResult } from '@/orchestration/executors/safeReadExecutor';

export type BridgeOutcome =
  | { rendered: true; artifactId: string; rendererKind: ArtifactKind; capability: string; sourceKind: string }
  | { rendered: false; reason: string; capability: string | null; sourceKind: string | null };

interface RendererSpec {
  kind: ArtifactKind;
  title: string;
  body?: string;
  cta?: { label: string; href?: string };
  secondaryCta?: { label: string; href?: string };
  source?: string;
  ttl?: number;
}

/**
 * Map capability `artifactKind` (from registry) → an existing safe renderer.
 * Anything missing here is treated as `missing_renderer` and skipped.
 * No mapping may carry destructive side-effects.
 */
function mapToRenderer(sourceKind: string, capability: string): RendererSpec | null {
  switch (sourceKind) {
    case 'brain.room':
      return {
        kind: 'insight',
        title: 'תצוגה מקדימה של המוח',
        body: 'AION יכולה לפתוח חדר רלוונטי במוח שלך.',
        cta: { label: 'פתח את המוח', href: '/brain' },
        source: 'brain_rooms',
      };
    case 'journey.next':
      return {
        kind: 'next_action',
        title: 'הצעד הבא במסע',
        body: 'הצעה לפעולה הבאה — ללא שמירה אוטומטית.',
        cta: { label: 'פתח את המסע', href: '/journey' },
        secondaryCta: { label: 'דחה לאחר כך' },
        source: 'journey_steps',
      };
    case 'journey.summary':
      return {
        kind: 'journey_workspace',
        title: 'סיכום המסע',
        body: 'תצוגה מקדימה של ההתקדמות הנוכחית.',
        cta: { label: 'פתח את המסע', href: '/journey' },
        source: 'journey_workspace',
      };
    case 'plan.draft':
      return {
        kind: 'plan_summary',
        title: 'הצעה לתוכנית',
        body: 'טיוטה בלבד — לא נשמר עד אישור.',
        source: 'plan_drafts',
      };
    case 'task.draft':
      return {
        kind: 'next_action',
        title: 'הצעה למשימה קטנה',
        body: 'טיוטה בלבד — לא נשמר עד אישור.',
        source: 'action_items',
      };
    case 'hypnosis.session':
      return {
        kind: 'hypnosis_player',
        title: 'המלצת היפנוזה',
        body: 'מצאתי מפגש שעשוי להתאים למצב שלך עכשיו.',
        cta: { label: 'פתח היפנוזה', href: '/hypnosis' },
        secondaryCta: { label: 'מאוחר יותר' },
        source: 'hypnosis_audios',
      };
    case 'outer-world.surface':
      return {
        kind: 'capability',
        title: 'משטח חיצוני',
        body: 'AION ממליצה לפתוח את העולם החיצון.',
        cta: { label: 'פתח עולם חיצון', href: '/outer-world' },
        source: 'outer_world',
      };
    case 'profile.summary':
      return {
        kind: 'identity_summary',
        title: 'סיכום זהות',
        body: 'תצוגה מקדימה של ה־DNA והפרופיל שלך.',
        cta: { label: 'פתח פרופיל', href: '/brain?panel=profile' },
        source: 'identity_profile',
      };
    case 'journal.preview':
      return {
        kind: 'journal_preview',
        title: 'יומן',
        body: 'תצוגה מקדימה של רשומות יומן רלוונטיות.',
        cta: { label: 'פתח את היומן', href: '/journal' },
        source: 'journal_entries',
      };
    // Phase 2 · Batch 2 — Business / Landing / Courses / Coaches / Identity / Avatar
    case 'business.canvas':
      return {
        kind: 'business_canvas',
        title: 'קנבס עסקי',
        body: 'תצוגה מקדימה של המסע העסקי שלך.',
        cta: { label: 'פתח את העסק', href: '/business' },
        source: 'business_profiles',
      };
    case 'landing.preview':
      return {
        kind: 'landing_preview',
        title: 'דפי נחיתה',
        body: 'תצוגה מקדימה של דפי הנחיתה שלך.',
        cta: { label: 'פתח את הבונה', href: '/coach-landing-builder' },
        source: 'coach_landing_pages',
      };
    case 'course.card':
      return {
        kind: 'course_card',
        title: 'קורס מומלץ',
        body: 'AION מצאה קורס שעשוי להתאים.',
        cta: { label: 'פתח קורסים', href: '/courses' },
        source: 'courses',
      };
    case 'curriculum.preview':
      return {
        kind: 'curriculum_preview',
        title: 'מסלול לימוד',
        body: 'תצוגה מקדימה של מסלול לימוד אישי.',
        cta: { label: 'פתח לימוד', href: '/learn' },
        source: 'learning_curricula',
      };
    case 'coach.recommendation':
      return {
        kind: 'coach_recommendation',
        title: 'מאמן מומלץ',
        body: 'AION מצאה מאמן שמתאים.',
        cta: { label: 'פתח מאמנים', href: '/coaches' },
        secondaryCta: { label: 'אולי בפעם אחרת' },
        source: 'practitioners',
      };
    case 'identity.summary':
      return {
        kind: 'identity_summary',
        title: 'מצב הזהות',
        body: 'תצוגה מקדימה של פרופיל / DNA / אווטאר.',
        cta: { label: 'פתח פרופיל', href: '/profile' },
        source: 'identity_profile',
      };
    case 'avatar.configurator':
      return {
        kind: 'avatar_configurator',
        title: 'אווטאר',
        body: 'התאמת האווטאר שלך — נדרש אישור לפני שינוי.',
        cta: { label: 'פתח Configurator', href: '/avatar-configurator' },
        source: 'avatar_customizations',
      };
    case 'profile.triad':
      return {
        kind: 'profile_triad',
        title: 'פרופיל זהות',
        body: 'AION · Avatar · DNA',
        cta: { label: 'פתח פרופיל', href: '/profile' },
        source: 'identity_profile',
      };
    // Phase 2 · Batch 3 — Economy / Social / Payments / Voice / Work
    case 'marketplace.card':
      return { kind: 'marketplace_card', title: 'שוק חופשי', body: 'תצוגה מקדימה של מודעות בשוק.', cta: { label: 'פתח שוק', href: '/free-market' }, source: 'fm_gigs' };
    case 'wallet.sheet':
      return { kind: 'wallet_sheet', title: 'ארנק', body: 'יתרה ופעולות אחרונות.', cta: { label: 'פתח ארנק', href: '/free-market?wallet=open' }, source: 'fm_wallets' };
    case 'community.preview':
      return { kind: 'community_preview', title: 'קהילה', body: 'פוסטים אחרונים בקהילה.', cta: { label: 'פתח קהילה', href: '/community' }, source: 'community_posts' };
    case 'message.preview':
      return { kind: 'message_preview', title: 'הודעות', body: 'תצוגה מקדימה של הודעות.', cta: { label: 'פתח הודעות', href: '/messages' }, source: 'messages' };
    case 'subscription.card':
      return { kind: 'subscription_card', title: 'מצב מנוי', body: 'תצוגה מקדימה של המנוי שלך.', cta: { label: 'פתח מנוי', href: '/subscriptions' }, source: 'profiles.subscription_tier' };
    case 'checkout.confirmation':
      return { kind: 'checkout_confirmation', title: 'מסך תשלום', body: 'פעולה חיצונית — נפתחת בחלון Stripe.', cta: { label: 'פתח מנוי', href: '/subscriptions' }, source: 'create-checkout-session' };
    case 'voice.capture':
      return { kind: 'note', title: 'הקלטה קולית', body: 'מוכן להקליט הודעה קולית.', source: 'voice_capture' };
    case 'audio.preview':
      return { kind: 'note', title: 'השמעת טקסט', body: 'תצוגה מקדימה של ההשמעה.', source: 'elevenlabs-tts' };
    case 'work.session-card':
      return { kind: 'work_session', title: 'עבודה', body: 'סיכום סשן/פוקוס.', cta: { label: 'פתח Work Hub', href: '/work' }, source: 'work_sessions' };
    case 'schedule.block-preview':
      return { kind: 'schedule_block_preview', title: 'בלוק זמן', body: 'תצוגה מקדימה של בלוק יומי.', cta: { label: 'פתח Work Hub', href: '/work' }, source: 'action_items:schedule_block' };
    // Intentionally unmapped (would mutate / no safe preview): journal.entry
    default:
      void capability;
      return null;
  }
}

/**
 * Bridge a router decision into (at most) one safe artifact.
 * The caller MUST invoke this at most once per turn.
 */
export function bridgeDecisionToArtifact(
  decision: RouterDecision,
  tracer: Pick<TurnTracer, 'id' | 'mark'>,
  read?: ReadResult | null,
): BridgeOutcome {
  // No candidate → nothing to bridge.
  if (!decision.capability) {
    return { rendered: false, reason: 'no-capability', capability: null, sourceKind: null };
  }

  const capDef = CAPABILITIES[decision.capability];
  const sourceKind = decision.artifactKind ?? capDef?.artifactKind ?? null;

  // Block unsafe capabilities at the bridge — even if a renderer exists.
  if (capDef?.safety === 'unsafe') {
    tracer.mark('artifact.skipped', {
      capability: decision.capability,
      kind: sourceKind,
      reason: 'unsafe-capability',
    });
    return { rendered: false, reason: 'unsafe-capability', capability: decision.capability, sourceKind };
  }

  if (!sourceKind) {
    tracer.mark('artifact.skipped', {
      capability: decision.capability,
      reason: 'no-artifact-kind',
    });
    return { rendered: false, reason: 'no-artifact-kind', capability: decision.capability, sourceKind: null };
  }

  const spec = mapToRenderer(sourceKind, decision.capability);
  if (!spec) {
    tracer.mark('artifact.skipped', {
      capability: decision.capability,
      kind: sourceKind,
      reason: 'missing_renderer',
    });
    return { rendered: false, reason: 'missing_renderer', capability: decision.capability, sourceKind };
  }

  // If a read result is attached, prefer the live summary as the body. We
  // never overwrite the title (keeps card recognizable) and we clamp the
  // body length so a noisy summary cannot break the layout.
  const liveBody = read?.ok && read.summary
    ? read.summary.slice(0, 220)
    : undefined;

  // Build href-only CTA (no onClick handlers → no side effects).
  const cta = spec.cta?.href ? { label: spec.cta.label, href: spec.cta.href } : undefined;
  const secondaryCta = spec.secondaryCta?.label
    ? { label: spec.secondaryCta.label, href: spec.secondaryCta.href }
    : undefined;

  const artifactId = `art_${tracer.id || 'no-trace'}_${sourceKind.replace(/\W+/g, '-')}`;
  emitArtifact({
    id: artifactId,
    kind: spec.kind,
    title: spec.title,
    body: liveBody ?? spec.body,
    cta,
    secondaryCta,
    meta: spec.source ? { source: spec.source, trace_id: tracer.id } : { trace_id: tracer.id },
    ttl: spec.ttl ?? 9000,
  });

  tracer.mark('artifact.candidate', {
    capability: decision.capability,
    source_kind: sourceKind,
    renderer_kind: spec.kind,
    rendered: true,
    artifact_id: artifactId,
    has_cta: !!cta,
    has_secondary: !!secondaryCta,
    source_label: spec.source ?? null,
    grounded: !!liveBody,
    read_sources: read?.sources ?? [],
  });

  return {
    rendered: true,
    artifactId,
    rendererKind: spec.kind,
    capability: decision.capability,
    sourceKind,
  };
}

/** Dev/diagnostic helper — pure, no emit. */
export function previewBridge(decision: RouterDecision): BridgeOutcome {
  if (!decision.capability) {
    return { rendered: false, reason: 'no-capability', capability: null, sourceKind: null };
  }
  const capDef = CAPABILITIES[decision.capability];
  const sourceKind = decision.artifactKind ?? capDef?.artifactKind ?? null;
  if (capDef?.safety === 'unsafe') {
    return { rendered: false, reason: 'unsafe-capability', capability: decision.capability, sourceKind };
  }
  if (!sourceKind) {
    return { rendered: false, reason: 'no-artifact-kind', capability: decision.capability, sourceKind: null };
  }
  const spec = mapToRenderer(sourceKind, decision.capability);
  if (!spec) {
    return { rendered: false, reason: 'missing_renderer', capability: decision.capability, sourceKind };
  }
  return {
    rendered: true,
    artifactId: `preview_${sourceKind}`,
    rendererKind: spec.kind,
    capability: decision.capability,
    sourceKind,
  };
}
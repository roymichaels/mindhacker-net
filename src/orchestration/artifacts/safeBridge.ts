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

export type BridgeOutcome =
  | { rendered: true; artifactId: string; rendererKind: ArtifactKind; capability: string; sourceKind: string }
  | { rendered: false; reason: string; capability: string | null; sourceKind: string | null };

interface RendererSpec {
  kind: ArtifactKind;
  title: string;
  body?: string;
  cta?: { label: string; href?: string };
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
      };
    case 'journey.next':
      return {
        kind: 'next_action',
        title: 'הצעד הבא במסע',
        body: 'הצעה לפעולה הבאה — ללא שמירה אוטומטית.',
        cta: { label: 'פתח את המסע', href: '/journey' },
      };
    case 'journey.summary':
      return {
        kind: 'plan_summary',
        title: 'סיכום המסע',
        body: 'תצוגה מקדימה של ההתקדמות הנוכחית.',
        cta: { label: 'פתח את המסע', href: '/journey' },
      };
    case 'plan.draft':
      return {
        kind: 'plan_summary',
        title: 'הצעה לתוכנית',
        body: 'טיוטה בלבד — לא נשמר עד אישור.',
      };
    case 'task.draft':
      return {
        kind: 'next_action',
        title: 'הצעה למשימה קטנה',
        body: 'טיוטה בלבד — לא נשמר עד אישור.',
      };
    case 'hypnosis.session':
      return {
        kind: 'capability',
        title: 'המלצת היפנוזה',
        body: 'מצאתי מפגש שעשוי להתאים למצב שלך עכשיו.',
        cta: { label: 'פתח היפנוזה', href: '/hypnosis' },
      };
    case 'outer-world.surface':
      return {
        kind: 'capability',
        title: 'משטח חיצוני',
        body: 'AION ממליצה לפתוח את העולם החיצון.',
        cta: { label: 'פתח עולם חיצון', href: '/outer-world' },
      };
    case 'profile.summary':
      return {
        kind: 'note',
        title: 'סיכום זהות',
        body: 'תצוגה מקדימה של ה־DNA והפרופיל שלך.',
        cta: { label: 'פתח פרופיל', href: '/brain?panel=profile' },
      };
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

  // Build href-only CTA (no onClick handlers → no side effects).
  const cta = spec.cta?.href ? { label: spec.cta.label, href: spec.cta.href } : undefined;

  const artifactId = `art_${tracer.id || 'no-trace'}_${sourceKind.replace(/\W+/g, '-')}`;
  emitArtifact({
    id: artifactId,
    kind: spec.kind,
    title: spec.title,
    body: spec.body,
    cta,
    ttl: spec.ttl ?? 9000,
  });

  tracer.mark('artifact.candidate', {
    capability: decision.capability,
    source_kind: sourceKind,
    renderer_kind: spec.kind,
    rendered: true,
    artifact_id: artifactId,
    has_cta: !!cta,
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
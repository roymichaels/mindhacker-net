/**
 * AION Confirmation Bridge — Phase F · Step 4.
 *
 * For capabilities that may mutate user data, AION emits a sticky `confirm`
 * artifact instead of running the mutation silently. The user sees:
 *   - title:        what AION wants to do
 *   - body:         what will happen (plain language)
 *   - meta.source:  which table / data source
 *   - cta:          confirm   → executes safe mutation
 *   - secondaryCta: cancel    → logs cancellation, no DB write
 *
 * Trace contract:
 *   - suggestion.generated   (always, when bridge selects a capability)
 *   - confirmation.shown     (when artifact is emitted)
 *   - confirmation.accepted  (user taps confirm)
 *   - confirmation.cancelled (user taps cancel)
 *   - mutation.executed      (mutation OK)
 *   - mutation.skipped       (mutation not allowed / no endpoint / error)
 */
import type { RouterDecision } from '@/orchestration/router/observeRouter';
import {
  CAPABILITIES,
  CONFIRM_REQUIRED_CAPABILITIES,
  type CapabilityId,
} from '@/orchestration/capabilities/registry';
import { emitArtifact } from '@/components/aion/artifacts/artifactBus';
import type { TurnTracer } from '@/diagnostics/aionTrace';
import type { ReadResult } from '@/orchestration/executors/safeReadExecutor';
import { executeMutationCapability } from '@/orchestration/executors/safeMutationExecutor';

export interface ConfirmContext {
  userId: string;
  message: string;
  /** From a prior read: e.g. action_items.id for action.complete. */
  targetId?: string | null;
}

export type ConfirmOutcome =
  | { shown: true; capability: CapabilityId; artifactId: string }
  | { shown: false; reason: string; capability: CapabilityId | null };

function describe(capability: CapabilityId, ctx: ConfirmContext, read?: ReadResult | null): {
  title: string;
  whatHappens: string;
  source: string;
  confirmLabel: string;
} {
  switch (capability) {
    case 'journal.capture':
      return {
        title: 'לשמור את זה ביומן?',
        whatHappens: `ייווצר רשומת יומן (reflection): "${ctx.message.slice(0, 80)}"`,
        source: 'journal_entries',
        confirmLabel: 'שמור ביומן',
      };
    case 'action.complete': {
      const pickTitle = (read?.data?.pick as { title?: string } | undefined)?.title ?? 'המשימה הפעילה';
      return {
        title: 'לסמן את המשימה כהושלמה?',
        whatHappens: `סטטוס "${pickTitle}" יעודכן ל־done.`,
        source: 'action_items',
        confirmLabel: 'סמן הושלם',
      };
    }
    case 'hypnosis.start':
      return {
        title: 'להתחיל מפגש היפנוזה?',
        whatHappens: 'תצוגה מקדימה בלבד — לא ייפתח מפגש אוטומטית בשלב זה.',
        source: 'hypnosis_audios',
        confirmLabel: 'הבנתי',
      };
    case 'business.createDraft':
      return {
        title: 'ליצור טיוטה עסקית?',
        whatHappens: 'תופעל פונקציה חיצונית שתייצר טיוטת תוכנית. לא נשמרת ללא אישור.',
        source: 'generate-business-plan',
        confirmLabel: 'צור טיוטה',
      };
    case 'creator.content.generate':
      return {
        title: 'לייצר תוכן?',
        whatHappens: 'AION תייצר טיוטת תוכן עבורך. שמירה תידרש בנפרד.',
        source: 'creator-content',
        confirmLabel: 'צור טיוטה',
      };
    case 'landing.generate':
      return {
        title: 'לייצר דף נחיתה?',
        whatHappens: 'תופעל פונקציה חיצונית שתייצר טיוטת דף נחיתה. לא תפורסם ללא אישור.',
        source: 'generate-landing-page',
        confirmLabel: 'צור דף',
      };
    case 'curriculum.generate':
      return {
        title: 'לייצר מסלול לימוד אישי?',
        whatHappens: 'תופעל פונקציה חיצונית שתבנה מסלול. לא יישמר ללא אישור.',
        source: 'course-orchestrator',
        confirmLabel: 'בנה מסלול',
      };
    case 'coach.match':
      return {
        title: 'לפנות למאמן?',
        whatHappens: 'פתיחת המלצת מאמן · פעולת תשלום/חיבור חיצוני תידרש בנפרד.',
        source: 'practitioners',
        confirmLabel: 'הצג מאמן',
      };
    case 'avatar.configure':
      return {
        title: 'לעדכן את האווטאר?',
        whatHappens: 'פתיחת ה־Configurator. שינוי בפועל מתבצע רק בתוך הכלי.',
        source: 'avatar_customizations',
        confirmLabel: 'פתח Configurator',
      };
    // Phase 2 · Batch 3
    case 'fm.listing.create':
      return { title: 'לפרסם מודעה חדשה?', whatHappens: 'תיווצר טיוטת מודעה בשוק החופשי. סטטוס: draft.', source: 'fm_gigs', confirmLabel: 'פרסם טיוטה' };
    case 'message.send':
      return { title: 'לשלוח את ההודעה?', whatHappens: `תישלח הודעה: "${ctx.message.slice(0, 80)}"`, source: 'messages', confirmLabel: 'שלח' };
    case 'subscription.portal':
      return { title: 'לפתוח את ניהול המנוי?', whatHappens: 'פתיחת Stripe Customer Portal בחלון נפרד.', source: 'customer-portal', confirmLabel: 'פתח Portal' };
    case 'checkout.create':
      return { title: 'להמשיך לתשלום?', whatHappens: 'תיפתח עמוד Stripe Checkout בחלון נפרד.', source: 'create-checkout-session', confirmLabel: 'המשך לתשלום' };
    case 'tts.speak':
      return { title: 'להשמיע בקול?', whatHappens: `הקראה של "${ctx.message.slice(0, 80)}".`, source: 'elevenlabs-tts', confirmLabel: 'השמע' };
    case 'work.startSession':
      return { title: 'להתחיל סשן פוקוס?', whatHappens: `יתחיל טיימר עבור "${ctx.message.slice(0, 60) || 'סשן עבודה'}".`, source: 'work_sessions', confirmLabel: 'התחל סשן' };
    case 'schedule.block':
      return { title: 'להוסיף בלוק ליומן?', whatHappens: `יתווסף בלוק "${ctx.message.slice(0, 60) || 'בלוק זמן'}" ליום הנוכחי.`, source: 'action_items:schedule_block', confirmLabel: 'קבע בלוק' };
    default:
      return {
        title: 'לאשר פעולה?',
        whatHappens: 'פעולה דורשת אישור.',
        source: 'unknown',
        confirmLabel: 'אישור',
      };
  }
}

export function bridgeDecisionToConfirmation(
  decision: RouterDecision,
  tracer: Pick<TurnTracer, 'id' | 'mark'>,
  ctx: ConfirmContext,
  read?: ReadResult | null,
): ConfirmOutcome {
  const cap = decision.capability;
  if (!cap) return { shown: false, reason: 'no-capability', capability: null };
  if (!CONFIRM_REQUIRED_CAPABILITIES.has(cap)) {
    return { shown: false, reason: 'not-confirm-required', capability: cap };
  }
  const def = CAPABILITIES[cap];
  if (def?.safety === 'unsafe') {
    return { shown: false, reason: 'unsafe-capability', capability: cap };
  }

  const spec = describe(cap, ctx, read);
  const targetId =
    ctx.targetId ??
    ((read?.data?.pick as { id?: string } | undefined)?.id ?? null);

  tracer.mark('suggestion.generated', {
    capability: cap,
    target_id: targetId,
    source: spec.source,
    read_sources: read?.sources ?? [],
  });

  const artifactId = `confirm_${tracer.id || 'no-trace'}_${cap.replace(/\W+/g, '-')}`;

  emitArtifact({
    id: artifactId,
    kind: 'confirm',
    title: spec.title,
    body: spec.whatHappens,
    meta: { source: spec.source, whatHappens: spec.whatHappens },
    ttl: 0, // sticky — user must confirm or cancel
    cta: {
      label: spec.confirmLabel,
      onClick: () => {
        tracer.mark('confirmation.accepted', { capability: cap, artifact_id: artifactId });
        void executeMutationCapability(cap, {
          userId: ctx.userId,
          message: ctx.message,
          targetId,
        }).then((res) => {
          if (res.ok) {
            tracer.mark('mutation.executed', {
              capability: cap,
              table: res.table,
              rows_written: res.rowsWritten ?? 0,
              duration_ms: res.durationMs,
              data: res.data,
            });
          } else {
            tracer.mark('mutation.skipped', {
              capability: cap,
              reason: res.skippedReason ?? 'unknown',
              error: res.error,
              source: res.source,
              duration_ms: res.durationMs,
            });
          }
        });
      },
    },
    secondaryCta: {
      label: 'ביטול',
      onClick: () => {
        tracer.mark('confirmation.cancelled', { capability: cap, artifact_id: artifactId });
      },
    },
  });

  tracer.mark('confirmation.shown', {
    capability: cap,
    artifact_id: artifactId,
    source: spec.source,
    target_id: targetId,
  });

  return { shown: true, capability: cap, artifactId };
}
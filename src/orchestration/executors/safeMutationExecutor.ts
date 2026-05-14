/**
 * AION Safe Mutation Executor — Phase 3 · Batch 1 (Controlled Real Execution).
 *
 * Performs the *minimal* set of real mutations AION may execute AFTER explicit
 * user confirmation through a `confirm` artifact. Anything outside the
 * `ALLOWED_REAL` allow-list — or that lacks a canonical endpoint/table —
 * returns `{ ok:false, source:'preview', skippedReason:... }` so the caller
 * logs `mutation.skipped` and the UI stays preview-only.
 *
 * Phase 3 · Batch 1 — allowed real mutations:
 *   - journal.capture      → insert into `journal_entries` (source:'aion')
 *   - action.complete      → set `action_items.status='done'` on existing row
 *   - work.startSession    → insert into `work_sessions`
 *   - schedule.block       → insert into `action_items` (schedule_block metadata)
 *   - message.send         → insert into `messages` (existing conversation)
 *   - hypnosis.start       → preview-only (no canonical start endpoint yet)
 *
 * Disabled (router may still suggest, executor refuses):
 *   plan.create, plan.restart, plan.delete, business.createDraft,
 *   landing.generate, curriculum.generate, fm.listing.create, checkout.create,
 *   subscription.portal, wallet.mint, identity.updateProfile, avatar.configure,
 *   tts.speak, action.create, mission.create, habit.create.
 */
import { supabase } from '@/integrations/supabase/client';
import { createJournalEntry } from '@/services/journalEntries';
import { completeAction } from '@/services/actionItems';
import type { CapabilityId } from '@/orchestration/capabilities/registry';
import { startWorkSession } from '@/services/workSessions';

export interface MutationInput {
  userId: string;
  /** Original user message text — used as journal content fallback. */
  message?: string;
  /** Optional id (action_items.id, hypnosis_audios.id, …). */
  targetId?: string | null;
}

export interface MutationResult {
  ok: boolean;
  capability: CapabilityId;
  source: 'mutation' | 'preview';
  durationMs: number;
  summary: string;
  rowsWritten?: number;
  table?: string;
  data?: Record<string, unknown>;
  error?: string;
  skippedReason?: string;
}

/** Phase 3 · Batch 1 — strict allow-list of real-mutation capabilities. */
const ALLOWED_REAL: ReadonlySet<CapabilityId> = new Set<CapabilityId>([
  'journal.capture',
  'action.complete',
  'work.startSession',
  'schedule.block',
  'message.send',
  // hypnosis.start is allowed by spec but has no canonical endpoint yet —
  // handler returns preview-only with skippedReason='no-mutation-endpoint'.
  'hypnosis.start',
]);

/** Capabilities explicitly disabled in Phase 3 · Batch 1 (router may still suggest). */
const DISABLED_BATCH1: ReadonlySet<CapabilityId> = new Set<CapabilityId>([
  'plan.create' as CapabilityId,
  'plan.restart' as CapabilityId,
  'plan.delete' as CapabilityId,
  'business.createDraft' as CapabilityId,
  'landing.generate' as CapabilityId,
  'curriculum.generate' as CapabilityId,
  'fm.listing.create' as CapabilityId,
  'checkout.create' as CapabilityId,
  'subscription.portal' as CapabilityId,
  'wallet.mint' as CapabilityId,
  'identity.updateProfile' as CapabilityId,
  'avatar.configure' as CapabilityId,
  'tts.speak' as CapabilityId,
]);

// ── Lightweight payload validators (no external dep). ────────────────────
type Validated<T> = { ok: true; value: T } | { ok: false; reason: string };

function vJournal(input: MutationInput): Validated<{ content: string }> {
  const content = (input.message ?? '').trim();
  if (!content) return { ok: false, reason: 'empty-content' };
  if (content.length > 4000) return { ok: false, reason: 'content-too-long' };
  return { ok: true, value: { content } };
}
function vTitle(input: MutationInput, fallback: string): string {
  const t = (input.message ?? '').trim().slice(0, 80);
  return t || fallback;
}
function vMessageSend(input: MutationInput): Validated<{ conversationId: string; content: string }> {
  const conversationId = (input.targetId ?? '').trim();
  const content = (input.message ?? '').trim();
  if (!conversationId) return { ok: false, reason: 'missing-conversation' };
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return { ok: false, reason: 'invalid-conversation-id' };
  if (!content) return { ok: false, reason: 'empty-content' };
  if (content.length > 2000) return { ok: false, reason: 'content-too-long' };
  return { ok: true, value: { conversationId, content } };
}

const now = () => Date.now();

export async function executeMutationCapability(
  capability: CapabilityId,
  input: MutationInput,
): Promise<MutationResult> {
  const t0 = now();

  // Disabled-by-policy capabilities short-circuit BEFORE any DB call.
  if (DISABLED_BATCH1.has(capability)) {
    return {
      ok: false, capability, source: 'preview',
      durationMs: now() - t0,
      summary: 'תצוגה מקדימה בלבד — הפעולה הזאת מושבתת כרגע.',
      skippedReason: 'disabled-by-policy',
    };
  }
  if (!ALLOWED_REAL.has(capability)) {
    return {
      ok: false,
      capability,
      source: 'preview',
      durationMs: now() - t0,
      summary: 'הפעולה אינה ברשימת הפעולות המאושרות.',
      skippedReason: 'not-allowed',
    };
  }
  if (!input.userId) {
    return {
      ok: false, capability, source: 'preview',
      durationMs: now() - t0, summary: 'Missing user.', skippedReason: 'no-user',
    };
  }

  try {
    switch (capability) {
      case 'journal.capture': {
        const v = vJournal(input);
        if (v.ok === false) {
          return { ok: false, capability, source: 'preview',
            durationMs: now() - t0, summary: 'התוכן ליומן אינו תקין.', skippedReason: v.reason };
        }
        const entry = await createJournalEntry({
          user_id: input.userId,
          journal_type: 'reflection',
          content: v.value.content,
          source: 'aion',
          title: v.value.content.slice(0, 60),
        });
        return {
          ok: true, capability, source: 'mutation',
          durationMs: now() - t0,
          summary: 'נשמר ביומן.',
          rowsWritten: 1, table: 'journal_entries',
          data: { id: (entry as { id?: string })?.id },
        };
      }

      case 'action.complete': {
        // Resolve target: explicit id, else most recent open action.
        let actionId = input.targetId ?? null;
        if (!actionId) {
          const { data: items } = await supabase
            .from('action_items')
            .select('id, title')
            .eq('user_id', input.userId)
            .in('status', ['todo', 'in_progress'])
            .order('order_index', { ascending: true })
            .limit(1);
          actionId = items?.[0]?.id ?? null;
        }
        if (!actionId) {
          return {
            ok: false, capability, source: 'preview',
            durationMs: now() - t0, summary: 'אין משימה פתוחה לסמן כהושלמה.',
            skippedReason: 'no-target',
          };
        }
        const updated = await completeAction(actionId);
        return {
          ok: true, capability, source: 'mutation',
          durationMs: now() - t0,
          summary: 'המשימה סומנה כהושלמה.',
          rowsWritten: 1, table: 'action_items',
          data: { id: (updated as { id?: string })?.id },
        };
      }

      case 'hypnosis.start': {
        // Allowed by Phase 3 spec but no canonical mutation endpoint exists.
        // Caller logs `mutation.skipped` with this reason.
        return {
          ok: false, capability, source: 'preview',
          durationMs: now() - t0,
          summary: 'תצוגה מקדימה בלבד — מפגש ההיפנוזה לא נפתח אוטומטית.',
          skippedReason: 'no-mutation-endpoint',
        };
      }

      case 'message.send': {
        const v = vMessageSend(input);
        if (v.ok === false) {
          return { ok: false, capability, source: 'preview', durationMs: now() - t0,
            summary: 'נתוני ההודעה אינם תקינים.', skippedReason: v.reason };
        }
        const { data, error } = await supabase
          .from('messages')
          .insert({ conversation_id: v.value.conversationId, sender_id: input.userId, content: v.value.content } as any)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        return { ok: true, capability, source: 'mutation', durationMs: now() - t0,
          summary: 'ההודעה נשלחה.', rowsWritten: 1, table: 'messages',
          data: { id: (data as any)?.id } };
      }

      case 'work.startSession': {
        const title = vTitle(input, 'סשן עבודה');
        const session = await startWorkSession({ user_id: input.userId, title });
        return { ok: true, capability, source: 'mutation', durationMs: now() - t0,
          summary: 'סשן פוקוס התחיל.', rowsWritten: 1, table: 'work_sessions',
          data: { id: (session as any)?.id, title } };
      }

      case 'schedule.block': {
        const title = vTitle(input, 'בלוק זמן');
        const date = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from('action_items')
          .insert({
            user_id: input.userId,
            title,
            type: 'task',
            source: 'aion',
            status: 'todo',
            scheduled_date: date,
            metadata: { schedule_block: true, block_type: 'focus', intensity: 'med' },
          } as any)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        return { ok: true, capability, source: 'mutation', durationMs: now() - t0,
          summary: 'בלוק נוסף ליום הנוכחי.', rowsWritten: 1, table: 'action_items',
          data: { id: (data as any)?.id, date, title } };
      }
    }
  } catch (e) {
    return {
      ok: false, capability, source: 'preview',
      durationMs: now() - t0,
      summary: 'תקלה בביצוע הפעולה.',
      error: (e as Error)?.message ?? 'unknown',
      skippedReason: 'mutation-error',
    };
  }

  return {
    ok: false, capability, source: 'preview',
    durationMs: now() - t0, summary: 'no-handler', skippedReason: 'no-handler',
  };
}
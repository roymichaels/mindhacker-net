/**
 * AION Safe Mutation Executor — Phase F · Step 4.
 *
 * Performs the *minimal* set of mutations AION may execute AFTER explicit
 * user confirmation through a `confirm` artifact. Anything outside this
 * allow-list returns `{ ok:false, source:'preview', skippedReason:'no-mutation-endpoint' }`
 * so the caller can log `mutation.skipped` and behave as preview-only.
 *
 * Allow-list (Phase F · Step 4):
 *   - journal.capture    → insert into `journal_entries` (source:'aion')
 *   - action.complete    → set `action_items.status='done'` for an existing row
 *   - hypnosis.start     → preview-only (no canonical start endpoint yet)
 *
 * Disabled (still observe/suggest only):
 *   plan.create, plan.restart, plan.delete, action.create, mission.create,
 *   habit.create, identity.updateProfile, landing.generate, business.createDraft.
 */
import { supabase } from '@/integrations/supabase/client';
import { createJournalEntry } from '@/services/journalEntries';
import { completeAction } from '@/services/actionItems';
import type { CapabilityId } from '@/orchestration/capabilities/registry';

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

const ALLOWED: ReadonlySet<CapabilityId> = new Set<CapabilityId>([
  'journal.capture',
  'action.complete',
  'hypnosis.start',
]);

const now = () => Date.now();

export async function executeMutationCapability(
  capability: CapabilityId,
  input: MutationInput,
): Promise<MutationResult> {
  const t0 = now();
  if (!ALLOWED.has(capability)) {
    return {
      ok: false,
      capability,
      source: 'preview',
      durationMs: now() - t0,
      summary: 'Capability not in allow-list.',
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
        const content = (input.message ?? '').trim();
        if (!content) {
          return {
            ok: false, capability, source: 'preview',
            durationMs: now() - t0, summary: 'אין תוכן ליומן.', skippedReason: 'empty-content',
          };
        }
        const entry = await createJournalEntry({
          user_id: input.userId,
          journal_type: 'reflection',
          content,
          source: 'aion',
          title: content.slice(0, 60),
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
        // No canonical start endpoint yet — log preview-only.
        return {
          ok: false, capability, source: 'preview',
          durationMs: now() - t0,
          summary: 'תצוגה מקדימה בלבד — מפגש ההיפנוזה לא נפתח אוטומטית.',
          skippedReason: 'no-mutation-endpoint',
        };
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
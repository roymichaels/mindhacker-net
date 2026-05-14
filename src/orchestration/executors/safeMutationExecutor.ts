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
import { startWorkSession } from '@/services/workSessions';
import { previewTTS } from '@/services/ttsSpeak';

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
  // Phase 2 · Batch 3
  'fm.listing.create',
  'message.send',
  'subscription.portal',
  'checkout.create',
  'tts.speak',
  'work.startSession',
  'schedule.block',
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

      case 'fm.listing.create': {
        const title = (input.message ?? '').trim().slice(0, 80) || 'מודעה חדשה';
        const { data, error } = await supabase
          .from('fm_gigs')
          .insert({ user_id: input.userId, title, status: 'draft' } as any)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        return { ok: true, capability, source: 'mutation', durationMs: now() - t0,
          summary: 'נוצרה טיוטת מודעה.', rowsWritten: 1, table: 'fm_gigs',
          data: { id: (data as any)?.id } };
      }

      case 'message.send': {
        const conversationId = input.targetId ?? null;
        const content = (input.message ?? '').trim();
        if (!conversationId || !content) {
          return { ok: false, capability, source: 'preview', durationMs: now() - t0,
            summary: 'חסר תוכן או מזהה שיחה.', skippedReason: 'missing-target-or-content' };
        }
        const { data, error } = await supabase
          .from('messages')
          .insert({ conversation_id: conversationId, sender_id: input.userId, content } as any)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        return { ok: true, capability, source: 'mutation', durationMs: now() - t0,
          summary: 'ההודעה נשלחה.', rowsWritten: 1, table: 'messages',
          data: { id: (data as any)?.id } };
      }

      case 'subscription.portal': {
        const { data, error } = await supabase.functions.invoke('customer-portal', {});
        if (error) throw error;
        const url = (data as any)?.url;
        if (typeof window !== 'undefined' && url) window.open(url, '_blank');
        return { ok: true, capability, source: 'mutation', durationMs: now() - t0,
          summary: 'נפתח Stripe Portal.', table: 'customer-portal',
          data: { url, external: true } };
      }

      case 'checkout.create': {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: { tier: input.targetId ?? 'plus' },
        });
        if (error) throw error;
        const url = (data as any)?.url;
        if (typeof window !== 'undefined' && url) window.open(url, '_blank');
        return { ok: true, capability, source: 'mutation', durationMs: now() - t0,
          summary: 'נפתח עמוד תשלום.', table: 'create-checkout-session',
          data: { url, external: true } };
      }

      case 'tts.speak': {
        const preview = previewTTS(input.message ?? '');
        if (!preview.ok) {
          return { ok: false, capability, source: 'preview', durationMs: now() - t0,
            summary: 'אין טקסט להקראה.', skippedReason: 'empty-text' };
        }
        const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
          body: { text: input.message, voiceId: preview.voiceId },
        });
        if (error) throw error;
        const audioContent = (data as any)?.audioContent;
        if (audioContent && typeof window !== 'undefined') {
          const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
          void audio.play().catch(() => {});
        }
        return { ok: true, capability, source: 'mutation', durationMs: now() - t0,
          summary: 'מתבצעת השמעה.', table: 'elevenlabs-tts',
          data: { chars: preview.charCount, external: true } };
      }

      case 'work.startSession': {
        const title = (input.message ?? '').trim().slice(0, 80) || 'סשן עבודה';
        const session = await startWorkSession({ user_id: input.userId, title });
        return { ok: true, capability, source: 'mutation', durationMs: now() - t0,
          summary: 'סשן פוקוס התחיל.', rowsWritten: 1, table: 'work_sessions',
          data: { id: (session as any)?.id, title } };
      }

      case 'schedule.block': {
        const title = (input.message ?? '').trim().slice(0, 80) || 'בלוק זמן';
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
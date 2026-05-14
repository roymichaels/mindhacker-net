/**
 * AION Orchestration Phase 1 — turn tracer.
 *
 * Pure observation. When `ff_aion_trace` is enabled in localStorage:
 *  - every chat turn gets a `traceId`
 *  - each pipeline stage is mirrored into `diagnosticsBus`
 *  - each stage is also written to `aion_signals` (kind=`trace.mark`)
 *
 * Never throws. Never blocks. No behavior change when flag is off.
 */
import { supabase } from '@/integrations/supabase/client';
import { diagnosticsBus, type AionTraceEvent } from './diagnosticsBus';

/**
 * Phase-1 AION orchestration trace flag (inlined here after `app-shell/` deletion).
 * Toggle:  localStorage.setItem("ff_aion_trace", "1")
 */
const AION_TRACE_FLAG_KEY = 'ff_aion_trace';
function isAionTraceEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const ls = window.localStorage.getItem(AION_TRACE_FLAG_KEY);
    return ls === '1' || ls === 'true';
  } catch {
    return false;
  }
}

function rid(): string {
  return `trc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface TurnTracer {
  id: string;
  mark: (stage: AionTraceEvent['stage'], data?: Record<string, unknown>) => void;
  end: (data?: Record<string, unknown>) => void;
}

const NOOP: TurnTracer = {
  id: '',
  mark: () => {},
  end: () => {},
};

export function startTurnTrace(seed?: Record<string, unknown>): TurnTracer {
  if (!isAionTraceEnabled()) return NOOP;
  const id = rid();
  const t0 = Date.now();

  const emit = (stage: AionTraceEvent['stage'], data?: Record<string, unknown>) => {
    const evt: AionTraceEvent = {
      at: Date.now(),
      traceId: id,
      stage,
      data: { dt_ms: Date.now() - t0, ...(data ?? {}) },
    };
    try { diagnosticsBus.emit('aion-trace', evt); } catch { /* swallow */ }
    // Fire-and-forget; never block the chat turn.
    void (async () => {
      try {
        const { data: ud } = await supabase.auth.getUser();
        if (!ud.user) return;
        // Insert into Phase 1 trace timeline (dedicated table).
        await supabase.from('aion_turn_trace_events').insert({
          trace_id: id,
          user_id: ud.user.id,
          source: 'client',
          stage,
          at: new Date(evt.at).toISOString(),
          data: (evt.data ?? {}) as never,
        });
        // On turn.start: open header. On turn.end: close it.
        if (stage === 'turn.start') {
          await supabase.from('aion_turn_traces').upsert(
            {
              trace_id: id,
              user_id: ud.user.id,
              route: (seed as any)?.route ?? null,
              conversation_id: (seed as any)?.conversationId ?? null,
              status: 'open',
              meta: (seed ?? {}) as never,
            } as never,
            { onConflict: 'trace_id' },
          );
        } else if (stage === 'turn.end') {
          const dur = Date.now() - t0;
          await supabase.from('aion_turn_traces').update({
            ended_at: new Date().toISOString(),
            duration_ms: dur,
            status: 'ok',
          } as never).eq('trace_id', id);
        }
      } catch {
        /* observation-only */
      }
    })();
  };

  emit('turn.start', seed);

  return {
    id,
    mark: emit,
    end: (data) => emit('turn.end', data),
  };
}
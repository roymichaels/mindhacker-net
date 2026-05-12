/**
 * Client wrappers for the AION orchestrator skills.
 * All calls are fire-and-forget by default — they must NEVER block UI.
 */
import { supabase } from "@/integrations/supabase/client";

export type SkillKind =
  | "intent.classify"
  | "emotion.detect"
  | "journal.extract"
  | "mode.select"
  | "artifact.generate"
  | "memory.update"
  | "next.action";

export interface SkillResult<T = unknown> {
  ok: boolean;
  result?: T;
  error?: string;
  duration_ms?: number;
  model?: string;
}

const dedupe = new Map<string, number>();
const DEDUPE_MS = 30_000;

function dedupeKey(kind: SkillKind, payload: unknown): string {
  try {
    return `${kind}:${JSON.stringify(payload).slice(0, 400)}`;
  } catch {
    return `${kind}:?`;
  }
}

export async function callAionSkill<T = unknown>(
  kind: SkillKind,
  payload: Record<string, unknown>,
): Promise<SkillResult<T> | null> {
  const key = dedupeKey(kind, payload);
  const last = dedupe.get(key);
  if (last && Date.now() - last < DEDUPE_MS) return null;
  dedupe.set(key, Date.now());

  const { data, error } = await supabase.functions.invoke("aion-orchestrator", {
    body: { kind, payload },
  });
  if (error) {
    console.warn(`[aion-skill] ${kind} failed`, error.message);
    return { ok: false, error: error.message };
  }
  return data as SkillResult<T>;
}

/** Fire-and-forget convenience: never throws, never blocks. */
export function emitAionSkill(kind: SkillKind, payload: Record<string, unknown>): void {
  void callAionSkill(kind, payload).catch((e) => console.warn(`[aion-skill] ${kind}`, e));
}

// Typed helpers
export const classifyIntent = (message: string, route?: string | null) =>
  emitAionSkill("intent.classify", { message, route });

export const detectEmotion = (messages: string[]) =>
  emitAionSkill("emotion.detect", { messages });

export const extractJournal = (
  window: Array<{ role: string; content: string }>,
) => emitAionSkill("journal.extract", { window });

export const selectMode = (signals: unknown[], current_mode?: string | null) =>
  emitAionSkill("mode.select", { signals, current_mode });

export const suggestNextAction = (
  open_items: unknown[],
  mode?: string | null,
  tone?: string | null,
) => emitAionSkill("next.action", { open_items, mode, tone });
import { supabase } from "@/integrations/supabase/client";

export type AionSignalKind =
  | "route_change"
  | "composer_focus"
  | "ai_message"
  | "action_completed"
  | "session_completed"
  | "journal_saved"
  | "idle"
  | "tone_signal";

export async function recordSignal(kind: AionSignalKind, payload: Record<string, unknown> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("aion_signals").insert({
      user_id: user.id,
      kind,
      payload,
      client_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("[aion] recordSignal failed", e);
  }
}
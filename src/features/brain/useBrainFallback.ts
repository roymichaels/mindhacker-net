import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BrainNode, BrainOverview } from "./types";

/**
 * Read legacy data tables directly and synthesize a BrainOverview.
 * Used as a safety net when the graph tables are empty so /brain is
 * never blank if the user actually has data elsewhere.
 */
export function useBrainFallback(userId: string | null, enabled: boolean) {
  return useQuery<BrainOverview>({
    queryKey: ["brain-fallback", userId],
    enabled: !!userId && enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const nodes: BrainNode[] = [];
      const push = (n: Partial<BrainNode> & { id: string; content: string; type: string }) => {
        nodes.push({
          id: n.id,
          type: n.type,
          layer: (n.layer ?? "deep") as BrainNode["layer"],
          pillar: n.pillar ?? null,
          content: n.content,
          confidence: n.confidence ?? 60,
          strength: n.strength ?? 2,
          emotional_charge: 0,
          user_confirmed: false,
          last_evidence_at: null,
          evidence_count: 1,
          score: (n.strength ?? 2) * (n.confidence ?? 60),
        });
      };

      const [profileRes, identityRes, actionsRes, journalRes, pillarsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, bio, aion_name, selected_pillars").eq("id", userId!).maybeSingle(),
        supabase.from("aurora_identity_elements").select("id, element_type, content").eq("user_id", userId!).limit(50),
        supabase.from("action_items").select("id, title, pillar, recurrence_rule, status").eq("user_id", userId!).limit(80),
        supabase.from("journal_entries").select("id, content, journal_type").eq("user_id", userId!).order("created_at", { ascending: false }).limit(20),
        supabase.from("pillar_confidence").select("pillar_id, confidence, signal_count").eq("user_id", userId!),
      ]);

      const p = profileRes.data;
      if (p?.full_name) push({ id: `p-name-${p.id}`, type: "identity", content: `My name is ${p.full_name}`, confidence: 90, strength: 5 });
      if (p?.bio) push({ id: `p-bio-${p.id}`, type: "identity", content: p.bio, confidence: 70, strength: 3 });
      for (const fp of (p?.selected_pillars as string[] | null) ?? []) {
        push({ id: `p-pillar-${fp}`, type: "goal", content: `Focus pillar: ${fp}`, pillar: String(fp), layer: "pattern", confidence: 70 });
      }

      for (const r of identityRes.data ?? []) {
        const t = String(r.element_type || "").toLowerCase();
        const nodeType = t.includes("value") ? "value" : t.includes("belief") ? "belief" : t.includes("goal") ? "goal" : t.includes("habit") ? "habit" : "identity";
        push({ id: `ie-${r.id}`, type: nodeType, content: String(r.content ?? ""), confidence: 70, strength: 3 });
      }

      for (const a of actionsRes.data ?? []) {
        const recurring = !!a.recurrence_rule;
        push({
          id: `ai-${a.id}`,
          type: recurring ? "habit" : "goal",
          content: String(a.title ?? ""),
          pillar: a.pillar ?? null,
          layer: recurring ? "pattern" : "surface",
          confidence: a.status === "done" || a.status === "completed" ? 65 : 50,
          strength: recurring ? 3 : 1,
        });
      }

      for (const j of journalRes.data ?? []) {
        const text = String(j.content ?? "").slice(0, 200);
        if (!text) continue;
        push({ id: `j-${j.id}`, type: "memory", content: text, layer: "surface", confidence: 50 });
      }

      const pillars: Record<string, { confidence: number; signal_count: number }> = {};
      for (const pc of pillarsRes.data ?? []) {
        pillars[pc.pillar_id] = { confidence: Number(pc.confidence ?? 0), signal_count: Number(pc.signal_count ?? 0) };
      }

      return {
        nodes: nodes.filter((n) => n.content && n.content.trim().length > 0),
        edges: [],
        pillars,
        contradictions: [],
        recent: [],
        unknown_areas: [],
        generated_at: new Date().toISOString(),
      };
    },
  });
}

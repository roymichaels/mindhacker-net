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

      const [profileRes, identityRes, actionsRes, journalRes, pillarsRes, launchpadRes, summaryRes, domainsRes, scansRes, orbRes, avatarRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, bio, aion_name, selected_pillars").eq("id", userId!).maybeSingle(),
        supabase.from("aurora_identity_elements").select("id, element_type, content").eq("user_id", userId!).limit(50),
        supabase.from("action_items").select("id, title, pillar, recurrence_rule, status").eq("user_id", userId!).limit(80),
        supabase.from("journal_entries").select("id, content, journal_type").eq("user_id", userId!).order("created_at", { ascending: false }).limit(20),
        supabase.from("pillar_confidence").select("pillar_id, confidence, signal_count").eq("user_id", userId!),
        supabase.from("launchpad_progress").select("step_1_intention, step_2_profile_data, step_5_focus_areas_selected, step_6_actions, step_6_anchor_habit, step_10_final_notes, launchpad_complete").eq("user_id", userId!).maybeSingle(),
        supabase.from("launchpad_summaries").select("summary_data, clarity_score, consciousness_score, transformation_readiness").eq("user_id", userId!).order("generated_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("life_domains").select("domain_id, domain_config, status").eq("user_id", userId!).limit(50),
        supabase.from("presence_scans").select("id, scores").eq("user_id", userId!).order("created_at", { ascending: false }).limit(10),
        supabase.from("orb_profiles").select("id, computed_from").eq("user_id", userId!).maybeSingle(),
        supabase.from("avatar_customizations").select("id, customization_data").eq("user_id", userId!).maybeSingle(),
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

      const launchpad = (launchpadRes.data ?? {}) as Record<string, any>;
      const summary = (summaryRes.data?.summary_data as Record<string, any> | null) ?? {};
      const identityProfile = (summary.identity_profile as Record<string, any> | undefined) ?? {};
      const lifeDirection = (summary.life_direction as Record<string, any> | undefined) ?? {};
      const behavioral = (summary.behavioral_insights as Record<string, any> | undefined) ?? {};

      const intention = (() => {
        try {
          return typeof launchpad.step_1_intention === "string"
            ? JSON.parse(launchpad.step_1_intention)
            : (launchpad.step_1_intention ?? {});
        } catch {
          return {};
        }
      })() as Record<string, any>;

      for (const target of (intention.target_90_days as string[] | undefined) ?? []) {
        push({ id: `lp-target-${target}`, type: "goal", content: `90-day target: ${target}`, layer: "surface", confidence: 72, strength: 2 });
      }
      for (const trait of ((identityProfile.dominant_traits as string[] | undefined) ?? []).slice(0, 6)) {
        push({ id: `ls-trait-${trait}`, type: "identity", content: `Dominant trait: ${trait}`, layer: "deep", confidence: 78, strength: 3 });
      }
      for (const value of ((identityProfile.values_hierarchy as string[] | undefined) ?? []).slice(0, 4)) {
        push({ id: `ls-value-${value}`, type: "value", content: value, layer: "deep", confidence: 80, strength: 3 });
      }
      if (lifeDirection.core_aspiration) {
        push({ id: `ls-aspiration`, type: "goal", content: String(lifeDirection.core_aspiration), layer: "deep", confidence: 82, strength: 4 });
      }
      for (const habit of ((behavioral.habits_to_cultivate as string[] | undefined) ?? []).slice(0, 4)) {
        push({ id: `ls-habit-${habit}`, type: "habit", content: `Cultivate: ${habit}`, layer: "pattern", confidence: 74, strength: 2 });
      }
      for (const blocker of ([...((behavioral.habits_to_transform as string[] | undefined) ?? []), ...((behavioral.resistance_patterns as string[] | undefined) ?? [])]).slice(0, 6)) {
        push({ id: `ls-blocker-${blocker}`, type: "blocker", content: blocker, layer: "pattern", confidence: 72, strength: 2 });
      }
      for (const area of (launchpad.step_5_focus_areas_selected as string[] | undefined) ?? []) {
        push({ id: `lp-focus-${area}`, type: "goal", content: `Focus area: ${area}`, layer: "surface", confidence: 70, strength: 2 });
      }
      if (launchpad.step_6_anchor_habit) {
        push({ id: `lp-anchor`, type: "habit", content: `Anchor habit: ${launchpad.step_6_anchor_habit}`, layer: "pattern", confidence: 75, strength: 3 });
      }
      if (launchpad.step_10_final_notes) {
        push({ id: `lp-notes`, type: "insight", content: String(launchpad.step_10_final_notes).slice(0, 200), layer: "deep", confidence: 68, strength: 2 });
      }

      for (const row of domainsRes.data ?? []) {
        const cfg = (row.domain_config as Record<string, any> | null) ?? {};
        const latest = (cfg.latest_assessment as Record<string, any> | undefined) ?? {};
        const findings = Array.isArray(latest.findings) ? latest.findings : [];
        for (const finding of findings.slice(0, 4)) {
          const text = String(finding?.text_en ?? finding?.text_he ?? "").trim();
          if (!text) continue;
          const type = /high_|strong|clear|flow|integrated|support|creative|authentic/i.test(String(finding?.id ?? "")) ? "strength" : "blocker";
          push({ id: `ld-${row.domain_id}-${finding.id}`, type, content: text, pillar: row.domain_id, layer: "pattern", confidence: 76, strength: 2 });
        }
      }

      for (const scan of scansRes.data ?? []) {
        const scores = (scan.scores as Record<string, number> | null) ?? {};
        const top = Object.entries(scores).filter(([, v]) => typeof v === "number").sort((a, b) => Number(b[1]) - Number(a[1]))[0];
        if (top) push({ id: `ps-${scan.id}-${top[0]}`, type: "pattern", content: `Presence signal: ${top[0]} (${Math.round(Number(top[1]))})`, pillar: "presence", layer: "pattern", confidence: 70, strength: 2 });
      }

      const orb = (orbRes.data?.computed_from as Record<string, any> | null) ?? {};
      if (orb.egoState) push({ id: `orb-ego`, type: "identity", content: `Orb ego state: ${orb.egoState}`, layer: "deep", confidence: 72, strength: 2 });
      const avatar = (avatarRes.data?.customization_data as Record<string, any> | null) ?? {};
      const avatarParts = Object.values(avatar).filter((part: any) => part && typeof part === "object" && (part.assetId || part.color)).length;
      if (avatarParts > 0) push({ id: `avatar-parts`, type: "identity", content: `Avatar customized across ${avatarParts} parts`, layer: "deep", confidence: 70, strength: 2 });

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
        debug: {
          origin: "fallback",
          source_counts: {
            onboarding: Number(!!launchpadRes.data) + Number(!!summaryRes.data),
            assessments: (domainsRes.data?.length ?? 0) + (scansRes.data?.length ?? 0) + (pillarsRes.data?.length ?? 0),
            journals: journalRes.data?.length ?? 0,
            actions: actionsRes.data?.length ?? 0,
          },
        },
      };
    },
  });
}

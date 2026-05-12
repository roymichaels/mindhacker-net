import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BrainEvidenceRow, BrainOverview } from "./types";

export function useCurrentUserId() {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setUid(data.user?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, []);
  return uid;
}

export function useBrainOverview(userId: string | null, minConfidence = 25, limit = 120) {
  return useQuery<BrainOverview>({
    queryKey: ["brain-overview", userId, minConfidence, limit],
    enabled: !!userId,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("brain_get_overview" as any, {
        p_user_id: userId,
        p_min_confidence: minConfidence,
        p_limit: limit,
      });
      if (error) throw error;
      const obj = (data ?? {}) as Partial<BrainOverview>;
      return {
        nodes: obj.nodes ?? [],
        edges: obj.edges ?? [],
        pillars: obj.pillars ?? {},
        contradictions: obj.contradictions ?? [],
        recent: obj.recent ?? [],
        unknown_areas: obj.unknown_areas ?? [],
        generated_at: obj.generated_at ?? new Date().toISOString(),
      };
    },
  });
}

export function useBrainNodeEvidence(nodeId: string | null) {
  return useQuery<BrainEvidenceRow[]>({
    queryKey: ["brain-evidence", nodeId],
    enabled: !!nodeId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("brain_evidence")
        .select("id, source_kind, source_ref, delta_confidence, delta_strength, summary, created_at")
        .eq("node_id", nodeId)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as BrainEvidenceRow[];
    },
  });
}

export async function confirmBrainNode(nodeId: string) {
  const { error } = await (supabase as any)
    .from("aurora_memory_graph")
    .update({
      user_confirmed: true,
      confidence: 95,
      last_referenced_at: new Date().toISOString(),
    })
    .eq("id", nodeId);
  if (error) throw error;
}

export async function rejectBrainNode(nodeId: string) {
  const { error } = await (supabase as any)
    .from("aurora_memory_graph")
    .update({
      is_active: false,
      user_corrected_at: new Date().toISOString(),
      confidence: 5,
    })
    .eq("id", nodeId);
  if (error) throw error;
}
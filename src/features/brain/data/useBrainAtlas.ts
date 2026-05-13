/**
 * useBrainAtlas — fetches the global Consciousness Map.
 *
 * One round-trip RPC (`brain_get_atlas`) returns per-room aggregates
 * (node_count, avg_confidence, coverage, gaps_count, last_evidence_at)
 * plus aggregated cross-room edges. The atlas view consumes this directly.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AtlasRoom {
  id: string;
  slug: string;
  node_count: number;
  avg_confidence: number;
  coverage: number;
  gaps_count: number;
  last_evidence_at: string | null;
}

export interface AtlasCrossEdge {
  from_room: string;
  to_room: string;
  weight: number;
}

export interface BrainAtlas {
  rooms: AtlasRoom[];
  cross_edges: AtlasCrossEdge[];
  generated_at: string;
}

export function useBrainAtlas(userId: string | null) {
  return useQuery<BrainAtlas, Error>({
    queryKey: ["brain-atlas", userId],
    enabled: !!userId,
    staleTime: 30_000,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("brain_get_atlas" as any, {
        p_user_id: userId,
      });
      if (error) {
        console.error("[brain] atlas RPC error", error);
        throw new Error(error.message ?? "brain_get_atlas failed");
      }
      const obj = (data ?? {}) as Partial<BrainAtlas>;
      return {
        rooms: Array.isArray(obj.rooms) ? (obj.rooms as AtlasRoom[]) : [],
        cross_edges: Array.isArray(obj.cross_edges) ? (obj.cross_edges as AtlasCrossEdge[]) : [],
        generated_at: obj.generated_at ?? new Date().toISOString(),
      };
    },
  });
}
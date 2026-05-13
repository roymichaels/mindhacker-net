/**
 * useBrainRoom — fetches the internal graph for one consciousness room.
 *
 * Wraps `brain_get_room` and adapts its rows to the legacy
 * BrainNode/BrainEdge shape so we can reuse `BrainGraphForce`.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BrainEdge, BrainLayer, BrainNode } from "../types";

export interface BrainRoomGap {
  id: string;
  content: string;
  confidence: number;
}

export interface BrainRoom {
  room: string;
  nodes: BrainNode[];
  edges: BrainEdge[];
  gaps: BrainRoomGap[];
  generated_at: string;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function useBrainRoom(userId: string | null, room: string | null) {
  return useQuery<BrainRoom, Error>({
    queryKey: ["brain-room", userId, room],
    enabled: !!userId && !!room,
    staleTime: 30_000,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("brain_get_room" as any, {
        p_user_id: userId,
        p_room: room,
        p_limit: 200,
      });
      if (error) {
        console.error("[brain] room RPC error", error);
        throw new Error(error.message ?? "brain_get_room failed");
      }
      const obj = (data ?? {}) as any;
      const nodes: BrainNode[] = (Array.isArray(obj.nodes) ? obj.nodes : []).map((n: any) => ({
        id: String(n.id),
        type: String(n.node_type ?? "identity"),
        layer: (n.layer ?? "surface") as BrainLayer,
        pillar: n.pillar ?? null,
        content: String(n.content ?? ""),
        confidence: num(n.confidence),
        strength: num(n.strength),
        emotional_charge: num(n.emotional_charge),
        user_confirmed: !!n.user_confirmed,
        last_evidence_at: n.last_evidence_at ?? null,
        evidence_count: num(n.reference_count),
        score: num(n.confidence) + num(n.reference_count) * 5,
        room: n.room ?? null,
      }));
      const edges: BrainEdge[] = (Array.isArray(obj.edges) ? obj.edges : []).map((e: any) => ({
        from: String(e.from_node),
        to: String(e.to_node),
        relation: String(e.relation ?? ""),
        weight: num(e.weight) || 1,
      }));
      return {
        room: String(obj.room ?? room),
        nodes,
        edges,
        gaps: Array.isArray(obj.gaps) ? (obj.gaps as BrainRoomGap[]) : [],
        generated_at: obj.generated_at ?? new Date().toISOString(),
      };
    },
  });
}
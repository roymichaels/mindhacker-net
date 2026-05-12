/**
 * graph.upsert — in-process upsert helper for `aurora_memory_graph`.
 *
 * Lexical dedupe (lower-cased content match) against the user's existing
 * nodes. On match: bump strength + reference_count, refresh
 * `last_referenced_at`, merge metadata. On miss: insert.
 *
 * Operates with the caller's user-scoped Supabase client — RLS enforces
 * ownership, so the helper never needs the service role.
 */
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type GraphNodeType =
  | "belief"
  | "fear"
  | "breakthrough"
  | "pattern"
  | "value_shift"
  | "dream"
  | "blocker"
  | "insight"
  | "value"
  | "desire"
  | "wound"
  | "goal"
  | "habit"
  | "contradiction"
  | "avoidance"
  | "strength"
  | "loop";

export interface ProposedNode {
  node_type: GraphNodeType;
  content: string;
  context?: string | null;
  pillar?: string | null;
  strength?: number; // 1..10, default 1
  metadata?: Record<string, unknown>;
  /** Where this node came from (used for brain_evidence). Default "conversation". */
  source_kind?:
    | "conversation"
    | "onboarding"
    | "assessment"
    | "journal"
    | "hypnosis"
    | "mission"
    | "habit"
    | "pulse"
    | "dna"
    | "manual";
  /** Stable reference for idempotent evidence writes. */
  source_ref?: Record<string, unknown>;
}

export interface UpsertResult {
  node_type: GraphNodeType;
  content: string;
  action: "inserted" | "reinforced" | "skipped";
  id?: string;
  reference_count?: number;
  strength?: number;
  confidence?: number;
}

const VALID_TYPES: GraphNodeType[] = [
  "belief",
  "fear",
  "breakthrough",
  "pattern",
  "value_shift",
  "dream",
  "blocker",
  "insight",
  "value",
  "desire",
  "wound",
  "goal",
  "habit",
  "contradiction",
  "avoidance",
  "strength",
  "loop",
];

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function upsertGraphNodes(
  client: SupabaseClient,
  user_id: string,
  nodes: ProposedNode[],
): Promise<UpsertResult[]> {
  const out: UpsertResult[] = [];
  for (const raw of nodes) {
    if (!raw?.content || !raw?.node_type) {
      out.push({ node_type: raw?.node_type ?? "insight", content: raw?.content ?? "", action: "skipped" });
      continue;
    }
    if (!VALID_TYPES.includes(raw.node_type)) {
      out.push({ node_type: raw.node_type, content: raw.content, action: "skipped" });
      continue;
    }
    const content = raw.content.trim().slice(0, 800);

    // Route through brain_upsert_node so every write also records evidence
    // and maintains layer/confidence/dedupe in a single place.
    const { data, error } = await client.rpc("brain_upsert_node", {
      p_user_id: user_id,
      p_type: raw.node_type,
      p_content: content,
      p_layer: null,
      p_pillar: raw.pillar ?? null,
      p_source_kind: raw.source_kind ?? "conversation",
      p_source_ref: raw.source_ref ?? raw.metadata ?? {},
      p_delta_conf: 5,
      p_delta_strength: Math.max(1, Math.min(10, raw.strength ?? 1)),
      p_emotional_charge: null,
      p_summary: content.slice(0, 200),
    });

    if (error || !data) {
      out.push({ node_type: raw.node_type, content, action: "skipped" });
      continue;
    }

    const result = data as {
      node_id: string;
      created: boolean;
      new_confidence: number;
      new_strength: number;
    };

    out.push({
      node_type: raw.node_type,
      content,
      action: result.created ? "inserted" : "reinforced",
      id: result.node_id,
      strength: result.new_strength,
      confidence: result.new_confidence,
      reference_count: result.created ? 1 : 2,
    });
  }
  return out;
}
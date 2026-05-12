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
  | "insight";

export interface ProposedNode {
  node_type: GraphNodeType;
  content: string;
  context?: string | null;
  pillar?: string | null;
  strength?: number; // 1..10, default 1
  metadata?: Record<string, unknown>;
}

export interface UpsertResult {
  node_type: GraphNodeType;
  content: string;
  action: "inserted" | "reinforced" | "skipped";
  id?: string;
  reference_count?: number;
  strength?: number;
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
    const normalized = normalize(content);

    // Look for an existing node of the same type whose normalized content matches.
    const { data: existingRows } = await client
      .from("aurora_memory_graph")
      .select("id, content, strength, reference_count, metadata")
      .eq("user_id", user_id)
      .eq("node_type", raw.node_type)
      .eq("is_active", true)
      .limit(50);

    const match = (existingRows ?? []).find(
      (r: any) => normalize(String(r.content ?? "")) === normalized,
    );

    if (match) {
      const nextStrength = Math.min(10, (match.strength ?? 1) + 1);
      const nextCount = (match.reference_count ?? 1) + 1;
      const mergedMeta = { ...(match.metadata ?? {}), ...(raw.metadata ?? {}) };
      const { error } = await client
        .from("aurora_memory_graph")
        .update({
          strength: nextStrength,
          reference_count: nextCount,
          last_referenced_at: new Date().toISOString(),
          metadata: mergedMeta,
        })
        .eq("id", match.id);
      if (error) {
        out.push({ node_type: raw.node_type, content, action: "skipped" });
      } else {
        out.push({
          node_type: raw.node_type,
          content,
          action: "reinforced",
          id: match.id,
          reference_count: nextCount,
          strength: nextStrength,
        });
      }
      continue;
    }

    const { data: inserted, error: insErr } = await client
      .from("aurora_memory_graph")
      .insert({
        user_id,
        node_type: raw.node_type,
        content,
        context: raw.context ?? null,
        pillar: raw.pillar ?? null,
        strength: Math.max(1, Math.min(10, raw.strength ?? 1)),
        metadata: raw.metadata ?? {},
      })
      .select("id")
      .maybeSingle();
    if (insErr) {
      out.push({ node_type: raw.node_type, content, action: "skipped" });
    } else {
      out.push({
        node_type: raw.node_type,
        content,
        action: "inserted",
        id: inserted?.id,
        reference_count: 1,
        strength: Math.max(1, Math.min(10, raw.strength ?? 1)),
      });
    }
  }
  return out;
}
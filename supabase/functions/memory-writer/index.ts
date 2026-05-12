/**
 * memory-writer — silent graph-growth pipeline.
 *
 * Invoked fire-and-forget after each meaningful interaction:
 *   - chat turn (assistant reply finalised)
 *   - journal save
 *   - hypnosis completion
 *   - mission completion
 *
 * Pipeline (all best-effort, never blocking the user):
 *   1. emotion.detect → aion_signals('emotion.detected')
 *   2. intent.classify (chat) → aion_signals('intent.classified')
 *   3. journal.extract (chat / journal) → may emit a 'breakthrough' or 'insight' node
 *   4. graph.proposal (new local skill) → typed nodes for aurora_memory_graph
 *   5. graph.upsert helper writes them, dedupe by lower-cased content
 *   6. recurring patterns (>=3 references) mirror into aurora_behavioral_patterns
 *   7. identity-flavoured nodes mirror into aurora_identity_elements
 *
 * Auth: caller's JWT is required and forwarded to Supabase so RLS enforces
 * ownership (no service role).
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callSkill } from "../_shared/aiSkill.ts";
import { SKILLS } from "../_shared/skillRegistry.ts";
import { upsertGraphNodes, type GraphNodeType, type ProposedNode } from "../_shared/graphUpsert.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Source = "chat" | "journal" | "hypnosis" | "mission";

interface Body {
  source: Source;
  context: {
    messages?: { role: "user" | "assistant"; content: string }[];
    journal_text?: string;
    hypnosis_summary?: string;
    mission?: { title: string; outcome: string; reflection?: string };
    pillar?: string;
  };
}

const VALID_SOURCES: Source[] = ["chat", "journal", "hypnosis", "mission"];

const PATTERN_TYPES = ["focus", "avoidance", "discipline", "resistance", "strength"] as const;
const IDENTITY_TYPES = [
  "value",
  "principle",
  "self_concept",
  "vision_statement",
  "character_trait",
  "role_model",
  "identity_title",
  "ai_archetype",
] as const;

/** All known internal life pillars. Used as the closed vocabulary the
 *  inference LLM is allowed to score. */
const PILLAR_IDS = [
  "consciousness", "presence", "power", "vitality", "focus", "combat",
  "expansion", "wealth", "influence", "relationships", "business",
  "projects", "play", "order", "romantics",
] as const;

function normalize(s: string): string {
  return String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Local skill: produce typed graph node candidates from a snippet. */
const GRAPH_PROPOSAL_SKILL = {
  name: "emit_graph_proposal",
  description:
    "Propose 0-5 long-term memory nodes for the user's consciousness graph from the snippet. Be conservative — only durable, recurring, identity-relevant content.",
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      nodes: {
        type: "array",
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            node_type: {
              type: "string",
              enum: [
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
                "avoidance",
                "strength",
                "loop",
              ],
            },
            content: { type: "string", maxLength: 400 },
            pillar: { type: "string" },
            pattern_type: {
              type: "string",
              enum: ["focus", "avoidance", "discipline", "resistance", "strength"],
            },
            identity_type: {
              type: "string",
              enum: IDENTITY_TYPES as unknown as string[],
            },
          },
          required: ["node_type", "content"],
        },
      },
      pillar_signals: {
        type: "array",
        maxItems: 5,
        description:
          "Per-pillar inference: how much this snippet teaches us about each pillar. delta is -10..+10. Only include pillars truly evidenced.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            pillar: { type: "string", enum: PILLAR_IDS as unknown as string[] },
            delta: { type: "number" },
            evidence: { type: "string", maxLength: 240 },
            gaps_resolved: { type: "array", items: { type: "string", maxLength: 120 }, maxItems: 4 },
            gaps_added: { type: "array", items: { type: "string", maxLength: 120 }, maxItems: 4 },
          },
          required: ["pillar", "delta"],
        },
      },
      contradictions: {
        type: "array",
        maxItems: 2,
        description:
          "Tensions between this snippet and prior stated content. Only include when the contradiction is concrete and meaningful.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            pillar: { type: "string" },
            with_statement: { type: "string", maxLength: 240, description: "Quote or paraphrase of the prior stance" },
            explanation: { type: "string", maxLength: 240 },
          },
          required: ["with_statement", "explanation"],
        },
      },
    },
    required: ["nodes"],
  },
};

function snippetFor(body: Body): string {
  const c = body.context ?? {};
  if (body.source === "chat") {
    return (c.messages ?? [])
      .slice(-6)
      .map((m) => `${m.role === "user" ? "U" : "A"}: ${String(m.content ?? "").slice(0, 600)}`)
      .join("\n");
  }
  if (body.source === "journal") return String(c.journal_text ?? "").slice(0, 2400);
  if (body.source === "hypnosis") return String(c.hypnosis_summary ?? "").slice(0, 2400);
  if (body.source === "mission") {
    const m = c.mission;
    return [m?.title, m?.outcome, m?.reflection].filter(Boolean).join("\n").slice(0, 2400);
  }
  return "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const t0 = Date.now();
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "missing_jwt" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.source || !VALID_SOURCES.includes(body.source)) {
      return new Response(JSON.stringify({ error: "invalid_source" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const snippet = snippetFor(body).trim();
    if (!snippet) {
      return new Response(JSON.stringify({ ok: true, skipped: "empty_snippet" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userRes } = await supabase.auth.getUser();
    const user_id = userRes?.user?.id;
    if (!user_id) {
      return new Response(JSON.stringify({ error: "no_user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Pipeline (each step best-effort) ──
    const writes: Record<string, unknown> = {};

    // 1. emotion.detect
    try {
      const skill = SKILLS["emotion.detect"];
      const messagesForEmotion =
        body.source === "chat"
          ? (body.context.messages ?? []).slice(-3).map((m) => m.content)
          : [snippet];
      const r = await callSkill<any>({
        system: skill.system,
        user: skill.buildUser({ messages: messagesForEmotion }),
        schema: skill.schema,
        timeoutMs: 12_000,
      });
      if (r.ok && r.result) {
        await supabase.from("aion_signals").insert({
          user_id,
          kind: skill.signalKind,
          payload: { ...r.result, source: body.source },
        });
        writes.emotion = r.result;
      }
    } catch (e) {
      console.warn("[memory-writer] emotion.detect failed", e);
    }

    // 2. intent.classify (chat only)
    if (body.source === "chat") {
      try {
        const skill = SKILLS["intent.classify"];
        const lastUser = [...(body.context.messages ?? [])]
          .reverse()
          .find((m) => m.role === "user")?.content ?? "";
        if (lastUser) {
          const r = await callSkill<any>({
            system: skill.system,
            user: skill.buildUser({ message: lastUser }),
            schema: skill.schema,
            timeoutMs: 8_000,
          });
          if (r.ok && r.result) {
            await supabase.from("aion_signals").insert({
              user_id,
              kind: skill.signalKind,
              payload: { ...r.result, source: body.source },
            });
            writes.intent = r.result;
          }
        }
      } catch (e) {
        console.warn("[memory-writer] intent.classify failed", e);
      }
    }

    // 3. journal.extract (chat + journal)
    let journalNode: ProposedNode | null = null;
    if (body.source === "chat" || body.source === "journal") {
      try {
        const skill = SKILLS["journal.extract"];
        const window =
          body.source === "chat"
            ? (body.context.messages ?? []).slice(-8)
            : [{ role: "user", content: body.context.journal_text ?? "" }];
        const r = await callSkill<any>({
          system: skill.system,
          user: skill.buildUser({ window }),
          schema: skill.schema,
          timeoutMs: 12_000,
        });
        if (r.ok && r.result?.shouldSave && r.result.body) {
          journalNode = {
            node_type: "insight",
            content: String(r.result.body).slice(0, 400),
            pillar: r.result.pillar ?? body.context.pillar ?? null,
            metadata: { title: r.result.title, tags: r.result.tags ?? [], source: body.source },
          };
          writes.journal = r.result;
        }
      } catch (e) {
        console.warn("[memory-writer] journal.extract failed", e);
      }
    }

    // 4. graph.proposal — typed candidates
    let proposed: ProposedNode[] = [];
    let proposalRaw: any = null;
    let pillarSignals: Array<{ pillar: string; delta: number; evidence?: string; gaps_resolved?: string[]; gaps_added?: string[] }> = [];
    let rawContradictions: Array<{ pillar?: string; with_statement: string; explanation: string }> = [];
    try {
      const r = await callSkill<{
        nodes: Array<{
          node_type: GraphNodeType;
          content: string;
          pillar?: string;
          pattern_type?: typeof PATTERN_TYPES[number];
          identity_type?: typeof IDENTITY_TYPES[number];
        }>;
        pillar_signals?: typeof pillarSignals;
        contradictions?: typeof rawContradictions;
      }>({
        system:
          "You are AION's silent inference engine. Three jobs:\n" +
          "1) Extract durable consciousness-graph nodes (beliefs, values, fears, goals, wounds, habits, patterns…). Be conservative; recurring/identity-relevant only.\n" +
          "2) Score each life pillar this snippet truly evidences (delta -10..+10). Note gaps revealed or filled.\n" +
          "3) Flag contradictions ONLY when the snippet conflicts with a prior stance the user actually stated.\n" +
          "Match the snippet's language. When in doubt, return empty arrays.",
        user: JSON.stringify({ source: body.source, pillar: body.context.pillar ?? null, snippet }),
        schema: GRAPH_PROPOSAL_SKILL,
        timeoutMs: 15_000,
      });
      if (r.ok && Array.isArray(r.result?.nodes)) {
        proposalRaw = r.result.nodes;
        proposed = r.result.nodes.map((n) => ({
          node_type: n.node_type,
          content: n.content,
          pillar: n.pillar ?? body.context.pillar ?? null,
          metadata: {
            source: body.source,
            pattern_type: n.pattern_type,
            identity_type: n.identity_type,
          },
        }));
        if (Array.isArray(r.result?.pillar_signals)) pillarSignals = r.result.pillar_signals;
        if (Array.isArray(r.result?.contradictions)) rawContradictions = r.result.contradictions;
      }
    } catch (e) {
      console.warn("[memory-writer] graph.proposal failed", e);
    }
    if (journalNode) proposed.unshift(journalNode);

    // 5. upsert
    const upserts = await upsertGraphNodes(supabase, user_id, proposed);
    writes.graph = upserts;

    // 5b. pillar_confidence updates
    const pillarUpdates: any[] = [];
    for (const sig of pillarSignals) {
      if (!PILLAR_IDS.includes(sig.pillar as any)) continue;
      const delta = Math.max(-10, Math.min(10, Number(sig.delta) || 0));
      try {
        const { data: existing } = await supabase
          .from("pillar_confidence")
          .select("id, confidence, signal_count, gaps")
          .eq("user_id", user_id)
          .eq("pillar_id", sig.pillar)
          .maybeSingle();

        const oldConf = Number(existing?.confidence ?? 0);
        // Diminishing returns above 70: positive deltas decay.
        const decay = oldConf >= 70 && delta > 0 ? 0.4 : oldConf >= 50 && delta > 0 ? 0.7 : 1;
        const newConf = Math.max(0, Math.min(100, oldConf + delta * decay));

        const oldGaps: string[] = Array.isArray(existing?.gaps) ? existing!.gaps as string[] : [];
        const resolved = new Set((sig.gaps_resolved ?? []).map((g) => g.toLowerCase()));
        const merged = new Set(oldGaps.filter((g) => !resolved.has(g.toLowerCase())));
        for (const g of (sig.gaps_added ?? [])) merged.add(g.slice(0, 120));
        const nextGaps = Array.from(merged).slice(0, 8);

        if (existing?.id) {
          await supabase
            .from("pillar_confidence")
            .update({
              confidence: Number(newConf.toFixed(2)),
              signal_count: (existing.signal_count ?? 0) + 1,
              gaps: nextGaps,
              last_signal_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("pillar_confidence")
            .insert({
              user_id,
              pillar_id: sig.pillar,
              confidence: Number(newConf.toFixed(2)),
              signal_count: 1,
              gaps: nextGaps,
              last_signal_at: new Date().toISOString(),
            });
        }
        pillarUpdates.push({ pillar: sig.pillar, old: oldConf, new: newConf, delta });
      } catch (e) {
        console.warn("[memory-writer] pillar_confidence failed", sig.pillar, e);
      }
    }
    writes.pillar_confidence = pillarUpdates;

    // 5c. contradictions — match `with_statement` to an existing strong graph node
    const contradictionWrites: any[] = [];
    for (const c of rawContradictions) {
      if (!c?.with_statement || !c?.explanation) continue;
      try {
        const { data: candidates } = await supabase
          .from("aurora_memory_graph")
          .select("id, content, strength")
          .eq("user_id", user_id)
          .eq("is_active", true)
          .gte("strength", 5)
          .limit(40);
        const needle = normalize(c.with_statement);
        const matchA = (candidates ?? []).find((r: any) =>
          normalize(String(r.content ?? "")).includes(needle.slice(0, 40)) ||
          needle.includes(normalize(String(r.content ?? "")).slice(0, 40)),
        );
        // The "B" side is the most recent insert from this batch (if any has strength≥5).
        const matchB = upserts.find((u) => u.action === "inserted" && (u.strength ?? 0) >= 5);
        if (matchA && matchB?.id) {
          const { data: ins, error: insErr } = await supabase
            .from("aurora_contradictions")
            .insert({
              user_id,
              pillar_id: c.pillar ?? body.context.pillar ?? null,
              statement_a: matchA.id,
              statement_b: matchB.id,
              explanation: c.explanation.slice(0, 400),
            })
            .select("id")
            .maybeSingle();
          if (!insErr) contradictionWrites.push({ id: ins?.id, pillar: c.pillar });
        }
      } catch (e) {
        console.warn("[memory-writer] contradiction insert failed", e);
      }
    }
    writes.contradictions = contradictionWrites;

    // 6. recurring patterns → aurora_behavioral_patterns
    for (let i = 0; i < upserts.length; i++) {
      const u = upserts[i];
      if (u.node_type !== "pattern") continue;
      if ((u.reference_count ?? 0) < 3) continue;
      const patternType =
        (proposalRaw?.[i]?.pattern_type as string) ?? null;
      if (!patternType || !PATTERN_TYPES.includes(patternType as any)) continue;
      try {
        await supabase.from("aurora_behavioral_patterns").insert({
          user_id,
          pattern_type: patternType,
          description: u.content.slice(0, 400),
        });
      } catch (e) {
        console.warn("[memory-writer] pattern mirror failed", e);
      }
    }

    // 7. identity-flavoured nodes → aurora_identity_elements
    for (let i = 0; i < proposed.length; i++) {
      const idType = proposalRaw?.[i]?.identity_type as string | undefined;
      if (!idType || !IDENTITY_TYPES.includes(idType as any)) continue;
      try {
        await supabase.from("aurora_identity_elements").insert({
          user_id,
          element_type: idType,
          content: proposed[i].content.slice(0, 400),
          metadata: { source: body.source, pillar: body.context.pillar ?? null },
        });
      } catch (e) {
        console.warn("[memory-writer] identity mirror failed", e);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, duration_ms: Date.now() - t0, writes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[memory-writer] fatal", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
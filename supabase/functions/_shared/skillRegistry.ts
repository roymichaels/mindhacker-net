/**
 * Registry of AION orchestration skills. Each skill: prompt + tool-call schema.
 * Add a new skill here; the orchestrator dispatches it by `kind`.
 */
import type { SkillSchema } from "./aiSkill.ts";

export interface SkillDef {
  kind: string;
  /** Stored back in aion_signals.kind so the brain can read recent results. */
  signalKind: string;
  system: string;
  schema: SkillSchema;
  buildUser: (payload: any) => string;
}

const intentClassify: SkillDef = {
  kind: "intent.classify",
  signalKind: "intent.classified",
  system:
    "You classify a user message into ONE intent for the MindOS app. Be terse, decisive, and never explain. Always emit the tool.",
  schema: {
    name: "emit_intent",
    description: "Classify the user's intent.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        intent: {
          type: "string",
          enum: ["journal", "plan", "vent", "execute", "reflect", "ask", "smalltalk"],
        },
        confidence: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["intent", "confidence"],
    },
  },
  buildUser: (p) =>
    JSON.stringify({
      message: String(p?.message ?? "").slice(0, 800),
      route: p?.route ?? null,
      recent_intents: (p?.recent_intents ?? []).slice(0, 3),
    }),
};

const emotionDetect: SkillDef = {
  kind: "emotion.detect",
  signalKind: "emotion.detected",
  system:
    "You read 1-3 user messages and emit ONE emotional snapshot. Valence is -1 (very negative) to 1 (very positive). Arousal is 0 (calm) to 1 (activated). Tone is one short label.",
  schema: {
    name: "emit_emotion",
    description: "Emotional snapshot of the user right now.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        tone: {
          type: "string",
          enum: ["anxious", "stressed", "tired", "neutral", "focused", "energized", "joyful", "sad", "frustrated"],
        },
        valence: { type: "number", minimum: -1, maximum: 1 },
        arousal: { type: "number", minimum: 0, maximum: 1 },
        signals: { type: "array", items: { type: "string" }, maxItems: 5 },
      },
      required: ["tone", "valence", "arousal", "signals"],
    },
  },
  buildUser: (p) =>
    JSON.stringify({
      messages: (p?.messages ?? []).slice(-3).map((m: string) => String(m).slice(0, 500)),
    }),
};

const journalExtract: SkillDef = {
  kind: "journal.extract",
  signalKind: "journal.extracted",
  system:
    "You scan a short chat window and decide if there is a journal-worthy reflection (insight, decision, breakthrough, recurring struggle). If not, set shouldSave=false. If yes, summarize concisely in the same language as the messages (Hebrew stays Hebrew).",
  schema: {
    name: "emit_journal_candidate",
    description: "Possible journal entry to save.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        shouldSave: { type: "boolean" },
        title: { type: "string" },
        body: { type: "string" },
        pillar: { type: "string" },
        tags: { type: "array", items: { type: "string" }, maxItems: 6 },
      },
      required: ["shouldSave", "title", "body", "pillar", "tags"],
    },
  },
  buildUser: (p) =>
    JSON.stringify({
      window: (p?.window ?? []).slice(-8).map((m: any) => ({
        role: m?.role,
        content: String(m?.content ?? "").slice(0, 600),
      })),
    }),
};

const modeSelect: SkillDef = {
  kind: "mode.select",
  signalKind: "mode.selected",
  system:
    "You choose the next AION operating mode given recent signals. Prefer 'normal' when sparse. 'overwhelmed' for anxious/stress bursts. 'recovery' for tired/late-night/idle. 'focus' for active execution. 'calm' for low-arousal positive. 'dominate' for high-arousal positive + execution.",
  schema: {
    name: "emit_mode",
    description: "Next operating mode for AION.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        next_mode: {
          type: "string",
          enum: ["focus", "recovery", "overwhelmed", "dominate", "calm", "normal"],
        },
        reason: { type: "string" },
      },
      required: ["next_mode", "reason"],
    },
  },
  buildUser: (p) => JSON.stringify({ signals: p?.signals ?? [], current_mode: p?.current_mode ?? null }),
};

const artifactGenerate: SkillDef = {
  kind: "artifact.generate",
  signalKind: "artifact.generated",
  system:
    "You produce ONE small actionable artifact AION can render in the chat. Choose the kind that best serves the intent. Keep payload minimal and language-matched to the user.",
  schema: {
    name: "emit_artifact",
    description: "Small artifact (card, micro-plan, hypnosis seed, protocol).",
    parameters: {
      type: "object",
      additionalProperties: true,
      properties: {
        kind: {
          type: "string",
          enum: ["card", "plan", "hypnosis", "protocol"],
        },
        title: { type: "string" },
        summary: { type: "string" },
        steps: { type: "array", items: { type: "string" }, maxItems: 6 },
      },
      required: ["kind", "title", "summary"],
    },
  },
  buildUser: (p) => JSON.stringify({ intent: p?.intent, context: p?.context ?? null }),
};

const memoryUpdate: SkillDef = {
  kind: "memory.update",
  signalKind: "memory.updated",
  system:
    "Given a new fact and existing memory hashes, decide what AION should add, reinforce, or remove from long-term memory of the user. Be conservative — only add real, durable facts.",
  schema: {
    name: "emit_memory_patch",
    description: "Patch to AION long-term memory of this user.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        add: { type: "array", items: { type: "string" }, maxItems: 5 },
        reinforce: { type: "array", items: { type: "string" }, maxItems: 5 },
        remove: { type: "array", items: { type: "string" }, maxItems: 5 },
      },
      required: ["add", "reinforce", "remove"],
    },
  },
  buildUser: (p) => JSON.stringify({ fact: p?.fact ?? "", existing: p?.existing ?? [] }),
};

const nextAction: SkillDef = {
  kind: "next.action",
  signalKind: "next.action",
  system:
    "Given open action items, current mode, and tone, suggest ONE next step. Match the user's language. urgency: low|med|high.",
  schema: {
    name: "emit_next_action",
    description: "One next step to suggest.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        why: { type: "string" },
        urgency: { type: "string", enum: ["low", "med", "high"] },
      },
      required: ["title", "why", "urgency"],
    },
  },
  buildUser: (p) =>
    JSON.stringify({
      open_items: (p?.open_items ?? []).slice(0, 8),
      mode: p?.mode ?? null,
      tone: p?.tone ?? null,
    }),
};

export const SKILLS: Record<string, SkillDef> = {
  [intentClassify.kind]: intentClassify,
  [emotionDetect.kind]: emotionDetect,
  [journalExtract.kind]: journalExtract,
  [modeSelect.kind]: modeSelect,
  [artifactGenerate.kind]: artifactGenerate,
  [memoryUpdate.kind]: memoryUpdate,
  [nextAction.kind]: nextAction,
};

export type SkillKind = keyof typeof SKILLS;
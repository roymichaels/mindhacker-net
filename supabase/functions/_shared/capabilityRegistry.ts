/**
 * AION Capability Registry — Phase 2.
 *
 * Single source of truth for everything AION is allowed to *do* on the
 * user's behalf. Each capability is:
 *   - id           stable string ("plan.restart")
 *   - description  one-liner for the router LLM
 *   - params       JSON-schema (validated server-side before run)
 *   - destructive  if true, client must show a confirmation sheet
 *   - run          (userId, params, admin) -> { ok, result?, error? }
 *
 * Capabilities call existing edge functions / RPCs. They never write
 * arbitrary SQL and never trust client-supplied user_id.
 *
 * Phase 2: registry + thin wrappers. No client wiring yet.
 */

// deno-lint-ignore no-explicit-any
type Admin = any;

export interface CapabilityResult<T = unknown> {
  ok: boolean;
  result?: T;
  error?: string;
}

export interface CapabilityDef {
  id: string;
  description: string;
  destructive?: boolean;
  /** JSON schema, draft-07 subset — validated by validateParams(). */
  params: {
    type: 'object';
    properties: Record<string, { type: string; enum?: string[]; description?: string }>;
    required?: string[];
    additionalProperties?: boolean;
  };
  run: (userId: string, params: Record<string, unknown>, admin: Admin) => Promise<CapabilityResult>;
}

/* ------------------------------- helpers -------------------------------- */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function invokeFn(name: string, body: Record<string, unknown>): Promise<CapabilityResult> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE}`,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: unknown = null;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) return { ok: false, error: `${name} ${res.status}`, result: data };
    return { ok: true, result: data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/* ----------------------------- capabilities ----------------------------- */

const planRestart: CapabilityDef = {
  id: 'plan.restart',
  description: 'Wipe the active 100-day strategy and regenerate from scratch.',
  destructive: true,
  params: { type: 'object', properties: {}, additionalProperties: false },
  run: (userId) => invokeFn('generate-100day-strategy', { user_id: userId, force: true }),
};

const planDelete: CapabilityDef = {
  id: 'plan.delete',
  description: 'Permanently delete the active strategy without regenerating.',
  destructive: true,
  params: { type: 'object', properties: {}, additionalProperties: false },
  run: async (userId, _params, admin) => {
    const { error } = await admin
      .from('life_plans')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'active');
    return error ? { ok: false, error: error.message } : { ok: true };
  },
};

const dailyGenerate: CapabilityDef = {
  id: 'daily.generate',
  description: "Generate today's action queue when it's empty.",
  params: { type: 'object', properties: {}, additionalProperties: false },
  run: (userId) => invokeFn('generate-today-queue', { user_id: userId }),
};

const actionCreate: CapabilityDef = {
  id: 'action.create',
  description: 'Create a single action item the user just committed to.',
  params: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Short, in user language.' },
      pillar: { type: 'string', description: 'Optional pillar id.' },
    },
    required: ['title'],
    additionalProperties: false,
  },
  run: async (userId, params, admin) => {
    const { data, error } = await admin
      .from('action_items')
      .insert({
        user_id: userId,
        title: String(params.title ?? '').slice(0, 200),
        pillar: (params.pillar as string | undefined) ?? null,
        status: 'pending',
        source: 'aion',
      })
      .select()
      .single();
    return error ? { ok: false, error: error.message } : { ok: true, result: data };
  },
};

const actionComplete: CapabilityDef = {
  id: 'action.complete',
  description: 'Mark an existing action item as completed.',
  params: {
    type: 'object',
    properties: { id: { type: 'string' } },
    required: ['id'],
    additionalProperties: false,
  },
  run: async (userId, params, admin) => {
    const { error } = await admin
      .from('action_items')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', String(params.id))
      .eq('user_id', userId);
    return error ? { ok: false, error: error.message } : { ok: true };
  },
};

const journalWrite: CapabilityDef = {
  id: 'journal.write',
  description: 'Save a journal entry the user just expressed.',
  params: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      body: { type: 'string' },
      pillar: { type: 'string' },
    },
    required: ['body'],
    additionalProperties: false,
  },
  run: async (userId, params, admin) => {
    const { data, error } = await admin
      .from('journal_entries')
      .insert({
        user_id: userId,
        title: (params.title as string | undefined) ?? null,
        content: String(params.body ?? '').slice(0, 8000),
        pillar: (params.pillar as string | undefined) ?? null,
        source: 'aion',
      })
      .select()
      .single();
    return error ? { ok: false, error: error.message } : { ok: true, result: data };
  },
};

const hypnosisStart: CapabilityDef = {
  id: 'hypnosis.start',
  description: 'Generate and stage a hypnosis session for a topic (e.g. sleep, focus).',
  params: {
    type: 'object',
    properties: { topic: { type: 'string' } },
    required: ['topic'],
    additionalProperties: false,
  },
  run: (userId, params) =>
    invokeFn('ai-hypnosis', { user_id: userId, topic: String(params.topic ?? '') }),
};

const brainOpenNode: CapabilityDef = {
  id: 'brain.openNode',
  description: 'Surface a specific consciousness-graph node card.',
  params: {
    type: 'object',
    properties: { nodeId: { type: 'string' } },
    required: ['nodeId'],
    additionalProperties: false,
  },
  run: async (userId, params, admin) => {
    const { data, error } = await admin
      .from('aurora_memory_graph')
      .select('*')
      .eq('user_id', userId)
      .eq('id', String(params.nodeId))
      .maybeSingle();
    return error ? { ok: false, error: error.message } : { ok: true, result: data };
  },
};

const progressSummarize: CapabilityDef = {
  id: 'progress.summarize',
  description: 'Return a compact "what AION knows about you" summary built from identity + patterns.',
  params: { type: 'object', properties: {}, additionalProperties: false },
  run: async (userId, _params, admin) => {
    const [identity, patterns] = await Promise.all([
      admin.from('aurora_identity_elements').select('label, weight').eq('user_id', userId).limit(20),
      admin.from('aurora_behavioral_patterns').select('label, count').eq('user_id', userId).order('count', { ascending: false }).limit(10),
    ]);
    return {
      ok: true,
      result: {
        identity: identity.data ?? [],
        patterns: patterns.data ?? [],
      },
    };
  },
};

const nextStepSuggest: CapabilityDef = {
  id: 'nextStep.suggest',
  description: 'Pick the single best next action from open items.',
  params: { type: 'object', properties: {}, additionalProperties: false },
  run: async (userId, _params, admin) => {
    const { data, error } = await admin
      .from('action_items')
      .select('id, title, pillar, priority, due_at')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('due_at', { ascending: true })
      .limit(1);
    if (error) return { ok: false, error: error.message };
    return { ok: true, result: data?.[0] ?? null };
  },
};

/* ------------------------------- registry ------------------------------- */

export const CAPABILITIES: Record<string, CapabilityDef> = Object.fromEntries(
  [
    planRestart,
    planDelete,
    dailyGenerate,
    actionCreate,
    actionComplete,
    journalWrite,
    hypnosisStart,
    brainOpenNode,
    progressSummarize,
    nextStepSuggest,
  ].map((c) => [c.id, c]),
);

/** Compact registry view for the router LLM (no `run`). */
export function describeRegistry() {
  return Object.values(CAPABILITIES).map(({ id, description, destructive, params }) => ({
    id,
    description,
    destructive: !!destructive,
    params,
  }));
}

/** Lightweight params validator — supports type + required + enum + additionalProperties. */
export function validateParams(
  schema: CapabilityDef['params'],
  input: unknown,
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, error: 'params must be an object' };
  }
  const obj = input as Record<string, unknown>;
  for (const key of schema.required ?? []) {
    if (!(key in obj)) return { ok: false, error: `missing required: ${key}` };
  }
  for (const [key, val] of Object.entries(obj)) {
    const def = schema.properties[key];
    if (!def) {
      if (schema.additionalProperties === false) {
        return { ok: false, error: `unknown param: ${key}` };
      }
      continue;
    }
    const t = typeof val;
    if (def.type === 'string' && t !== 'string') return { ok: false, error: `${key} must be string` };
    if (def.type === 'number' && t !== 'number') return { ok: false, error: `${key} must be number` };
    if (def.type === 'boolean' && t !== 'boolean') return { ok: false, error: `${key} must be boolean` };
    if (def.enum && !def.enum.includes(String(val))) {
      return { ok: false, error: `${key} must be one of ${def.enum.join('|')}` };
    }
  }
  return { ok: true, value: obj };
}
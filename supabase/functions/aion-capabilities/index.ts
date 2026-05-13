/**
 * AION Capabilities — Phase 2 dispatcher.
 *
 * Single endpoint the router (and, later, the client) calls to execute
 * a registered capability. JWT-authenticated, params-validated,
 * per-user rate-limited, and every invocation is mirrored into
 * `aion_signals` (kind=`capability.invoked`) for the brain to observe.
 *
 * Methods:
 *   GET  ?list=1                          → registry listing for the router
 *   POST { capability, params, traceId? } → run a capability
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CAPABILITIES, describeRegistry, validateParams } from '../_shared/capabilityRegistry.ts';
import { startServerTrace, getTraceIdFromRequest } from '../_shared/turnTrace.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-aion-trace-id, x-aion-route',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const RATE: Map<string, number[]> = new Map();
const LIMIT_PER_MIN = 20;
function rateLimit(userId: string): boolean {
  const now = Date.now();
  const arr = (RATE.get(userId) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  RATE.set(userId, arr);
  return arr.length <= LIMIT_PER_MIN;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const url = new URL(req.url);
  if (req.method === 'GET' && url.searchParams.get('list')) {
    return json({ ok: true, capabilities: describeRegistry() });
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    if (!token) return json({ ok: false, error: 'unauthorized' }, 401);
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) return json({ ok: false, error: 'unauthorized' }, 401);
    const userId = userData.user.id;

    if (!rateLimit(userId)) return json({ ok: false, error: 'rate_limited' }, 429);

    const body = await req.json().catch(() => ({}));
    const capabilityId: string = body?.capability;
    const traceId: string | null = body?.traceId ?? getTraceIdFromRequest(req);
    const cap = CAPABILITIES[capabilityId];
    if (!cap) return json({ ok: false, error: `unknown_capability:${capabilityId}` }, 400);

    const validated = validateParams(cap.params, body?.params ?? {});
    if (!validated.ok) return json({ ok: false, error: validated.error }, 400);

    const t0 = Date.now();
    let result: Awaited<ReturnType<typeof cap.run>>;
    try {
      result = await cap.run(userId, validated.value, admin);
    } catch (e) {
      result = { ok: false, error: e instanceof Error ? e.message : 'unknown' };
    }
    const dt = Date.now() - t0;

    const tracer = startServerTrace({ traceId, userId, source: 'aion-capabilities' });
    if (tracer.enabled) {
      tracer.event('capability.invoked', { capability: capabilityId, ok: result.ok, ms: dt, destructive: !!cap.destructive });
      tracer.upsertHeader({ capability: capabilityId, router_decision: 'capability' });
    }

    // Observation-only: record into aion_signals so the brain can react.
    admin
      .from('aion_signals')
      .insert({
        user_id: userId,
        kind: 'capability.invoked',
        payload: {
          capability: capabilityId,
          ok: result.ok,
          error: result.error ?? null,
          duration_ms: dt,
          trace_id: traceId,
          destructive: !!cap.destructive,
        } as never,
        client_at: new Date().toISOString(),
      })
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) console.warn('[aion-capabilities] signal insert failed', error.message);
      });

    console.log(`[aion-capabilities] cap=${capabilityId} ok=${result.ok} dt=${dt}ms`);
    return json({ ...result, duration_ms: dt, capability: capabilityId });
  } catch (e) {
    console.error('[aion-capabilities] error', e);
    return json({ ok: false, error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});
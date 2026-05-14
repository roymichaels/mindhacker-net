/**
 * AION Capability Registry — Phase F Phase 1 (typed only, no execution).
 *
 * Lists every action AION may eventually take. The router compares incoming
 * intent/emotion against this registry and emits a `capability.candidate`
 * trace event. Nothing in this file mutates state.
 *
 * Execution modes:
 *   - 'observe' : router records the candidate, skips execution.
 *   - 'suggest' : router would surface a chip/CTA (not wired yet).
 *   - 'execute' : router would invoke the underlying engine (Phase 2).
 *
 * Phase 1 forces every capability to 'observe' regardless of declared mode.
 */
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';

export type CapabilityMode = 'observe' | 'read' | 'suggest' | 'mutate' | 'destructive';
export type CapabilitySafety = 'safe' | 'unsafe';

export interface CapabilityDef<I extends ZodTypeAny = ZodTypeAny> {
  id: string;
  description: string;
  inputSchema: I;
  safety: CapabilitySafety;
  artifactKind: string | null;
  declaredMode: CapabilityMode;
}

function def<I extends ZodTypeAny>(d: CapabilityDef<I>): CapabilityDef<I> {
  return d;
}

export const CAPABILITIES = {
  'brain.query':        def({ id: 'brain.query',        description: 'Read nodes/edges from the consciousness map.',     inputSchema: z.object({ query: z.string().optional(), pillar: z.string().optional() }), safety: 'safe',   artifactKind: 'brain.room',         declaredMode: 'read' }),
  'brain.openRoom':     def({ id: 'brain.openRoom',     description: 'Open a Brain room artifact.',                       inputSchema: z.object({ roomId: z.string().optional() }),                                safety: 'safe',   artifactKind: 'brain.room',         declaredMode: 'read' }),
  'journey.nextAction': def({ id: 'journey.nextAction', description: 'Surface the next action item from the Journey.',     inputSchema: z.object({}).optional(),                                                   safety: 'safe',   artifactKind: 'journey.next',       declaredMode: 'read' }),
  'journey.summarize':  def({ id: 'journey.summarize',  description: 'Summarize current Journey progress.',                inputSchema: z.object({}).optional(),                                                   safety: 'safe',   artifactKind: 'journey.summary',    declaredMode: 'read' }),
  'plan.suggest':       def({ id: 'plan.suggest',       description: 'Suggest a plan adjustment (no write).',              inputSchema: z.object({ pillar: z.string().optional() }),                               safety: 'safe',   artifactKind: 'plan.draft',         declaredMode: 'suggest' }),
  'task.suggest':       def({ id: 'task.suggest',       description: 'Suggest a single task / next step.',                 inputSchema: z.object({ context: z.string().optional() }),                              safety: 'safe',   artifactKind: 'task.draft',         declaredMode: 'suggest' }),
  'journal.capture':    def({ id: 'journal.capture',    description: 'Capture a journal entry from the conversation.',     inputSchema: z.object({ snippet: z.string().optional() }),                              safety: 'safe',   artifactKind: 'journal.entry',      declaredMode: 'suggest' }),
  'hypnosis.recommend': def({ id: 'hypnosis.recommend', description: 'Recommend a hypnosis/recovery session.',             inputSchema: z.object({ topic: z.string().optional() }),                                safety: 'safe',   artifactKind: 'hypnosis.session',   declaredMode: 'read' }),
  'outerWorld.open':    def({ id: 'outerWorld.open',    description: 'Open an Outer World surface (coaches, market, …).',  inputSchema: z.object({ surface: z.string().optional() }),                              safety: 'safe',   artifactKind: 'outer-world.surface', declaredMode: 'read' }),
  'profile.summarize':  def({ id: 'profile.summarize',  description: 'Summarize identity/DNA/profile.',                    inputSchema: z.object({}).optional(),                                                   safety: 'safe',   artifactKind: 'profile.summary',    declaredMode: 'read' }),
} as const;

export type CapabilityId = keyof typeof CAPABILITIES;

/**
 * Phase F · Step 3 — read + suggest are now allowed to execute.
 *
 * Policy:
 *   - 'read'        → executes against safeReadExecutor (no DB writes).
 *   - 'suggest'     → executes a read for grounding, never writes.
 *   - 'mutate'      → forced to 'observe' (no capability declares this yet).
 *   - 'destructive' → forced to 'observe' (no capability declares this yet).
 *
 * Anything else (unknown / unsafe) collapses to 'observe'.
 */
const ALLOWED_EXECUTION: ReadonlySet<CapabilityMode> = new Set(['read', 'suggest']);

export function effectiveMode(id: CapabilityId): CapabilityMode {
  const def = CAPABILITIES[id];
  if (!def) return 'observe';
  if (def.safety === 'unsafe') return 'observe';
  if (ALLOWED_EXECUTION.has(def.declaredMode)) return def.declaredMode;
  return 'observe';
}

export function getCapability(id: CapabilityId): CapabilityDef {
  return CAPABILITIES[id];
}

export function listCapabilities(): CapabilityDef[] {
  return Object.values(CAPABILITIES);
}
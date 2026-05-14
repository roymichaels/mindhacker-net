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

export type CapabilityMode = 'observe' | 'suggest' | 'execute';
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
  'brain.query':        def({ id: 'brain.query',        description: 'Read nodes/edges from the consciousness map.',     inputSchema: z.object({ query: z.string().optional(), pillar: z.string().optional() }), safety: 'safe',   artifactKind: null,        declaredMode: 'execute' }),
  'brain.openRoom':     def({ id: 'brain.openRoom',     description: 'Open a Brain room artifact.',                       inputSchema: z.object({ roomId: z.string() }),                                          safety: 'safe',   artifactKind: 'brain.room', declaredMode: 'suggest' }),
  'journey.nextAction': def({ id: 'journey.nextAction', description: 'Surface the next action item from the Journey.',     inputSchema: z.object({}).optional(),                                                   safety: 'safe',   artifactKind: 'journey.next', declaredMode: 'suggest' }),
  'journey.summarize':  def({ id: 'journey.summarize',  description: 'Summarize current Journey progress.',                inputSchema: z.object({}).optional(),                                                   safety: 'safe',   artifactKind: 'journey.summary', declaredMode: 'suggest' }),
  'plan.suggest':       def({ id: 'plan.suggest',       description: 'Suggest a plan adjustment (no write).',              inputSchema: z.object({ pillar: z.string().optional() }),                               safety: 'safe',   artifactKind: 'plan.draft',  declaredMode: 'suggest' }),
  'task.suggest':       def({ id: 'task.suggest',       description: 'Suggest a single task / next step.',                 inputSchema: z.object({ context: z.string().optional() }),                              safety: 'safe',   artifactKind: 'task.draft',  declaredMode: 'suggest' }),
  'journal.capture':    def({ id: 'journal.capture',    description: 'Capture a journal entry from the conversation.',     inputSchema: z.object({ snippet: z.string().optional() }),                              safety: 'unsafe', artifactKind: 'journal.entry', declaredMode: 'execute' }),
  'hypnosis.recommend': def({ id: 'hypnosis.recommend', description: 'Recommend a hypnosis/recovery session.',             inputSchema: z.object({ topic: z.string().optional() }),                                safety: 'safe',   artifactKind: 'hypnosis.session', declaredMode: 'suggest' }),
  'outerWorld.open':    def({ id: 'outerWorld.open',    description: 'Open an Outer World surface (coaches, market, …).',  inputSchema: z.object({ surface: z.string() }),                                         safety: 'safe',   artifactKind: 'outer-world.surface', declaredMode: 'suggest' }),
  'profile.summarize':  def({ id: 'profile.summarize',  description: 'Summarize identity/DNA/profile.',                    inputSchema: z.object({}).optional(),                                                   safety: 'safe',   artifactKind: 'profile.summary', declaredMode: 'suggest' }),
} as const;

export type CapabilityId = keyof typeof CAPABILITIES;

/** Phase 1 hard override — no capability ever exits observe mode. */
export function effectiveMode(_id: CapabilityId): CapabilityMode {
  return 'observe';
}

export function getCapability(id: CapabilityId): CapabilityDef {
  return CAPABILITIES[id];
}

export function listCapabilities(): CapabilityDef[] {
  return Object.values(CAPABILITIES);
}
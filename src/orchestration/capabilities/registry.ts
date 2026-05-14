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
  'action.complete':    def({ id: 'action.complete',    description: 'Mark an existing action item as completed (confirm).', inputSchema: z.object({ actionId: z.string().optional() }),                            safety: 'safe',   artifactKind: 'action.complete',    declaredMode: 'mutate' }),
  'hypnosis.start':     def({ id: 'hypnosis.start',     description: 'Start a hypnosis session for the user (confirm).',     inputSchema: z.object({ audioId: z.string().optional() }),                              safety: 'safe',   artifactKind: 'hypnosis.start',     declaredMode: 'mutate' }),
  'daily.generate':     def({ id: 'daily.generate',     description: 'Preview today\'s queue (suggestion, no write).',       inputSchema: z.object({}).optional(),                                                   safety: 'safe',   artifactKind: 'journey.next',       declaredMode: 'suggest' }),
  'plan.summarize':     def({ id: 'plan.summarize',     description: 'Summarize the active life plan.',                      inputSchema: z.object({}).optional(),                                                   safety: 'safe',   artifactKind: 'journey.summary',    declaredMode: 'read' }),
  'journal.search':     def({ id: 'journal.search',     description: 'Search recent journal entries (read-only).',           inputSchema: z.object({ query: z.string().optional() }),                                safety: 'safe',   artifactKind: 'journal.preview',    declaredMode: 'read' }),
  // Phase 2 · Batch 2 — Business / Creator / Freelancer
  'business.summarize':       def({ id: 'business.summarize',       description: 'Summarize the active business journey + plan.',        inputSchema: z.object({}).optional(),                          safety: 'safe', artifactKind: 'business.canvas',         declaredMode: 'read' }),
  'business.createDraft':     def({ id: 'business.createDraft',     description: 'Draft a new business plan (confirm-required).',         inputSchema: z.object({ topic: z.string().optional() }),       safety: 'safe', artifactKind: 'business.canvas',         declaredMode: 'mutate' }),
  'creator.content.generate': def({ id: 'creator.content.generate', description: 'Generate content for creator/freelancer (confirm).',    inputSchema: z.object({ topic: z.string().optional() }),       safety: 'safe', artifactKind: 'business.canvas',         declaredMode: 'mutate' }),
  // Landing pages
  'landing.preview':          def({ id: 'landing.preview',          description: 'Preview existing landing pages (read-only).',           inputSchema: z.object({}).optional(),                          safety: 'safe', artifactKind: 'landing.preview',         declaredMode: 'read' }),
  'landing.generate':         def({ id: 'landing.generate',         description: 'Generate a new landing page draft (confirm-required).', inputSchema: z.object({ offer: z.string().optional() }),       safety: 'safe', artifactKind: 'landing.preview',         declaredMode: 'mutate' }),
  // Course / Learning
  'course.recommend':         def({ id: 'course.recommend',         description: 'Recommend courses from the catalog (read-only).',       inputSchema: z.object({ query: z.string().optional() }),       safety: 'safe', artifactKind: 'course.card',             declaredMode: 'read' }),
  'curriculum.generate':      def({ id: 'curriculum.generate',      description: 'Generate a personalised curriculum (confirm-required).',inputSchema: z.object({ topic: z.string().optional() }),       safety: 'safe', artifactKind: 'curriculum.preview',      declaredMode: 'mutate' }),
  // Coach / Practitioner matching
  'coach.recommend':          def({ id: 'coach.recommend',          description: 'Recommend a practitioner from the marketplace.',        inputSchema: z.object({ query: z.string().optional() }),       safety: 'safe', artifactKind: 'coach.recommendation',    declaredMode: 'read' }),
  'coach.match':              def({ id: 'coach.match',              description: 'Surface best coach match (external/payment intent).',   inputSchema: z.object({ query: z.string().optional() }),       safety: 'safe', artifactKind: 'coach.recommendation',    declaredMode: 'mutate' }),
  // Profile / Identity / Avatar
  'identity.bootstrap':       def({ id: 'identity.bootstrap',       description: 'Bootstrap identity (profile/DNA/avatar status).',       inputSchema: z.object({}).optional(),                          safety: 'safe', artifactKind: 'identity.summary',        declaredMode: 'read' }),
  'avatar.configure':         def({ id: 'avatar.configure',         description: 'Open avatar configurator (confirm-required mutate).',   inputSchema: z.object({}).optional(),                          safety: 'safe', artifactKind: 'avatar.configurator',     declaredMode: 'mutate' }),
  // Phase 2 · Batch 3 — Economy / Social / Payments / Voice / Work
  'fm.search':            def({ id: 'fm.search',            description: 'Search Free Market gigs/bounties.',                  inputSchema: z.object({ query: z.string().optional() }), safety: 'safe', artifactKind: 'marketplace.card',      declaredMode: 'read' }),
  'fm.listing.preview':   def({ id: 'fm.listing.preview',   description: 'Preview a single Free Market listing.',                inputSchema: z.object({ id: z.string().optional() }),    safety: 'safe', artifactKind: 'marketplace.card',      declaredMode: 'read' }),
  'fm.listing.create':    def({ id: 'fm.listing.create',    description: 'Create a Free Market listing draft (confirm-required).', inputSchema: z.object({ title: z.string().optional() }), safety: 'safe', artifactKind: 'marketplace.card',      declaredMode: 'mutate' }),
  'wallet.open':          def({ id: 'wallet.open',          description: 'Open the Free Market wallet sheet.',                   inputSchema: z.object({}).optional(),                    safety: 'safe', artifactKind: 'wallet.sheet',          declaredMode: 'read' }),
  'wallet.status':        def({ id: 'wallet.status',        description: 'Read wallet balance and recent transactions.',         inputSchema: z.object({}).optional(),                    safety: 'safe', artifactKind: 'wallet.sheet',          declaredMode: 'read' }),
  'community.feed':       def({ id: 'community.feed',       description: 'Read recent community posts.',                          inputSchema: z.object({ query: z.string().optional() }), safety: 'safe', artifactKind: 'community.preview',     declaredMode: 'read' }),
  'community.thread':     def({ id: 'community.thread',     description: 'Read a community thread + comments.',                   inputSchema: z.object({ id: z.string().optional() }),    safety: 'safe', artifactKind: 'community.preview',     declaredMode: 'read' }),
  'message.search':       def({ id: 'message.search',       description: 'Search the user\'s messages (read-only).',              inputSchema: z.object({ query: z.string().optional() }), safety: 'safe', artifactKind: 'message.preview',       declaredMode: 'read' }),
  'message.send':         def({ id: 'message.send',         description: 'Send a message in an existing conversation (confirm).', inputSchema: z.object({ conversationId: z.string().optional(), body: z.string().optional() }), safety: 'safe', artifactKind: 'message.preview', declaredMode: 'mutate' }),
  'subscription.status':  def({ id: 'subscription.status',  description: 'Read current subscription tier and status.',            inputSchema: z.object({}).optional(),                    safety: 'safe', artifactKind: 'subscription.card',     declaredMode: 'read' }),
  'subscription.portal':  def({ id: 'subscription.portal',  description: 'Open Stripe Customer Portal (external, confirm).',      inputSchema: z.object({}).optional(),                    safety: 'safe', artifactKind: 'checkout.confirmation', declaredMode: 'mutate' }),
  'checkout.create':      def({ id: 'checkout.create',      description: 'Create a Stripe checkout session (external, confirm).', inputSchema: z.object({ tier: z.string().optional() }),  safety: 'safe', artifactKind: 'checkout.confirmation', declaredMode: 'mutate' }),
  'voice.transcribe':     def({ id: 'voice.transcribe',     description: 'Describe voice capture availability (read).',           inputSchema: z.object({}).optional(),                    safety: 'safe', artifactKind: 'voice.capture',         declaredMode: 'read' }),
  'tts.speak':            def({ id: 'tts.speak',            description: 'Speak a text aloud via TTS (confirm-required).',         inputSchema: z.object({ text: z.string().optional(), voiceId: z.string().optional() }), safety: 'safe', artifactKind: 'audio.preview', declaredMode: 'mutate' }),
  'work.startSession':    def({ id: 'work.startSession',    description: 'Start a focus work session (confirm-required).',         inputSchema: z.object({ title: z.string().optional(), isDeepWork: z.boolean().optional() }), safety: 'safe', artifactKind: 'work.session-card', declaredMode: 'mutate' }),
  'work.summarize':       def({ id: 'work.summarize',       description: 'Summarize today\'s work sessions and score.',            inputSchema: z.object({}).optional(),                    safety: 'safe', artifactKind: 'work.session-card',     declaredMode: 'read' }),
  'schedule.block':       def({ id: 'schedule.block',       description: 'Add a schedule block to the day (confirm-required).',   inputSchema: z.object({ title: z.string().optional(), start_time: z.string().optional(), end_time: z.string().optional(), date: z.string().optional() }), safety: 'safe', artifactKind: 'schedule.block-preview', declaredMode: 'mutate' }),
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

/**
 * Phase F · Step 4 — capabilities that may mutate the database, but ONLY
 * after explicit user confirmation through the confirm artifact flow.
 * The bridge produces a sticky `confirm` artifact for these IDs; nothing
 * runs until the user taps the confirm CTA.
 */
export const CONFIRM_REQUIRED_CAPABILITIES: ReadonlySet<CapabilityId> = new Set<CapabilityId>([
  'journal.capture',
  'action.complete',
  'hypnosis.start',
  'business.createDraft',
  'creator.content.generate',
  'landing.generate',
  'curriculum.generate',
  'coach.match',
  'avatar.configure',
  // Phase 2 · Batch 3
  'fm.listing.create',
  'message.send',
  'subscription.portal',
  'checkout.create',
  'tts.speak',
  'work.startSession',
  'schedule.block',
]);

export function effectiveMode(id: CapabilityId): CapabilityMode {
  const def = CAPABILITIES[id];
  if (!def) return 'observe';
  if (def.safety === 'unsafe') return 'observe';
  // Mutate capabilities never auto-execute; they go through confirmation.
  if (def.declaredMode === 'mutate') return 'observe';
  if (ALLOWED_EXECUTION.has(def.declaredMode)) return def.declaredMode;
  return 'observe';
}

export function getCapability(id: CapabilityId): CapabilityDef {
  return CAPABILITIES[id];
}

export function listCapabilities(): CapabilityDef[] {
  return Object.values(CAPABILITIES);
}
/**
 * artifactBus — tiny pub/sub for summoning ephemeral, in-chat UI.
 *
 * Philosophy: AION is the OS; chat is the only persistent surface.
 * Anything else (assessments, plans, builders) is *summoned* into the
 * chat stream as an ArtifactInstance and dismissed when no longer
 * relevant.
 *
 * No React. Pure event emitter so non-component code (capability
 * handlers, AI tool-call results, deep-link parsers) can summon.
 */

export type ArtifactKind =
  | 'assessment'
  | 'today-list'
  | 'plan'
  | 'journey'
  | 'landing-builder'
  | 'business-canvas'
  | 'job-mode'
  // Phase 2 — legacy surface collapse: hubs become summonable artifacts.
  | 'journal'
  | 'hypnosis'
  | 'business-dashboard'
  | 'business-journey'
  | 'freelancer'
  | 'creator'
  | 'therapist'
  | 'pillar-assess'
  | 'pillar-results'
  | 'pillar-history'
  | 'quest'
  | 'missions'
  | 'profile-stats';

export interface ArtifactInstance {
  id: string;
  kind: ArtifactKind;
  params: Record<string, unknown>;
  /** Auto-fullscreen on summon. Defaults to false. */
  fullscreen?: boolean;
  createdAt: number;
}

type Listener = (artifacts: ArtifactInstance[]) => void;

let stack: ArtifactInstance[] = [];
const listeners = new Set<Listener>();

function emit() {
  // Snapshot so subscribers can compare references safely.
  const snapshot = stack.slice();
  listeners.forEach((l) => {
    try {
      l(snapshot);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[artifactBus] listener error', err);
    }
  });
}

function uid(): string {
  return `art_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const artifactBus = {
  summon(
    kind: ArtifactKind,
    params: Record<string, unknown> = {},
    opts: { fullscreen?: boolean; replaceKind?: boolean } = {},
  ): string {
    if (opts.replaceKind) {
      stack = stack.filter((a) => a.kind !== kind);
    }
    const inst: ArtifactInstance = {
      id: uid(),
      kind,
      params,
      fullscreen: opts.fullscreen ?? false,
      createdAt: Date.now(),
    };
    stack = [...stack, inst];
    emit();
    return inst.id;
  },
  /**
   * Summon by semantic intent rather than artifact kind.
   *
   * Phase 4B — capabilities and skills should describe *what they want
   * to manifest* ("explain memory", "continue journey", "open work")
   * and let the bus map that to the right artifact kind. This keeps the
   * UX vocabulary aligned with AION's voice instead of the registry.
   */
  summonFromIntent(
    intent: string,
    params: Record<string, unknown> = {},
    opts: { fullscreen?: boolean; replaceKind?: boolean } = {},
  ): string | null {
    const kind = INTENT_KIND_MAP[intent.toLowerCase().trim()];
    if (!kind) {
      // eslint-disable-next-line no-console
      console.warn('[artifactBus] unknown intent', intent);
      return null;
    }
    return this.summon(kind, params, opts);
  },
  dismiss(id: string) {
    const next = stack.filter((a) => a.id !== id);
    if (next.length !== stack.length) {
      stack = next;
      emit();
    }
  },
  dismissAll() {
    if (stack.length === 0) return;
    stack = [];
    emit();
  },
  list(): ArtifactInstance[] {
    return stack.slice();
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    // Prime the listener so React subscribers get current state.
    listener(stack.slice());
    return () => listeners.delete(listener);
  },
};

export type ArtifactBus = typeof artifactBus;

/**
 * Intent → ArtifactKind. Lowercased keys. Aliases welcome.
 * Behavioral abstraction only — adding intents does not change capabilities.
 */
const INTENT_KIND_MAP: Record<string, ArtifactKind> = {
  // Self / identity
  'profile-stats': 'profile-stats',
  'self-stats': 'profile-stats',
  'advanced-self': 'profile-stats',
  // Trajectory
  'continue-journey': 'journey',
  'journey': 'journey',
  'today': 'today-list',
  'plan': 'plan',
  'missions': 'missions',
  'quest': 'quest',
  // Practice
  'journal': 'journal',
  'capture-journal': 'journal',
  'hypnosis': 'hypnosis',
  // Manifestation
  'business': 'business-dashboard',
  'business-canvas': 'business-canvas',
  'business-journey': 'business-journey',
  'landing': 'landing-builder',
  'freelancer': 'freelancer',
  'creator': 'creator',
  'therapist': 'therapist',
  'job': 'job-mode',
  // Pillar
  'assess-pillar': 'pillar-assess',
  'pillar-results': 'pillar-results',
  'pillar-history': 'pillar-history',
  // Generic
  'assessment': 'assessment',
};

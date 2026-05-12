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
  | 'job-mode';

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

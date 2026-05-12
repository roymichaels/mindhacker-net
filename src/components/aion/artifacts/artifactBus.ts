/**
 * Artifact Bus — lightweight client-side event bus for AION artifacts.
 *
 * Phase 4 of Interactive AION Mode (see `.lovable/plan.md`).
 *
 * Any subsystem (voice loop, brain response handler, journal extractor,
 * next-action skill) can emit an artifact and the immersive surface will
 * render it as a floating card via <ArtifactLayer />.
 *
 * This is intentionally decoupled from React so non-component code (skills,
 * services) can publish without prop-drilling.
 */

export type ArtifactKind =
  | 'next_action'
  | 'journal_capture'
  | 'plan_summary'
  | 'note'
  | 'insight'
  | 'capability';

export interface AionArtifact {
  id: string;
  kind: ArtifactKind;
  title: string;
  body?: string;
  /** Optional CTA — label + action handler. */
  cta?: { label: string; href?: string; onClick?: () => void };
  /** ms before auto-dismiss. 0 = sticky. Default 9000. */
  ttl?: number;
  createdAt: number;
}

const EVENT = 'aion:artifact';

export function emitArtifact(input: Omit<AionArtifact, 'id' | 'createdAt'> & { id?: string }) {
  const artifact: AionArtifact = {
    id: input.id ?? `art_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    ttl: input.ttl ?? 9000,
    ...input,
  };
  window.dispatchEvent(new CustomEvent<AionArtifact>(EVENT, { detail: artifact }));
  return artifact.id;
}

export function onArtifact(handler: (a: AionArtifact) => void): () => void {
  const fn = (e: Event) => handler((e as CustomEvent<AionArtifact>).detail);
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

export const ARTIFACT_EVENT = EVENT;
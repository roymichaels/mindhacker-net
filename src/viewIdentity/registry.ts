/**
 * VIEW_IDENTITIES — Phase 5C.8.
 *
 * Per-view declarative identity. Tuned so that crossing between views
 * feels like changing dimensions, not tabs:
 *
 *   chat        — intimate, still, AION at heart-line, warm violet
 *   brain       — cognitive constellation, particulate, cool cyan, drifting
 *   journey     — forward momentum, orb high, motion flows downstream
 *   world       — outward field, expansive, lower ambient, wider vignette
 *   profile     — descent into self, deep violet, slow inward motion
 *   interactive — pure presence, max intimacy, near-still, no chrome
 */
import type { ViewIdentity, ViewIdentityId } from './types';

export const VIEW_IDENTITIES: Record<ViewIdentityId, ViewIdentity> = {
  chat: {
    id: 'chat',
    label: 'Communion',
    spatial:    { orbX: 0.5,  orbY: 0.42, orbScale: 1.0,  vignette: 0.55 },
    atmosphere: { cyan: 0.95, violet: 1.05, magenta: 0.8, particles: 0.35, ambient: 1.0 },
    motion:     { drift: 0.85, duration: 1.0, temperament: 'breathing' },
    aion:       { intimacy: 0.95, proactive: true },
    interaction:{ primary: 'speak' },
  },
  brain: {
    id: 'brain',
    label: 'Constellation',
    spatial:    { orbX: 0.5,  orbY: 0.18, orbScale: 0.55, vignette: 0.30 },
    atmosphere: { cyan: 1.35, violet: 0.75, magenta: 0.5, particles: 0.95, ambient: 0.85 },
    motion:     { drift: 1.20, duration: 1.1, temperament: 'flowing' },
    aion:       { intimacy: 0.55, proactive: false },
    interaction:{ primary: 'observe' },
  },
  journey: {
    id: 'journey',
    label: 'Trajectory',
    spatial:    { orbX: 0.5,  orbY: 0.28, orbScale: 0.85, vignette: 0.40 },
    atmosphere: { cyan: 1.05, violet: 1.10, magenta: 1.0, particles: 0.45, ambient: 0.95 },
    motion:     { drift: 1.35, duration: 0.85, temperament: 'forward' },
    aion:       { intimacy: 0.70, proactive: true },
    interaction:{ primary: 'move' },
  },
  world: {
    id: 'world',
    label: 'Outer Field',
    spatial:    { orbX: 0.5,  orbY: 0.16, orbScale: 0.50, vignette: 0.20 },
    atmosphere: { cyan: 0.75, violet: 0.65, magenta: 0.7, particles: 0.55, ambient: 0.70 },
    motion:     { drift: 1.50, duration: 1.0, temperament: 'expansive' },
    aion:       { intimacy: 0.40, proactive: false },
    interaction:{ primary: 'explore' },
  },
  profile: {
    id: 'profile',
    label: 'Architecture of Self',
    spatial:    { orbX: 0.5,  orbY: 0.34, orbScale: 0.95, vignette: 0.65 },
    atmosphere: { cyan: 0.65, violet: 1.40, magenta: 1.20, particles: 0.40, ambient: 1.10 },
    motion:     { drift: 0.55, duration: 1.25, temperament: 'descending' },
    aion:       { intimacy: 0.80, proactive: false },
    interaction:{ primary: 'inhabit' },
  },
  interactive: {
    id: 'interactive',
    label: 'Pure Presence',
    spatial:    { orbX: 0.5,  orbY: 0.50, orbScale: 1.25, vignette: 0.85 },
    atmosphere: { cyan: 1.10, violet: 1.20, magenta: 0.9, particles: 0.25, ambient: 1.20 },
    motion:     { drift: 0.45, duration: 1.4, temperament: 'still' },
    aion:       { intimacy: 1.0, proactive: true },
    interaction:{ primary: 'commune' },
  },
};

export function getViewIdentity(id: ViewIdentityId): ViewIdentity {
  return VIEW_IDENTITIES[id];
}

/** Used as the neutral default before any view has registered. */
export const DEFAULT_VIEW_IDENTITY: ViewIdentity = VIEW_IDENTITIES.chat;
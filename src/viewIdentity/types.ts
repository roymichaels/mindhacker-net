/**
 * ViewIdentity — Phase 5C.8.
 *
 * Each main AION surface (Chat, Brain, Journey, World, Profile,
 * Interactive) is a different *mode of consciousness* in the same
 * universe. A ViewIdentity is the small declarative contract that
 * tells the shared atmosphere/motion/orb layers how to feel for that
 * mode. No new UI — just modulation of layers that already exist.
 */

export type ViewIdentityId =
  | 'chat'
  | 'brain'
  | 'journey'
  | 'world'
  | 'profile'
  | 'interactive';

/** Spatial composition — where AION rests + how the room is read. */
export interface ViewSpatial {
  /** Normalised viewport coords (0..1, top-left). Where the orb anchors. */
  orbX: number;
  orbY: number;
  /** Relative orb scale (1 = base). */
  orbScale: number;
  /** Vignette intensity 0..1. Higher = more focused chamber. */
  vignette: number;
}

/** Atmospheric tone — the chamber colour/depth signature. */
export interface ViewAtmosphere {
  /** Multiplier on cyan glow field. */
  cyan: number;
  /** Multiplier on violet glow field. */
  violet: number;
  /** Multiplier on magenta accent. */
  magenta: number;
  /** Particle density bias 0..1. */
  particles: number;
  /** Ambient opacity bias 0..1.5 (1 = base). */
  ambient: number;
}

/** Motion language — how time moves in this mode. */
export interface ViewMotion {
  /** Drift speed multiplier on background fields (1 = base). Lower = stiller. */
  drift: number;
  /** Transition duration multiplier (1 = base). */
  duration: number;
  /** Easing temperament label (advisory; consumed by motion presets). */
  temperament: 'still' | 'breathing' | 'flowing' | 'forward' | 'expansive' | 'descending';
}

/** AION presence behaviour inside this mode. */
export interface ViewAionBehaviour {
  /** How close AION feels — drives whisper density + orb intimacy. 0..1. */
  intimacy: number;
  /** Whether AION speaks proactively here. */
  proactive: boolean;
}

/** Interaction grammar — how touch is interpreted at the shell level. */
export interface ViewInteraction {
  /** Primary verb of this mode (advisory label, not shown). */
  primary: 'speak' | 'observe' | 'move' | 'explore' | 'inhabit' | 'commune';
}

export interface ViewIdentity {
  id: ViewIdentityId;
  spatial: ViewSpatial;
  atmosphere: ViewAtmosphere;
  motion: ViewMotion;
  aion: ViewAionBehaviour;
  interaction: ViewInteraction;
  /** Short label for debugging (not user-facing). */
  label: string;
}
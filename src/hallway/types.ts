/**
 * Hallway — types for the world-first navigation model.
 *
 * The hallway is not a screen. It is the persistent world. Rooms are
 * config-driven environments AION can take you into. They are NOT pages —
 * a room is a state of consciousness with an ambience, an AION mode, and a
 * suite of surfaces (data, rituals, conversations) bound to that state.
 */
export type RoomId =
  | 'beliefs'
  | 'emotions'
  | 'parts'
  | 'time'
  | 'identity'
  | 'body';

/** AION's behavioural mode while the user is inside this room. */
export type RoomAionMode =
  | 'neutral'
  | 'reflective'
  | 'empathic'
  | 'mirror'
  | 'witness'
  | 'somatic';

export type RoomDensity = 'minimal' | 'standard' | 'rich';

export interface RoomAmbience {
  /** HSL hue used to bias the orb + room background tinting. 0–360. */
  hue: number;
  /** Saturation 0–100. */
  saturation: number;
  /** Lightness 0–100 of the dominant ambient tone. */
  lightness: number;
  /** Visual density of UI inside the room. */
  density: RoomDensity;
}

export interface RoomCopy {
  /** Door label shown in the hallway. */
  label: { en: string; he: string };
  /** One-line subtitle for the door. */
  tagline: { en: string; he: string };
  /** What AION whispers as you enter. Kept short — single sentence. */
  entryWhisper: { en: string; he: string };
}

export interface RoomDefinition {
  id: RoomId;
  /** Stable English slug (also used in the URL). */
  slug: string;
  /** AION's mode while the user is inside this room. */
  aion: RoomAionMode;
  /** Visual + spatial ambience cues. */
  ambience: RoomAmbience;
  /** All copy for door + entry. */
  copy: RoomCopy;
  /**
   * IDs of data surfaces this room federates. Surfaces are NOT pages — they
   * are sub-views the room may compose (journal, signals, parts dialogue,
   * timeline, etc.). Resolved by the surface registry, not by routes.
   */
  surfaces: string[];
  /**
   * Whether this room is implemented yet. Unimplemented rooms still show on
   * the hallway map but enter a "coming soon" stub instead of crashing.
   */
  implemented: boolean;
}
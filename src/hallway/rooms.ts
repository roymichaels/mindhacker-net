/**
 * Room registry — the canonical 6-room foundation for MindOS.
 *
 * Phase 1.3 of the world-first rebuild. Rooms here are PURE CONFIG — they
 * describe environments, not React trees. The HallwayShell renders the door
 * grid, and `RoomEnvironment` turns a room into a live consciousness state
 * (orb mode + ambience + AION whisper).
 *
 * Adding a new room: extend `RoomId` in `./types.ts`, append a definition
 * here, and (optionally) implement its surfaces. Do NOT add a top-level
 * <Route> for a room — rooms are reached via /hallway/:slug.
 */
import type { RoomDefinition } from './types';

export const ROOM_REGISTRY: readonly RoomDefinition[] = [
  {
    id: 'beliefs',
    slug: 'beliefs',
    aion: 'reflective',
    ambience: { hue: 268, saturation: 55, lightness: 18, density: 'standard' },
    copy: {
      label: { en: 'Beliefs', he: 'אמונות' },
      tagline: {
        en: 'The structures running underneath the choices.',
        he: 'המבנים שפועלים מתחת לבחירות שלך.',
      },
      entryWhisper: {
        en: 'Let us look at what you have been holding as true.',
        he: 'בוא נסתכל על מה שאתה מחזיק כאמת.',
      },
    },
    surfaces: ['belief.map', 'belief.dialogue', 'belief.history'],
    implemented: false,
  },
  {
    id: 'emotions',
    slug: 'emotions',
    aion: 'empathic',
    ambience: { hue: 18, saturation: 70, lightness: 22, density: 'minimal' },
    copy: {
      label: { en: 'Emotions & Energy', he: 'רגשות ואנרגיה' },
      tagline: {
        en: 'The weather inside you, right now.',
        he: 'מזג האוויר הפנימי שלך, ברגע זה.',
      },
      entryWhisper: {
        en: 'Take one breath. What is moving in you?',
        he: 'נשימה אחת. מה זז בתוכך?',
      },
    },
    surfaces: ['emotion.tide', 'energy.curve', 'emotion.journal'],
    implemented: false,
  },
  {
    id: 'parts',
    slug: 'parts',
    aion: 'witness',
    ambience: { hue: 292, saturation: 50, lightness: 20, density: 'standard' },
    copy: {
      label: { en: 'Inner Characters', he: 'דמויות פנימיות' },
      tagline: {
        en: 'The parts of you that take turns at the wheel.',
        he: 'החלקים בתוכך שמתחלפים בהגה.',
      },
      entryWhisper: {
        en: 'Who is speaking right now?',
        he: 'מי מדבר כרגע?',
      },
    },
    surfaces: ['parts.cast', 'parts.dialogue', 'parts.timeline'],
    implemented: false,
  },
  {
    id: 'time',
    slug: 'time',
    aion: 'reflective',
    ambience: { hue: 210, saturation: 45, lightness: 16, density: 'rich' },
    copy: {
      label: { en: 'Time & Memory', he: 'זמן וזיכרון' },
      tagline: {
        en: 'The thread that runs from then to now.',
        he: 'החוט שעובר מאז ועד עכשיו.',
      },
      entryWhisper: {
        en: 'Let us walk back along the line.',
        he: 'בוא נלך אחורה לאורך הקו.',
      },
    },
    surfaces: ['memory.timeline', 'memory.loops', 'memory.snapshots'],
    implemented: false,
  },
  {
    id: 'identity',
    slug: 'identity',
    aion: 'mirror',
    ambience: { hue: 280, saturation: 60, lightness: 22, density: 'standard' },
    copy: {
      label: { en: 'Identity & Roles', he: 'זהות ותפקידים' },
      tagline: {
        en: 'Every self you wear, and the one underneath.',
        he: 'כל עצמי שאתה לובש, וזה שמתחת.',
      },
      entryWhisper: {
        en: 'Which version of you walked in here?',
        he: 'איזו גרסה שלך נכנסה לכאן?',
      },
    },
    surfaces: ['identity.dna', 'identity.roles', 'identity.aion'],
    implemented: false,
  },
  {
    id: 'body',
    slug: 'body',
    aion: 'somatic',
    ambience: { hue: 142, saturation: 40, lightness: 18, density: 'minimal' },
    copy: {
      label: { en: 'Body & Soma', he: 'גוף וסומה' },
      tagline: {
        en: 'The intelligence that does not speak in words.',
        he: 'התבונה שלא מדברת במילים.',
      },
      entryWhisper: {
        en: 'Land in the body. I will be here.',
        he: 'נחת בגוף. אני כאן.',
      },
    },
    surfaces: ['body.scan', 'body.breath', 'body.hypnosis'],
    implemented: false,
  },
] as const;

const BY_SLUG = new Map(ROOM_REGISTRY.map((r) => [r.slug, r] as const));
const BY_ID = new Map(ROOM_REGISTRY.map((r) => [r.id, r] as const));

export function getRoomBySlug(slug: string | undefined | null): RoomDefinition | null {
  if (!slug) return null;
  return BY_SLUG.get(slug) ?? null;
}

export function getRoomById(id: string | undefined | null): RoomDefinition | null {
  if (!id) return null;
  return BY_ID.get(id as RoomDefinition['id']) ?? null;
}

export function listRooms(): readonly RoomDefinition[] {
  return ROOM_REGISTRY;
}
/**
 * RoomRegistry — single source of truth for the consciousness hallway.
 *
 * Six rooms (designed for 8). Each room owns a hue, a soundscape stub,
 * an AI behavior mode, and a one-line invitation AION uses on entry.
 * Existing pillar pages will be re-housed under `subsections` in later phases.
 */

export type RoomId =
  | 'beliefs'
  | 'emotions'
  | 'characters'
  | 'time'
  | 'identity'
  | 'body';

export type AionMode =
  | 'socratic'
  | 'mirror'
  | 'dialogue'
  | 'witness'
  | 'strategist'
  | 'somatic';

export interface RoomDef {
  id: RoomId;
  nameEn: string;
  nameHe: string;
  /** HSL hue 0-360, drives orb tint + ambient lighting */
  hue: number;
  /** Glyph (single grapheme) used as a placeholder for room geometry */
  glyph: string;
  /** AION behavior mode while inside this room */
  aionMode: AionMode;
  /** One-line invitation AION speaks/shows on entry */
  inviteEn: string;
  inviteHe: string;
  /** Soundscape token — wired to ambient audio in a later phase */
  soundscape: string;
}

export const ROOMS: RoomDef[] = [
  {
    id: 'beliefs',
    nameEn: 'Beliefs',
    nameHe: 'אמונות',
    hue: 265,
    glyph: '◇',
    aionMode: 'socratic',
    inviteEn: 'What story are you carrying right now?',
    inviteHe: 'איזה סיפור אתה נושא איתך עכשיו?',
    soundscape: 'air-low',
  },
  {
    id: 'emotions',
    nameEn: 'Emotions',
    nameHe: 'רגש',
    hue: 18,
    glyph: '◉',
    aionMode: 'mirror',
    inviteEn: 'Where does the charge live in your body?',
    inviteHe: 'איפה המטען חי בגוף שלך?',
    soundscape: 'pulse-warm',
  },
  {
    id: 'characters',
    nameEn: 'Inner Parts',
    nameHe: 'דמויות פנימיות',
    hue: 292,
    glyph: '◈',
    aionMode: 'dialogue',
    inviteEn: 'Which part of you wants to speak?',
    inviteHe: 'איזה חלק בך רוצה לדבר?',
    soundscape: 'choir-soft',
  },
  {
    id: 'time',
    nameEn: 'Time & Memory',
    nameHe: 'זמן וזיכרון',
    hue: 200,
    glyph: '◐',
    aionMode: 'witness',
    inviteEn: 'Which moment is calling for attention?',
    inviteHe: 'איזה רגע קורא לתשומת לב?',
    soundscape: 'tide',
  },
  {
    id: 'identity',
    nameEn: 'Identity & Roles',
    nameHe: 'זהות',
    hue: 45,
    glyph: '✦',
    aionMode: 'strategist',
    inviteEn: 'Who are you becoming?',
    inviteHe: 'מי אתה הופך להיות?',
    soundscape: 'bell-bright',
  },
  {
    id: 'body',
    nameEn: 'Body & Soma',
    nameHe: 'גוף',
    hue: 145,
    glyph: '◯',
    aionMode: 'somatic',
    inviteEn: 'Take one breath with me.',
    inviteHe: 'נשום איתי נשימה אחת.',
    soundscape: 'breath',
  },
];

export function getRoom(id: string | undefined | null): RoomDef {
  return ROOMS.find((r) => r.id === id) ?? ROOMS[0];
}
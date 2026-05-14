/**
 * aionVoice — Phase 5A foundation.
 *
 * Single source of truth for AION's voice. Every user-facing AION string
 * should eventually route through `say()` so tone, pronouns, name
 * interpolation, and mood adapters stay consistent across chat,
 * artifacts, proactive nudges, empty states, and ambient observations.
 *
 * No backend, no network, no DB. Pure formatter. Bilingual (en/he).
 *
 * Usage:
 *   say('memory.remember', { lang: 'en', userName: 'Asaf' })
 *   // → "I remember, Asaf."
 *
 *   say(
 *     { en: 'I notice {name} keeps returning here.', he: 'אני שם לב ש{name} ממשיך לחזור לכאן.' },
 *     { lang: 'he', userName: 'אסף' }
 *   )
 *   // → "אני שם לב שאסף ממשיך לחזור לכאן."
 *
 * Tone presets are advisory — components may pass `tone` to nudge style,
 * but the registry deliberately keeps a small palette so AION sounds
 * like one entity, not a chorus.
 */

export type Lang = 'en' | 'he';

export type AionTone =
  | 'observing'    // ambient, low-key, "I notice…"
  | 'inviting'    // gentle CTA, "stay with this"
  | 'remembering' // memory recall, "I remember…"
  | 'forming'     // still learning, "I'm piecing this together"
  | 'resting'     // quiet moments, "nothing pulls at you now"
  | 'manifesting'; // about to summon, "I'll bring this forward"

export interface VoiceContext {
  lang: Lang;
  /** User's chosen name. Optional. */
  userName?: string;
  /** AION's name as the user named it. Optional. */
  aionName?: string;
  tone?: AionTone;
}

export type Bilingual = { en: string; he: string };

/** Curated lines. Add sparingly. Each entry must serve relationship, not feature. */
const REGISTRY: Record<string, Bilingual> = {
  // Memory continuity — first-person AION.
  'memory.remember': {
    en: 'I remember, {name}.',
    he: 'אני זוכר, {name}.',
  },
  'memory.lastTimeYou': {
    en: 'Last time, you said something I kept.',
    he: 'בפעם הקודמת אמרת משהו ששמרתי.',
  },
  'memory.startingToUnderstand': {
    en: "I'm starting to understand you here.",
    he: 'אני מתחיל להבין אותך כאן.',
  },
  'memory.stillLearning': {
    en: "I'm still learning this side of you.",
    he: 'אני עדיין לומד את הצד הזה שלך.',
  },
  // Trust ladder — relationship language for permission asks.
  'trust.canISeeThis': {
    en: 'Can I see this with you?',
    he: 'אפשר שאראה את זה איתך?',
  },
  'trust.thankYouForLetting': {
    en: 'Thank you for letting me in here.',
    he: 'תודה שנתת לי להיכנס לכאן.',
  },
  // Manifestation framing — never "generate" or "create".
  'manifest.bringingForward': {
    en: "I'll bring this forward.",
    he: 'אני אביא את זה קדימה.',
  },
  'manifest.formingNow': {
    en: 'Forming this for you now.',
    he: 'מעצב את זה עבורך עכשיו.',
  },
  // Quiet moments — explicit invitations to stillness.
  'rest.nothingPulling': {
    en: 'Nothing is pulling at you right now. Stay with that.',
    he: 'שום דבר לא מושך אותך כרגע. הישאר עם זה.',
  },
  'rest.loopClosed': {
    en: 'The loop is closed. Rest.',
    he: 'הלולאה נסגרה. נוח.',
  },
};

export type VoiceKey = keyof typeof REGISTRY;

/** Resolve a key or inline bilingual into a final string for the user. */
export function say(
  keyOrLine: VoiceKey | Bilingual,
  ctx: VoiceContext,
): string {
  const line: Bilingual =
    typeof keyOrLine === 'string' ? REGISTRY[keyOrLine] : keyOrLine;
  if (!line) return '';
  const raw = line[ctx.lang] ?? line.en ?? '';
  return interpolate(raw, ctx);
}

function interpolate(raw: string, ctx: VoiceContext): string {
  return raw
    .replace(/\{name\}/g, ctx.userName ?? (ctx.lang === 'he' ? 'אתה' : 'you'))
    .replace(/\{aion\}/g, ctx.aionName ?? 'AION');
}

/** Diagnostic helper — list all registered keys (used by dev tooling only). */
export function listVoiceKeys(): VoiceKey[] {
  return Object.keys(REGISTRY) as VoiceKey[];
}

/** Allow downstream modules to extend the registry at module init. */
export function registerVoice(key: string, line: Bilingual): void {
  if (REGISTRY[key]) return;
  (REGISTRY as Record<string, Bilingual>)[key] = line;
}
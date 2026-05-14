/**
 * Curiosity / Probe Engine — Phase F · Step 5.
 *
 * Picks AT MOST one gentle exploratory question per eligible turn.
 * Pure function over the ContextPacket — no DB, no LLM.
 *
 * Eligibility (all must hold):
 *   - decisionMode is 'reflective' | 'curious' | 'observational'
 *   - no urgent task intent (router didn't pick journey.nextAction / action.complete)
 *   - cooldown clear (max 1 probe per 3 turns, repetitionGuard.canProbe())
 *
 * Triggers (any one is enough):
 *   - high sparsity (≥ 0.5)
 *   - lowest pillar confidence < 25
 *   - large open contradiction count (≥ 1)
 *   - neglected rooms detected
 *
 * Tone rules (NEVER violate):
 *   - one question only, no stacked questions
 *   - reflection sentence first, question second
 *   - never use the words: assessment, pillar, confidence, intake, analysis,
 *     הערכה, אבחון, שאלון, ציון, רמת ביטחון
 *   - mirror user's language (he/en) — defaults to Hebrew
 */
import type { ContextPacket } from '@/orchestration/context/contextBuilder';
import type { CapabilityId } from '@/orchestration/capabilities/registry';

export type ProbeReason =
  | 'sparsity'
  | 'low-pillar'
  | 'contradiction'
  | 'neglected-room'
  | 'reflective-open';

export interface ProbeCandidate {
  ok: true;
  reason: ProbeReason;
  text: string;
  language: 'he' | 'en';
  triggerData?: Record<string, unknown>;
}

export interface ProbeSkipped {
  ok: false;
  reason: string;
}

export type ProbeResult = ProbeCandidate | ProbeSkipped;

const URGENT_CAPS: ReadonlySet<string> = new Set([
  'journey.nextAction',
  'action.complete',
  'task.suggest',
  'plan.suggest',
]);

const FORBIDDEN = /\b(assessment|intake|analysis|pillar|confidence|הערכה|אבחון|שאלון|ציון|ביטחון)\b/i;

function pickRoomLabel(packet: ContextPacket): string | null {
  const neg = packet.graphDepth.neglectedRooms[0];
  if (neg) return neg;
  const lowest = packet.lowestPillars[0]?.pillar_id;
  return lowest ?? null;
}

function templates(reason: ProbeReason, packet: ContextPacket, language: 'he' | 'en'): string[] {
  const room = pickRoomLabel(packet);
  const topRoom = packet.graphDepth.topRooms[0] ?? null;

  if (language === 'he') {
    switch (reason) {
      case 'sparsity':
        return [
          'אני מרגיש שעוד לא סיפרת לי הרבה על עצמך — יש משהו בחיים שלך שכמעט אף פעם לא עולה כאן?',
          'אני שומע אותך, אבל יש פיסות שעוד לא ראיתי. מה מהדברים שחשובים לך הכי קשה לתאר?',
        ];
      case 'low-pillar':
        return room
          ? [`אתה הרבה מדבר על מה שאתה רוצה לעשות, אבל פחות על ה${roomLabelHe(room)}. זה מכוון?`]
          : ['יש תחומים שאתה כמעט לא נוגע בהם בשיחות איתי. משהו שם שעדיף לא להיכנס אליו עכשיו?'];
      case 'contradiction':
        return ['חלק ממך נשמע ברור לגמרי, וחלק אחר כאילו מושך לכיוון שני. שמת לב לזה?'];
      case 'neglected-room':
        return room
          ? [`שמתי לב שב${roomLabelHe(room)} כמעט לא דיברנו לאחרונה. רוצה לרגע לעצור שם?`]
          : ['יש פינות בחיים שלך שלא ביקרנו בהן הרבה זמן. רוצה לבחור אחת?'];
      case 'reflective-open':
      default:
        return topRoom
          ? [`אני שומע הרבה על ${roomLabelHe(topRoom)} בזמן האחרון. מה גורם לזה לעלות עכשיו?`]
          : ['יש תחושה שמשהו עדין יושב מתחת למה שאמרת. רוצה לרגע להשהות שם?'];
    }
  }

  // English fallback (kept short).
  switch (reason) {
    case 'sparsity':
      return ['You haven\'t shown me a lot of yourself yet — is there a part of your life that almost never comes up?'];
    case 'low-pillar':
      return ['You speak a lot about what you want to build, but rarely about the people around you. Is that intentional?'];
    case 'contradiction':
      return ['Part of you sounds clear, and another part seems to pull the other way. Do you notice that?'];
    case 'neglected-room':
      return ['There\'s a corner of your life we haven\'t visited in a while. Want to stop there for a moment?'];
    default:
      return ['Something quieter seems to be sitting underneath that. Want to pause there?'];
  }
}

function roomLabelHe(id: string): string {
  // Best-effort label — id is already a slug; render as-is if no map.
  const map: Record<string, string> = {
    relationships: 'מערכות יחסים',
    health: 'בריאות',
    finance: 'כסף',
    purpose: 'משמעות',
    creativity: 'יצירה',
    discipline: 'משמעת',
    rest: 'מנוחה',
    body: 'גוף',
    mind: 'מחשבה',
  };
  return map[id] ?? id;
}

export function chooseProbe(
  packet: ContextPacket,
  routedCapability: CapabilityId | null,
  language: 'he' | 'en' = 'he',
): ProbeResult {
  if (routedCapability && URGENT_CAPS.has(routedCapability)) {
    return { ok: false, reason: 'urgent-intent' };
  }
  if (packet.decisionMode === 'directive') {
    return { ok: false, reason: 'directive-mode' };
  }

  let reason: ProbeReason | null = null;
  if (packet.contradictions.length >= 1) reason = 'contradiction';
  else if (packet.graphDepth.sparsityScore >= 0.5) reason = 'sparsity';
  else if (packet.lowestPillars[0] && packet.lowestPillars[0].confidence < 25) reason = 'low-pillar';
  else if (packet.graphDepth.neglectedRooms.length > 0) reason = 'neglected-room';
  else if (packet.decisionMode === 'reflective') reason = 'reflective-open';

  if (!reason) return { ok: false, reason: 'no-trigger' };

  const candidates = templates(reason, packet, language);
  const text = candidates[Math.floor(Math.random() * candidates.length)] ?? candidates[0];

  if (!text || FORBIDDEN.test(text)) {
    return { ok: false, reason: 'forbidden-language' };
  }
  // Single-question rule: ensure exactly one '?'.
  const qCount = (text.match(/\?/g) ?? []).length;
  if (qCount !== 1) return { ok: false, reason: 'multi-question' };

  return {
    ok: true,
    reason,
    text,
    language,
    triggerData: {
      sparsity: packet.graphDepth.sparsityScore,
      lowest_pillar: packet.lowestPillars[0]?.pillar_id ?? null,
      contradictions: packet.contradictions.length,
      neglected: packet.graphDepth.neglectedRooms,
    },
  };
}
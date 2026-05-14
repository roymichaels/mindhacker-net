/**
 * AION Observe-Mode Router — Phase F Phase 1.
 *
 * Pure function. Given a user message + route + (optional) intent/emotion,
 * picks the most likely capability candidate and the artifact it WOULD emit.
 * Never mutates anything. Used solely to enrich the turn trace.
 *
 * Heuristics here are intentionally lightweight; the real intent/emotion
 * classification still runs server-side via aion-orchestrator skills. This
 * router's only job is to make the decision visible BEFORE skill results
 * land, so the diagnostics panel has something to show on every turn.
 */
import { CAPABILITIES, effectiveMode, type CapabilityId, type CapabilityMode } from '@/orchestration/capabilities/registry';

export interface RouterInput {
  content: string;
  route: string | null;
  intent?: string | null;
  emotion?: string | null;
  language?: 'he' | 'en' | string;
}

export interface RouterDecision {
  capability: CapabilityId | null;
  artifactKind: string | null;
  mode: CapabilityMode;
  reason: string;
  matchedKeywords: string[];
  skipped: boolean;
  skippedReason?: string;
}

/** Bilingual keyword buckets — order = priority. */
const RULES: Array<{ cap: CapabilityId; kws: RegExp[] }> = [
  { cap: 'action.complete',    kws: [/mark.*(done|complete)/i, /סמן ש?סיימתי/, /סיימתי את זה/, /בוצע/] },
  { cap: 'hypnosis.start',     kws: [/start\s+hypnosis/i, /התחל היפנוזה/, /תפעיל היפנוזה/, /תתחיל מפגש/] },
  { cap: 'journal.capture',    kws: [/save.*journal|write\s+down|note this/i, /תשמור.*ביומן|רשום ביומן|תרשום ביומן|שמור את זה/] },
  { cap: 'journal.search',     kws: [/search.*journal|find.*(journal|note)/i, /חפש ביומן|מה כתבתי|הראה לי את היומן|חיפוש ביומן/] },
  { cap: 'brain.query',        kws: [/\bbrain\b/i, /\bmind\s*map\b/i, /המוח שלי/, /מפת תודעה/, /מי אני/] },
  { cap: 'brain.openRoom',     kws: [/open\s+room/i, /\broom\b/i, /\bחדר\b/, /פתח לי את החדר/, /הראה לי את החדר/] },
  { cap: 'profile.summarize',  kws: [/who\s+am\s+i/i, /my\s+identity/i, /\bdna\b/i, /what\s+do\s+you\s+know\s+about\s+me/i, /הזהות שלי/, /ה־?DNA/, /מה אתה יודע עליי?/, /מה ידוע לך עליי?/] },
  { cap: 'hypnosis.recommend', kws: [/sleep|insomnia|relax|hypnosis/i, /לישון|להירדם|להירגע|היפנוזה/] },
  { cap: 'outerWorld.open',    kws: [/coach|marketplace|market\b|community/i, /מאמן|קהילה|שוק/] },
  { cap: 'daily.generate',     kws: [/today.*(plan|queue|tasks)|plan\s+my\s+day|build\s+today/i, /מה היום|תכנן לי את היום|בנה לי יום|המשימות של היום/] },
  { cap: 'plan.summarize',     kws: [/summari[sz]e\s+(my\s+)?plan|plan\s+summary/i, /סכם את התוכנית|סיכום התוכנית/] },
  { cap: 'plan.suggest',       kws: [/plan|strategy|roadmap|business/i, /תוכנית|אסטרטגיה|מסלול|עסק/] },
  { cap: 'journey.nextAction', kws: [/what\s+(should|do)\s+i\s+do|stuck|next\s+step/i, /מה כדאי|מה לעשות|אני תקוע|הצעד הבא/] },
  { cap: 'task.suggest',       kws: [/give\s+me\s+a\s+task|small\s+win/i, /משימה|ניצחון קטן/] },
  { cap: 'journey.summarize',  kws: [/summary|progress|where\s+am\s+i\s+at/i, /סיכום|התקדמות|איפה אני|מצב המסע|המצב של המסע/] },
];

export function routeObserve(input: RouterInput): RouterDecision {
  const text = (input.content ?? '').slice(0, 2000);
  if (!text.trim()) {
    return {
      capability: null,
      artifactKind: null,
      mode: 'observe',
      reason: 'empty-input',
      matchedKeywords: [],
      skipped: true,
      skippedReason: 'no-content',
    };
  }

  for (const rule of RULES) {
    const matched = rule.kws.filter((re) => re.test(text)).map((re) => re.source);
    if (matched.length === 0) continue;
    const def = CAPABILITIES[rule.cap];
    const mode = effectiveMode(rule.cap);
    const declared = def.declaredMode;
    // mutate capabilities don't auto-execute; they trigger confirm flow.
    const willExecute = mode === 'read' || mode === 'suggest' || declared === 'mutate';
    return {
      capability: rule.cap,
      artifactKind: def.artifactKind,
      mode,
      reason: `keyword:${matched[0]}`,
      matchedKeywords: matched,
      skipped: !willExecute,
      skippedReason: willExecute ? undefined : 'observe-only',
    };
  }

  return {
    capability: null,
    artifactKind: null,
    mode: 'observe',
    reason: 'no-rule-matched',
    matchedKeywords: [],
    skipped: true,
    skippedReason: 'no-candidate',
  };
}
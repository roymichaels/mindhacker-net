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
  { cap: 'brain.query',        kws: [/\bbrain\b/i, /\bmind\s*map\b/i, /המוח שלי/, /מפת תודעה/, /מי אני/] },
  { cap: 'brain.openRoom',     kws: [/open\s+room/i, /\broom\b/i, /חדר/, /הראה לי את/] },
  { cap: 'profile.summarize',  kws: [/who\s+am\s+i/i, /my\s+identity/i, /\bdna\b/i, /what\s+do\s+you\s+know\s+about\s+me/i, /הזהות שלי/, /ה־?DNA/, /מה אתה יודע עליי?/, /מה ידוע לך עליי?/] },
  { cap: 'hypnosis.recommend', kws: [/sleep|insomnia|relax|hypnosis/i, /לישון|להירדם|להירגע|היפנוזה/] },
  { cap: 'outerWorld.open',    kws: [/coach|marketplace|market\b|community/i, /מאמן|קהילה|שוק/] },
  { cap: 'journal.capture',    kws: [/journal|write\s+down|note this/i, /יומן|לכתוב|תרשום/] },
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
    const willExecute = mode === 'read' || mode === 'suggest';
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
/**
 * @module lib/power/scoring
 * Ratio-based normalization scoring engine for Power assessment.
 * Produces module scores, findings, and fix-library items.
 */
import type {
  PowerTrackId,
  GymStrengthInput,
  CalConditioningInput,
  CalSkillsInput,
  ExplosivePowerInput,
  ModuleScore,
  PowerFinding,
  PowerAssessment,
  FixItem,
} from './types';
import { SKILL_LADDERS } from './ladders';

/* ─── Helpers ─── */
function norm(value: number, low: number, high: number): number {
  if (value <= low) return 0;
  if (value >= high) return 100;
  return Math.round(((value - low) / (high - low)) * 100);
}

function normInverse(value: number, best: number, worst: number): number {
  if (value <= best) return 100;
  if (value >= worst) return 0;
  return Math.round(((worst - value) / (worst - best)) * 100);
}

/** Epley 1RM estimation */
function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/* ─── Gym Strength ─── */
export function scoreGymStrength(input: GymStrengthInput): ModuleScore {
  const bw = input.bodyweight || 75;
  const subs: Record<string, number> = {};
  const parts: number[] = [];
  let filledCount = 0;

  const lifts = [
    { data: input.bench, key: 'bench', bands: [0.5, 0.75, 1.0, 1.25, 1.5] },
    { data: input.squat, key: 'squat', bands: [0.75, 1.0, 1.25, 1.5, 2.0] },
    { data: input.deadlift, key: 'deadlift', bands: [1.0, 1.25, 1.5, 2.0, 2.5] },
    { data: input.ohp, key: 'ohp', bands: [0.3, 0.45, 0.6, 0.75, 1.0] },
  ];

  for (const lift of lifts) {
    if (lift.data && lift.data.weight > 0) {
      filledCount++;
      const est = estimate1RM(lift.data.weight, lift.data.reps);
      const ratio = est / bw;
      // Map ratio to 0-100 using bands
      const [b1, b2, b3, b4, b5] = lift.bands;
      let s: number;
      if (ratio <= b1) s = norm(ratio, 0, b1) * 0.3;
      else if (ratio <= b2) s = 30 + norm(ratio, b1, b2) * 0.15;
      else if (ratio <= b3) s = 45 + norm(ratio, b2, b3) * 0.15;
      else if (ratio <= b4) s = 60 + norm(ratio, b3, b4) * 0.2;
      else s = 80 + norm(ratio, b4, b5) * 0.2;
      subs[lift.key] = Math.round(Math.min(s, 100));
      parts.push(subs[lift.key]);
    }
  }

  const score = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : -1;
  const confidence = filledCount >= 3 ? 'high' : filledCount >= 1 ? 'med' : 'low';

  return { trackId: 'gym_strength', score, subScores: subs, label: 'Gym Strength', confidence };
}

/* ─── Calisthenics Conditioning ─── */
export function scoreCalConditioning(input: CalConditioningInput): ModuleScore {
  const subs: Record<string, number> = {};
  const parts: number[] = [];
  let filledCount = 0;

  const fields: [number | undefined, string, number, number][] = [
    [input.maxPushups, 'pushups', 5, 60],
    [input.maxPullups, 'pullups', 1, 22],
    [input.maxDips, 'dips', 3, 35],
    [input.maxBwSquats, 'bwSquats', 10, 80],
  ];

  for (const [val, key, lo, hi] of fields) {
    if (val != null && val > 0) {
      filledCount++;
      subs[key] = norm(val, lo, hi);
      parts.push(subs[key]);
    }
  }

  // Weighted calisthenics bonus
  if (input.weightedCalisthenics) {
    if (input.weightedPullupWeight && input.weightedPullupReps) {
      const bonus = norm(input.weightedPullupWeight, 5, 50);
      subs.weightedPullup = bonus;
      parts.push(bonus);
      filledCount++;
    }
    if (input.weightedDipWeight && input.weightedDipReps) {
      const bonus = norm(input.weightedDipWeight, 5, 50);
      subs.weightedDip = bonus;
      parts.push(bonus);
      filledCount++;
    }
  }

  const score = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : -1;
  const confidence = filledCount >= 3 ? 'high' : filledCount >= 1 ? 'med' : 'low';

  return { trackId: 'calisthenics_conditioning', score, subScores: subs, label: 'Calisthenics Conditioning', confidence };
}

/* ─── Calisthenics Skills ─── */
export function scoreCalSkills(input: CalSkillsInput): ModuleScore {
  const subs: Record<string, number> = {};
  const parts: number[] = [];
  let filledCount = 0;

  const skills: [number, string, number][] = [
    [input.handstand, 'handstand', SKILL_LADDERS.handstand.length],
    [input.planche, 'planche', SKILL_LADDERS.planche.length],
    [input.frontLever, 'frontLever', SKILL_LADDERS.frontLever.length],
    [input.backLever, 'backLever', SKILL_LADDERS.backLever.length],
    [input.humanFlag, 'humanFlag', SKILL_LADDERS.humanFlag.length],
    [input.muscleUp, 'muscleUp', SKILL_LADDERS.muscleUp.length],
    [input.pistolSquat, 'pistolSquat', SKILL_LADDERS.pistolSquat.length],
    [input.vSit, 'vSit', SKILL_LADDERS.vSit.length],
  ];

  for (const [level, key, maxLevel] of skills) {
    if (level > 0) {
      filledCount++;
      subs[key] = Math.round((level / maxLevel) * 100);
      parts.push(subs[key]);
    }
    // 0 = not training, skip
  }

  const score = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : -1;
  const confidence = filledCount >= 3 ? 'high' : filledCount >= 1 ? 'med' : 'low';

  return { trackId: 'calisthenics_skills', score, subScores: subs, label: 'Calisthenics Skills', confidence };
}

/* ─── Explosive Power ─── */
export function scoreExplosivePower(input: ExplosivePowerInput): ModuleScore {
  const subs: Record<string, number> = {};
  const parts: number[] = [];
  let filledCount = 0;

  if (input.verticalJumpCm != null && input.verticalJumpCm > 0) {
    subs.verticalJump = norm(input.verticalJumpCm, 25, 80);
    parts.push(subs.verticalJump); filledCount++;
  }
  if (input.broadJumpCm != null && input.broadJumpCm > 0) {
    subs.broadJump = norm(input.broadJumpCm, 150, 310);
    parts.push(subs.broadJump); filledCount++;
  }
  if (input.sprint20mSeconds != null && input.sprint20mSeconds > 0) {
    subs.sprint20m = normInverse(input.sprint20mSeconds, 2.8, 5.0);
    parts.push(subs.sprint20m); filledCount++;
  }
  if (input.sprint40mSeconds != null && input.sprint40mSeconds > 0) {
    subs.sprint40m = normInverse(input.sprint40mSeconds, 4.8, 8.0);
    parts.push(subs.sprint40m); filledCount++;
  }

  const score = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : -1;
  const confidence = filledCount >= 2 ? 'high' : filledCount >= 1 ? 'med' : 'low';

  return { trackId: 'explosive_power', score, subScores: subs, label: 'Explosive Power', confidence };
}

/* ─── Findings ─── */
export function generateFindings(scores: ModuleScore[]): PowerFinding[] {
  const findings: PowerFinding[] = [];
  let idx = 0;

  for (const ms of scores) {
    if (ms.score < 0) continue;

    if (ms.score < 30) {
      findings.push({
        id: `f${idx++}`, severity: 'notable',
        text: `${ms.label} score critically low (${ms.score}/100). Foundational work needed.`,
        textHe: `ציון ${ms.label} נמוך קריטית (${ms.score}/100). נדרשת עבודת יסוד.`,
      });
    } else if (ms.score < 55) {
      findings.push({
        id: `f${idx++}`, severity: 'moderate',
        text: `${ms.label} below average (${ms.score}/100). Targeted focus recommended.`,
        textHe: `${ms.label} מתחת לממוצע (${ms.score}/100). מיקוד ממוקד מומלץ.`,
      });
    }

    // Imbalance
    const vals = Object.values(ms.subScores).filter(v => v >= 0);
    if (vals.length >= 2) {
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      if (max - min > 40) {
        findings.push({
          id: `f${idx++}`, severity: 'moderate',
          text: `Significant imbalance in ${ms.label} (Δ${max - min}).`,
          textHe: `חוסר איזון משמעותי ב-${ms.label} (Δ${max - min}).`,
        });
      }
    }
  }

  // Missing modules
  const assessed = scores.filter(s => s.score >= 0).length;
  if (assessed < scores.length) {
    findings.push({
      id: `f${idx++}`, severity: 'minor',
      text: `Some modules lack input data — assess to unlock full accuracy.`,
      textHe: `חלק מהמודולים חסרי נתונים — הזן למדויקות מלאה.`,
    });
  }

  return findings.slice(0, 6);
}

/* ─── Fix Library ─── */
export const FIX_LIBRARY: FixItem[] = [
  // Tier 1 — High Impact
  { id: 'fix_compound', title: 'Progressive Overload (Compound Lifts)', titleHe: 'עומס פרוגרסיבי (הרמות מורכבות)', why: 'The single most impactful driver for maximal strength.', whyHe: 'הגורם היחיד בעל ההשפעה הגדולה ביותר לכוח מקסימלי.', tier: 1, impact: 'high', difficulty: 'med', tags: ['gym_strength'] },
  { id: 'fix_pull_vol', title: 'Pulling Volume Baseline', titleHe: 'נפח משיכות בסיסי', why: 'Most people are pull-deficient. Increasing pull volume corrects posture and unlocks strength.', whyHe: 'רוב האנשים חסרי משיכות. הגדלת נפח מתקנת יציבה ומשחררת כוח.', tier: 1, impact: 'high', difficulty: 'easy', tags: ['gym_strength', 'calisthenics_conditioning'] },
  { id: 'fix_push_vol', title: 'Push Volume Baseline', titleHe: 'נפח דחיפות בסיסי', why: 'Consistent push volume builds chest and shoulder endurance.', whyHe: 'נפח דחיפות עקבי בונה סיבולת חזה וכתף.', tier: 1, impact: 'high', difficulty: 'easy', tags: ['gym_strength', 'calisthenics_conditioning'] },
  { id: 'fix_leg_base', title: 'Leg Strength Baseline', titleHe: 'בסיס כוח רגליים', why: 'Legs are the engine. Squat and deadlift patterns build foundation.', whyHe: 'הרגליים הן המנוע. דפוסי סקוואט ומתלה בונים בסיס.', tier: 1, impact: 'high', difficulty: 'med', tags: ['gym_strength'] },
  { id: 'fix_mobility', title: 'Shoulder & Hip Mobility', titleHe: 'ניידות כתפיים וירכיים', why: 'Minimum mobility unlocks safe range of motion for all movements.', whyHe: 'ניידות מינימלית מאפשרת טווח תנועה בטוח לכל התרגילים.', tier: 1, impact: 'high', difficulty: 'easy', tags: ['gym_strength', 'calisthenics_skills', 'calisthenics_conditioning'] },
  { id: 'fix_recovery', title: 'Sleep + Protein Baseline', titleHe: 'בסיס שינה + חלבון', why: 'Without recovery basics, training stimulus is wasted.', whyHe: 'ללא בסיסי התאוששות, גירוי האימון מתבזבז.', tier: 1, impact: 'high', difficulty: 'easy', tags: ['gym_strength', 'calisthenics_conditioning', 'calisthenics_skills', 'explosive_power'] },
  // Tier 2 — Refinement
  { id: 'fix_grip', title: 'Grip Strength Work', titleHe: 'עבודת כוח אחיזה', why: 'Grip is often the hidden limiter for pulls and hangs.', whyHe: 'אחיזה היא לעיתים המגביל הנסתר למשיכות ותליות.', tier: 2, impact: 'med', difficulty: 'easy', tags: ['gym_strength', 'calisthenics_conditioning', 'calisthenics_skills'] },
  { id: 'fix_scap', title: 'Scapular Control Drills', titleHe: 'תרגילי שליטה בשכמות', why: 'Scapular stability is prerequisite for planche, lever, and pressing strength.', whyHe: 'יציבות שכמות היא תנאי מוקדם לפלאנש, לבר וכוח דחיפה.', tier: 2, impact: 'med', difficulty: 'med', tags: ['calisthenics_skills', 'calisthenics_conditioning'] },
  { id: 'fix_core', title: 'Core Anti-Extension & Anti-Rotation', titleHe: 'ליבה: אנטי-הארכה ואנטי-סיבוב', why: 'Core strength protects the spine and transfers force between limbs.', whyHe: 'כוח ליבה מגן על עמוד השדרה ומעביר כוח בין הגפיים.', tier: 2, impact: 'med', difficulty: 'med', tags: ['gym_strength', 'calisthenics_skills', 'explosive_power'] },
  { id: 'fix_tempo', title: 'Tempo & Eccentric Training', titleHe: 'אימון טמפו ואקסנטרי', why: 'Controlled negatives build tendon resilience and unlock strength gains.', whyHe: 'שליליות מבוקרות בונות חוסן גידים ופותחות רווחי כוח.', tier: 2, impact: 'med', difficulty: 'med', tags: ['gym_strength', 'calisthenics_conditioning'] },
  { id: 'fix_sprint_mech', title: 'Sprint Mechanics Basics', titleHe: 'יסודות מכניקת ספרינט', why: 'Technical efficiency in sprinting reduces injury risk and improves times.', whyHe: 'יעילות טכנית בספרינט מפחיתה סיכון לפציעה ומשפרת זמנים.', tier: 2, impact: 'med', difficulty: 'med', tags: ['explosive_power'] },
  // Tier 3 — Advanced
  { id: 'fix_skill_prog', title: 'Skill-Specific Progression', titleHe: 'התקדמות ספציפית למיומנות', why: 'Dedicated blocks for individual calisthenics skills.', whyHe: 'בלוקים ייעודיים למיומנויות קליסטניקס ספציפיות.', tier: 3, impact: 'med', difficulty: 'hard', tags: ['calisthenics_skills'] },
  { id: 'fix_plyo', title: 'Advanced Plyometrics', titleHe: 'פליאומטריקה מתקדמת', why: 'Depth jumps and reactive training for peak power output.', whyHe: 'קפיצות עומק ואימון ריאקטיבי לשיא תפוקת כוח.', tier: 3, impact: 'med', difficulty: 'hard', tags: ['explosive_power'] },
  { id: 'fix_weighted_cal', title: 'Weighted Calisthenics Specialization', titleHe: 'התמחות קליסטניקס עם משקל', why: 'Adding external load to bodyweight movements for advanced strength.', whyHe: 'הוספת עומס חיצוני לתנועות משקל גוף לכוח מתקדם.', tier: 3, impact: 'low', difficulty: 'hard', tags: ['calisthenics_conditioning'] },
];

/** Select top 3 focus items based on weakest tracks */
export function selectFocusItems(scores: ModuleScore[]): FixItem[] {
  const sorted = [...scores].filter(s => s.score >= 0).sort((a, b) => a.score - b.score);
  const weakTrackIds = sorted.map(s => s.trackId);

  // Prioritize Tier 1 items for weak tracks, then Tier 2
  const selected: FixItem[] = [];
  for (const tier of [1, 2, 3] as const) {
    for (const trackId of weakTrackIds) {
      for (const item of FIX_LIBRARY) {
        if (item.tier === tier && item.tags.includes(trackId) && !selected.find(s => s.id === item.id)) {
          selected.push(item);
          if (selected.length >= 3) return selected;
        }
      }
    }
  }
  return selected.slice(0, 3);
}

/* ─── Build full assessment ─── */
export function buildPowerAssessment(
  selectedTracks: PowerTrackId[],
  moduleScores: ModuleScore[],
): PowerAssessment {
  const scoreMap: Record<string, ModuleScore> = {};
  for (const ms of moduleScores) scoreMap[ms.trackId] = ms;

  const valid = moduleScores.filter(s => s.score >= 0);
  const powerIndex = valid.length > 0
    ? Math.round(valid.reduce((sum, s) => sum + s.score, 0) / valid.length)
    : -1;

  // Overall confidence
  const highCount = valid.filter(s => s.confidence === 'high').length;
  const confidence: 'low' | 'med' | 'high' =
    highCount >= 2 ? 'high' : valid.length >= 1 ? 'med' : 'low';

  return {
    selectedTracks,
    moduleScores: scoreMap,
    powerIndex,
    confidence,
    findings: generateFindings(moduleScores),
    focusItems: selectFocusItems(moduleScores),
    assessedAt: new Date().toISOString(),
  };
}

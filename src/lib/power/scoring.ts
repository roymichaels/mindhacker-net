/**
 * @module lib/power/scoring
 * Ratio-based normalization scoring engine for Power assessment.
 */
import type {
  PowerModuleId,
  MaxStrengthInput,
  RelativeBodyweightInput,
  StaticSkillInput,
  ExplosivePowerInput,
  StructuralStrengthInput,
  ModuleScore,
  PowerFinding,
  PowerLever,
  PowerAssessment,
  PlancheTier,
  FrontLeverTier,
} from './types';

/* ─── Ratio-based normalization helpers ─── */

/** Clamp and normalize a value within [low, high] → [0, 100] */
function norm(value: number, low: number, high: number): number {
  if (value <= low) return 0;
  if (value >= high) return 100;
  return Math.round(((value - low) / (high - low)) * 100);
}

/** Inverse normalization: lower is better (e.g. sprint time) */
function normInverse(value: number, best: number, worst: number): number {
  if (value <= best) return 100;
  if (value >= worst) return 0;
  return Math.round(((worst - value) / (worst - best)) * 100);
}

/* ─── Module scoring functions ─── */

export function scoreMaxStrength(input: MaxStrengthInput): ModuleScore {
  const bw = input.bodyweight || 70;
  const subs: Record<string, number> = {};
  const parts: number[] = [];

  if (input.bench1rm != null && input.bench1rm > 0) {
    const ratio = input.bench1rm / bw;
    subs.bench = norm(ratio, 0.5, 2.0);
    parts.push(subs.bench);
  }
  if (input.squat1rm != null && input.squat1rm > 0) {
    const ratio = input.squat1rm / bw;
    subs.squat = norm(ratio, 0.75, 2.5);
    parts.push(subs.squat);
  }
  if (input.deadlift1rm != null && input.deadlift1rm > 0) {
    const ratio = input.deadlift1rm / bw;
    subs.deadlift = norm(ratio, 1.0, 3.0);
    parts.push(subs.deadlift);
  }

  const score = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : -1;

  return { moduleId: 'max_strength', score, subScores: subs, label: 'Max Strength' };
}

export function scoreRelativeBodyweight(input: RelativeBodyweightInput): ModuleScore {
  const subs: Record<string, number> = {};
  const parts: number[] = [];

  if (input.maxPushups != null) {
    subs.pushups = norm(input.maxPushups, 5, 60);
    parts.push(subs.pushups);
  }
  if (input.maxPullups != null) {
    subs.pullups = norm(input.maxPullups, 1, 25);
    parts.push(subs.pullups);
  }
  if (input.maxDips != null) {
    subs.dips = norm(input.maxDips, 3, 35);
    parts.push(subs.dips);
  }
  if (input.lSitHoldSeconds != null) {
    subs.lSit = norm(input.lSitHoldSeconds, 5, 60);
    parts.push(subs.lSit);
  }

  const score = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : -1;
  return { moduleId: 'relative_bodyweight', score, subScores: subs, label: 'Relative Bodyweight' };
}

const PLANCHE_SCORES: Record<PlancheTier, number> = {
  none: 0, tuck: 20, adv_tuck: 40, straddle: 60, half_lay: 80, full: 100,
};
const FRONT_LEVER_SCORES: Record<FrontLeverTier, number> = {
  none: 0, tuck: 20, adv_tuck: 40, straddle: 60, half_lay: 80, full: 100,
};

export function scoreStaticSkill(input: StaticSkillInput): ModuleScore {
  const subs: Record<string, number> = {};
  const parts: number[] = [];

  subs.planche = PLANCHE_SCORES[input.plancheProgression] ?? 0;
  parts.push(subs.planche);

  subs.frontLever = FRONT_LEVER_SCORES[input.frontLeverProgression] ?? 0;
  parts.push(subs.frontLever);

  if (input.handstandHoldSeconds != null) {
    subs.handstand = norm(input.handstandHoldSeconds, 5, 60);
    parts.push(subs.handstand);
  }

  const score = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : -1;
  return { moduleId: 'static_skill_strength', score, subScores: subs, label: 'Static Skill Strength' };
}

export function scoreExplosivePower(input: ExplosivePowerInput): ModuleScore {
  const subs: Record<string, number> = {};
  const parts: number[] = [];

  if (input.sprint30mSeconds != null && input.sprint30mSeconds > 0) {
    subs.sprint = normInverse(input.sprint30mSeconds, 3.8, 6.5);
    parts.push(subs.sprint);
  }
  if (input.verticalJumpCm != null) {
    subs.verticalJump = norm(input.verticalJumpCm, 25, 80);
    parts.push(subs.verticalJump);
  }
  if (input.broadJumpCm != null) {
    subs.broadJump = norm(input.broadJumpCm, 150, 310);
    parts.push(subs.broadJump);
  }
  if (input.clapPushups != null) {
    subs.clapPushups = norm(input.clapPushups, 1, 25);
    parts.push(subs.clapPushups);
  }

  const score = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : -1;
  return { moduleId: 'explosive_power', score, subScores: subs, label: 'Explosive Power' };
}

export function scoreStructuralStrength(input: StructuralStrengthInput): ModuleScore {
  const subs: Record<string, number> = {};
  const parts: number[] = [];

  if (input.deadHangSeconds != null) {
    subs.deadHang = norm(input.deadHangSeconds, 15, 120);
    parts.push(subs.deadHang);
  }
  if (input.sidePlankSeconds != null) {
    subs.sidePlank = norm(input.sidePlankSeconds, 15, 90);
    parts.push(subs.sidePlank);
  }
  if (input.singleLegBalanceSeconds != null) {
    subs.singleLegBalance = norm(input.singleLegBalanceSeconds, 10, 60);
    parts.push(subs.singleLegBalance);
  }
  if (input.deepSquatHoldSeconds != null) {
    subs.deepSquat = norm(input.deepSquatHoldSeconds, 15, 120);
    parts.push(subs.deepSquat);
  }

  const score = parts.length > 0 ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : -1;
  return { moduleId: 'structural_strength', score, subScores: subs, label: 'Structural Strength' };
}

/* ─── Findings generator ─── */

export function generateFindings(scores: ModuleScore[]): PowerFinding[] {
  const findings: PowerFinding[] = [];
  let idx = 0;

  for (const ms of scores) {
    if (ms.score < 0) continue;

    if (ms.score < 30) {
      findings.push({
        id: `f${idx++}`,
        severity: 'notable',
        text: `${ms.label} score is critically low (${ms.score}/100). Foundational work needed.`,
        textHe: `ציון ${ms.label} נמוך באופן קריטי (${ms.score}/100). נדרשת עבודת יסוד.`,
      });
    } else if (ms.score < 55) {
      findings.push({
        id: `f${idx++}`,
        severity: 'moderate',
        text: `${ms.label} is below average (${ms.score}/100). Targeted training recommended.`,
        textHe: `${ms.label} מתחת לממוצע (${ms.score}/100). אימון ממוקד מומלץ.`,
      });
    }

    // Sub-score imbalance check
    const vals = Object.values(ms.subScores).filter(v => v >= 0);
    if (vals.length >= 2) {
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      if (max - min > 40) {
        findings.push({
          id: `f${idx++}`,
          severity: 'moderate',
          text: `Significant imbalance detected in ${ms.label} subscores (Δ${max - min}).`,
          textHe: `חוסר איזון משמעותי ב-${ms.label} (Δ${max - min}).`,
        });
      }
    }
  }

  return findings.slice(0, 6);
}

/* ─── Lever generator ─── */

const LEVER_BANK: Record<PowerModuleId, PowerLever[]> = {
  max_strength: [
    { id: 'ms1', name: 'Compound Lift Overload', nameHe: 'עומס הרמות מורכבות', why: 'Increase 1RM through progressive overload on primary lifts.', whyHe: 'הגדלת 1RM דרך עומס פרוגרסיבי.', moduleId: 'max_strength' },
    { id: 'ms2', name: 'Weak Link Identification', nameHe: 'זיהוי חוליה חלשה', why: 'Address sticking points limiting compound lift output.', whyHe: 'טיפול בנקודות חולשה המגבילות ביצועי הרמה.', moduleId: 'max_strength' },
    { id: 'ms3', name: 'Upper / Lower Balance', nameHe: 'איזון עליון / תחתון', why: 'Equalize push-pull and upper-lower strength ratios.', whyHe: 'איזון יחסי כוח דחיפה-משיכה ועליון-תחתון.', moduleId: 'max_strength' },
  ],
  relative_bodyweight: [
    { id: 'rb1', name: 'Rep Endurance Building', nameHe: 'בניית סיבולת חזרות', why: 'Increase max reps through grease-the-groove protocols.', whyHe: 'הגדלת חזרות מקס דרך פרוטוקולים תדירים.', moduleId: 'relative_bodyweight' },
    { id: 'rb2', name: 'Eccentric Strength Focus', nameHe: 'מיקוד כוח אקסנטרי', why: 'Strengthen negative phase to unlock higher volumes.', whyHe: 'חיזוק פאזה שלילית לפתיחת נפחים גבוהים.', moduleId: 'relative_bodyweight' },
    { id: 'rb3', name: 'Core Compression Mastery', nameHe: 'שליטה בדחיסת ליבה', why: 'L-sit and hollow body are limited by core compression capacity.', whyHe: 'L-sit ו-hollow body מוגבלים ע"י יכולת דחיסת ליבה.', moduleId: 'relative_bodyweight' },
  ],
  static_skill_strength: [
    { id: 'ss1', name: 'Scapular Depression Strength', nameHe: 'כוח הורדת שכמה', why: 'Foundation for planche and front lever progressions.', whyHe: 'יסוד להתקדמות בפלאנש ופרונט לבר.', moduleId: 'static_skill_strength' },
    { id: 'ss2', name: 'Isometric Core Compression', nameHe: 'דחיסת ליבה איזומטרית', why: 'Holding advanced positions requires extreme core tension.', whyHe: 'החזקת תנוחות מתקדמות דורשת מתח ליבה קיצוני.', moduleId: 'static_skill_strength' },
    { id: 'ss3', name: 'Planche Progression Block', nameHe: 'בלוק התקדמות פלאנש', why: 'Structured micro-progressions through planche tiers.', whyHe: 'התקדמות מובנית דרך שכבות פלאנש.', moduleId: 'static_skill_strength' },
  ],
  explosive_power: [
    { id: 'ep1', name: 'Posterior Chain Development', nameHe: 'פיתוח שרשרת אחורית', why: 'Glutes and hamstrings drive explosive hip extension.', whyHe: 'ישבנים ואחורי ירך מניעים הארכת מפרק ירך נפיצה.', moduleId: 'explosive_power' },
    { id: 'ep2', name: 'Reactive Plyometrics', nameHe: 'פליאומטריקה ריאקטיבית', why: 'Develop stretch-shortening cycle for vertical power.', whyHe: 'פיתוח מחזור קיצור-מתיחה לכוח אנכי.', moduleId: 'explosive_power' },
    { id: 'ep3', name: 'Sprint Mechanics', nameHe: 'מכניקת ספרינט', why: 'Technical improvements in acceleration mechanics.', whyHe: 'שיפורים טכניים במכניקת האצה.', moduleId: 'explosive_power' },
  ],
  structural_strength: [
    { id: 'st1', name: 'Grip & Hang Endurance', nameHe: 'סיבולת אחיזה ותלייה', why: 'Grip strength is a key limiter for functional capacity.', whyHe: 'כוח אחיזה הוא מגביל מפתח ליכולת תפקודית.', moduleId: 'structural_strength' },
    { id: 'st2', name: 'Anti-Rotation Stability', nameHe: 'יציבות אנטי-סיבוב', why: 'Lateral core stability protects spine under load.', whyHe: 'יציבות ליבה צדדית מגנה על עמוד השדרה תחת עומס.', moduleId: 'structural_strength' },
    { id: 'st3', name: 'Deep Squat Mobility', nameHe: 'ניידות סקוואט עמוק', why: 'Full-range squat holds reveal ankle/hip mobility limits.', whyHe: 'החזקת סקוואט עמוק חושפת מגבלות ניידות.', moduleId: 'structural_strength' },
  ],
};

export function generateLevers(scores: ModuleScore[]): PowerLever[] {
  const levers: PowerLever[] = [];

  // Sort modules by score ascending (weakest first) to prioritize
  const sorted = [...scores].filter(s => s.score >= 0).sort((a, b) => a.score - b.score);

  for (const ms of sorted) {
    const bank = LEVER_BANK[ms.moduleId] ?? [];
    for (const lever of bank) {
      if (levers.length >= 3) break;
      if (!levers.find(l => l.id === lever.id)) {
        levers.push(lever);
      }
    }
    if (levers.length >= 3) break;
  }

  return levers.slice(0, 3);
}

/* ─── Build full assessment ─── */

export function buildPowerAssessment(
  selectedModules: PowerModuleId[],
  moduleScores: ModuleScore[],
): PowerAssessment {
  const scoreMap: Record<string, ModuleScore> = {};
  for (const ms of moduleScores) {
    scoreMap[ms.moduleId] = ms;
  }

  const validScores = moduleScores.filter(s => s.score >= 0);
  const powerIndex = validScores.length > 0
    ? Math.round(validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length)
    : -1;

  return {
    selectedModules,
    moduleScores: scoreMap,
    powerIndex,
    findings: generateFindings(moduleScores),
    levers: generateLevers(moduleScores),
    assessedAt: new Date().toISOString(),
  };
}

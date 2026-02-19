/**
 * Visual DNA Builder — maps ALL onboarding intake variables to visual orb parameters.
 * Uses deterministic seeding (no Math.random).
 */

import { seedFloat, seedInt } from './orbSeed';
import type {
  OrbProfile,
  GradientMode,
  MaterialType,
  PatternType,
  ParticleBehavior,
  ParticleMode,
  MaterialParams,
} from '@/components/orb/types';

export interface VisualDNAInput {
  step1Intention?: Record<string, unknown> | null;
  step2ProfileData?: Record<string, unknown> | null;
  summaryRow?: {
    clarity_score?: number | null;
    consciousness_score?: number | null;
    transformation_readiness?: number | null;
    summary_data?: Record<string, unknown> | null;
  } | null;
  gameState?: {
    level?: number;
    sessionStreak?: number;
    experience?: number;
  } | null;
  seed: number;
}

// Helpers
function get<T>(obj: Record<string, unknown> | null | undefined, key: string, fallback: T): T {
  if (!obj || obj[key] === undefined || obj[key] === null) return fallback;
  return obj[key] as T;
}

function getArr(obj: Record<string, unknown> | null | undefined, key: string): string[] {
  if (!obj) return [];
  const v = obj[key];
  return Array.isArray(v) ? v : [];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Shift HSL hue */
function shiftHue(hsl: string, degrees: number): string {
  const m = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!m) return hsl;
  return `${(parseInt(m[1]) + degrees + 360) % 360} ${m[2]}% ${m[3]}%`;
}

function makeHSL(h: number, s: number, l: number): string {
  // Guard against NaN from undefined/null arithmetic
  if (isNaN(h)) h = 200;
  if (isNaN(s)) s = 70;
  if (isNaN(l)) l = 50;
  return `${Math.round(((h % 360) + 360) % 360)} ${Math.round(clamp(s, 0, 100))}% ${Math.round(clamp(l, 0, 100))}%`;
}

/**
 * Build a Partial<OrbProfile> from ALL intake signals.
 * The caller merges this over the archetype-based defaults.
 */
export function buildVisualDNA(input: VisualDNAInput): Partial<OrbProfile> {
  const { step1Intention, step2ProfileData, summaryRow, gameState, seed } = input;
  const s1 = step1Intention || {};
  const s2 = step2ProfileData || {};

  // --- Read all intake fields ---
  const pressureZone = get<string>(s1, 'pressure_zone', '');
  const functionalSignals = getArr(s1, 'functional_signals');
  const urgencyScale = get<number>(s1, 'urgency_scale', 5);
  const restructureWillingness = get<number>(s1, 'restructure_willingness', 5);
  const executionPattern = get<string>(s1, 'execution_pattern', '');
  const motivationDriver = get<string>(s1, 'motivation_driver', '');
  const failureMoment = get<string>(s1, 'failure_moment', '');

  const sleepQuality = get<number>(s2, 'sleep_quality', 3);
  const screenBeforeBed = get<string>(s2, 'screen_before_bed', 'no');
  const dailyScreenTime = get<number>(s2, 'daily_screen_time', 4);
  const shortsReels = get<string>(s2, 'shorts_reels', 'sometimes');
  const pornFrequency = get<string>(s2, 'porn_frequency', 'never');
  const activityLevel = get<string>(s2, 'activity_level', 'moderate');
  const bodyFatEstimate = get<string>(s2, 'body_fat_estimate', 'average');
  const sunlightAfterWaking = get<string>(s2, 'sunlight_after_waking', 'no');
  const coldExposure = get<string>(s2, 'cold_exposure', 'no');
  const caffeineIntake = get<number>(s2, 'caffeine_intake', 2);
  const alcoholFrequency = get<string>(s2, 'alcohol_frequency', 'rarely');
  const weedThc = get<string>(s2, 'weed_thc', 'never');
  const stressDefaultBehavior = getArr(s2, 'stress_default_behavior');
  const frictionTrigger = get<string>(s2, 'friction_trigger', '');
  const ageBracket = get<string>(s2, 'age_bracket', '25-34');
  const gender = get<string>(s2, 'gender', '');
  const dependents = getArr(s2, 'dependents');
  const relationshipStatus = get<string>(s2, 'relationship_status', '');
  const activeWorkHours = get<number>(s2, 'active_work_hours', 8);
  const energyPeakTime = get<string>(s2, 'energy_peak_time', 'morning');

  const level = gameState?.level || 1;
  const streak = gameState?.sessionStreak || 0;
  const clarityScore = summaryRow?.clarity_score || 0;
  const consciousnessScore = summaryRow?.consciousness_score || 0;
  const transformationReadiness = summaryRow?.transformation_readiness || 0;

  // === DOPAMINE LOAD composite score (0-1) ===
  const screenScore = clamp(dailyScreenTime / 10, 0, 1);
  const reelsScore = shortsReels === 'always' ? 0.9 : shortsReels === 'often' ? 0.7 : shortsReels === 'sometimes' ? 0.4 : 0.1;
  const pornScore = pornFrequency === 'daily' ? 0.9 : pornFrequency === 'weekly' ? 0.6 : pornFrequency === 'monthly' ? 0.3 : 0;
  const dopamineLoad = clamp((screenScore + reelsScore + pornScore) / 3, 0, 1);

  // === MATERIAL TYPE ===
  let materialType: MaterialType = 'glass';
  if (motivationDriver === 'status') materialType = 'metal';
  else if (motivationDriver === 'freedom') materialType = 'plasma';
  else if (motivationDriver === 'identity_upgrade') materialType = 'iridescent';
  else if (motivationDriver === 'stability') materialType = 'glass';
  else {
    // Seed-driven fallback
    const mats: MaterialType[] = ['metal', 'glass', 'plasma', 'iridescent'];
    materialType = mats[seedInt(seed, 20, 0, mats.length - 1)];
  }
  // Sleep quality override: low sleep → wire/matte
  if (sleepQuality <= 2 && materialType === 'iridescent') materialType = 'metal';
  if (sleepQuality >= 4 && materialType === 'wire') materialType = 'glass';

  // === PATTERN TYPE ===
  let patternType: PatternType = 'fractal';
  if (pressureZone === 'cognitive_overload') patternType = 'shards';
  else if (pressureZone === 'energy_instability') patternType = 'cellular';
  else if (pressureZone === 'direction_fog' || pressureZone === 'direction_confusion') patternType = 'swirl';
  else if (pressureZone === 'lack_of_structure') patternType = 'strata';
  else if (coldExposure === 'yes') patternType = 'shards';
  else if (stressDefaultBehavior.includes('eat')) patternType = 'cellular';
  else {
    const pats: PatternType[] = ['voronoi', 'cellular', 'fractal', 'shards', 'swirl', 'strata'];
    patternType = pats[seedInt(seed, 21, 0, pats.length - 1)];
  }

  // === PATTERN INTENSITY ===
  const patternIntensity = clamp(0.3 + dopamineLoad * 0.3 + seedFloat(seed, 22) * 0.2, 0.15, 0.85);

  // === GRADIENT MODE ===
  let gradientMode: GradientMode = 'vertical';
  if (materialType === 'plasma') gradientMode = 'noise';
  else if (materialType === 'iridescent') gradientMode = 'rim';
  else if (patternType === 'swirl' || patternType === 'cellular') gradientMode = 'radial';
  else {
    const modes: GradientMode[] = ['vertical', 'radial', 'noise', 'rim'];
    gradientMode = modes[seedInt(seed, 23, 0, modes.length - 1)];
  }

  // === GRADIENT STOPS (3-7 colors) ===
  const stopCount = clamp(3 + Math.floor(restructureWillingness / 3) + (level > 5 ? 1 : 0), 3, 7);
  const baseHue = (seed % 360);
  const hueSpread = 30 + dopamineLoad * 60 + seedFloat(seed, 24) * 30; // 30-120° spread
  const baseSat = 60 + (sleepQuality / 5) * 25 + seedFloat(seed, 25) * 10;
  const baseLit = 35 + (1 - dopamineLoad) * 15 + seedFloat(seed, 26) * 10;

  // Temperature bias from gender/sunlight
  const warmBias = (sunlightAfterWaking === 'yes' ? 15 : -10) + (gender === 'male' ? 5 : gender === 'female' ? -5 : 0);

  const gradientStops: string[] = [];
  for (let i = 0; i < stopCount; i++) {
    const t = i / (stopCount - 1);
    const hue = (baseHue + warmBias + t * hueSpread + seedFloat(seed, 30 + i) * 20) % 360;
    const sat = clamp(baseSat + (t - 0.5) * 20 + seedFloat(seed, 40 + i) * 15, 40, 100);
    const lit = clamp(baseLit + Math.sin(t * Math.PI) * 15 + seedFloat(seed, 50 + i) * 10, 20, 75);
    gradientStops.push(makeHSL(hue, sat, lit));
  }

  // Core gradient = first and last stops
  const coreGradient: [string, string] = [gradientStops[0], gradientStops[gradientStops.length - 1]];

  // === RIM LIGHT COLOR ===
  let rimHue = baseHue + 180; // complementary
  if (sunlightAfterWaking === 'yes') rimHue = 40 + seedFloat(seed, 60) * 20; // warm gold
  else rimHue = 190 + seedFloat(seed, 60) * 30; // cool cyan
  const rimLightColor = makeHSL(rimHue, 70 + seedFloat(seed, 61) * 20, 60 + urgencyScale * 2);

  // === MATERIAL PARAMS ===
  const materialParams: MaterialParams = {
    metalness: materialType === 'metal' ? 0.8 + seedFloat(seed, 70) * 0.15 : materialType === 'iridescent' ? 0.5 : 0.1,
    roughness: clamp(0.3 + (5 - sleepQuality) * 0.1 + seedFloat(seed, 71) * 0.15, 0.1, 0.9),
    clearcoat: coldExposure === 'yes' ? 0.8 : materialType === 'glass' ? 0.6 : 0.2,
    transmission: materialType === 'glass' ? 0.4 + seedFloat(seed, 72) * 0.3 : 0,
    ior: materialType === 'glass' ? 1.3 + seedFloat(seed, 73) * 0.3 : 1.5,
    emissiveIntensity: clamp(0.2 + urgencyScale * 0.06 + dopamineLoad * 0.2, 0.1, 0.9),
  };

  // === PARTICLE BEHAVIOR ===
  let particleBehavior: ParticleBehavior = 'orbit';
  if (executionPattern === 'start_and_quit') particleBehavior = 'burst';
  else if (executionPattern === 'overplan_and_delay') particleBehavior = 'orbit';
  else if (executionPattern === 'burn_out_quickly') particleBehavior = 'burst';
  else if (executionPattern === 'consistent_but_plateaued') particleBehavior = 'spiral';
  else if (dopamineLoad > 0.6) particleBehavior = 'halo';
  else if (stressDefaultBehavior.includes('isolate')) particleBehavior = 'drift';
  else {
    const behs: ParticleBehavior[] = ['orbit', 'spiral', 'halo', 'burst', 'drift'];
    particleBehavior = behs[seedInt(seed, 80, 0, behs.length - 1)];
  }

  // === PARTICLE MODE ===
  let particleMode: ParticleMode = 'cycle';
  if (dopamineLoad > 0.7) particleMode = 'random';
  else if (materialType === 'iridescent') particleMode = 'byVelocity';
  else if (activityLevel === 'high' || activityLevel === 'very_high') particleMode = 'byRadius';
  else {
    const pmodes: ParticleMode[] = ['single', 'cycle', 'random', 'byVelocity', 'byRadius'];
    particleMode = pmodes[seedInt(seed, 81, 0, pmodes.length - 1)];
  }

  // === PARTICLE PALETTE (3-5 colors) ===
  const palCount = clamp(3 + (dopamineLoad > 0.5 ? 1 : 0) + (level > 8 ? 1 : 0), 3, 5);
  const particlePalette: string[] = [];
  for (let i = 0; i < palCount; i++) {
    const hue = (baseHue + i * (360 / palCount) + seedFloat(seed, 90 + i) * 30) % 360;
    const sat = dopamineLoad > 0.6 ? 85 + seedFloat(seed, 95 + i) * 15 : 60 + seedFloat(seed, 95 + i) * 25;
    const lit = 50 + seedFloat(seed, 100 + i) * 20;
    particlePalette.push(makeHSL(hue, sat, lit));
  }

  // === BLOOM STRENGTH ===
  let bloomStrength = 0.3 + dopamineLoad * 0.4 + seedFloat(seed, 110) * 0.2;
  if (executionPattern === 'burn_out_quickly') bloomStrength = clamp(bloomStrength + 0.3, 0, 1.5);
  if (sleepQuality <= 2) bloomStrength = clamp(bloomStrength - 0.2, 0, 1.5);
  bloomStrength = clamp(bloomStrength, 0.1, 1.3);

  // === CHROMA SHIFT ===
  let chromaShift = materialType === 'iridescent' ? 0.4 + seedFloat(seed, 111) * 0.3 : 0.05 + seedFloat(seed, 111) * 0.15;
  if (screenBeforeBed === 'yes') chromaShift = clamp(chromaShift + 0.15, 0, 0.8);

  // === DAY/NIGHT BIAS ===
  let dayNightBias = 0.5 + seedFloat(seed, 112) * 0.2;
  if (functionalSignals.includes('afternoon_crash')) dayNightBias -= 0.15;
  if (sleepQuality >= 4) dayNightBias += 0.1;
  dayNightBias = clamp(dayNightBias, 0.15, 0.85);

  // === MOTION MODIFIERS ===
  let motionSpeedMod = 1.0;
  let pulseRateMod = 1.0;
  let morphSpeedMod = 1.0;
  let morphIntensityMod = 0;
  let smoothnessMod = 0;

  // Caffeine -> micro jitter
  if (caffeineIntake >= 3) motionSpeedMod += 0.15;
  // Alcohol/weed -> dreamy, smooth
  if (alcoholFrequency === 'daily' || alcoholFrequency === 'often' || weedThc === 'daily' || weedThc === 'often') {
    smoothnessMod += 0.15;
    morphSpeedMod -= 0.1;
  }
  // Urgency -> faster pulse
  pulseRateMod += (urgencyScale - 5) * 0.06;
  // Activity level -> morph speed
  if (activityLevel === 'high' || activityLevel === 'very_high') morphSpeedMod += 0.15;
  if (activityLevel === 'sedentary') morphSpeedMod -= 0.1;
  // Racing thoughts -> higher noise
  if (functionalSignals.includes('racing_thoughts')) {
    pulseRateMod += 0.2;
    morphIntensityMod += 0.1;
  }
  // Work hours -> constrained motion
  if (activeWorkHours > 10) motionSpeedMod -= 0.1;
  // Body fat
  if (bodyFatEstimate === 'high' || bodyFatEstimate === 'very_high') morphSpeedMod -= 0.1;

  return {
    gradientStops,
    gradientMode,
    coreGradient,
    rimLightColor,
    materialType,
    materialParams,
    patternType,
    patternIntensity,
    particlePalette,
    particleMode,
    particleBehavior,
    bloomStrength,
    chromaShift,
    dayNightBias,
    // Motion modifiers (applied as multipliers/additions by caller)
    motionSpeed: clamp(motionSpeedMod, 0.5, 2.2),
    pulseRate: clamp(pulseRateMod, 0.4, 2.8),
    morphSpeed: clamp(morphSpeedMod, 0.4, 1.8),
    morphIntensity: clamp(0.3 + morphIntensityMod, 0.15, 0.95),
    smoothness: clamp(0.5 + smoothnessMod, 0.2, 0.95),
  };
}

/**
 * Generate "why you got this look" explanatory bullets.
 * Supports bilingual output (en/he).
 */
export function getVisualDNAExplanations(input: VisualDNAInput, lang: 'en' | 'he' = 'en'): string[] {
  const { step1Intention, step2ProfileData } = input;
  const s1 = step1Intention || {};
  const s2 = step2ProfileData || {};
  const explanations: string[] = [];
  const isHe = lang === 'he';

  const push = (en: string, he: string) => explanations.push(isHe ? he : en);

  const motivationDriver = get<string>(s1, 'motivation_driver', '');
  if (motivationDriver === 'status') push('Status-driven → metallic, high specular material', 'מוטיבציה מסטטוס → חומר מתכתי, ספקולרי גבוה');
  else if (motivationDriver === 'freedom') push('Freedom-driven → flowing plasma material', 'מוטיבציה מחופש → חומר פלזמה זורם');
  else if (motivationDriver === 'identity_upgrade') push('Identity upgrade → iridescent, chromatic shift', 'שדרוג זהות → אירידסנטי, הסטת צבע');

  const pressureZone = get<string>(s1, 'pressure_zone', '');
  if (pressureZone === 'cognitive_overload') push('Cognitive overload → sharp shard patterns', 'עומס קוגניטיבי → דפוסי שברים חדים');
  else if (pressureZone === 'direction_fog' || pressureZone === 'direction_confusion') push('Direction fog → swirl pattern', 'ערפל כיוון → דפוס מערבולת');

  const sleepQuality = get<number>(s2, 'sleep_quality', 3);
  if (sleepQuality <= 2) push('Low sleep quality → higher roughness, reduced bloom', 'שינה נמוכה → מרקם גס יותר, פחות זוהר');
  else if (sleepQuality >= 4) push('High sleep quality → smoother, glass-like surface', 'שינה טובה → חלק יותר, משטח זכוכיתי');

  const dopamineLoad = clamp((get<number>(s2, 'daily_screen_time', 4) / 10 + 
    (get<string>(s2, 'shorts_reels', '') === 'always' ? 0.9 : 0.3)) / 2, 0, 1);
  if (dopamineLoad > 0.6) push('High dopamine load → neon palette, stronger bloom', 'עומס דופמין גבוה → פלטת ניאון, זוהר חזק');

  const sunlight = get<string>(s2, 'sunlight_after_waking', 'no');
  if (sunlight === 'yes') push('Morning sunlight → warm gold rim light', 'שמש בוקר → אור שוליים זהוב חם');
  else push('No morning sunlight → cool cyan rim light', 'ללא שמש בוקר → אור שוליים ציאן קר');

  const coldExposure = get<string>(s2, 'cold_exposure', 'no');
  if (coldExposure === 'yes') push('Cold exposure → crystalline pattern, higher clearcoat', 'חשיפה לקור → דפוס קריסטלי, ציפוי שקוף גבוה');

  const restructure = get<number>(s1, 'restructure_willingness', 5);
  if (restructure >= 7) push('High restructure willingness → more gradient stops, richer material', 'מוכנות גבוהה לשינוי → יותר עצירות גרדיאנט, חומר עשיר');
  
  const urgency = get<number>(s1, 'urgency_scale', 5);
  if (urgency >= 7) push('High urgency → faster pulse, brighter emissive', 'דחיפות גבוהה → פעימה מהירה, זוהר בהיר');

  return explanations;
}

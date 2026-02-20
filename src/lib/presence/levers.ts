/**
 * @module lib/presence/levers
 * @purpose Fix library for the Presence bio-scan — selectable interventions, tiered.
 */

import type { FixItem } from './types';

export const FIX_LIBRARY: FixItem[] = [
  // ── Tier 1 — High Impact ──
  {
    id: 'body_fat_lever',
    name: 'Body Fat Reduction Lever',
    why: 'Reveals facial structure and muscle definition as an appearance lever',
    difficulty: 'hard',
    impact: 'high',
    category: 'body',
    tier: 1,
  },
  {
    id: 'chin_tuck_drills',
    name: 'Neck Alignment (Chin Tuck / Wall Drill)',
    why: 'Corrects forward head posture, enhances jawline projection',
    difficulty: 'easy',
    impact: 'high',
    category: 'posture',
    tier: 1,
  },
  {
    id: 'tongue_posture',
    name: 'Tongue Posture (Mewing Fundamentals)',
    why: 'Posture/airway habit that may improve jaw appearance over time',
    difficulty: 'easy',
    impact: 'med',
    category: 'face',
    tier: 1,
  },
  {
    id: 'resistance_training',
    name: 'Resistance Training for Frame (Shoulders/Back)',
    why: 'Builds visible frame and posture support structure',
    difficulty: 'medium',
    impact: 'high',
    category: 'frame',
    tier: 1,
  },
  {
    id: 'sleep_depuff',
    name: 'Sleep Regularization + De-Puff Protocol',
    why: 'Reduces facial puffiness, improves skin quality and recovery',
    difficulty: 'easy',
    impact: 'med',
    category: 'recovery',
    tier: 1,
  },
  {
    id: 'walking_neat',
    name: 'Daily Walking Baseline (NEAT)',
    why: 'Supports body composition without high effort',
    difficulty: 'easy',
    impact: 'med',
    category: 'body',
    tier: 1,
  },
  // ── Tier 2 — Refinement ──
  {
    id: 'grooming_optimization',
    name: 'Grooming Refinement',
    why: 'Quick symmetry and definition improvement',
    difficulty: 'easy',
    impact: 'med',
    category: 'grooming',
    tier: 2,
  },
  {
    id: 'beard_shaping',
    name: 'Beard Shaping',
    why: 'Enhances jawline definition and facial symmetry through strategic grooming',
    difficulty: 'easy',
    impact: 'med',
    category: 'grooming',
    tier: 2,
  },
  {
    id: 'hair_optimization',
    name: 'Hair Optimization',
    why: 'Improves face framing and overall proportional balance',
    difficulty: 'easy',
    impact: 'med',
    category: 'grooming',
    tier: 2,
  },
  // ── Tier 3 — Optional ──
  {
    id: 'skincare_baseline',
    name: 'Skin Protocol (Cleanser + Moisturizer + SPF)',
    why: 'Foundation of skin health — prioritize if texture or acne visible',
    difficulty: 'easy',
    impact: 'med',
    category: 'skin',
    tier: 3,
  },
];

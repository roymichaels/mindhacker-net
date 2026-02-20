/**
 * @module lib/presence/levers
 * @purpose Fix library for the Presence bio-scan — selectable interventions.
 */

import type { FixItem } from './types';

export const FIX_LIBRARY: FixItem[] = [
  {
    id: 'tongue_posture',
    name: 'Tongue Posture (Mewing Fundamentals)',
    why: 'Posture/airway habit that may improve jaw appearance over time',
    difficulty: 'easy',
    impact: 'med',
    category: 'face',
  },
  {
    id: 'nasal_breathing',
    name: 'Nasal Breathing Practice',
    why: 'Improves oxygen efficiency, reduces facial puffiness',
    difficulty: 'easy',
    impact: 'med',
    category: 'face',
  },
  {
    id: 'chin_tuck_drills',
    name: 'Neck Alignment (Chin Tuck / Wall Drill)',
    why: 'Corrects forward head posture, enhances jawline projection',
    difficulty: 'easy',
    impact: 'high',
    category: 'posture',
  },
  {
    id: 'posture_reset',
    name: 'Posture Reset Routine (Upper Back Mobility)',
    why: 'Opens chest, fixes rounded shoulders, improves frame',
    difficulty: 'easy',
    impact: 'high',
    category: 'posture',
  },
  {
    id: 'body_fat_lever',
    name: 'Body Fat Reduction Lever',
    why: 'Reveals facial structure and muscle definition as an appearance lever',
    difficulty: 'hard',
    impact: 'high',
    category: 'body',
  },
  {
    id: 'skincare_baseline',
    name: 'Skincare Baseline (Cleanser + Moisturizer + SPF)',
    why: 'Foundation of skin health and appearance',
    difficulty: 'easy',
    impact: 'med',
    category: 'skin',
  },
  {
    id: 'grooming_optimization',
    name: 'Grooming Optimization (Beard/Eyebrow/Hair)',
    why: 'Quick symmetry and definition improvement',
    difficulty: 'easy',
    impact: 'med',
    category: 'grooming',
  },
  {
    id: 'sleep_depuff',
    name: 'Sleep + De-Puff Protocol',
    why: 'Reduces facial puffiness, improves skin quality',
    difficulty: 'easy',
    impact: 'med',
    category: 'recovery',
  },
  {
    id: 'hydration_sodium',
    name: 'Hydration + Sodium Awareness',
    why: 'Controls water retention affecting facial definition',
    difficulty: 'easy',
    impact: 'low',
    category: 'recovery',
  },
  {
    id: 'resistance_training',
    name: 'Resistance Training for Frame (Shoulders/Back)',
    why: 'Builds visible frame and posture support structure',
    difficulty: 'medium',
    impact: 'high',
    category: 'body',
  },
  {
    id: 'walking_neat',
    name: 'Walking / NEAT Baseline',
    why: 'Supports body composition without high effort',
    difficulty: 'easy',
    impact: 'low',
    category: 'body',
  },
];

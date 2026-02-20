/**
 * @module lib/presence/levers
 * @purpose Full structured intervention library for the Presence Coach Engine.
 */

export type LeverCategory =
  | 'face_structure'
  | 'posture_frame'
  | 'body_composition'
  | 'skin_protocol'
  | 'hair_grooming'
  | 'style_clothing'
  | 'dental_smile'
  | 'sleep_recovery';

export interface Lever {
  id: string;
  title: string;
  category: LeverCategory;
  timeCost: string;
  frequency: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedImpactTime: string;
  instructions: string[];
  contraindications?: string[];
  routineBlock?: 'morning' | 'daytime' | 'evening';
  routineDuration?: number; // minutes
}

export const LEVERS: Lever[] = [
  // ── A) Face Structure / Jawline ──
  {
    id: 'tongue_posture',
    title: 'Tongue Posture (Mewing Fundamentals)',
    category: 'face_structure',
    timeCost: '0 min (habit)',
    frequency: 'All day',
    difficulty: 'easy',
    expectedImpactTime: '3-6 months',
    instructions: [
      'Rest entire tongue flat against roof of mouth',
      'Keep lips gently sealed',
      'Breathe through nose only',
      'Set hourly reminders initially',
    ],
    contraindications: ['TMJ pain — reduce intensity', 'Not guaranteed bone change; presented as posture/airway habit'],
    routineBlock: 'daytime',
    routineDuration: 0,
  },
  {
    id: 'nasal_breathing',
    title: 'Nasal Breathing Habit',
    category: 'face_structure',
    timeCost: '0 min (habit)',
    frequency: 'All day + night',
    difficulty: 'easy',
    expectedImpactTime: '2-4 weeks',
    instructions: [
      'Consciously breathe through nose during day',
      'Tape mouth at night ONLY if safe and comfortable (not for minors)',
      'If persistent difficulty, consult a professional',
    ],
    contraindications: ['Nasal obstruction — see ENT first', 'Not for minors without medical guidance'],
    routineBlock: 'daytime',
    routineDuration: 0,
  },
  {
    id: 'chewing_protocol',
    title: 'Chewing Protocol (Safe)',
    category: 'face_structure',
    timeCost: '10-15 min',
    frequency: '3-5x/week',
    difficulty: 'easy',
    expectedImpactTime: '2-3 months',
    instructions: [
      'Use sugar-free gum (e.g. mastic gum)',
      'Chew evenly on both sides',
      'Start with 10 min, gradually increase to 15',
      'Stop immediately if TMJ pain occurs',
    ],
    contraindications: ['TMJ disorders', 'Recent dental work'],
    routineBlock: 'daytime',
    routineDuration: 10,
  },
  {
    id: 'chin_tuck_drills',
    title: 'Neck Posture / Chin Tuck Drills',
    category: 'face_structure',
    timeCost: '3 min',
    frequency: 'Daily',
    difficulty: 'easy',
    expectedImpactTime: '2-4 weeks',
    instructions: [
      'Stand against wall, tuck chin back creating double chin',
      'Hold 5 seconds, release. Repeat 10x',
      'Strengthens deep neck flexors',
      'Reduces forward head posture to enhance jawline appearance',
    ],
    routineBlock: 'morning',
    routineDuration: 3,
  },
  {
    id: 'facial_depuff',
    title: 'Facial De-Puff Protocol',
    category: 'face_structure',
    timeCost: '5 min',
    frequency: 'Daily (morning)',
    difficulty: 'easy',
    expectedImpactTime: '1-2 weeks',
    instructions: [
      'Cold water face splash or ice roller for 2 min',
      'Reduce sodium intake after 6pm',
      'Minimize alcohol consumption',
      'Ensure 7+ hours sleep',
      'Stay hydrated (2-3L/day)',
    ],
    routineBlock: 'morning',
    routineDuration: 5,
  },
  {
    id: 'beard_strategy',
    title: 'Beard Strategy (Jawline Enhancement)',
    category: 'face_structure',
    timeCost: '5 min',
    frequency: 'Weekly trim',
    difficulty: 'easy',
    expectedImpactTime: '1-2 weeks',
    instructions: [
      'Define neckline: two fingers above Adam\'s apple',
      'Fade cheek line for cleaner appearance',
      'Shape to enhance jaw angle',
      'Keep edges symmetrical',
    ],
    routineBlock: 'morning',
    routineDuration: 5,
  },
  {
    id: 'grooming_symmetry',
    title: 'Grooming Symmetry Hacks',
    category: 'face_structure',
    timeCost: '3 min',
    frequency: 'Weekly',
    difficulty: 'easy',
    expectedImpactTime: 'Immediate',
    instructions: [
      'Tidy eyebrows (remove strays, maintain shape)',
      'Keep facial hair edges clean and symmetrical',
      'Align haircut line with face shape',
    ],
    routineBlock: 'morning',
    routineDuration: 3,
  },

  // ── B) Posture & Frame ──
  {
    id: 'forward_head_correction',
    title: 'Forward Head Posture Correction',
    category: 'posture_frame',
    timeCost: '5 min',
    frequency: 'Daily',
    difficulty: 'easy',
    expectedImpactTime: '2-4 weeks',
    instructions: [
      'Chin tucks: 3 sets of 10 reps',
      'Wall angels: 2 sets of 10 reps',
      'Thoracic extensions over foam roller: 2 min',
    ],
    routineBlock: 'morning',
    routineDuration: 5,
  },
  {
    id: 'rounded_shoulders_fix',
    title: 'Rounded Shoulders Fix',
    category: 'posture_frame',
    timeCost: '5 min',
    frequency: 'Daily',
    difficulty: 'easy',
    expectedImpactTime: '3-6 weeks',
    instructions: [
      'Band pull-aparts: 3 sets of 15',
      'Doorway chest stretch: 30s each side',
      'Scapular retraction holds: 3x10s',
    ],
    routineBlock: 'morning',
    routineDuration: 5,
  },
  {
    id: 'pelvic_alignment',
    title: 'Pelvic Alignment Basics',
    category: 'posture_frame',
    timeCost: '5 min',
    frequency: 'Daily',
    difficulty: 'medium',
    expectedImpactTime: '4-8 weeks',
    instructions: [
      'Glute bridges: 3 sets of 12',
      'Hip flexor stretch (kneeling lunge): 30s each side',
      'Dead bugs: 2 sets of 10',
    ],
    routineBlock: 'evening',
    routineDuration: 5,
  },
  {
    id: 'presence_stance',
    title: 'Presence Stance Drill',
    category: 'posture_frame',
    timeCost: '30 sec',
    frequency: 'Multiple daily',
    difficulty: 'easy',
    expectedImpactTime: '1-2 weeks',
    instructions: [
      'Feet shoulder-width, weight balanced',
      'Ribs stacked over pelvis',
      'Shoulders back and down',
      'Crown of head reaching upward',
      'Hold 30 seconds, reset hourly',
    ],
    routineBlock: 'daytime',
    routineDuration: 1,
  },
  {
    id: 'desk_ergonomics',
    title: 'Desk Ergonomics Quick Setup',
    category: 'posture_frame',
    timeCost: '10 min (one-time)',
    frequency: 'One-time setup',
    difficulty: 'easy',
    expectedImpactTime: '1-2 weeks',
    instructions: [
      'Monitor at eye level, arm\'s length away',
      'Elbows at 90° when typing',
      'Feet flat on floor or footrest',
      'Take a 30-second posture break every 30 min',
    ],
  },

  // ── C) Body Composition ──
  {
    id: 'body_fat_target',
    title: 'Body Fat Target & Tracking',
    category: 'body_composition',
    timeCost: '5 min/week',
    frequency: 'Weekly',
    difficulty: 'medium',
    expectedImpactTime: '4-12 weeks',
    instructions: [
      'Determine target body fat range (non-shaming)',
      'Track waist measurement weekly (same time, same conditions)',
      'Track weight trend (7-day average, not daily fluctuations)',
      'Take optional progress photos monthly',
    ],
  },
  {
    id: 'leaning_protocol',
    title: 'Leaning Protocol',
    category: 'body_composition',
    timeCost: 'Ongoing',
    frequency: 'Daily habits',
    difficulty: 'hard',
    expectedImpactTime: '8-16 weeks',
    instructions: [
      'Create modest caloric deficit (300-500 cal)',
      'Protein target: 1.6-2.2g per kg bodyweight',
      'Maintain step count (8,000-10,000/day)',
      'Resistance training 3-4x/week minimum',
    ],
  },
  {
    id: 'muscle_building_basics',
    title: 'Muscle Building Basics',
    category: 'body_composition',
    timeCost: '45-60 min',
    frequency: '3-4x/week',
    difficulty: 'medium',
    expectedImpactTime: '8-16 weeks',
    instructions: [
      'Compound movements: squat, bench, row, overhead press, deadlift',
      'Progressive overload: add weight or reps weekly',
      'Adequate protein intake',
      'Prioritize shoulders, chest, back for visual frame',
    ],
  },
  {
    id: 'weekly_measurement',
    title: 'Weekly Measurement Routine',
    category: 'body_composition',
    timeCost: '3 min',
    frequency: 'Weekly',
    difficulty: 'easy',
    expectedImpactTime: 'Ongoing tracking',
    instructions: [
      'Measure waist at navel, morning before eating',
      'Weigh yourself same time each day, track 7-day average',
      'Optional: progress photos (front, side) monthly',
    ],
    routineBlock: 'morning',
    routineDuration: 3,
  },

  // ── D) Skin Protocol ──
  {
    id: 'skincare_basics',
    title: 'Cleanser / Moisturizer / SPF',
    category: 'skin_protocol',
    timeCost: '3 min',
    frequency: 'Twice daily',
    difficulty: 'easy',
    expectedImpactTime: '2-4 weeks',
    instructions: [
      'Morning: gentle cleanser → moisturizer → SPF 30+',
      'Evening: cleanser → moisturizer (heavier)',
      'Pat dry, don\'t rub',
      'Consistency > expensive products',
    ],
    routineBlock: 'morning',
    routineDuration: 3,
  },
  {
    id: 'acne_routine',
    title: 'Acne-Prone Routine',
    category: 'skin_protocol',
    timeCost: '5 min',
    frequency: 'Twice daily',
    difficulty: 'medium',
    expectedImpactTime: '4-8 weeks',
    instructions: [
      'Use gentle, non-comedogenic cleanser',
      'Apply benzoyl peroxide OR salicylic acid (not both)',
      'Moisturize even oily skin',
      'Change pillowcase 2x/week',
      'If persistent, consult dermatologist',
    ],
    routineBlock: 'evening',
    routineDuration: 5,
  },
  {
    id: 'skin_triggers',
    title: 'Sleep / Hydration / Diet Triggers',
    category: 'skin_protocol',
    timeCost: '0 min (awareness)',
    frequency: 'Daily tracking',
    difficulty: 'easy',
    expectedImpactTime: '2-4 weeks',
    instructions: [
      'Track dairy and sugar intake — common breakout triggers',
      'Aim for 2-3L water daily',
      'Sleep 7-9 hours consistently',
      'Reduce alcohol (dehydrates skin)',
    ],
    routineBlock: 'evening',
    routineDuration: 0,
  },

  // ── E) Hair / Grooming ──
  {
    id: 'haircut_selector',
    title: 'Haircut Selector by Face Shape',
    category: 'hair_grooming',
    timeCost: '15 min (one-time)',
    frequency: 'Every 3-4 weeks',
    difficulty: 'easy',
    expectedImpactTime: 'Immediate',
    instructions: [
      'Identify face shape (oval, round, square, oblong, heart)',
      'Research 2-3 cuts that suit your shape',
      'Show reference photos to barber',
      'Maintain trim schedule every 3-4 weeks',
    ],
  },
  {
    id: 'hairline_styling',
    title: 'Hairline Acceptance vs Enhancement',
    category: 'hair_grooming',
    timeCost: '5 min',
    frequency: 'Daily styling',
    difficulty: 'easy',
    expectedImpactTime: 'Immediate',
    instructions: [
      'If thinning: shorter styles often look better',
      'Use volumizing products for thin hair',
      'Avoid heavy gels that reveal scalp',
      'Consider buzz cut if significantly receded — own it',
    ],
  },
  {
    id: 'beard_mapping',
    title: 'Beard / Mustache Mapping',
    category: 'hair_grooming',
    timeCost: '10 min',
    frequency: 'Weekly maintenance',
    difficulty: 'easy',
    expectedImpactTime: '2-4 weeks',
    instructions: [
      'Map your beard growth pattern',
      'Identify weak spots — work with them, not against',
      'Define clean neckline and cheek line',
      'Use beard oil for health and appearance',
    ],
  },
  {
    id: 'eyebrow_grooming',
    title: 'Eyebrow Grooming Template',
    category: 'hair_grooming',
    timeCost: '3 min',
    frequency: 'Weekly',
    difficulty: 'easy',
    expectedImpactTime: 'Immediate',
    instructions: [
      'Remove only obvious strays between brows',
      'Keep natural shape — don\'t over-pluck',
      'Trim excessively long hairs with small scissors',
      'Brush upward to check for uniformity',
    ],
    routineBlock: 'morning',
    routineDuration: 3,
  },

  // ── F) Style / Clothing ──
  {
    id: 'style_archetype',
    title: 'Style Archetype Selector',
    category: 'style_clothing',
    timeCost: '15 min (one-time)',
    frequency: 'One-time + seasonal review',
    difficulty: 'easy',
    expectedImpactTime: 'Immediate',
    instructions: [
      'Choose primary archetype: Classic, Street, Minimal, Athletic, Formal',
      'Collect 10-15 reference images',
      'Identify 3 signature pieces per archetype',
      'Build outfits around your archetype',
    ],
  },
  {
    id: 'capsule_wardrobe',
    title: 'Capsule Wardrobe Starter',
    category: 'style_clothing',
    timeCost: '1-2 hours (one-time)',
    frequency: 'Seasonal update',
    difficulty: 'medium',
    expectedImpactTime: '1-2 weeks',
    instructions: [
      'Select 15-20 versatile core pieces',
      'Ensure all items mix and match',
      'Invest in quality basics: white tee, dark jeans, neutral jacket',
      'Remove anything that doesn\'t fit properly',
    ],
  },
  {
    id: 'fit_checklist',
    title: 'Fit Checklist',
    category: 'style_clothing',
    timeCost: '2 min per outfit',
    frequency: 'When dressing',
    difficulty: 'easy',
    expectedImpactTime: 'Immediate',
    instructions: [
      'Shoulder seam sits at shoulder bone edge',
      'Sleeves end at wrist bone',
      'Pants break: slight or no break',
      'Shirt doesn\'t billow when tucked',
      'Can insert one fist in waistband (not more)',
    ],
    routineBlock: 'morning',
    routineDuration: 2,
  },
  {
    id: 'color_palette',
    title: 'Color Palette Quick Test',
    category: 'style_clothing',
    timeCost: '10 min (one-time)',
    frequency: 'One-time',
    difficulty: 'easy',
    expectedImpactTime: 'Immediate',
    instructions: [
      'Hold white vs cream fabric near face — which brightens?',
      'Warm: earth tones, olive, gold, rust',
      'Cool: navy, grey, burgundy, silver',
      'Neutral: works with both — lucky you',
      'Build wardrobe around your best palette',
    ],
  },

  // ── G) Dental / Smile ──
  {
    id: 'brushing_flossing',
    title: 'Brushing / Flossing Habit Stack',
    category: 'dental_smile',
    timeCost: '4 min',
    frequency: 'Twice daily',
    difficulty: 'easy',
    expectedImpactTime: '2-4 weeks',
    instructions: [
      'Brush 2 min with fluoride toothpaste, 2x/day',
      'Floss before brushing (evening)',
      'Tongue scraper for breath freshness',
      'Replace toothbrush every 3 months',
    ],
    routineBlock: 'evening',
    routineDuration: 4,
  },
  {
    id: 'whitening_mention',
    title: 'Whitening (Non-Medical)',
    category: 'dental_smile',
    timeCost: '5 min',
    frequency: 'Per product instructions',
    difficulty: 'easy',
    expectedImpactTime: '2-4 weeks',
    instructions: [
      'OTC whitening strips or toothpaste for mild improvement',
      'Avoid excessive use — can cause sensitivity',
      'Consult dentist for professional options',
      'Reduce coffee/tea staining with straw or rinse after',
    ],
  },
  {
    id: 'breath_hygiene',
    title: 'Breath Hygiene Checklist',
    category: 'dental_smile',
    timeCost: '2 min',
    frequency: 'Daily',
    difficulty: 'easy',
    expectedImpactTime: '1 week',
    instructions: [
      'Tongue scraping each morning',
      'Stay hydrated throughout day',
      'Avoid dry mouth — nasal breathing helps',
      'Sugar-free mint or gum after meals',
    ],
    routineBlock: 'morning',
    routineDuration: 2,
  },

  // ── H) Sleep / Recovery ──
  {
    id: 'sleep_window',
    title: 'Sleep Window Consistency',
    category: 'sleep_recovery',
    timeCost: '0 min (scheduling)',
    frequency: 'Daily',
    difficulty: 'medium',
    expectedImpactTime: '1-2 weeks',
    instructions: [
      'Set consistent bedtime ± 30 min',
      'Target 7-9 hours per night',
      'Wind-down routine 30 min before bed',
      'Avoid screens 1 hour before sleep (or use blue-light filter)',
    ],
    routineBlock: 'evening',
    routineDuration: 0,
  },
  {
    id: 'morning_light',
    title: 'Morning Light Exposure',
    category: 'sleep_recovery',
    timeCost: '10 min',
    frequency: 'Daily',
    difficulty: 'easy',
    expectedImpactTime: '1 week',
    instructions: [
      'Get outside within 30 min of waking',
      '10 min of natural sunlight (no sunglasses)',
      'Sets circadian rhythm for better sleep',
      'Even on cloudy days, outdoor light is sufficient',
    ],
    routineBlock: 'morning',
    routineDuration: 10,
  },
  {
    id: 'screen_reduction',
    title: 'Late Screen Reduction',
    category: 'sleep_recovery',
    timeCost: '0 min (avoidance)',
    frequency: 'Daily',
    difficulty: 'medium',
    expectedImpactTime: '1 week',
    instructions: [
      'No screens 60 min before bed',
      'Use blue-light filter after sunset if needed',
      'Replace with reading, stretching, or journaling',
    ],
    routineBlock: 'evening',
    routineDuration: 0,
  },
  {
    id: 'hydration_timing',
    title: 'Hydration & Salt Timing',
    category: 'sleep_recovery',
    timeCost: '0 min (habit)',
    frequency: 'Daily',
    difficulty: 'easy',
    expectedImpactTime: '1-2 weeks',
    instructions: [
      'Front-load water intake — most before 6pm',
      'Reduce sodium after dinner to minimize morning puffiness',
      'Aim for 2-3L total daily intake',
      'Add pinch of salt to morning water for electrolytes',
    ],
    routineBlock: 'morning',
    routineDuration: 0,
  },
];

/** Get levers by category */
export function getLeversByCategory(category: LeverCategory): Lever[] {
  return LEVERS.filter(l => l.category === category);
}

/** Get a single lever by id */
export function getLeverById(id: string): Lever | undefined {
  return LEVERS.find(l => l.id === id);
}

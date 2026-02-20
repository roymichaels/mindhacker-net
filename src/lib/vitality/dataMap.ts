/**
 * Vitality Data Map — STEP 1
 * Maps ACTUAL onboarding stored keys to vitality subsystem categories.
 * Source: src/flows/onboardingFlowSpec.ts (dbPath fields)
 *
 * Every entry verified against the flow spec. No invented keys.
 */

export type VitalityCategory =
  | 'sleep'
  | 'circadian'
  | 'dopamine'
  | 'nutrition'
  | 'hydration'
  | 'training'
  | 'recovery'
  | 'load'
  | 'hormonal_proxy'
  | 'energy_mood'
  | 'stress_recovery';

export type DataType = 'time' | 'band' | 'numeric' | 'boolean' | 'slider' | 'multi_select' | 'single_select' | 'free_text' | 'priority_rank';

export interface VitalityFieldMapping {
  internalKey: string;
  labelKey: string;              // translation key for human label
  category: VitalityCategory;
  dataType: DataType;
  sourceColumn: 'step_1_intention' | 'step_2_profile_data';
}

/**
 * VITALITY DATA MAP
 * Each entry maps directly to a stored onboarding answer key.
 */
export const VITALITY_DATA_MAP: VitalityFieldMapping[] = [
  // ── Sleep ──
  { internalKey: 'sleep_duration_avg',   labelKey: 'vitality.field.sleepDuration',      category: 'sleep',            dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'sleep_quality',        labelKey: 'vitality.field.sleepQuality',       category: 'sleep',            dataType: 'slider',        sourceColumn: 'step_2_profile_data' },
  { internalKey: 'sleep_latency',        labelKey: 'vitality.field.sleepLatency',       category: 'sleep',            dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'wake_during_night',    labelKey: 'vitality.field.nightAwakenings',    category: 'sleep',            dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'snoring',              labelKey: 'vitality.field.snoring',            category: 'sleep',            dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'sleep_apnea_suspect',  labelKey: 'vitality.field.sleepApnea',         category: 'sleep',            dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'sleep_schedule_consistency', labelKey: 'vitality.field.sleepConsistency', category: 'sleep',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'screen_before_bed',    labelKey: 'vitality.field.screenBeforeBed',    category: 'sleep',            dataType: 'single_select', sourceColumn: 'step_2_profile_data' },

  // ── Circadian ──
  { internalKey: 'wake_time',            labelKey: 'vitality.field.wakeTime',           category: 'circadian',        dataType: 'time',          sourceColumn: 'step_2_profile_data' },
  { internalKey: 'sleep_time',           labelKey: 'vitality.field.sleepTime',          category: 'circadian',        dataType: 'time',          sourceColumn: 'step_2_profile_data' },
  { internalKey: 'sunlight_after_waking',labelKey: 'vitality.field.morningSunlight',    category: 'circadian',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'desired_wake_time',    labelKey: 'vitality.field.desiredWakeTime',    category: 'circadian',        dataType: 'time',          sourceColumn: 'step_2_profile_data' },
  { internalKey: 'failure_moment',       labelKey: 'vitality.field.failureWindow',      category: 'circadian',        dataType: 'single_select', sourceColumn: 'step_1_intention' },
  { internalKey: 'energy_peak_time',     labelKey: 'vitality.field.energyPeak',         category: 'circadian',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'energy_crash_time',    labelKey: 'vitality.field.energyCrash',        category: 'circadian',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },

  // ── Energy & Mood ──
  { internalKey: 'avg_energy_level',     labelKey: 'vitality.field.avgEnergy',          category: 'energy_mood',      dataType: 'slider',        sourceColumn: 'step_2_profile_data' },
  { internalKey: 'energy_volatility',    labelKey: 'vitality.field.energyVolatility',   category: 'energy_mood',      dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'baseline_mood',        labelKey: 'vitality.field.baselineMood',       category: 'energy_mood',      dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'anxiety_level',        labelKey: 'vitality.field.anxietyLevel',       category: 'energy_mood',      dataType: 'slider',        sourceColumn: 'step_2_profile_data' },

  // ── Stress & Recovery ──
  { internalKey: 'current_stress',       labelKey: 'vitality.field.currentStress',      category: 'stress_recovery',  dataType: 'slider',        sourceColumn: 'step_2_profile_data' },
  { internalKey: 'relaxation_frequency', labelKey: 'vitality.field.relaxationFreq',     category: 'stress_recovery',  dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'has_hrv_device',       labelKey: 'vitality.field.hrvDevice',          category: 'stress_recovery',  dataType: 'single_select', sourceColumn: 'step_2_profile_data' },

  // ── Dopamine Load ──
  { internalKey: 'daily_screen_time',    labelKey: 'vitality.field.screenTime',         category: 'dopamine',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'shorts_reels',         labelKey: 'vitality.field.shortsReels',        category: 'dopamine',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'gaming',               labelKey: 'vitality.field.gaming',             category: 'dopamine',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'porn_frequency',       labelKey: 'vitality.field.pornFrequency',      category: 'dopamine',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'late_night_scrolling', labelKey: 'vitality.field.lateNightScrolling', category: 'dopamine',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'first_caffeine_timing',labelKey: 'vitality.field.caffeineTiming',     category: 'dopamine',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },

  // ── Nutrition ──
  { internalKey: 'diet_type',            labelKey: 'vitality.field.dietType',           category: 'nutrition',        dataType: 'multi_select',  sourceColumn: 'step_2_profile_data' },
  { internalKey: 'meals_per_day',        labelKey: 'vitality.field.mealsPerDay',        category: 'nutrition',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'protein_estimate',     labelKey: 'vitality.field.proteinEstimate',    category: 'nutrition',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'fiber_veggie_intake',  labelKey: 'vitality.field.fiberVeggie',        category: 'nutrition',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'late_eating_frequency',labelKey: 'vitality.field.lateEating',         category: 'nutrition',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'eating_window',        labelKey: 'vitality.field.eatingWindow',       category: 'nutrition',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'protein_awareness',    labelKey: 'vitality.field.proteinAwareness',   category: 'nutrition',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'nutrition_weak_point', labelKey: 'vitality.field.nutritionWeakPoint', category: 'nutrition',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },

  // ── Hydration ──
  { internalKey: 'daily_fluid_volume',   labelKey: 'vitality.field.fluidVolume',        category: 'hydration',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'fluid_sources',        labelKey: 'vitality.field.fluidSources',       category: 'hydration',        dataType: 'multi_select',  sourceColumn: 'step_2_profile_data' },

  // ── Training / Movement ──
  { internalKey: 'activity_level',       labelKey: 'vitality.field.trainingFrequency',  category: 'training',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'training_window_available', labelKey: 'vitality.field.trainingWindow', category: 'training',        dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'daily_movement_neat',  labelKey: 'vitality.field.dailyNeat',          category: 'training',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },

  // ── Load (Recovery context) ──
  { internalKey: 'active_work_hours',    labelKey: 'vitality.field.workHours',          category: 'load',             dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'availability_hours',   labelKey: 'vitality.field.onCallHours',        category: 'load',             dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'dependents',           labelKey: 'vitality.field.dependents',         category: 'load',             dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'household_responsibility', labelKey: 'vitality.field.householdResp',  category: 'load',             dataType: 'single_select', sourceColumn: 'step_2_profile_data' },

  // ── Substances (cross-category) ──
  { internalKey: 'caffeine_intake',      labelKey: 'vitality.field.caffeineIntake',     category: 'recovery',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'last_caffeine_time',   labelKey: 'vitality.field.lastCaffeineTime',   category: 'recovery',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'alcohol_frequency',    labelKey: 'vitality.field.alcoholFrequency',   category: 'recovery',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'nicotine',             labelKey: 'vitality.field.nicotine',           category: 'recovery',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'weed_thc',             labelKey: 'vitality.field.weedThc',            category: 'recovery',         dataType: 'single_select', sourceColumn: 'step_2_profile_data' },

  // ── Hormonal Proxy ──
  { internalKey: 'body_fat_estimate',    labelKey: 'vitality.field.bodyFatEstimate',    category: 'hormonal_proxy',   dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'age_bracket',          labelKey: 'vitality.field.ageBracket',         category: 'hormonal_proxy',   dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'gender',              labelKey: 'vitality.field.gender',              category: 'hormonal_proxy',   dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'libido_level',        labelKey: 'vitality.field.libido',              category: 'hormonal_proxy',   dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
  { internalKey: 'menstrual_regularity',labelKey: 'vitality.field.menstrualRegularity', category: 'hormonal_proxy',   dataType: 'single_select', sourceColumn: 'step_2_profile_data' },
];

/** Group fields by subsystem for scoring */
export const SUBSYSTEM_FIELDS: Record<string, string[]> = {
  sleep_quality: ['sleep_duration_avg', 'sleep_quality', 'sleep_latency', 'wake_during_night', 'snoring', 'sleep_apnea_suspect', 'sleep_schedule_consistency', 'screen_before_bed'],
  circadian_stability: ['wake_time', 'sleep_time', 'sunlight_after_waking', 'desired_wake_time', 'failure_moment', 'energy_peak_time', 'energy_crash_time'],
  energy_mood: ['avg_energy_level', 'energy_volatility', 'baseline_mood', 'anxiety_level'],
  stress_recovery: ['current_stress', 'relaxation_frequency', 'has_hrv_device'],
  dopamine_load: ['daily_screen_time', 'shorts_reels', 'gaming', 'porn_frequency', 'late_night_scrolling', 'first_caffeine_timing'],
  nutritional_stability: ['diet_type', 'meals_per_day', 'protein_estimate', 'fiber_veggie_intake', 'late_eating_frequency', 'eating_window', 'protein_awareness', 'nutrition_weak_point'],
  hydration_balance: ['daily_fluid_volume', 'fluid_sources'],
  recovery_capacity: ['activity_level', 'training_window_available', 'daily_movement_neat', 'active_work_hours', 'availability_hours', 'dependents', 'household_responsibility', 'caffeine_intake', 'last_caffeine_time', 'alcohol_frequency', 'nicotine', 'weed_thc'],
  hormonal_signal: ['body_fat_estimate', 'age_bracket', 'gender', 'sleep_quality', 'sunlight_after_waking', 'activity_level', 'libido_level', 'menstrual_regularity'],
};

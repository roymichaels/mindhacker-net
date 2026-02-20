/**
 * @module lib/combat/disciplines
 * Data-driven discipline questionnaire definitions.
 * Each discipline has 5-6 questions shown only if selected.
 */
import type { CombatDiscipline } from './types';

export type QuestionType = 'single_select' | 'multi_select' | 'numeric';

export interface DisciplineQuestion {
  id: string;
  labelKey: string;
  type: QuestionType;
  options?: { id: string; labelKey: string }[];
  min?: number;
  max?: number;
}

export interface DisciplineSpec {
  id: CombatDiscipline;
  titleKey: string;
  iconEmoji: string;
  /** Which subsystem(s) this discipline feeds into for scoring */
  subsystems: ('striking_skill' | 'grappling_skill' | 'tactical_awareness')[];
  questions: DisciplineQuestion[];
}

export const DISCIPLINE_SPECS: DisciplineSpec[] = [
  {
    id: 'boxing',
    titleKey: 'combat.disc_sec_boxing',
    iconEmoji: '🥊',
    subsystems: ['striking_skill'],
    questions: [
      {
        id: 'combo_fluency',
        labelKey: 'combat.boxing_q_combo',
        type: 'single_select',
        options: [
          { id: 'fluid', labelKey: 'combat.boxing_opt_fluid' },
          { id: 'moderate', labelKey: 'combat.boxing_opt_moderate' },
          { id: 'basic', labelKey: 'combat.boxing_opt_basic' },
          { id: 'none', labelKey: 'combat.boxing_opt_none' },
        ],
      },
      {
        id: 'defense_skill',
        labelKey: 'combat.boxing_q_defense',
        type: 'single_select',
        options: [
          { id: 'head_movement', labelKey: 'combat.boxing_opt_head_movement' },
          { id: 'guard_only', labelKey: 'combat.boxing_opt_guard_only' },
          { id: 'minimal', labelKey: 'combat.boxing_opt_minimal' },
        ],
      },
      {
        id: 'footwork',
        labelKey: 'combat.boxing_q_footwork',
        type: 'single_select',
        options: [
          { id: 'fluid', labelKey: 'combat.boxing_opt_fw_fluid' },
          { id: 'average', labelKey: 'combat.boxing_opt_fw_average' },
          { id: 'static', labelKey: 'combat.boxing_opt_fw_static' },
        ],
      },
      {
        id: 'bag_work_freq',
        labelKey: 'combat.boxing_q_bag',
        type: 'single_select',
        options: [
          { id: 'daily', labelKey: 'combat.opt_daily' },
          { id: '3_5wk', labelKey: 'combat.opt_3_5wk' },
          { id: '1_2wk', labelKey: 'combat.opt_1_2wk' },
          { id: 'rarely', labelKey: 'combat.opt_rarely' },
          { id: 'never', labelKey: 'combat.opt_never' },
        ],
      },
      {
        id: 'sparring_comfort',
        labelKey: 'combat.boxing_q_sparring',
        type: 'single_select',
        options: [
          { id: 'comfortable', labelKey: 'combat.opt_comfortable' },
          { id: 'moderate', labelKey: 'combat.opt_moderate' },
          { id: 'anxious', labelKey: 'combat.opt_anxious' },
          { id: 'never_sparred', labelKey: 'combat.opt_never_sparred' },
        ],
      },
    ],
  },
  {
    id: 'muay_thai',
    titleKey: 'combat.disc_sec_muay_thai',
    iconEmoji: '🦵',
    subsystems: ['striking_skill'],
    questions: [
      {
        id: 'kick_technique',
        labelKey: 'combat.mt_q_kick',
        type: 'single_select',
        options: [
          { id: 'all_levels', labelKey: 'combat.mt_opt_all_levels' },
          { id: 'low_mid', labelKey: 'combat.mt_opt_low_mid' },
          { id: 'low_only', labelKey: 'combat.mt_opt_low_only' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
        ],
      },
      {
        id: 'clinch_work',
        labelKey: 'combat.mt_q_clinch',
        type: 'single_select',
        options: [
          { id: 'proficient', labelKey: 'combat.mt_opt_proficient' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'elbow_knee',
        labelKey: 'combat.mt_q_elbow_knee',
        type: 'single_select',
        options: [
          { id: 'trained', labelKey: 'combat.mt_opt_trained' },
          { id: 'limited', labelKey: 'combat.mt_opt_limited' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'shin_conditioning',
        labelKey: 'combat.mt_q_shin',
        type: 'single_select',
        options: [
          { id: 'conditioned', labelKey: 'combat.mt_opt_conditioned' },
          { id: 'light', labelKey: 'combat.mt_opt_light' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'sparring_comfort',
        labelKey: 'combat.mt_q_sparring',
        type: 'single_select',
        options: [
          { id: 'comfortable', labelKey: 'combat.opt_comfortable' },
          { id: 'moderate', labelKey: 'combat.opt_moderate' },
          { id: 'anxious', labelKey: 'combat.opt_anxious' },
          { id: 'never_sparred', labelKey: 'combat.opt_never_sparred' },
        ],
      },
    ],
  },
  {
    id: 'kickboxing',
    titleKey: 'combat.disc_sec_kickboxing',
    iconEmoji: '🦶',
    subsystems: ['striking_skill'],
    questions: [
      {
        id: 'combo_flow',
        labelKey: 'combat.kb_q_combo',
        type: 'single_select',
        options: [
          { id: 'fluid', labelKey: 'combat.boxing_opt_fluid' },
          { id: 'moderate', labelKey: 'combat.boxing_opt_moderate' },
          { id: 'basic', labelKey: 'combat.boxing_opt_basic' },
        ],
      },
      {
        id: 'distance_management',
        labelKey: 'combat.kb_q_distance',
        type: 'single_select',
        options: [
          { id: 'strong', labelKey: 'combat.opt_strong' },
          { id: 'average', labelKey: 'combat.opt_average' },
          { id: 'weak', labelKey: 'combat.opt_weak' },
        ],
      },
      {
        id: 'defensive_footwork',
        labelKey: 'combat.kb_q_footwork',
        type: 'single_select',
        options: [
          { id: 'trained', labelKey: 'combat.mt_opt_trained' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'power_vs_tech',
        labelKey: 'combat.kb_q_power_tech',
        type: 'single_select',
        options: [
          { id: 'balanced', labelKey: 'combat.kb_opt_balanced' },
          { id: 'power_heavy', labelKey: 'combat.kb_opt_power' },
          { id: 'technique_focused', labelKey: 'combat.kb_opt_technique' },
        ],
      },
      {
        id: 'sparring_comfort',
        labelKey: 'combat.kb_q_sparring',
        type: 'single_select',
        options: [
          { id: 'comfortable', labelKey: 'combat.opt_comfortable' },
          { id: 'moderate', labelKey: 'combat.opt_moderate' },
          { id: 'anxious', labelKey: 'combat.opt_anxious' },
          { id: 'never_sparred', labelKey: 'combat.opt_never_sparred' },
        ],
      },
    ],
  },
  {
    id: 'bjj',
    titleKey: 'combat.disc_sec_bjj',
    iconEmoji: '🤼',
    subsystems: ['grappling_skill'],
    questions: [
      {
        id: 'lifetime_hours',
        labelKey: 'combat.bjj_q_hours',
        type: 'single_select',
        options: [
          { id: '1_10', labelKey: 'combat.opt_rolling_1_10' },
          { id: '10_50', labelKey: 'combat.opt_rolling_10_50' },
          { id: '50_200', labelKey: 'combat.opt_rolling_50_200' },
          { id: '200_plus', labelKey: 'combat.opt_rolling_200_plus' },
        ],
      },
      {
        id: 'rolling_freq',
        labelKey: 'combat.bjj_q_freq',
        type: 'single_select',
        options: [
          { id: 'none', labelKey: 'combat.opt_none' },
          { id: 'monthly', labelKey: 'combat.opt_monthly' },
          { id: 'weekly', labelKey: 'combat.opt_weekly' },
          { id: '2x_weekly', labelKey: 'combat.opt_2x_weekly' },
        ],
      },
      {
        id: 'guard_game',
        labelKey: 'combat.bjj_q_guard',
        type: 'single_select',
        options: [
          { id: 'active', labelKey: 'combat.bjj_opt_active_guard' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'mount_escape',
        labelKey: 'combat.bjj_q_mount',
        type: 'single_select',
        options: [
          { id: 'yes', labelKey: 'combat.opt_yes' },
          { id: 'sometimes', labelKey: 'combat.opt_sometimes' },
          { id: 'no', labelKey: 'combat.opt_no' },
        ],
      },
      {
        id: 'sub_awareness',
        labelKey: 'combat.bjj_q_subs',
        type: 'single_select',
        options: [
          { id: 'recognize_defend', labelKey: 'combat.bjj_opt_recognize' },
          { id: 'basic_awareness', labelKey: 'combat.bjj_opt_basic_aware' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
    ],
  },
  {
    id: 'wrestling',
    titleKey: 'combat.disc_sec_wrestling',
    iconEmoji: '🤼‍♂️',
    subsystems: ['grappling_skill'],
    questions: [
      {
        id: 'takedown_proficiency',
        labelKey: 'combat.wr_q_takedown',
        type: 'single_select',
        options: [
          { id: 'strong', labelKey: 'combat.opt_strong' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'sprawl_instinct',
        labelKey: 'combat.wr_q_sprawl',
        type: 'single_select',
        options: [
          { id: 'yes', labelKey: 'combat.opt_yes' },
          { id: 'sometimes', labelKey: 'combat.opt_sometimes' },
          { id: 'no', labelKey: 'combat.opt_no' },
        ],
      },
      {
        id: 'top_control',
        labelKey: 'combat.wr_q_top_control',
        type: 'single_select',
        options: [
          { id: 'dominant', labelKey: 'combat.wr_opt_dominant' },
          { id: 'average', labelKey: 'combat.opt_average' },
          { id: 'weak', labelKey: 'combat.opt_weak' },
        ],
      },
      {
        id: 'grappling_cardio',
        labelKey: 'combat.wr_q_cardio',
        type: 'single_select',
        options: [
          { id: 'strong', labelKey: 'combat.opt_strong' },
          { id: 'moderate', labelKey: 'combat.opt_moderate' },
          { id: 'weak', labelKey: 'combat.opt_weak' },
        ],
      },
      {
        id: 'competition_exp',
        labelKey: 'combat.wr_q_competition',
        type: 'single_select',
        options: [
          { id: 'active', labelKey: 'combat.wr_opt_active' },
          { id: 'past', labelKey: 'combat.wr_opt_past' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
    ],
  },
  {
    id: 'judo',
    titleKey: 'combat.disc_sec_judo',
    iconEmoji: '🥋',
    subsystems: ['grappling_skill'],
    questions: [
      {
        id: 'throw_proficiency',
        labelKey: 'combat.judo_q_throw',
        type: 'single_select',
        options: [
          { id: 'proficient', labelKey: 'combat.mt_opt_proficient' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'grip_fighting',
        labelKey: 'combat.judo_q_grip',
        type: 'single_select',
        options: [
          { id: 'strong', labelKey: 'combat.opt_strong' },
          { id: 'average', labelKey: 'combat.opt_average' },
          { id: 'weak', labelKey: 'combat.opt_weak' },
        ],
      },
      {
        id: 'newaza',
        labelKey: 'combat.judo_q_newaza',
        type: 'single_select',
        options: [
          { id: 'proficient', labelKey: 'combat.mt_opt_proficient' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'breakfall',
        labelKey: 'combat.judo_q_breakfall',
        type: 'single_select',
        options: [
          { id: 'instinctive', labelKey: 'combat.judo_opt_instinctive' },
          { id: 'trained', labelKey: 'combat.mt_opt_trained' },
          { id: 'untrained', labelKey: 'combat.judo_opt_untrained' },
        ],
      },
      {
        id: 'randori_freq',
        labelKey: 'combat.judo_q_randori',
        type: 'single_select',
        options: [
          { id: 'weekly', labelKey: 'combat.opt_weekly' },
          { id: 'monthly', labelKey: 'combat.opt_monthly' },
          { id: 'rarely', labelKey: 'combat.opt_rarely' },
          { id: 'never', labelKey: 'combat.opt_never' },
        ],
      },
    ],
  },
  {
    id: 'krav_maga',
    titleKey: 'combat.disc_sec_krav_maga',
    iconEmoji: '⚔️',
    subsystems: ['striking_skill', 'tactical_awareness'],
    questions: [
      {
        id: 'scenario_training',
        labelKey: 'combat.km_q_scenario',
        type: 'single_select',
        options: [
          { id: 'regular', labelKey: 'combat.km_opt_regular' },
          { id: 'occasional', labelKey: 'combat.km_opt_occasional' },
          { id: 'never', labelKey: 'combat.opt_never' },
        ],
      },
      {
        id: 'multi_attacker',
        labelKey: 'combat.km_q_multi',
        type: 'single_select',
        options: [
          { id: 'trained', labelKey: 'combat.mt_opt_trained' },
          { id: 'limited', labelKey: 'combat.mt_opt_limited' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'weapon_defense',
        labelKey: 'combat.km_q_weapon',
        type: 'single_select',
        options: [
          { id: 'trained', labelKey: 'combat.mt_opt_trained' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'stress_inoculation',
        labelKey: 'combat.km_q_stress',
        type: 'single_select',
        options: [
          { id: 'regular', labelKey: 'combat.km_opt_regular' },
          { id: 'some', labelKey: 'combat.km_opt_some' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'deescalation',
        labelKey: 'combat.km_q_deesc',
        type: 'single_select',
        options: [
          { id: 'trained', labelKey: 'combat.mt_opt_trained' },
          { id: 'instinctive', labelKey: 'combat.judo_opt_instinctive' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
    ],
  },
  {
    id: 'kung_fu',
    titleKey: 'combat.disc_sec_kung_fu',
    iconEmoji: '🐉',
    subsystems: ['striking_skill'],
    questions: [
      {
        id: 'form_proficiency',
        labelKey: 'combat.kf_q_form',
        type: 'single_select',
        options: [
          { id: 'advanced', labelKey: 'combat.kf_opt_advanced' },
          { id: 'intermediate', labelKey: 'combat.kf_opt_intermediate' },
          { id: 'beginner', labelKey: 'combat.kf_opt_beginner' },
        ],
      },
      {
        id: 'application',
        labelKey: 'combat.kf_q_application',
        type: 'single_select',
        options: [
          { id: 'sparring', labelKey: 'combat.kf_opt_sparring' },
          { id: 'drills_only', labelKey: 'combat.kf_opt_drills' },
          { id: 'forms_only', labelKey: 'combat.kf_opt_forms_only' },
        ],
      },
      {
        id: 'style_type',
        labelKey: 'combat.kf_q_style',
        type: 'single_select',
        options: [
          { id: 'external', labelKey: 'combat.kf_opt_external' },
          { id: 'internal', labelKey: 'combat.kf_opt_internal' },
          { id: 'both', labelKey: 'combat.kf_opt_both' },
        ],
      },
      {
        id: 'weapon_forms',
        labelKey: 'combat.kf_q_weapons',
        type: 'single_select',
        options: [
          { id: 'yes', labelKey: 'combat.opt_yes' },
          { id: 'no', labelKey: 'combat.opt_no' },
        ],
      },
      {
        id: 'conditioning_method',
        labelKey: 'combat.kf_q_conditioning',
        type: 'single_select',
        options: [
          { id: 'iron_body', labelKey: 'combat.kf_opt_iron_body' },
          { id: 'general', labelKey: 'combat.kf_opt_general' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
    ],
  },
  {
    id: 'military_training',
    titleKey: 'combat.disc_sec_military',
    iconEmoji: '🎖️',
    subsystems: ['striking_skill', 'tactical_awareness'],
    questions: [
      {
        id: 'cqb_training',
        labelKey: 'combat.mil_q_cqb',
        type: 'single_select',
        options: [
          { id: 'extensive', labelKey: 'combat.mil_opt_extensive' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'combatives',
        labelKey: 'combat.mil_q_combatives',
        type: 'single_select',
        options: [
          { id: 'proficient', labelKey: 'combat.mt_opt_proficient' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'stress_inoculation',
        labelKey: 'combat.mil_q_stress',
        type: 'single_select',
        options: [
          { id: 'combat_tested', labelKey: 'combat.mil_opt_combat_tested' },
          { id: 'training_only', labelKey: 'combat.mil_opt_training_only' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'team_tactics',
        labelKey: 'combat.mil_q_team',
        type: 'single_select',
        options: [
          { id: 'trained', labelKey: 'combat.mt_opt_trained' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'weapon_integration',
        labelKey: 'combat.mil_q_weapon_int',
        type: 'single_select',
        options: [
          { id: 'trained', labelKey: 'combat.mt_opt_trained' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
    ],
  },
  {
    id: 'mma',
    titleKey: 'combat.disc_sec_mma',
    iconEmoji: '🏟️',
    subsystems: ['striking_skill', 'grappling_skill'],
    questions: [
      {
        id: 'range_transitions',
        labelKey: 'combat.mma_q_transitions',
        type: 'single_select',
        options: [
          { id: 'fluid', labelKey: 'combat.boxing_opt_fluid' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'ground_and_pound',
        labelKey: 'combat.mma_q_gnp',
        type: 'single_select',
        options: [
          { id: 'trained', labelKey: 'combat.mt_opt_trained' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'clinch_cage',
        labelKey: 'combat.mma_q_clinch',
        type: 'single_select',
        options: [
          { id: 'proficient', labelKey: 'combat.mt_opt_proficient' },
          { id: 'basic', labelKey: 'combat.opt_basic' },
          { id: 'none', labelKey: 'combat.opt_none' },
        ],
      },
      {
        id: 'weakest_range',
        labelKey: 'combat.mma_q_weakest',
        type: 'single_select',
        options: [
          { id: 'striking', labelKey: 'combat.chip_striking' },
          { id: 'grappling', labelKey: 'combat.chip_grappling' },
          { id: 'clinch', labelKey: 'combat.mma_opt_clinch' },
        ],
      },
      {
        id: 'mma_cardio',
        labelKey: 'combat.mma_q_cardio',
        type: 'single_select',
        options: [
          { id: 'strong', labelKey: 'combat.opt_strong' },
          { id: 'moderate', labelKey: 'combat.opt_moderate' },
          { id: 'weak', labelKey: 'combat.opt_weak' },
        ],
      },
    ],
  },
];

/** Get discipline specs only for selected disciplines */
export function getActiveDisciplineSpecs(selected: CombatDiscipline[]): DisciplineSpec[] {
  return DISCIPLINE_SPECS.filter(s => selected.includes(s.id));
}

/**
 * Generic domain assessment types — used by all AI-conversation-based pillar assessments.
 */

export interface DomainFinding {
  id: string;
  text_he: string;
  text_en: string;
  severity: 'low' | 'med' | 'high';
  subsystem: string;
}

export type Confidence = 'low' | 'med' | 'high';

export interface DomainAssessmentResult {
  assessed_at: string;
  domain_index: number;
  confidence: Confidence;
  subscores: Record<string, number>;
  findings: DomainFinding[];
  mirror_statement: { he: string; en: string };
  one_next_step: { he: string; en: string };
  selected_focus_items?: string[];
}

export interface DomainAssessmentConfig {
  latest_assessment?: DomainAssessmentResult;
  history?: DomainAssessmentResult[];
  completed?: boolean;
  completed_at?: string;
}

/** Domain-specific subsystem metadata for display */
export interface SubsystemMeta {
  id: string;
  icon: string;
  nameKey: string; // i18n key
  weight: number; // for weighted index calc
}

export interface DomainAssessMeta {
  domainId: string;
  color: string; // tailwind color name (emerald, purple, sky)
  introTitleKey: string;
  introSubtitleKey: string;
  subsystems: SubsystemMeta[];
}

/* ───── Domain definitions ───── */

export const WEALTH_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'income_clarity', icon: '💰', nameKey: 'wealth.sub_income_clarity', weight: 0.20 },
  { id: 'financial_discipline', icon: '📊', nameKey: 'wealth.sub_financial_discipline', weight: 0.15 },
  { id: 'value_creation', icon: '⚡', nameKey: 'wealth.sub_value_creation', weight: 0.20 },
  { id: 'opportunity_awareness', icon: '🎯', nameKey: 'wealth.sub_opportunity_awareness', weight: 0.15 },
  { id: 'wealth_mindset', icon: '🧠', nameKey: 'wealth.sub_wealth_mindset', weight: 0.15 },
  { id: 'strategic_positioning', icon: '♟️', nameKey: 'wealth.sub_strategic_positioning', weight: 0.15 },
];

export const INFLUENCE_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'communication_power', icon: '🎤', nameKey: 'influence.sub_communication_power', weight: 0.20 },
  { id: 'presence_impact', icon: '👁️', nameKey: 'influence.sub_presence_impact', weight: 0.15 },
  { id: 'leadership_capacity', icon: '👑', nameKey: 'influence.sub_leadership_capacity', weight: 0.20 },
  { id: 'social_intelligence', icon: '🧩', nameKey: 'influence.sub_social_intelligence', weight: 0.15 },
  { id: 'persuasion_skill', icon: '🎯', nameKey: 'influence.sub_persuasion_skill', weight: 0.15 },
  { id: 'authenticity_in_power', icon: '💎', nameKey: 'influence.sub_authenticity_in_power', weight: 0.15 },
];

export const RELATIONSHIPS_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'connection_depth', icon: '❤️', nameKey: 'relationships.sub_connection_depth', weight: 0.20 },
  { id: 'boundary_clarity', icon: '🛡️', nameKey: 'relationships.sub_boundary_clarity', weight: 0.15 },
  { id: 'vulnerability_access', icon: '🔓', nameKey: 'relationships.sub_vulnerability_access', weight: 0.20 },
  { id: 'network_quality', icon: '🌐', nameKey: 'relationships.sub_network_quality', weight: 0.15 },
  { id: 'conflict_capacity', icon: '⚔️', nameKey: 'relationships.sub_conflict_capacity', weight: 0.15 },
  { id: 'reciprocity_balance', icon: '⚖️', nameKey: 'relationships.sub_reciprocity_balance', weight: 0.15 },
];

export const BUSINESS_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'business_clarity', icon: '🎯', nameKey: 'businessAssess.sub_business_clarity', weight: 0.20 },
  { id: 'revenue_engine', icon: '💰', nameKey: 'businessAssess.sub_revenue_engine', weight: 0.20 },
  { id: 'operational_maturity', icon: '⚙️', nameKey: 'businessAssess.sub_operational_maturity', weight: 0.15 },
  { id: 'market_positioning', icon: '📍', nameKey: 'businessAssess.sub_market_positioning', weight: 0.15 },
  { id: 'growth_capacity', icon: '📈', nameKey: 'businessAssess.sub_growth_capacity', weight: 0.15 },
  { id: 'founder_resilience', icon: '🔥', nameKey: 'businessAssess.sub_founder_resilience', weight: 0.15 },
];

export const PROJECTS_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'vision_clarity', icon: '🔭', nameKey: 'projectsAssess.sub_vision_clarity', weight: 0.20 },
  { id: 'execution_discipline', icon: '⚡', nameKey: 'projectsAssess.sub_execution_discipline', weight: 0.20 },
  { id: 'resource_management', icon: '📊', nameKey: 'projectsAssess.sub_resource_management', weight: 0.15 },
  { id: 'priority_focus', icon: '🎯', nameKey: 'projectsAssess.sub_priority_focus', weight: 0.15 },
  { id: 'obstacle_navigation', icon: '🧭', nameKey: 'projectsAssess.sub_obstacle_navigation', weight: 0.15 },
  { id: 'completion_rate', icon: '✅', nameKey: 'projectsAssess.sub_completion_rate', weight: 0.15 },
];

/* ───── CORE DOMAIN SUBSYSTEMS ───── */

export const PRESENCE_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'facial_structure', icon: '👤', nameKey: 'presenceAssess.sub_facial_structure', weight: 0.15 },
  { id: 'body_composition', icon: '🏋️', nameKey: 'presenceAssess.sub_body_composition', weight: 0.20 },
  { id: 'grooming_discipline', icon: '✂️', nameKey: 'presenceAssess.sub_grooming_discipline', weight: 0.15 },
  { id: 'style_coherence', icon: '👔', nameKey: 'presenceAssess.sub_style_coherence', weight: 0.15 },
  { id: 'posture_presence', icon: '🧍', nameKey: 'presenceAssess.sub_posture_presence', weight: 0.20 },
  { id: 'image_awareness', icon: '🪞', nameKey: 'presenceAssess.sub_image_awareness', weight: 0.15 },
];

export const POWER_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'max_strength', icon: '🏋️', nameKey: 'powerAssess.sub_max_strength', weight: 0.20 },
  { id: 'relative_strength', icon: '💪', nameKey: 'powerAssess.sub_relative_strength', weight: 0.20 },
  { id: 'skill_strength', icon: '🤸', nameKey: 'powerAssess.sub_skill_strength', weight: 0.15 },
  { id: 'explosive_power', icon: '⚡', nameKey: 'powerAssess.sub_explosive_power', weight: 0.15 },
  { id: 'structural_strength', icon: '🦴', nameKey: 'powerAssess.sub_structural_strength', weight: 0.15 },
  { id: 'training_consistency', icon: '📅', nameKey: 'powerAssess.sub_training_consistency', weight: 0.15 },
];

export const VITALITY_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'sleep_quality', icon: '😴', nameKey: 'vitalityAssess.sub_sleep_quality', weight: 0.20 },
  { id: 'circadian_stability', icon: '🌅', nameKey: 'vitalityAssess.sub_circadian_stability', weight: 0.15 },
  { id: 'nutrition_quality', icon: '🥗', nameKey: 'vitalityAssess.sub_nutrition_quality', weight: 0.20 },
  { id: 'substance_load', icon: '☕', nameKey: 'vitalityAssess.sub_substance_load', weight: 0.15 },
  { id: 'recovery_capacity', icon: '🔄', nameKey: 'vitalityAssess.sub_recovery_capacity', weight: 0.15 },
  { id: 'energy_stability', icon: '🔋', nameKey: 'vitalityAssess.sub_energy_stability', weight: 0.15 },
];

export const FOCUS_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'deep_work_capacity', icon: '🎯', nameKey: 'focusAssess.sub_deep_work_capacity', weight: 0.20 },
  { id: 'dopamine_control', icon: '📱', nameKey: 'focusAssess.sub_dopamine_control', weight: 0.20 },
  { id: 'attention_span', icon: '📖', nameKey: 'focusAssess.sub_attention_span', weight: 0.15 },
  { id: 'meditation_practice', icon: '🧘', nameKey: 'focusAssess.sub_meditation_practice', weight: 0.15 },
  { id: 'distraction_resistance', icon: '🛡️', nameKey: 'focusAssess.sub_distraction_resistance', weight: 0.15 },
  { id: 'cognitive_endurance', icon: '🧠', nameKey: 'focusAssess.sub_cognitive_endurance', weight: 0.15 },
];

export const COMBAT_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'striking_ability', icon: '🥊', nameKey: 'combatAssess.sub_striking_ability', weight: 0.20 },
  { id: 'grappling_skill', icon: '🤼', nameKey: 'combatAssess.sub_grappling_skill', weight: 0.20 },
  { id: 'reaction_speed', icon: '⚡', nameKey: 'combatAssess.sub_reaction_speed', weight: 0.15 },
  { id: 'combat_conditioning', icon: '💨', nameKey: 'combatAssess.sub_combat_conditioning', weight: 0.15 },
  { id: 'pressure_handling', icon: '🔥', nameKey: 'combatAssess.sub_pressure_handling', weight: 0.15 },
  { id: 'tactical_awareness', icon: '♟️', nameKey: 'combatAssess.sub_tactical_awareness', weight: 0.15 },
];

export const EXPANSION_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'learning_drive', icon: '📚', nameKey: 'expansionAssess.sub_learning_drive', weight: 0.20 },
  { id: 'creative_output', icon: '🎨', nameKey: 'expansionAssess.sub_creative_output', weight: 0.20 },
  { id: 'intellectual_range', icon: '🌐', nameKey: 'expansionAssess.sub_intellectual_range', weight: 0.15 },
  { id: 'language_skill', icon: '🗣️', nameKey: 'expansionAssess.sub_language_skill', weight: 0.15 },
  { id: 'growth_mindset', icon: '🌱', nameKey: 'expansionAssess.sub_growth_mindset', weight: 0.15 },
  { id: 'knowledge_application', icon: '⚙️', nameKey: 'expansionAssess.sub_knowledge_application', weight: 0.15 },
];

export const PLAY_SUBSYSTEMS: SubsystemMeta[] = [
  { id: 'play_frequency', icon: '🎮', nameKey: 'playAssess.sub_play_frequency', weight: 0.20 },
  { id: 'joy_capacity', icon: '😊', nameKey: 'playAssess.sub_joy_capacity', weight: 0.20 },
  { id: 'variety_range', icon: '🌈', nameKey: 'playAssess.sub_variety_range', weight: 0.15 },
  { id: 'recovery_awareness', icon: '🔄', nameKey: 'playAssess.sub_recovery_awareness', weight: 0.15 },
  { id: 'guilt_free_rest', icon: '🧘', nameKey: 'playAssess.sub_guilt_free_rest', weight: 0.15 },
  { id: 'somatic_connection', icon: '🏃', nameKey: 'playAssess.sub_somatic_connection', weight: 0.15 },
];

export const DOMAIN_ASSESS_META: Record<string, DomainAssessMeta> = {
  /* Arena domains */
  wealth: {
    domainId: 'wealth',
    color: 'emerald',
    introTitleKey: 'wealth.assessTitle',
    introSubtitleKey: 'wealth.assessSubtitle',
    subsystems: WEALTH_SUBSYSTEMS,
  },
  influence: {
    domainId: 'influence',
    color: 'purple',
    introTitleKey: 'influence.assessTitle',
    introSubtitleKey: 'influence.assessSubtitle',
    subsystems: INFLUENCE_SUBSYSTEMS,
  },
  relationships: {
    domainId: 'relationships',
    color: 'sky',
    introTitleKey: 'relationships.assessTitle',
    introSubtitleKey: 'relationships.assessSubtitle',
    subsystems: RELATIONSHIPS_SUBSYSTEMS,
  },
  business: {
    domainId: 'business',
    color: 'rose',
    introTitleKey: 'businessAssess.assessTitle',
    introSubtitleKey: 'businessAssess.assessSubtitle',
    subsystems: BUSINESS_SUBSYSTEMS,
  },
  projects: {
    domainId: 'projects',
    color: 'amber',
    introTitleKey: 'projectsAssess.assessTitle',
    introSubtitleKey: 'projectsAssess.assessSubtitle',
    subsystems: PROJECTS_SUBSYSTEMS,
  },
  play: {
    domainId: 'play',
    color: 'violet',
    introTitleKey: 'playAssess.assessTitle',
    introSubtitleKey: 'playAssess.assessSubtitle',
    subsystems: PLAY_SUBSYSTEMS,
  },
  /* Core domains */
  presence: {
    domainId: 'presence',
    color: 'fuchsia',
    introTitleKey: 'presenceAssess.assessTitle',
    introSubtitleKey: 'presenceAssess.assessSubtitle',
    subsystems: PRESENCE_SUBSYSTEMS,
  },
  power: {
    domainId: 'power',
    color: 'red',
    introTitleKey: 'powerAssess.assessTitle',
    introSubtitleKey: 'powerAssess.assessSubtitle',
    subsystems: POWER_SUBSYSTEMS,
  },
  vitality: {
    domainId: 'vitality',
    color: 'amber',
    introTitleKey: 'vitalityAssess.assessTitle',
    introSubtitleKey: 'vitalityAssess.assessSubtitle',
    subsystems: VITALITY_SUBSYSTEMS,
  },
  focus: {
    domainId: 'focus',
    color: 'cyan',
    introTitleKey: 'focusAssess.assessTitle',
    introSubtitleKey: 'focusAssess.assessSubtitle',
    subsystems: FOCUS_SUBSYSTEMS,
  },
  combat: {
    domainId: 'combat',
    color: 'slate',
    introTitleKey: 'combatAssess.assessTitle',
    introSubtitleKey: 'combatAssess.assessSubtitle',
    subsystems: COMBAT_SUBSYSTEMS,
  },
  expansion: {
    domainId: 'expansion',
    color: 'indigo',
    introTitleKey: 'expansionAssess.assessTitle',
    introSubtitleKey: 'expansionAssess.assessSubtitle',
    subsystems: EXPANSION_SUBSYSTEMS,
  },
};

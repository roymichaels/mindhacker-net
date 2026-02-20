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

export const DOMAIN_ASSESS_META: Record<string, DomainAssessMeta> = {
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
};

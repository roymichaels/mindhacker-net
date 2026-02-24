/**
 * Assessment Quality Contract — shared validator for all pillar assessments.
 * Determines if a domain's assessment data is complete enough for plan generation.
 * Used by generate-90day-strategy, generate-phase-actions, and frontend preflight.
 */

interface MissingQuestion {
  field: string;
  question_he: string;
  question_en: string;
}

interface QualityResult {
  isReady: boolean;
  missingFields: string[];
  missingQuestions: MissingQuestion[];
  reasonCode: 'READY' | 'NO_ASSESSMENT' | 'MISSING_REQUIRED_DATA' | 'LOW_CONFIDENCE' | 'LEGACY_FORMAT';
}

/** Global minimum required fields for ALL domains */
const GLOBAL_REQUIRED = ['subscores', 'assessed_at', 'confidence'];

/** Domain-specific required metrics — these MUST be captured in conversation */
const DOMAIN_REQUIRED_METRICS: Record<string, {
  fields: string[];
  questions: MissingQuestion[];
}> = {
  combat: {
    fields: ['combat_metrics'],
    questions: [
      { field: 'combat_metrics.disciplines', question_he: 'אילו אומנויות לחימה אתה מתרגל?', question_en: 'Which martial arts do you train?' },
      { field: 'combat_metrics.training_frequency', question_he: 'כמה פעמים בשבוע אתה מתאמן?', question_en: 'How many times per week do you train?' },
      { field: 'combat_metrics.sparring_frequency', question_he: 'כמה פעמים בשבוע אתה עושה ספארינג?', question_en: 'How often do you spar per week?' },
      { field: 'combat_metrics.round_capacity', question_he: 'כמה סיבובים של 3 דקות אתה מחזיק?', question_en: 'How many 3-minute rounds can you sustain?' },
      { field: 'combat_metrics.max_pushups', question_he: 'כמה שכיבות סמיכה בסט אחד?', question_en: 'Max push-ups in one set?' },
      { field: 'combat_metrics.training_mode', question_he: 'מצב אימון — סולו, חדר כושר, היברידי, טקטי?', question_en: 'Training mode — solo, gym, hybrid, tactical?' },
    ],
  },
  power: {
    fields: ['power_metrics'],
    questions: [
      { field: 'power_metrics.training_type', question_he: 'מה סוג האימונים שלך — כוח, קליסטניקס, היברידי?', question_en: 'What type of training — strength, calisthenics, hybrid?' },
      { field: 'power_metrics.training_frequency', question_he: 'כמה פעמים בשבוע אתה מתאמן?', question_en: 'How many times per week do you train?' },
      { field: 'power_metrics.max_pullups', question_he: 'כמה מתח בסט אחד?', question_en: 'Max pull-ups in one set?' },
      { field: 'power_metrics.max_pushups', question_he: 'כמה שכיבות סמיכה בסט אחד?', question_en: 'Max push-ups in one set?' },
      { field: 'power_metrics.bodyweight', question_he: 'כמה אתה שוקל?', question_en: 'What is your bodyweight?' },
    ],
  },
  vitality: {
    fields: ['vitality_metrics'],
    questions: [
      { field: 'vitality_metrics.sleep_hours', question_he: 'כמה שעות שינה אתה ישן בממוצע?', question_en: 'How many hours of sleep on average?' },
      { field: 'vitality_metrics.sleep_time', question_he: 'באיזו שעה אתה הולך לישון?', question_en: 'What time do you go to sleep?' },
      { field: 'vitality_metrics.wake_time', question_he: 'באיזו שעה אתה קם?', question_en: 'What time do you wake up?' },
      { field: 'vitality_metrics.diet_type', question_he: 'מה סוג התזונה שלך?', question_en: 'What is your diet type?' },
      { field: 'vitality_metrics.caffeine_cups', question_he: 'כמה כוסות קפה ביום?', question_en: 'How many cups of coffee per day?' },
    ],
  },
  focus: {
    fields: ['focus_metrics'],
    questions: [
      { field: 'focus_metrics.deep_work_max_hours', question_he: 'כמה שעות עבודה עמוקה בלי הפסקה?', question_en: 'Max deep work hours without break?' },
      { field: 'focus_metrics.screen_time_hours', question_he: 'כמה שעות מסך ביום?', question_en: 'Daily screen time in hours?' },
      { field: 'focus_metrics.meditation_practice', question_he: 'אתה מתרגל מדיטציה? באיזו תדירות?', question_en: 'Do you meditate? How often?' },
    ],
  },
};

/**
 * Validate a domain's assessment quality for plan generation readiness.
 */
export function validateAssessmentQuality(
  domainId: string,
  domainConfig: Record<string, any> | null | undefined,
): QualityResult {
  if (!domainConfig) {
    return {
      isReady: false,
      missingFields: ['domain_config'],
      missingQuestions: [],
      reasonCode: 'NO_ASSESSMENT',
    };
  }

  // Check for latest_assessment (new format) vs latest (legacy)
  const latest = domainConfig.latest_assessment;
  const legacyLatest = domainConfig.latest;

  // Legacy format detected — needs reassessment
  if (!latest && legacyLatest) {
    // Try to normalize: if legacy has subsystem scores, it might be usable
    const hasSubscores = legacyLatest.subscores || legacyLatest.subsystems || legacyLatest.subScores;
    if (hasSubscores) {
      // Partially usable but missing willingness + structured data
      return {
        isReady: false,
        missingFields: ['willingness', 'assessed_at'],
        missingQuestions: [
          { field: 'willingness', question_he: 'מה אתה מוכן לעשות? ומה לא?', question_en: 'What are you willing to do? And what\'s off the table?' },
        ],
        reasonCode: 'LEGACY_FORMAT',
      };
    }
    return {
      isReady: false,
      missingFields: ['latest_assessment'],
      missingQuestions: [],
      reasonCode: 'NO_ASSESSMENT',
    };
  }

  if (!latest) {
    return {
      isReady: false,
      missingFields: ['latest_assessment'],
      missingQuestions: [],
      reasonCode: 'NO_ASSESSMENT',
    };
  }

  // Check global required fields
  const missingFields: string[] = [];
  const missingQuestions: MissingQuestion[] = [];

  if (!latest.subscores || Object.keys(latest.subscores).length < 3) {
    missingFields.push('subscores');
  }
  if (!latest.assessed_at) {
    missingFields.push('assessed_at');
  }
  if (!latest.confidence) {
    missingFields.push('confidence');
  }

  // Check willingness (critical for plan generation)
  if (!latest.willingness || (!latest.willingness.willing_to_do?.length && !latest.willingness.not_willing_to_do?.length)) {
    missingFields.push('willingness');
    missingQuestions.push({
      field: 'willingness',
      question_he: 'מה אתה מוכן להתחיל לעשות? ומה בטוח לא?',
      question_en: 'What are you willing to start doing? And what\'s off the table?',
    });
  }

  // Check domain-specific required metrics
  const domainReqs = DOMAIN_REQUIRED_METRICS[domainId];
  if (domainReqs) {
    for (const field of domainReqs.fields) {
      const metricsData = latest[field] || latest.metrics?.[field];
      if (!metricsData || (typeof metricsData === 'object' && Object.keys(metricsData).length === 0)) {
        missingFields.push(field);
        // Add all questions for this missing metrics group
        missingQuestions.push(...domainReqs.questions.filter(q => q.field.startsWith(field)));
      }
    }
  }

  if (missingFields.length > 0) {
    return {
      isReady: false,
      missingFields,
      missingQuestions,
      reasonCode: 'MISSING_REQUIRED_DATA',
    };
  }

  // Low confidence with no subscores is a soft fail
  if (latest.confidence === 'low') {
    return {
      isReady: false,
      missingFields: [],
      missingQuestions: [],
      reasonCode: 'LOW_CONFIDENCE',
    };
  }

  return { isReady: true, missingFields: [], missingQuestions: [], reasonCode: 'READY' };
}

/**
 * Validate all pillars for a given hub and return structured result.
 */
export function validateHubReadiness(
  hub: 'core' | 'arena' | 'both',
  domains: { domain_id: string; domain_config: Record<string, any> }[],
  pillarIds?: string[],
): {
  ready: boolean;
  incompletePillars: { pillarId: string; result: QualityResult }[];
} {
  const CORE = ['consciousness', 'presence', 'power', 'vitality', 'focus', 'combat', 'expansion'];
  const ARENA = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play', 'order'];

  let targetPillars: string[];
  if (pillarIds && pillarIds.length > 0) {
    targetPillars = pillarIds;
  } else if (hub === 'both') {
    targetPillars = [...CORE, ...ARENA];
  } else {
    targetPillars = hub === 'core' ? CORE : ARENA;
  }

  const incomplete: { pillarId: string; result: QualityResult }[] = [];

  for (const pillarId of targetPillars) {
    const domain = domains.find(d => d.domain_id === pillarId);
    const result = validateAssessmentQuality(pillarId, domain?.domain_config);
    if (!result.isReady) {
      incomplete.push({ pillarId, result });
    }
  }

  return {
    ready: incomplete.length === 0,
    incompletePillars: incomplete,
  };
}

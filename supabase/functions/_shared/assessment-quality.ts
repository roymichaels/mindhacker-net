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
  // ─── CORE DOMAINS ───

  consciousness: {
    fields: ['consciousness_metrics'],
    questions: [
      { field: 'consciousness_metrics.self_reflection_practice', question_he: 'האם אתה מתרגל רפלקציה עצמית? באיזו תדירות?', question_en: 'Do you practice self-reflection? How often?' },
      { field: 'consciousness_metrics.journaling_frequency', question_he: 'האם אתה כותב יומן? כמה פעמים בשבוע?', question_en: 'Do you journal? How many times per week?' },
      { field: 'consciousness_metrics.emotional_trigger_awareness', question_he: 'כמה מודע אתה לטריגרים רגשיים שלך? (1-10)', question_en: 'How aware are you of your emotional triggers? (1-10)' },
      { field: 'consciousness_metrics.inner_dialogue_quality', question_he: 'איך הדיאלוג הפנימי שלך? חיובי, ביקורתי, או מעורב?', question_en: 'How is your inner dialogue? Positive, critical, or mixed?' },
      { field: 'consciousness_metrics.mindfulness_moments', question_he: 'כמה רגעי מודעות יש לך ביום?', question_en: 'How many mindful moments do you have per day?' },
    ],
  },

  presence: {
    fields: ['presence_metrics'],
    questions: [
      { field: 'presence_metrics.skincare_routine', question_he: 'מה שגרת הטיפוח שלך? (ללא/בסיסית/מלאה)', question_en: 'What is your skincare routine? (none/basic/full)' },
      { field: 'presence_metrics.last_style_purchase', question_he: 'מתי בפעם האחרונה קנית בגד בצורה מכוונת?', question_en: 'When did you last buy clothing intentionally?' },
      { field: 'presence_metrics.posture_awareness', question_he: 'מה רמת המודעות שלך ליציבה? (1-10)', question_en: 'What is your posture awareness level? (1-10)' },
      { field: 'presence_metrics.grooming_frequency', question_he: 'באיזו תדירות אתה מטפח את עצמך? (יומי/שבועי/לעתים)', question_en: 'How often do you groom? (daily/weekly/rarely)' },
      { field: 'presence_metrics.style_confidence', question_he: 'כמה בטוח אתה בסגנון שלך? (1-10)', question_en: 'How confident are you in your style? (1-10)' },
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
      { field: 'focus_metrics.phone_pickups', question_he: 'כמה פעמים ביום אתה מרים את הטלפון?', question_en: 'How many times a day do you pick up your phone?' },
      { field: 'focus_metrics.attention_span_minutes', question_he: 'כמה דקות אתה מחזיק ריכוז על משימה אחת?', question_en: 'How many minutes can you focus on a single task?' },
    ],
  },

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

  expansion: {
    fields: ['expansion_metrics'],
    questions: [
      { field: 'expansion_metrics.books_per_month', question_he: 'כמה ספרים אתה קורא בחודש?', question_en: 'How many books do you read per month?' },
      { field: 'expansion_metrics.languages_spoken', question_he: 'כמה שפות אתה דובר?', question_en: 'How many languages do you speak?' },
      { field: 'expansion_metrics.current_learning_project', question_he: 'מה הפרויקט הלימודי הנוכחי שלך?', question_en: 'What is your current learning project?' },
      { field: 'expansion_metrics.creative_output_frequency', question_he: 'כמה פעמים בשבוע אתה יוצר משהו?', question_en: 'How often do you create something per week?' },
      { field: 'expansion_metrics.learning_mode', question_he: 'איך אתה מעדיף ללמוד? (קריאה/וידאו/קורסים/ניסוי)', question_en: 'How do you prefer to learn? (reading/video/courses/experimentation)' },
    ],
  },

  // ─── ARENA DOMAINS ───

  wealth: {
    fields: ['wealth_metrics'],
    questions: [
      { field: 'wealth_metrics.monthly_income_range', question_he: 'מה טווח ההכנסה החודשית שלך?', question_en: 'What is your monthly income range?' },
      { field: 'wealth_metrics.income_streams', question_he: 'כמה מקורות הכנסה יש לך?', question_en: 'How many income streams do you have?' },
      { field: 'wealth_metrics.savings_rate', question_he: 'כמה אחוז מההכנסה אתה חוסך?', question_en: 'What percentage of income do you save?' },
      { field: 'wealth_metrics.debt_status', question_he: 'יש לך חובות? באיזה היקף?', question_en: 'Do you have debt? How much?' },
      { field: 'wealth_metrics.financial_goal', question_he: 'מה היעד הפיננסי שלך ל-12 חודשים?', question_en: 'What is your financial goal for 12 months?' },
    ],
  },

  influence: {
    fields: ['influence_metrics'],
    questions: [
      { field: 'influence_metrics.people_managed', question_he: 'כמה אנשים אתה מנהל או מוביל?', question_en: 'How many people do you manage or lead?' },
      { field: 'influence_metrics.public_speaking_frequency', question_he: 'כמה פעמים בחודש אתה מדבר מול קהל?', question_en: 'How often do you speak publicly per month?' },
      { field: 'influence_metrics.content_creation', question_he: 'אתה יוצר תוכן? באיזו תדירות?', question_en: 'Do you create content? How often?' },
      { field: 'influence_metrics.network_size', question_he: 'כמה אנשי מפתח יש ברשת שלך?', question_en: 'How many key people are in your network?' },
      { field: 'influence_metrics.negotiation_comfort', question_he: 'כמה נוח לך לנהל משא ומתן? (1-10)', question_en: 'How comfortable are you negotiating? (1-10)' },
    ],
  },

  relationships: {
    fields: ['relationships_metrics'],
    questions: [
      { field: 'relationships_metrics.close_friends_count', question_he: 'כמה חברים קרובים באמת יש לך?', question_en: 'How many truly close friends do you have?' },
      { field: 'relationships_metrics.relationship_status', question_he: 'מה מצב הזוגיות שלך?', question_en: 'What is your relationship status?' },
      { field: 'relationships_metrics.conflict_frequency', question_he: 'כמה פעמים בחודש יש לך קונפליקטים משמעותיים?', question_en: 'How often do you have significant conflicts per month?' },
      { field: 'relationships_metrics.support_network_quality', question_he: 'כמה חזקה רשת התמיכה שלך? (1-10)', question_en: 'How strong is your support network? (1-10)' },
      { field: 'relationships_metrics.vulnerability_comfort', question_he: 'כמה נוח לך להיפתח? (1-10)', question_en: 'How comfortable are you being vulnerable? (1-10)' },
    ],
  },

  business: {
    fields: ['business_metrics'],
    questions: [
      { field: 'business_metrics.has_business', question_he: 'יש לך עסק פעיל? (כן/לא/בתכנון)', question_en: 'Do you have an active business? (yes/no/planning)' },
      { field: 'business_metrics.monthly_revenue', question_he: 'מה ההכנסה החודשית של העסק?', question_en: 'What is the monthly revenue?' },
      { field: 'business_metrics.team_size', question_he: 'כמה אנשים בצוות?', question_en: 'How many people on your team?' },
      { field: 'business_metrics.years_in_operation', question_he: 'כמה שנים העסק פעיל?', question_en: 'How many years in operation?' },
      { field: 'business_metrics.biggest_bottleneck', question_he: 'מה החסם הכי גדול בעסק עכשיו?', question_en: 'What is the biggest bottleneck right now?' },
    ],
  },

  projects: {
    fields: ['projects_metrics'],
    questions: [
      { field: 'projects_metrics.active_projects_count', question_he: 'כמה פרויקטים פעילים יש לך עכשיו?', question_en: 'How many active projects do you have right now?' },
      { field: 'projects_metrics.completion_rate', question_he: 'מתוך 10 פרויקטים שמתחיל — כמה אתה מסיים?', question_en: 'Out of 10 projects started — how many do you finish?' },
      { field: 'projects_metrics.avg_project_duration', question_he: 'כמה זמן לוקח לך פרויקט ממוצע?', question_en: 'How long does an average project take?' },
      { field: 'projects_metrics.biggest_blocker', question_he: 'מה הדבר שהכי מעכב את הפרויקטים שלך?', question_en: 'What is the biggest thing blocking your projects?' },
      { field: 'projects_metrics.project_management_tool', question_he: 'אתה משתמש בכלי לניהול פרויקטים? איזה?', question_en: 'Do you use a project management tool? Which one?' },
    ],
  },

  play: {
    fields: ['play_metrics'],
    questions: [
      { field: 'play_metrics.weekly_play_hours', question_he: 'כמה שעות בשבוע אתה מקדיש למשחק/כיף?', question_en: 'How many hours per week do you dedicate to play/fun?' },
      { field: 'play_metrics.play_activities', question_he: 'מה סוגי הפעילויות שאתה עושה בשביל כיף?', question_en: 'What types of activities do you do for fun?' },
      { field: 'play_metrics.last_vacation', question_he: 'מתי הייתה החופשה האחרונה שלך?', question_en: 'When was your last vacation?' },
      { field: 'play_metrics.rest_guilt_level', question_he: 'כמה אשמה מרגיש כשנח? (1-10)', question_en: 'How much guilt do you feel when resting? (1-10)' },
      { field: 'play_metrics.flow_state_frequency', question_he: 'כמה פעמים בשבוע אתה חווה flow?', question_en: 'How often do you experience flow state per week?' },
    ],
  },

  order: {
    fields: ['order_metrics'],
    questions: [
      { field: 'order_metrics.cleaning_frequency', question_he: 'כמה פעמים בשבוע אתה מנקה/מסדר?', question_en: 'How often do you clean/organize per week?' },
      { field: 'order_metrics.unread_emails', question_he: 'כמה מיילים לא נקראים יש לך?', question_en: 'How many unread emails do you have?' },
      { field: 'order_metrics.digital_organization', question_he: 'כמה מסודרת הסביבה הדיגיטלית שלך? (1-10)', question_en: 'How organized is your digital environment? (1-10)' },
      { field: 'order_metrics.has_daily_routine', question_he: 'יש לך שגרת סדר יומית קבועה?', question_en: 'Do you have a consistent daily routine?' },
      { field: 'order_metrics.space_satisfaction', question_he: 'כמה מרוצה אתה מהסביבה הפיזית שלך? (1-10)', question_en: 'How satisfied are you with your physical environment? (1-10)' },
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
    const hasSubscores = legacyLatest.subscores || legacyLatest.subsystems || legacyLatest.subScores;
    if (hasSubscores) {
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
      const metricsData = latest[field] || latest.metrics?.[field] || latest.domain_metrics;
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

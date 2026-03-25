import { DOMAIN_ASSESS_META } from '../domain-assess/types.js';

type Language = 'he' | 'en';

interface DomainMetricSpec {
  key: string;
  question: string;
  type: 'number' | 'string';
}

interface DomainPromptSpec {
  startQuestion: Record<Language, string>;
  style: Record<Language, string>;
  metrics: DomainMetricSpec[];
  willingnessRequired?: boolean;
}

const DOMAIN_PROMPTS: Record<string, DomainPromptSpec> = {
  vitality: {
    startQuestion: {
      he: 'איך נראים השינה, האנרגיה והתזונה שלך כרגע, בלי לייפות?',
      en: 'How do your sleep, energy, and nutrition look right now, without sugarcoating it?',
    },
    style: {
      he: 'התמקד בשינה, קצב יומי, תזונה, חומרים מעוררים והתאוששות. קצר, ישיר, שאלה אחת בכל פעם.',
      en: 'Focus on sleep, daily rhythm, nutrition, stimulants, and recovery. Keep it short, direct, and one question at a time.',
    },
    metrics: [
      { key: 'sleep_hours', question: 'How many hours do you sleep?', type: 'number' },
      { key: 'sleep_time', question: 'When do you usually fall asleep?', type: 'string' },
      { key: 'wake_time', question: 'When do you usually wake up?', type: 'string' },
      { key: 'diet_type', question: 'How would you describe your diet?', type: 'string' },
      { key: 'caffeine_cups', question: 'How many caffeinated drinks do you have per day?', type: 'number' },
    ],
  },
  focus: {
    startQuestion: {
      he: 'כמה זמן אתה באמת מסוגל להישאר מרוכז בלי לברוח לטלפון או להסחות?',
      en: 'How long can you actually stay focused before escaping to your phone or distractions?',
    },
    style: {
      he: 'בדוק ריכוז עמוק, שליטת דופמין, מסכים, מדיטציה וסבולת מנטלית.',
      en: 'Assess deep focus, dopamine control, screen habits, meditation, and mental endurance.',
    },
    metrics: [
      { key: 'deep_work_max_hours', question: 'What is your maximum deep-work block?', type: 'number' },
      { key: 'screen_time_hours', question: 'How many hours of screen time per day?', type: 'number' },
      { key: 'meditation_practice', question: 'Do you meditate? How often?', type: 'string' },
      { key: 'phone_pickups', question: 'How many times do you pick up your phone per day?', type: 'number' },
      { key: 'attention_span_minutes', question: 'How many minutes can you hold attention on one task?', type: 'number' },
    ],
  },
  power: {
    startQuestion: {
      he: 'כמה חזק הגוף שלך באמת היום, במספרים או בביצועים?',
      en: 'How strong is your body really today, in numbers or actual performance?',
    },
    style: {
      he: 'בדוק כוח מרבי, כוח יחסי, תרגילי משקל גוף, כוח מתפרץ ועקביות אימון.',
      en: 'Assess max strength, relative strength, bodyweight skill, explosiveness, and training consistency.',
    },
    metrics: [
      { key: 'training_type', question: 'What kind of training do you do?', type: 'string' },
      { key: 'training_frequency', question: 'How many times per week do you train?', type: 'number' },
      { key: 'max_pullups', question: 'What is your max pull-up count?', type: 'number' },
      { key: 'max_pushups', question: 'What is your max push-up count?', type: 'number' },
      { key: 'bodyweight', question: 'What is your bodyweight?', type: 'number' },
    ],
  },
  combat: {
    startQuestion: {
      he: 'אם מחר יש עימות, על מה אתה באמת יכול לסמוך?',
      en: 'If a real fight happened tomorrow, what could you honestly rely on?',
    },
    style: {
      he: 'בדוק רקע לחימה, אימון, ספראינג, קיבולת סיבובים ולחץ.',
      en: 'Assess fight background, training, sparring, round capacity, and pressure handling.',
    },
    metrics: [
      { key: 'disciplines', question: 'Which combat disciplines do you train?', type: 'string' },
      { key: 'training_frequency', question: 'How many combat sessions per week?', type: 'number' },
      { key: 'sparring_frequency', question: 'How often do you spar?', type: 'number' },
      { key: 'round_capacity', question: 'How many hard rounds can you handle?', type: 'number' },
      { key: 'training_mode', question: 'Mostly drills, bags, or live rounds?', type: 'string' },
    ],
  },
  expansion: {
    startQuestion: {
      he: 'איך אתה מרחיב את עצמך אינטלקטואלית כרגע, מעבר לגלילה?',
      en: 'How are you expanding yourself intellectually right now, beyond scrolling?',
    },
    style: {
      he: 'בדוק למידה, יצירה, שפות, סקרנות ויישום ידע.',
      en: 'Assess learning, creation, languages, curiosity, and knowledge application.',
    },
    metrics: [
      { key: 'books_per_month', question: 'How many books do you finish per month?', type: 'number' },
      { key: 'languages_spoken', question: 'How many languages do you speak?', type: 'number' },
      { key: 'current_learning_project', question: 'What are you actively learning right now?', type: 'string' },
      { key: 'creative_output_frequency', question: 'How often do you create something original?', type: 'string' },
      { key: 'learning_mode', question: 'How do you usually learn best?', type: 'string' },
    ],
  },
  wealth: {
    startQuestion: {
      he: 'מה הקשר האמיתי שלך לכסף כרגע?',
      en: 'What is your real relationship with money right now?',
    },
    style: {
      he: 'בדוק הכנסה, חיסכון, חוב, הזדמנויות ומיינדסט כלכלי.',
      en: 'Assess income, savings, debt, opportunities, and wealth mindset.',
    },
    metrics: [
      { key: 'monthly_income_range', question: 'What is your monthly income range?', type: 'string' },
      { key: 'income_streams', question: 'How many income streams do you have?', type: 'number' },
      { key: 'savings_rate', question: 'What percentage of income do you save?', type: 'number' },
      { key: 'debt_status', question: 'Do you have debt? How much?', type: 'string' },
      { key: 'financial_goal', question: 'What is your 12-month financial goal?', type: 'string' },
    ],
    willingnessRequired: true,
  },
  influence: {
    startQuestion: {
      he: 'כשאתה נכנס לחדר, מה באמת קורה?',
      en: 'When you enter a room, what really happens?',
    },
    style: {
      he: 'בדוק תקשורת, נוכחות, מנהיגות, רשת והשפעה.',
      en: 'Assess communication, presence, leadership, network, and influence.',
    },
    metrics: [
      { key: 'people_managed', question: 'How many people do you lead?', type: 'number' },
      { key: 'public_speaking_frequency', question: 'How often do you speak publicly per month?', type: 'number' },
      { key: 'content_creation', question: 'Do you create content? How often?', type: 'string' },
      { key: 'network_size', question: 'How many meaningful contacts are in your network?', type: 'number' },
      { key: 'negotiation_comfort', question: 'How comfortable are you negotiating from 1 to 10?', type: 'number' },
    ],
  },
  relationships: {
    startQuestion: {
      he: 'מי באמת קרוב אליך היום, ולא רק מכיר אותך?',
      en: 'Who is genuinely close to you today, not just familiar with you?',
    },
    style: {
      he: 'בדוק עומק קשר, גבולות, פגיעות, קונפליקט ותמיכה.',
      en: 'Assess connection depth, boundaries, vulnerability, conflict, and support.',
    },
    metrics: [
      { key: 'close_friends_count', question: 'How many truly close friends do you have?', type: 'number' },
      { key: 'relationship_status', question: 'What is your relationship status?', type: 'string' },
      { key: 'conflict_frequency', question: 'How many meaningful conflicts per month?', type: 'number' },
      { key: 'support_network_quality', question: 'How strong is your support network from 1 to 10?', type: 'number' },
      { key: 'vulnerability_comfort', question: 'How comfortable are you being vulnerable from 1 to 10?', type: 'number' },
    ],
    willingnessRequired: true,
  },
  romantics: {
    startQuestion: {
      he: 'מה מצב העולם הרומנטי שלך כרגע, באמת?',
      en: 'What is the real state of your romantic world right now?',
    },
    style: {
      he: 'בדוק דייטינג, משיכה, פגיעות, קונפליקט ושביעות רצון.',
      en: 'Assess dating, attraction, vulnerability, conflict, and romantic satisfaction.',
    },
    metrics: [
      { key: 'relationship_status', question: 'What is your relationship status?', type: 'string' },
      { key: 'dating_frequency', question: 'How often do you date or meet new people?', type: 'string' },
      { key: 'conflict_frequency', question: 'How many significant romantic conflicts per month?', type: 'number' },
      { key: 'vulnerability_comfort', question: 'How comfortable are you being vulnerable from 1 to 10?', type: 'number' },
      { key: 'romantic_satisfaction', question: 'How satisfied are you with your romantic life from 1 to 10?', type: 'number' },
    ],
    willingnessRequired: true,
  },
  business: {
    startQuestion: {
      he: 'אם העסק שלך קיים, מה הוא עושה ולמי?',
      en: 'If your business exists, what does it do and for whom?',
    },
    style: {
      he: 'בדוק מודל עסקי, הכנסות, צוות, מיצוב וצוואר בקבוק.',
      en: 'Assess business model, revenue, team, positioning, and bottlenecks.',
    },
    metrics: [
      { key: 'has_business', question: 'Do you have an active business?', type: 'string' },
      { key: 'monthly_revenue', question: 'What is the monthly revenue?', type: 'string' },
      { key: 'team_size', question: 'How many people are on the team?', type: 'number' },
      { key: 'years_in_operation', question: 'How many years has it been running?', type: 'number' },
      { key: 'biggest_bottleneck', question: 'What is the biggest bottleneck right now?', type: 'string' },
    ],
  },
  projects: {
    startQuestion: {
      he: 'מה הפרויקט הכי חשוב אצלך כרגע, ומה עוצר אותו?',
      en: 'What is your most important project right now, and what is blocking it?',
    },
    style: {
      he: 'בדוק חזון, ביצוע, משאבים, מיקוד והשלמה.',
      en: 'Assess vision, execution, resources, focus, and completion.',
    },
    metrics: [
      { key: 'active_projects_count', question: 'How many active projects are you juggling?', type: 'number' },
      { key: 'completion_rate', question: 'What percentage of your projects do you usually finish?', type: 'number' },
      { key: 'avg_project_duration', question: 'What is the average duration of a project?', type: 'string' },
      { key: 'biggest_blocker', question: 'What is the biggest blocker?', type: 'string' },
      { key: 'project_management_tool', question: 'What system do you use to manage projects?', type: 'string' },
    ],
  },
  play: {
    startQuestion: {
      he: 'מתי בפעם האחרונה באמת שיחקת או נהנית בלי יעד פרודוקטיבי?',
      en: 'When was the last time you genuinely played or had fun without a productive goal?',
    },
    style: {
      he: 'בדוק משחק, הנאה, מנוחה, חופשות וזרימה.',
      en: 'Assess play, joy, rest, vacations, and flow.',
    },
    metrics: [
      { key: 'weekly_play_hours', question: 'How many hours per week do you dedicate to play?', type: 'number' },
      { key: 'play_activities', question: 'What do you do for fun?', type: 'string' },
      { key: 'last_vacation', question: 'When was your last vacation?', type: 'string' },
      { key: 'rest_guilt_level', question: 'How much guilt do you feel when resting from 1 to 10?', type: 'number' },
      { key: 'flow_state_frequency', question: 'How often do you enter flow each week?', type: 'string' },
    ],
  },
  order: {
    startQuestion: {
      he: 'איך נראה הסדר שלך כרגע בבית, בשולחן העבודה ובטלפון?',
      en: 'What does your order look like right now at home, on your desk, and on your phone?',
    },
    style: {
      he: 'בדוק ניקיון, מערכות, סדר דיגיטלי, שגרה ושליטה סביבתית.',
      en: 'Assess cleanliness, systems, digital order, routine, and environmental control.',
    },
    metrics: [
      { key: 'cleaning_frequency', question: 'How often do you clean or organize each week?', type: 'string' },
      { key: 'unread_emails', question: 'How many unread emails do you have?', type: 'number' },
      { key: 'digital_organization', question: 'How organized is your digital environment from 1 to 10?', type: 'number' },
      { key: 'has_daily_routine', question: 'Do you have a consistent daily routine?', type: 'string' },
      { key: 'space_satisfaction', question: 'How satisfied are you with your physical environment from 1 to 10?', type: 'number' },
    ],
  },
  consciousness: {
    startQuestion: {
      he: 'עד כמה אתה באמת מודע למה שקורה בתוכך?',
      en: 'How aware are you really of what is happening inside you?',
    },
    style: {
      he: 'בדוק מודעות עצמית, טריגרים, יומן, מיינדפולנס ודיאלוג פנימי.',
      en: 'Assess self-awareness, triggers, journaling, mindfulness, and inner dialogue.',
    },
    metrics: [
      { key: 'self_reflection_practice', question: 'How often do you self-reflect?', type: 'string' },
      { key: 'journaling_frequency', question: 'How many times per week do you journal?', type: 'number' },
      { key: 'emotional_trigger_awareness', question: 'How aware are you of your triggers from 1 to 10?', type: 'number' },
      { key: 'inner_dialogue_quality', question: 'How would you describe your inner dialogue?', type: 'string' },
      { key: 'mindfulness_moments', question: 'How many mindful moments do you have per day?', type: 'number' },
    ],
  },
  presence: {
    startQuestion: {
      he: 'איך אתה נראה ומורגש מבחוץ כרגע, בלי פילטרים?',
      en: 'How do you look and land externally right now, without filters?',
    },
    style: {
      he: 'בדוק טיפוח, סגנון, יציבה, מודעות תדמית והרגלי הופעה.',
      en: 'Assess grooming, style, posture, image awareness, and presentation habits.',
    },
    metrics: [
      { key: 'skincare_routine', question: 'Do you have a skincare or grooming routine?', type: 'string' },
      { key: 'last_style_purchase', question: 'When was your last intentional style purchase?', type: 'string' },
      { key: 'posture_awareness', question: 'How aware are you of your posture from 1 to 10?', type: 'number' },
      { key: 'grooming_frequency', question: 'How often do you groom intentionally?', type: 'string' },
      { key: 'style_confidence', question: 'How confident are you in your style from 1 to 10?', type: 'number' },
    ],
  },
};

export function buildExtractDomainProfileTool(domainId: string) {
  const meta = DOMAIN_ASSESS_META[domainId];
  if (!meta) {
    throw new Error(`Unknown domain: ${domainId}`);
  }

  const subsystemProps = Object.fromEntries(
    meta.subsystems.map((subsystem) => [
      subsystem.id,
      {
        type: 'number',
        description: `0-100 score for ${subsystem.id}`,
      },
    ])
  );

  return {
    type: 'function' as const,
    function: {
      name: 'extract_domain_profile',
      description: 'Extract the final domain assessment once enough evidence has been collected.',
      parameters: {
        type: 'object',
        properties: {
          subscores: {
            type: 'object',
            properties: subsystemProps,
            required: meta.subsystems.map((subsystem) => subsystem.id),
          },
          findings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                text_he: { type: 'string' },
                text_en: { type: 'string' },
                severity: { type: 'string', enum: ['low', 'med', 'high'] },
                subsystem: { type: 'string', enum: meta.subsystems.map((subsystem) => subsystem.id) },
              },
              required: ['id', 'text_he', 'text_en', 'severity', 'subsystem'],
            },
          },
          mirror_statement: {
            type: 'object',
            properties: {
              he: { type: 'string' },
              en: { type: 'string' },
            },
            required: ['he', 'en'],
          },
          one_next_step: {
            type: 'object',
            properties: {
              he: { type: 'string' },
              en: { type: 'string' },
            },
            required: ['he', 'en'],
          },
          willingness: {
            type: 'object',
            properties: {
              willing_to_do: { type: 'array', items: { type: 'string' } },
              not_willing_to_do: { type: 'array', items: { type: 'string' } },
              open_to_try: { type: 'array', items: { type: 'string' } },
              constraints: { type: 'array', items: { type: 'string' } },
            },
            required: ['willing_to_do', 'not_willing_to_do'],
          },
          domain_metrics: {
            type: 'object',
            additionalProperties: true,
          },
          confidence: {
            type: 'string',
            enum: ['low', 'med', 'high'],
          },
        },
        required: ['subscores', 'findings', 'mirror_statement', 'one_next_step', 'willingness', 'domain_metrics', 'confidence'],
      },
    },
  };
}

export function buildDomainAssessSystemPrompt(domainId: string, language: string) {
  const meta = DOMAIN_ASSESS_META[domainId];
  const spec = DOMAIN_PROMPTS[domainId];

  if (!meta || !spec) {
    throw new Error(`Unsupported domain: ${domainId}`);
  }

  const lang = language === 'he' ? 'he' : 'en';
  const metricsBlock = spec.metrics
    .map((metric, index) => `${index + 1}. ${metric.question} -> ${metric.key}`)
    .join('\n');
  const subsystemBlock = meta.subsystems
    .map((subsystem, index) => `${index + 1}. ${subsystem.id}`)
    .join('\n');

  const willingnessBlock = spec.willingnessRequired
    ? lang === 'he'
      ? '\nלפני הסיום חובה לשאול מה המשתמש מוכן לעשות ומה מחוץ לתחום, ולשמור זאת בשדה willingness.'
      : '\nBefore finishing, you must ask what the user is willing to do and what is off the table, then store it in willingness.'
    : '';

  if (lang === 'he') {
    return [
      'אתה סוכן אבחון דומיין של MindOS.',
      'נהל שיחה חדה, קצרה וישירה. שאלה אחת בכל פעם. 6-10 הודעות בדרך כלל.',
      `התחל בדיוק עם: "${spec.startQuestion.he}"`,
      `תחום: ${domainId}`,
      `תתי-מערכות לבדיקה:\n${subsystemBlock}`,
      `פוקוס שיחה: ${spec.style.he}`,
      `מדדים חובה לפני extract_domain_profile:\n${metricsBlock}`,
      'אל תיתן עצות במהלך האבחון. תאסוף מידע, תאתגר סתירות, ותענה רק בעברית.',
      'כשהמידע מספיק, קרא לפונקציה extract_domain_profile.',
      willingnessBlock,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    'You are the MindOS domain assessment agent.',
    'Run a sharp, short, direct assessment. One question at a time. Usually 6-10 messages.',
    `Start exactly with: "${spec.startQuestion.en}"`,
    `Domain: ${domainId}`,
    `Subsystems to assess:\n${subsystemBlock}`,
    `Conversation focus: ${spec.style.en}`,
    `Mandatory metrics before extract_domain_profile:\n${metricsBlock}`,
    'Do not give advice during the assessment. Gather evidence, challenge contradictions, and respond only in English.',
    'When there is enough evidence, call extract_domain_profile.',
    willingnessBlock,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Job System - RPG-Style Identity Progression
 * 
 * Instead of fixed archetypes, the AI assigns a dynamic "Job" to users
 * based on their onboarding data. Jobs evolve with level progression.
 */

export type JobCategory = 
  | 'warrior'          // Physical, action-oriented
  | 'intellectual'     // Knowledge, strategy
  | 'creative'         // Arts, innovation
  | 'spiritual'        // Mystical, intuitive
  | 'entrepreneur'     // Business, leadership
  | 'healer';          // Helping, nurturing

export type JobTier = 1 | 2 | 3 | 4;

export interface JobDefinition {
  id: string;
  nameHe: string;
  nameEn: string;
  tier: JobTier;
  category: JobCategory;
  icon: string;
  descriptionHe: string;
  descriptionEn: string;
  minLevel: number;
  nextJobIds: string[];  // Possible advancement paths
  visualProperties: JobVisualProperties;
}

export interface JobVisualProperties {
  primaryHue: number;
  secondaryHue: number;
  saturation: number;
  lightness: number;
  morphology: 'sharp' | 'organic' | 'geometric' | 'flowing' | 'crystalline';
  particleType: 'electric' | 'flames' | 'mist' | 'sparks' | 'glow' | 'none';
  intensity: number;  // 0-1
}

export interface UserJob {
  jobId: string;
  jobName: string;
  jobNameEn: string;
  tier: JobTier;
  icon: string;
  description: string;
  category: JobCategory;
  nextJobAtLevel: number;
  nextJobPreview: string;
  visualProperties: JobVisualProperties;
}

// ============================================
// JOB DEFINITIONS - TIER 1 (Levels 1-3)
// ============================================

const TIER_1_JOBS: Record<string, JobDefinition> = {
  'mind-apprentice': {
    id: 'mind-apprentice',
    nameHe: 'שוליה של המוח',
    nameEn: 'Mind Apprentice',
    tier: 1,
    category: 'intellectual',
    icon: '🧠',
    descriptionHe: 'חוקר מתחיל שלומד להבין את עצמו',
    descriptionEn: 'A beginner explorer learning to understand themselves',
    minLevel: 1,
    nextJobIds: ['mind-ninja', 'reality-architect'],
    visualProperties: {
      primaryHue: 210,
      secondaryHue: 240,
      saturation: 70,
      lightness: 55,
      morphology: 'flowing',
      particleType: 'mist',
      intensity: 0.5,
    },
  },
  'warrior-trainee': {
    id: 'warrior-trainee',
    nameHe: 'חניך הלוחם',
    nameEn: 'Warrior Trainee',
    tier: 1,
    category: 'warrior',
    icon: '⚔️',
    descriptionHe: 'לוחם צעיר שבונה את הכוח הפנימי',
    descriptionEn: 'A young warrior building inner strength',
    minLevel: 1,
    nextJobIds: ['combat-monk', 'shadow-striker'],
    visualProperties: {
      primaryHue: 15,
      secondaryHue: 35,
      saturation: 80,
      lightness: 50,
      morphology: 'sharp',
      particleType: 'flames',
      intensity: 0.6,
    },
  },
  'dream-apprentice': {
    id: 'dream-apprentice',
    nameHe: 'שוליה של החלומות',
    nameEn: 'Dream Apprentice',
    tier: 1,
    category: 'creative',
    icon: '🎨',
    descriptionHe: 'יוצר מתחיל שמגלה את הכוח היצירתי',
    descriptionEn: 'A creator discovering their creative power',
    minLevel: 1,
    nextJobIds: ['reality-weaver', 'vision-painter'],
    visualProperties: {
      primaryHue: 300,
      secondaryHue: 330,
      saturation: 75,
      lightness: 55,
      morphology: 'organic',
      particleType: 'glow',
      intensity: 0.55,
    },
  },
  'mystic-initiate': {
    id: 'mystic-initiate',
    nameHe: 'מיסטיקאי מתחיל',
    nameEn: 'Mystic Initiate',
    tier: 1,
    category: 'spiritual',
    icon: '🔮',
    descriptionHe: 'נשמה חוקרת שמתחילה לראות מעבר',
    descriptionEn: 'A seeking soul beginning to see beyond',
    minLevel: 1,
    nextJobIds: ['shadow-walker', 'consciousness-diver'],
    visualProperties: {
      primaryHue: 270,
      secondaryHue: 290,
      saturation: 65,
      lightness: 48,
      morphology: 'flowing',
      particleType: 'mist',
      intensity: 0.5,
    },
  },
  'path-finder': {
    id: 'path-finder',
    nameHe: 'מוצא הדרכים',
    nameEn: 'Path Finder',
    tier: 1,
    category: 'entrepreneur',
    icon: '🧭',
    descriptionHe: 'חוקר שמחפש את הדרך שלו בעולם',
    descriptionEn: 'An explorer seeking their path in the world',
    minLevel: 1,
    nextJobIds: ['reality-hacker', 'empire-builder'],
    visualProperties: {
      primaryHue: 45,
      secondaryHue: 60,
      saturation: 80,
      lightness: 55,
      morphology: 'crystalline',
      particleType: 'sparks',
      intensity: 0.6,
    },
  },
  'heart-healer': {
    id: 'heart-healer',
    nameHe: 'מרפא הלבבות',
    nameEn: 'Heart Healer',
    tier: 1,
    category: 'healer',
    icon: '💚',
    descriptionHe: 'נשמה רגישה שלומדת לרפא',
    descriptionEn: 'A sensitive soul learning to heal',
    minLevel: 1,
    nextJobIds: ['soul-mender', 'energy-guardian'],
    visualProperties: {
      primaryHue: 150,
      secondaryHue: 170,
      saturation: 65,
      lightness: 50,
      morphology: 'organic',
      particleType: 'glow',
      intensity: 0.5,
    },
  },
};

// ============================================
// JOB DEFINITIONS - TIER 2 (Levels 4-6)
// ============================================

const TIER_2_JOBS: Record<string, JobDefinition> = {
  'mind-ninja': {
    id: 'mind-ninja',
    nameHe: 'נינג\'ה של המוח',
    nameEn: 'Mind Ninja',
    tier: 2,
    category: 'intellectual',
    icon: '🥷',
    descriptionHe: 'לוחם שקט שמשתלט על המוח בדיוק כירורגי',
    descriptionEn: 'A silent warrior mastering the mind with surgical precision',
    minLevel: 4,
    nextJobIds: ['consciousness-sage', 'reality-master'],
    visualProperties: {
      primaryHue: 220,
      secondaryHue: 15,
      saturation: 75,
      lightness: 45,
      morphology: 'sharp',
      particleType: 'electric',
      intensity: 0.7,
    },
  },
  'reality-architect': {
    id: 'reality-architect',
    nameHe: 'ארכיטקט המציאות',
    nameEn: 'Reality Architect',
    tier: 2,
    category: 'intellectual',
    icon: '🏛️',
    descriptionHe: 'בונה עולמות חדשים מתוך מחשבה',
    descriptionEn: 'Building new worlds from thought',
    minLevel: 4,
    nextJobIds: ['consciousness-sage', 'infinite-player'],
    visualProperties: {
      primaryHue: 200,
      secondaryHue: 180,
      saturation: 80,
      lightness: 50,
      morphology: 'geometric',
      particleType: 'electric',
      intensity: 0.75,
    },
  },
  'combat-monk': {
    id: 'combat-monk',
    nameHe: 'נזיר הקרב',
    nameEn: 'Combat Monk',
    tier: 2,
    category: 'warrior',
    icon: '🥋',
    descriptionHe: 'לוחם שמאזן בין כוח לשלווה',
    descriptionEn: 'A warrior balancing power with serenity',
    minLevel: 4,
    nextJobIds: ['legendary-warrior', 'shadow-master'],
    visualProperties: {
      primaryHue: 25,
      secondaryHue: 270,
      saturation: 75,
      lightness: 48,
      morphology: 'sharp',
      particleType: 'flames',
      intensity: 0.75,
    },
  },
  'shadow-striker': {
    id: 'shadow-striker',
    nameHe: 'פוגע הצללים',
    nameEn: 'Shadow Striker',
    tier: 2,
    category: 'warrior',
    icon: '🗡️',
    descriptionHe: 'תוקף מהחושך עם דיוק קטלני',
    descriptionEn: 'Striking from darkness with lethal precision',
    minLevel: 4,
    nextJobIds: ['shadow-master', 'legendary-warrior'],
    visualProperties: {
      primaryHue: 0,
      secondaryHue: 280,
      saturation: 70,
      lightness: 35,
      morphology: 'sharp',
      particleType: 'sparks',
      intensity: 0.8,
    },
  },
  'reality-weaver': {
    id: 'reality-weaver',
    nameHe: 'טווה המציאות',
    nameEn: 'Reality Weaver',
    tier: 2,
    category: 'creative',
    icon: '🕸️',
    descriptionHe: 'אורג את חוטי המציאות ליצירות חדשות',
    descriptionEn: 'Weaving reality threads into new creations',
    minLevel: 4,
    nextJobIds: ['creation-master', 'infinite-player'],
    visualProperties: {
      primaryHue: 280,
      secondaryHue: 320,
      saturation: 80,
      lightness: 55,
      morphology: 'organic',
      particleType: 'glow',
      intensity: 0.7,
    },
  },
  'vision-painter': {
    id: 'vision-painter',
    nameHe: 'צייר החזונות',
    nameEn: 'Vision Painter',
    tier: 2,
    category: 'creative',
    icon: '🖌️',
    descriptionHe: 'הופך חזונות לתמונות מציאות',
    descriptionEn: 'Transforming visions into reality paintings',
    minLevel: 4,
    nextJobIds: ['creation-master', 'reality-master'],
    visualProperties: {
      primaryHue: 320,
      secondaryHue: 40,
      saturation: 85,
      lightness: 58,
      morphology: 'organic',
      particleType: 'sparks',
      intensity: 0.7,
    },
  },
  'shadow-walker': {
    id: 'shadow-walker',
    nameHe: 'הולך הצללים',
    nameEn: 'Shadow Walker',
    tier: 2,
    category: 'spiritual',
    icon: '🌑',
    descriptionHe: 'נע בין העולמות, רואה את הנסתר',
    descriptionEn: 'Moving between worlds, seeing the hidden',
    minLevel: 4,
    nextJobIds: ['consciousness-sage', 'fate-shaper'],
    visualProperties: {
      primaryHue: 260,
      secondaryHue: 0,
      saturation: 60,
      lightness: 40,
      morphology: 'flowing',
      particleType: 'mist',
      intensity: 0.65,
    },
  },
  'consciousness-diver': {
    id: 'consciousness-diver',
    nameHe: 'צולל התודעה',
    nameEn: 'Consciousness Diver',
    tier: 2,
    category: 'spiritual',
    icon: '🌊',
    descriptionHe: 'צולל למעמקי התודעה האינסופית',
    descriptionEn: 'Diving into infinite depths of consciousness',
    minLevel: 4,
    nextJobIds: ['consciousness-sage', 'infinite-player'],
    visualProperties: {
      primaryHue: 240,
      secondaryHue: 180,
      saturation: 70,
      lightness: 45,
      morphology: 'flowing',
      particleType: 'mist',
      intensity: 0.6,
    },
  },
  'reality-hacker': {
    id: 'reality-hacker',
    nameHe: 'האקר המציאות',
    nameEn: 'Reality Hacker',
    tier: 2,
    category: 'entrepreneur',
    icon: '💻',
    descriptionHe: 'פורץ את קודי המציאות ומשנה אותם',
    descriptionEn: 'Breaking reality codes and rewriting them',
    minLevel: 4,
    nextJobIds: ['infinite-player', 'reality-master'],
    visualProperties: {
      primaryHue: 170,
      secondaryHue: 45,
      saturation: 85,
      lightness: 50,
      morphology: 'crystalline',
      particleType: 'electric',
      intensity: 0.8,
    },
  },
  'empire-builder': {
    id: 'empire-builder',
    nameHe: 'בונה האימפריות',
    nameEn: 'Empire Builder',
    tier: 2,
    category: 'entrepreneur',
    icon: '👑',
    descriptionHe: 'בונה ממלכות מתוך חזון וכוח רצון',
    descriptionEn: 'Building kingdoms from vision and willpower',
    minLevel: 4,
    nextJobIds: ['infinite-player', 'legendary-warrior'],
    visualProperties: {
      primaryHue: 40,
      secondaryHue: 10,
      saturation: 90,
      lightness: 52,
      morphology: 'geometric',
      particleType: 'sparks',
      intensity: 0.75,
    },
  },
  'soul-mender': {
    id: 'soul-mender',
    nameHe: 'תופר הנשמות',
    nameEn: 'Soul Mender',
    tier: 2,
    category: 'healer',
    icon: '✨',
    descriptionHe: 'מרפא את השברים העמוקים ביותר',
    descriptionEn: 'Healing the deepest fractures',
    minLevel: 4,
    nextJobIds: ['light-bearer', 'consciousness-sage'],
    visualProperties: {
      primaryHue: 160,
      secondaryHue: 200,
      saturation: 70,
      lightness: 55,
      morphology: 'organic',
      particleType: 'glow',
      intensity: 0.65,
    },
  },
  'energy-guardian': {
    id: 'energy-guardian',
    nameHe: 'שומר האנרגיה',
    nameEn: 'Energy Guardian',
    tier: 2,
    category: 'healer',
    icon: '🛡️',
    descriptionHe: 'שומר ומגן על האנרגיה הקולקטיבית',
    descriptionEn: 'Protecting and guarding collective energy',
    minLevel: 4,
    nextJobIds: ['light-bearer', 'legendary-warrior'],
    visualProperties: {
      primaryHue: 140,
      secondaryHue: 45,
      saturation: 65,
      lightness: 48,
      morphology: 'geometric',
      particleType: 'glow',
      intensity: 0.7,
    },
  },
};

// ============================================
// JOB DEFINITIONS - TIER 3 (Levels 7-9)
// ============================================

const TIER_3_JOBS: Record<string, JobDefinition> = {
  'shadow-master': {
    id: 'shadow-master',
    nameHe: 'שליט הצללים',
    nameEn: 'Shadow Master',
    tier: 3,
    category: 'warrior',
    icon: '🌘',
    descriptionHe: 'שולט באופל ובאור בשליטה מוחלטת',
    descriptionEn: 'Mastering both darkness and light with absolute control',
    minLevel: 7,
    nextJobIds: ['transcendent-being'],
    visualProperties: {
      primaryHue: 280,
      secondaryHue: 0,
      saturation: 60,
      lightness: 30,
      morphology: 'sharp',
      particleType: 'sparks',
      intensity: 0.85,
    },
  },
  'legendary-warrior': {
    id: 'legendary-warrior',
    nameHe: 'הלוחם האגדי',
    nameEn: 'Legendary Warrior',
    tier: 3,
    category: 'warrior',
    icon: '⚡',
    descriptionHe: 'לוחם שהפך לאגדה חיה',
    descriptionEn: 'A warrior who has become a living legend',
    minLevel: 7,
    nextJobIds: ['transcendent-being'],
    visualProperties: {
      primaryHue: 30,
      secondaryHue: 50,
      saturation: 90,
      lightness: 55,
      morphology: 'sharp',
      particleType: 'flames',
      intensity: 0.9,
    },
  },
  'fate-shaper': {
    id: 'fate-shaper',
    nameHe: 'מעצב הגורל',
    nameEn: 'Fate Shaper',
    tier: 3,
    category: 'spiritual',
    icon: '🌟',
    descriptionHe: 'משנה את חוטי הגורל לפי רצונו',
    descriptionEn: 'Reshaping the threads of fate at will',
    minLevel: 7,
    nextJobIds: ['transcendent-being'],
    visualProperties: {
      primaryHue: 275,
      secondaryHue: 45,
      saturation: 75,
      lightness: 50,
      morphology: 'flowing',
      particleType: 'glow',
      intensity: 0.85,
    },
  },
  'consciousness-sage': {
    id: 'consciousness-sage',
    nameHe: 'חכם התודעה',
    nameEn: 'Consciousness Sage',
    tier: 3,
    category: 'spiritual',
    icon: '🧘',
    descriptionHe: 'הגיע לרמות גבוהות של הבנה ותודעה',
    descriptionEn: 'Reached high levels of understanding and consciousness',
    minLevel: 7,
    nextJobIds: ['transcendent-being'],
    visualProperties: {
      primaryHue: 250,
      secondaryHue: 180,
      saturation: 60,
      lightness: 55,
      morphology: 'organic',
      particleType: 'mist',
      intensity: 0.75,
    },
  },
  'creation-master': {
    id: 'creation-master',
    nameHe: 'אדון היצירה',
    nameEn: 'Creation Master',
    tier: 3,
    category: 'creative',
    icon: '🌈',
    descriptionHe: 'מייצר מציאויות חדשות מהדמיון הטהור',
    descriptionEn: 'Manifesting new realities from pure imagination',
    minLevel: 7,
    nextJobIds: ['transcendent-being'],
    visualProperties: {
      primaryHue: 300,
      secondaryHue: 60,
      saturation: 85,
      lightness: 60,
      morphology: 'organic',
      particleType: 'glow',
      intensity: 0.85,
    },
  },
  'reality-master': {
    id: 'reality-master',
    nameHe: 'שליט המציאות',
    nameEn: 'Reality Master',
    tier: 3,
    category: 'intellectual',
    icon: '🌐',
    descriptionHe: 'שולט בחוקי המציאות עצמה',
    descriptionEn: 'Mastering the laws of reality itself',
    minLevel: 7,
    nextJobIds: ['transcendent-being'],
    visualProperties: {
      primaryHue: 200,
      secondaryHue: 280,
      saturation: 80,
      lightness: 50,
      morphology: 'crystalline',
      particleType: 'electric',
      intensity: 0.9,
    },
  },
  'infinite-player': {
    id: 'infinite-player',
    nameHe: 'השחקן האינסופי',
    nameEn: 'Infinite Player',
    tier: 3,
    category: 'entrepreneur',
    icon: '♾️',
    descriptionHe: 'משחק את המשחק האינסופי של החיים',
    descriptionEn: 'Playing the infinite game of life',
    minLevel: 7,
    nextJobIds: ['transcendent-being'],
    visualProperties: {
      primaryHue: 45,
      secondaryHue: 180,
      saturation: 85,
      lightness: 55,
      morphology: 'crystalline',
      particleType: 'sparks',
      intensity: 0.85,
    },
  },
  'light-bearer': {
    id: 'light-bearer',
    nameHe: 'נושא האור',
    nameEn: 'Light Bearer',
    tier: 3,
    category: 'healer',
    icon: '🕯️',
    descriptionHe: 'מביא אור לחושך ומרפא את העולם',
    descriptionEn: 'Bringing light to darkness and healing the world',
    minLevel: 7,
    nextJobIds: ['transcendent-being'],
    visualProperties: {
      primaryHue: 50,
      secondaryHue: 30,
      saturation: 90,
      lightness: 65,
      morphology: 'organic',
      particleType: 'glow',
      intensity: 0.9,
    },
  },
};

// ============================================
// JOB DEFINITIONS - TIER 4 (Level 10+)
// ============================================

const TIER_4_JOBS: Record<string, JobDefinition> = {
  'transcendent-being': {
    id: 'transcendent-being',
    nameHe: 'היש המתעלה',
    nameEn: 'Transcendent Being',
    tier: 4,
    category: 'spiritual',
    icon: '🌌',
    descriptionHe: 'התעלה מעבר לגבולות ההבנה הרגילה',
    descriptionEn: 'Transcended beyond ordinary understanding',
    minLevel: 10,
    nextJobIds: [],
    visualProperties: {
      primaryHue: 280,
      secondaryHue: 180,
      saturation: 75,
      lightness: 50,
      morphology: 'flowing',
      particleType: 'glow',
      intensity: 1.0,
    },
  },
};

// ============================================
// COMBINED JOB REGISTRY
// ============================================

export const ALL_JOBS: Record<string, JobDefinition> = {
  ...TIER_1_JOBS,
  ...TIER_2_JOBS,
  ...TIER_3_JOBS,
  ...TIER_4_JOBS,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getJob(jobId: string): JobDefinition | null {
  return ALL_JOBS[jobId] || null;
}

export function getJobsByTier(tier: JobTier): JobDefinition[] {
  return Object.values(ALL_JOBS).filter(job => job.tier === tier);
}

export function getJobsByCategory(category: JobCategory): JobDefinition[] {
  return Object.values(ALL_JOBS).filter(job => job.category === category);
}

export function getStarterJobs(): JobDefinition[] {
  return Object.values(TIER_1_JOBS);
}

export function getNextJobs(currentJobId: string): JobDefinition[] {
  const currentJob = getJob(currentJobId);
  if (!currentJob) return [];
  
  return currentJob.nextJobIds
    .map(id => getJob(id))
    .filter((job): job is JobDefinition => job !== null);
}

export function getTierForLevel(level: number): JobTier {
  if (level >= 10) return 4;
  if (level >= 7) return 3;
  if (level >= 4) return 2;
  return 1;
}

export function getNextAdvancementLevel(currentTier: JobTier): number | null {
  switch (currentTier) {
    case 1: return 4;
    case 2: return 7;
    case 3: return 10;
    case 4: return null; // Max tier
  }
}

/**
 * Map category keywords to job categories
 */
export const CATEGORY_KEYWORDS: Record<string, JobCategory[]> = {
  // Physical/warrior keywords
  'martial-arts': ['warrior'],
  'gym': ['warrior'],
  'sports': ['warrior'],
  'fitness': ['warrior'],
  'running': ['warrior'],
  'swimming': ['warrior', 'healer'],
  
  // Intellectual keywords
  'coding': ['intellectual'],
  'technology': ['intellectual'],
  'science': ['intellectual'],
  'reading': ['intellectual'],
  'psychology': ['intellectual'],
  'philosophy': ['intellectual', 'spiritual'],
  'languages': ['intellectual'],
  'gaming': ['intellectual'],
  
  // Creative keywords
  'art': ['creative'],
  'music': ['creative'],
  'writing': ['creative'],
  'photography': ['creative'],
  'design': ['creative'],
  'dance': ['creative', 'warrior'],
  'crafts': ['creative'],
  
  // Spiritual keywords
  'meditation': ['spiritual'],
  'tarot': ['spiritual'],
  'astrology': ['spiritual'],
  'spirituality': ['spiritual'],
  'magic': ['spiritual'],
  'yoga': ['spiritual', 'healer'],
  
  // Entrepreneur keywords
  'entrepreneurship': ['entrepreneur'],
  'business': ['entrepreneur'],
  'investing': ['entrepreneur'],
  'marketing': ['entrepreneur', 'creative'],
  'travel': ['entrepreneur'],
  'networking': ['entrepreneur'],
  
  // Healer keywords
  'volunteering': ['healer'],
  'mentoring': ['healer'],
  'community': ['healer'],
  'gardening': ['healer'],
  'nature': ['healer'],
  'helping': ['healer'],
};

/**
 * Determine the best starter job category based on user data
 */
export function determineJobCategory(
  hobbies: string[],
  priorities: string[],
  behaviors: { decision?: string; conflict?: string; problem?: string }
): JobCategory {
  const categoryScores: Record<JobCategory, number> = {
    warrior: 0,
    intellectual: 0,
    creative: 0,
    spiritual: 0,
    entrepreneur: 0,
    healer: 0,
  };
  
  // Score based on hobbies
  for (const hobby of hobbies) {
    const categories = CATEGORY_KEYWORDS[hobby.toLowerCase()];
    if (categories) {
      categories.forEach(cat => {
        categoryScores[cat] += categories.length === 1 ? 2 : 1;
      });
    }
  }
  
  // Score based on priorities
  const priorityMapping: Record<string, JobCategory[]> = {
    career: ['entrepreneur', 'warrior'],
    health: ['warrior', 'healer'],
    spirituality: ['spiritual'],
    creativity: ['creative'],
    wealth: ['entrepreneur'],
    freedom: ['entrepreneur'],
    learning: ['intellectual'],
    adventure: ['warrior', 'entrepreneur'],
    impact: ['healer'],
    family: ['healer'],
    relationships: ['healer'],
  };
  
  for (const priority of priorities) {
    const categories = priorityMapping[priority.toLowerCase()];
    if (categories) {
      categories.forEach(cat => {
        categoryScores[cat] += 1;
      });
    }
  }
  
  // Score based on behaviors
  if (behaviors.decision === 'gut-feeling' || behaviors.decision === 'quick-decision') {
    categoryScores.warrior += 1;
  }
  if (behaviors.decision === 'pros-cons' || behaviors.decision === 'research-first') {
    categoryScores.intellectual += 1;
  }
  if (behaviors.conflict === 'direct') {
    categoryScores.warrior += 1;
  }
  if (behaviors.conflict === 'diplomatic' || behaviors.conflict === 'avoid') {
    categoryScores.healer += 1;
  }
  if (behaviors.problem === 'solve-immediately') {
    categoryScores.warrior += 1;
    categoryScores.entrepreneur += 1;
  }
  
  // Find highest scoring category
  let maxCategory: JobCategory = 'intellectual';
  let maxScore = 0;
  
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category as JobCategory;
    }
  }
  
  return maxCategory;
}

/**
 * Get the best starter job for a category
 */
export function getStarterJobForCategory(category: JobCategory): JobDefinition {
  const categoryToJob: Record<JobCategory, string> = {
    warrior: 'warrior-trainee',
    intellectual: 'mind-apprentice',
    creative: 'dream-apprentice',
    spiritual: 'mystic-initiate',
    entrepreneur: 'path-finder',
    healer: 'heart-healer',
  };
  
  return ALL_JOBS[categoryToJob[category]];
}

/**
 * Convert job visual properties to HSL color strings
 */
export function jobToColorStrings(job: JobDefinition): {
  primary: string;
  secondary: string;
  accent: string;
} {
  const { primaryHue, secondaryHue, saturation, lightness } = job.visualProperties;
  
  return {
    primary: `${primaryHue} ${saturation}% ${lightness}%`,
    secondary: `${secondaryHue} ${saturation - 5}% ${lightness + 5}%`,
    accent: `${(primaryHue + secondaryHue) / 2} ${saturation}% ${lightness + 10}%`,
  };
}

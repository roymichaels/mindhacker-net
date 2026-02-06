/**
 * Standardized Query Key Factory
 * 
 * Centralizes all React Query keys to prevent cache collisions
 * and ensure consistent invalidation patterns across the application.
 */

export const QUERY_KEYS = {
  // === User & Profile ===
  profile: (userId: string) => ['profile', userId] as const,
  userRoles: (userId: string) => ['user-roles', userId] as const,
  
  // === Gamification ===
  gameState: (userId: string) => ['game-state', userId] as const,
  achievements: (userId: string) => ['achievements', userId] as const,
  sessions: (userId: string) => ['hypnosis-sessions', userId] as const,
  
  // === Aurora Life Model ===
  aurora: {
    lifeDirection: (userId: string) => ['aurora', 'life-direction', userId] as const,
    energyPatterns: (userId: string) => ['aurora', 'energy-patterns', userId] as const,
    behavioralPatterns: (userId: string) => ['aurora', 'behavioral-patterns', userId] as const,
    focusPlans: (userId: string) => ['aurora', 'focus-plans', userId] as const,
    dailyMinimums: (userId: string) => ['aurora', 'daily-minimums', userId] as const,
    identityElements: (userId: string) => ['aurora', 'identity-elements', userId] as const,
    lifeVisions: (userId: string) => ['aurora', 'life-visions', userId] as const,
    commitments: (userId: string) => ['aurora', 'commitments', userId] as const,
    onboardingProgress: (userId: string) => ['aurora', 'onboarding-progress', userId] as const,
    checklists: (userId: string) => ['aurora', 'checklists', userId] as const,
    reminders: (userId: string) => ['aurora', 'reminders', userId] as const,
    conversations: (userId: string) => ['aurora', 'conversations', userId] as const,
    messages: (conversationId: string) => ['aurora', 'messages', conversationId] as const,
  },
  
  // === Launchpad / Journey ===
  launchpad: {
    progress: (userId: string) => ['launchpad', 'progress', userId] as const,
    data: (userId: string) => ['launchpad', 'data', userId] as const,
  },
  
  // === Business Journey ===
  business: {
    journey: (userId: string) => ['business', 'journey', userId] as const,
    plan: (businessId: string) => ['business', 'plan', businessId] as const,
    milestones: (planId: string) => ['business', 'milestones', planId] as const,
    branding: (businessId: string) => ['business', 'branding', businessId] as const,
    orb: (businessId: string) => ['business', 'orb', businessId] as const,
  },
  
  // === Content ===
  content: {
    products: () => ['content', 'products'] as const,
    product: (slug: string) => ['content', 'product', slug] as const,
    episodes: (productId: string) => ['content', 'episodes', productId] as const,
    purchases: (userId: string) => ['content', 'purchases', userId] as const,
    enrollments: (userId: string) => ['content', 'enrollments', userId] as const,
  },
  
  // === Community ===
  community: {
    posts: () => ['community', 'posts'] as const,
    post: (postId: string) => ['community', 'post', postId] as const,
    members: () => ['community', 'members'] as const,
    events: () => ['community', 'events'] as const,
  },
  
  // === Hypnosis ===
  hypnosis: {
    sessions: (userId: string) => ['hypnosis', 'sessions', userId] as const,
    daily: (userId: string) => ['hypnosis', 'daily', userId] as const,
    videos: () => ['hypnosis', 'videos'] as const,
  },
  
  // === Admin ===
  admin: {
    users: () => ['admin', 'users'] as const,
    notifications: () => ['admin', 'notifications'] as const,
    analytics: () => ['admin', 'analytics'] as const,
    bugReports: () => ['admin', 'bug-reports'] as const,
  },
  
  // === Coach ===
  coach: {
    clients: (coachId: string) => ['coach', 'clients', coachId] as const,
    client: (clientId: string) => ['coach', 'client', clientId] as const,
  },
  
  // === Misc ===
  siteSettings: () => ['site-settings'] as const,
  practitioners: () => ['practitioners'] as const,
  affiliates: (userId: string) => ['affiliates', userId] as const,
} as const;

/**
 * Helper to invalidate all aurora-related queries for a user
 */
export const getAuroraQueryKeys = (userId: string) => [
  QUERY_KEYS.aurora.lifeDirection(userId),
  QUERY_KEYS.aurora.energyPatterns(userId),
  QUERY_KEYS.aurora.behavioralPatterns(userId),
  QUERY_KEYS.aurora.focusPlans(userId),
  QUERY_KEYS.aurora.dailyMinimums(userId),
  QUERY_KEYS.aurora.identityElements(userId),
  QUERY_KEYS.aurora.lifeVisions(userId),
  QUERY_KEYS.aurora.commitments(userId),
  QUERY_KEYS.aurora.onboardingProgress(userId),
  QUERY_KEYS.aurora.checklists(userId),
];

/**
 * Helper to invalidate all gamification queries for a user
 */
export const getGamificationQueryKeys = (userId: string) => [
  QUERY_KEYS.gameState(userId),
  QUERY_KEYS.achievements(userId),
  QUERY_KEYS.sessions(userId),
];

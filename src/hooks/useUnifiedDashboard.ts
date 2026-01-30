import { useGameState } from '@/hooks/useGameState';
import { useLifeModel, useDashboard, useOnboardingProgress } from '@/hooks/aurora';
import { useAuth } from '@/contexts/AuthContext';
import { calculateXpProgress } from '@/lib/achievements';
import { getEgoState } from '@/lib/egoStates';

export interface UnifiedDashboardData {
  // User
  user: {
    id: string | undefined;
    email: string | undefined;
    name: string | undefined;
  };
  
  // Gamification
  level: number;
  experience: number;
  xpProgress: {
    current: number;
    required: number;
    percentage: number;
  };
  streak: number;
  tokens: number;
  totalSessions: number;
  egoState: {
    id: string;
    name: string;
    nameHe: string;
    icon: string;
    gradient: string;
  };
  
  // Life Model
  lifeDirection: {
    content: string;
    clarityScore: number;
  } | null;
  activeFocusPlan: {
    title: string;
    description: string | null;
    durationDays: number;
    daysRemaining: number;
  } | null;
  dailyAnchors: Array<{
    id: string;
    title: string;
    category: string | null;
  }>;
  
  // Identity
  values: string[];
  principles: string[];
  selfConcepts: string[];
  characterTraits: string[];
  
  // Vision
  fiveYearVision: {
    title: string;
    description: string | null;
  } | null;
  tenYearVision: {
    title: string;
    description: string | null;
  } | null;
  
  // Commitments
  activeCommitments: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
  
  // Progress
  onboardingProgress: number;
  hasDirection: boolean;
  hasIdentity: boolean;
  hasEnergy: boolean;
  isLifeModelComplete: boolean;
  
  // State
  isLoading: boolean;
  isEmpty: boolean;
}

export function useUnifiedDashboard(): UnifiedDashboardData {
  const { user } = useAuth();
  const { gameState, sessionStats, loading: gameLoading } = useGameState();
  const { lifeDirection, activeFocusPlan, dailyMinimums } = useLifeModel();
  const { values, principles, selfConcepts, characterTraits, fiveYearVision, tenYearVision, activeCommitments } = useDashboard();
  const { progressPercentage, hasDirection, hasIdentity, hasEnergy, isLifeModelComplete } = useOnboardingProgress();

  // Calculate XP progress
  const xpProgress = calculateXpProgress(gameState?.experience ?? 0);
  
  // Get ego state details
  const egoStateDetails = getEgoState(gameState?.activeEgoState ?? 'guardian');
  
  // Calculate days remaining for focus plan
  const getDaysRemaining = () => {
    if (!activeFocusPlan?.start_date) return activeFocusPlan?.duration_days ?? 0;
    const startDate = new Date(activeFocusPlan.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + activeFocusPlan.duration_days);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isEmpty = !hasDirection && !hasIdentity && !hasEnergy && (sessionStats?.totalSessions ?? 0) === 0;

  return {
    // User
    user: {
      id: user?.id,
      email: user?.email,
      name: user?.user_metadata?.full_name,
    },
    
    // Gamification
    level: gameState?.level ?? 1,
    experience: gameState?.experience ?? 0,
    xpProgress: {
      current: xpProgress.current,
      required: xpProgress.required,
      percentage: xpProgress.percentage,
    },
    streak: gameState?.sessionStreak ?? 0,
    tokens: gameState?.tokens ?? 0,
    totalSessions: sessionStats?.totalSessions ?? 0,
    egoState: {
      id: egoStateDetails.id,
      name: egoStateDetails.name,
      nameHe: egoStateDetails.nameHe,
      icon: egoStateDetails.icon,
      gradient: egoStateDetails.colors.gradient,
    },
    
    // Life Model
    lifeDirection: lifeDirection ? {
      content: lifeDirection.content,
      clarityScore: lifeDirection.clarity_score ?? 0,
    } : null,
    activeFocusPlan: activeFocusPlan ? {
      title: activeFocusPlan.title,
      description: activeFocusPlan.description,
      durationDays: activeFocusPlan.duration_days,
      daysRemaining: getDaysRemaining(),
    } : null,
    dailyAnchors: dailyMinimums.map((m) => ({
      id: m.id,
      title: m.title,
      category: m.category,
    })),
    
    // Identity
    values: values.map((v) => v.content),
    principles: principles.map((p) => p.content),
    selfConcepts: selfConcepts.map((s) => s.content),
    characterTraits: characterTraits.map((t) => t.content),
    
    // Vision
    fiveYearVision: fiveYearVision ? {
      title: fiveYearVision.title,
      description: fiveYearVision.description,
    } : null,
    tenYearVision: tenYearVision ? {
      title: tenYearVision.title,
      description: tenYearVision.description,
    } : null,
    
    // Commitments
    activeCommitments: activeCommitments.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
    })),
    
    // Progress
    onboardingProgress: progressPercentage,
    hasDirection,
    hasIdentity,
    hasEnergy,
    isLifeModelComplete,
    
    // State
    isLoading: gameLoading,
    isEmpty,
  };
}

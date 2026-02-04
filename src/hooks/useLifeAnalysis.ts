import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LifeAnalysisSlice {
  id: string;
  name: string;
  nameHe: string;
  value: number;
  color: string;
}

export interface LifeAnalysisData {
  slices: LifeAnalysisSlice[];
  balanceIndex: number;
  hasData: boolean;
}

// Pillar definitions with colors matching the Life OS theme
const PILLARS = [
  { id: 'personality', name: 'Personality', nameHe: 'אישיות', color: 'hsl(221 83% 53%)' },
  { id: 'business', name: 'Business', nameHe: 'עסקים', color: 'hsl(38 92% 50%)' },
  { id: 'health', name: 'Health', nameHe: 'בריאות', color: 'hsl(0 84% 60%)' },
  { id: 'relationships', name: 'Relationships', nameHe: 'קשרים', color: 'hsl(330 80% 60%)' },
  { id: 'finances', name: 'Finances', nameHe: 'פיננסים', color: 'hsl(152 69% 45%)' },
  { id: 'learning', name: 'Learning', nameHe: 'למידה', color: 'hsl(239 84% 67%)' },
  { id: 'purpose', name: 'Purpose', nameHe: 'מטרה', color: 'hsl(270 76% 60%)' },
];

// Map launchpad focus areas to pillars
const FOCUS_AREA_MAPPING: Record<string, string> = {
  // Personality-related
  identity: 'personality',
  confidence: 'personality',
  mindset: 'personality',
  emotions: 'personality',
  spirituality: 'personality',
  
  // Business-related
  career: 'business',
  business: 'business',
  productivity: 'business',
  leadership: 'business',
  
  // Health-related
  health: 'health',
  fitness: 'health',
  sleep: 'health',
  energy: 'health',
  nutrition: 'health',
  
  // Relationships-related
  relationships: 'relationships',
  family: 'relationships',
  social: 'relationships',
  communication: 'relationships',
  
  // Finances-related
  finances: 'finances',
  money: 'finances',
  wealth: 'finances',
  
  // Learning-related
  learning: 'learning',
  education: 'learning',
  skills: 'learning',
  growth: 'learning',
  
  // Purpose-related
  purpose: 'purpose',
  meaning: 'purpose',
  impact: 'purpose',
  contribution: 'purpose',
};

export function useLifeAnalysis() {
  const { user } = useAuth();

  return useQuery<LifeAnalysisData>({
    queryKey: ['life-analysis', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return getDefaultData();
      }

      // Fetch launchpad progress for focus areas
      const { data: launchpad } = await supabase
        .from('launchpad_progress')
        .select('step_5_focus_areas_selected, step_2_profile_data, launchpad_complete')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch journey completion status
      const [businessJourney, healthJourney, relationshipsJourney, financeJourney, learningJourney] = await Promise.all([
        supabase.from('business_journeys').select('journey_complete').eq('user_id', user.id).maybeSingle(),
        supabase.from('health_journeys').select('is_completed').eq('user_id', user.id).maybeSingle(),
        supabase.from('relationships_journeys').select('journey_complete').eq('user_id', user.id).maybeSingle(),
        supabase.from('finance_journeys').select('journey_complete').eq('user_id', user.id).maybeSingle(),
        supabase.from('learning_journeys').select('journey_complete').eq('user_id', user.id).maybeSingle(),
      ]);

      // Initialize scores
      const scores: Record<string, number> = {};
      PILLARS.forEach(p => scores[p.id] = 0);

      let hasAnyData = false;

      // 1. Focus Areas from launchpad (30% weight)
      const focusAreas = (launchpad?.step_5_focus_areas_selected as string[]) || [];
      focusAreas.forEach(area => {
        const pillarId = FOCUS_AREA_MAPPING[area.toLowerCase()] || area.toLowerCase();
        if (scores[pillarId] !== undefined) {
          scores[pillarId] += 30;
          hasAnyData = true;
        }
      });

      // 2. Journey completion status (25% weight)
      if (launchpad?.launchpad_complete) {
        scores.personality += 25;
        hasAnyData = true;
      }
      if (businessJourney.data?.journey_complete) {
        scores.business += 25;
        hasAnyData = true;
      }
      if (healthJourney.data?.is_completed) {
        scores.health += 25;
        hasAnyData = true;
      }
      if (relationshipsJourney.data?.journey_complete) {
        scores.relationships += 25;
        hasAnyData = true;
      }
      if (financeJourney.data?.journey_complete) {
        scores.finances += 25;
        hasAnyData = true;
      }
      if (learningJourney.data?.journey_complete) {
        scores.learning += 25;
        hasAnyData = true;
      }

      // 3. Profile data depth (20% weight)
      const profileData = launchpad?.step_2_profile_data as Record<string, unknown> | null;
      if (profileData) {
        const filledFields = Object.values(profileData).filter(v => v && v !== '').length;
        const depthBonus = Math.min(filledFields * 2, 20);
        scores.personality += depthBonus;
        if (depthBonus > 0) hasAnyData = true;
      }

      // 4. Give minimum visibility to all pillars (5% base)
      PILLARS.forEach(p => {
        if (scores[p.id] === 0) {
          scores[p.id] = 5;
        }
      });

      // Normalize to percentages
      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
      
      const slices: LifeAnalysisSlice[] = PILLARS.map(pillar => ({
        id: pillar.id,
        name: pillar.name,
        nameHe: pillar.nameHe,
        value: Math.round((scores[pillar.id] / totalScore) * 100),
        color: pillar.color,
      }));

      // Calculate balance index (0-100, higher = more balanced)
      const avgValue = 100 / PILLARS.length;
      const variance = slices.reduce((sum, s) => sum + Math.pow(s.value - avgValue, 2), 0) / PILLARS.length;
      const maxVariance = Math.pow(100 - avgValue, 2);
      const balanceIndex = Math.round(100 - (variance / maxVariance) * 100);

      return {
        slices,
        balanceIndex,
        hasData: hasAnyData,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function getDefaultData(): LifeAnalysisData {
  return {
    slices: PILLARS.map(p => ({
      id: p.id,
      name: p.name,
      nameHe: p.nameHe,
      value: Math.round(100 / PILLARS.length),
      color: p.color,
    })),
    balanceIndex: 100,
    hasData: false,
  };
}

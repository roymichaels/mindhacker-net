import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { AIAnalysisDisplay } from '@/components/launchpad/AIAnalysisDisplay';
import { LifePlanExpanded } from './LifePlanExpanded';
import { ConsciousnessCard, BehavioralInsightsCard, IdentityProfileCard, TraitsCard, CommitmentsCard, DailyAnchorsDisplay, CurrentFocusCard, ChecklistsCard } from './unified';
import { PlanRoadmap } from '../dashboard/plan/PlanRoadmap';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Target, ListChecks, Sparkles, TrendingUp, User, Award, Heart, Anchor, Focus, Map } from 'lucide-react';

interface DashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
}

export function AIAnalysisModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'ניתוח AI מלא' : 'Full AI Analysis'}
          icon={<Brain className="h-5 w-5" />}
        />
        <AIAnalysisDisplay language={language} />
      </DialogContent>
    </Dialog>
  );
}

export function LifePlanModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}
          icon={<Target className="h-5 w-5" />}
        />
        <LifePlanExpanded />
      </DialogContent>
    </Dialog>
  );
}

export function ChecklistsModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'משימות ויעדים' : 'Tasks & Goals'}
          icon={<ListChecks className="h-5 w-5" />}
        />
        <div className="space-y-4">
          <ChecklistsCard />
          <PlanRoadmap />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ConsciousnessModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'מפת התודעה' : 'Consciousness Map'}
          icon={<Sparkles className="h-5 w-5" />}
        />
        <ConsciousnessCard />
      </DialogContent>
    </Dialog>
  );
}

export function BehavioralModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'תובנות התנהגותיות' : 'Behavioral Insights'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <BehavioralInsightsCard />
      </DialogContent>
    </Dialog>
  );
}

interface IdentityModalProps extends DashboardModalProps {
  values: string[];
  principles: string[];
  selfConcepts: string[];
  identityTitle?: {
    title: string;
    titleEn: string;
    icon: string;
  } | null;
}

export function IdentityModal({ open, onOpenChange, language, values, principles, selfConcepts, identityTitle }: IdentityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'כרטיס הזהות שלי' : 'My Identity Card'}
          icon={<User className="h-5 w-5" />}
        />
        <IdentityProfileCard 
          values={values} 
          principles={principles} 
          selfConcepts={selfConcepts} 
          identityTitle={identityTitle}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ArchetypeData {
  archetype: {
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
  };
  coreTraits: Array<{
    name: string;
    nameEn: string;
    icon: string;
    reason: string;
    reasonEn: string;
  }>;
  growthEdges: Array<{
    area: string;
    areaEn: string;
  }>;
  uniqueStrength: string;
  uniqueStrengthEn: string;
}

export function TraitsModal({ open, onOpenChange, language }: DashboardModalProps) {
  const { user } = useAuth();
  const [archetypeData, setArchetypeData] = useState<ArchetypeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !open) return;

    async function fetchArchetype() {
      try {
        const { data } = await supabase
          .from('launchpad_summaries')
          .select('summary_data')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.summary_data) {
          const summaryData = data.summary_data as any;
          
          // Try to get archetype from identity_profile or build from consciousness_analysis
          if (summaryData.identity_profile?.archetype) {
            setArchetypeData(summaryData.identity_profile.archetype);
          } else if (summaryData.consciousness_analysis) {
            // Build archetype from consciousness analysis data
            const ca = summaryData.consciousness_analysis;
            const ip = summaryData.identity_profile || {};
            
            const constructedArchetype: ArchetypeData = {
              archetype: {
                name: ip.suggested_ego_state || 'מעצב מודע',
                nameEn: ip.suggested_ego_state_en || 'Conscious Shaper',
                description: ca.current_state || '',
                descriptionEn: ca.current_state || '',
                icon: '🎯',
              },
              coreTraits: (ip.dominant_traits || ca.strengths || []).slice(0, 4).map((trait: string, i: number) => ({
                name: trait,
                nameEn: trait,
                icon: ['💡', '🔥', '⚡', '🌟'][i] || '✨',
                reason: '',
                reasonEn: '',
              })),
              growthEdges: (ca.growth_edges || []).slice(0, 3).map((edge: string) => ({
                area: edge,
                areaEn: edge,
              })),
              uniqueStrength: ip.values_hierarchy?.[0] || ca.strengths?.[0] || '',
              uniqueStrengthEn: ip.values_hierarchy?.[0] || ca.strengths?.[0] || '',
            };
            
            setArchetypeData(constructedArchetype);
          }
        }
      } catch (err) {
        console.error('Error fetching archetype:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArchetype();
  }, [user, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'תכונות אופי' : 'Character Traits'}
          icon={<Award className="h-5 w-5" />}
        />
        <TraitsCard archetypeData={archetypeData} />
      </DialogContent>
    </Dialog>
  );
}

interface CommitmentsModalProps extends DashboardModalProps {
  commitments: Array<{ id: string; title: string; description: string | null }>;
}

export function CommitmentsModal({ open, onOpenChange, language, commitments }: CommitmentsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'התחייבויות' : 'Commitments'}
          icon={<Heart className="h-5 w-5" />}
        />
        <CommitmentsCard commitments={commitments} />
      </DialogContent>
    </Dialog>
  );
}

interface AnchorsModalProps extends DashboardModalProps {
  anchors: Array<{ id: string; title: string; category: string | null }>;
}

export function AnchorsModal({ open, onOpenChange, language, anchors }: AnchorsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'עוגנים יומיים' : 'Daily Anchors'}
          icon={<Anchor className="h-5 w-5" />}
        />
        <DailyAnchorsDisplay anchors={anchors} />
      </DialogContent>
    </Dialog>
  );
}

interface FocusModalProps extends DashboardModalProps {
  focusPlan: {
    title: string;
    description: string | null;
    durationDays: number;
    daysRemaining: number;
  } | null;
}

export function FocusModal({ open, onOpenChange, language, focusPlan }: FocusModalProps) {
  if (!focusPlan) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader 
          title={language === 'he' ? 'פוקוס נוכחי' : 'Current Focus'}
          icon={<Focus className="h-5 w-5" />}
        />
        <CurrentFocusCard
          title={focusPlan.title}
          description={focusPlan.description}
          durationDays={focusPlan.durationDays}
          daysRemaining={focusPlan.daysRemaining}
        />
      </DialogContent>
    </Dialog>
  );
}

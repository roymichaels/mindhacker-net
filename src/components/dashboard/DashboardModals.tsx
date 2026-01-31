import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AIAnalysisDisplay } from '@/components/launchpad/AIAnalysisDisplay';
import { LifePlanExpanded } from './LifePlanExpanded';
import { ChecklistsCard, ConsciousnessCard, BehavioralInsightsCard, IdentityProfileCard, TraitsCard, CommitmentsCard, DailyAnchorsDisplay, CurrentFocusCard } from './unified';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
}

export function AIAnalysisModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'ניתוח AI מלא' : 'Full AI Analysis'}
          </DialogTitle>
        </DialogHeader>
        <AIAnalysisDisplay language={language} />
      </DialogContent>
    </Dialog>
  );
}

export function LifePlanModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}
          </DialogTitle>
        </DialogHeader>
        <LifePlanExpanded />
      </DialogContent>
    </Dialog>
  );
}

export function ChecklistsModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'המשימות שלי' : 'My Tasks'}
          </DialogTitle>
        </DialogHeader>
        <ChecklistsCard />
      </DialogContent>
    </Dialog>
  );
}

export function ConsciousnessModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'מפת התודעה' : 'Consciousness Map'}
          </DialogTitle>
        </DialogHeader>
        <ConsciousnessCard />
      </DialogContent>
    </Dialog>
  );
}

export function BehavioralModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'תובנות התנהגותיות' : 'Behavioral Insights'}
          </DialogTitle>
        </DialogHeader>
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
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'פרופיל זהות' : 'Identity Profile'}
          </DialogTitle>
        </DialogHeader>
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
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'תכונות אופי' : 'Character Traits'}
          </DialogTitle>
        </DialogHeader>
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
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'התחייבויות' : 'Commitments'}
          </DialogTitle>
        </DialogHeader>
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
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'עוגנים יומיים' : 'Daily Anchors'}
          </DialogTitle>
        </DialogHeader>
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
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'פוקוס נוכחי' : 'Current Focus'}
          </DialogTitle>
        </DialogHeader>
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

import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadData } from '@/hooks/useLaunchpadData';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useLaunchpadSummary } from '@/hooks/useLifePlan';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, Loader2, Check, X, Sparkles, Star, Gem, Flame,
  Heart, Target, Compass, TrendingUp, Zap, Brain,
  UserCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
// PersonalizedOrb moved to MobileHeroGrid HUD
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  MergedIdentityModal, MergedDirectionModal, MergedInsightsModal,
} from '@/components/dashboard/MergedModals';
import { PillChips } from '@/components/aurora-ui/PillChips';
import { GradientCTAButton } from '@/components/aurora-ui/GradientCTAButton';
import { JobPanel } from '@/components/dashboard/JobPanel';

interface ProfileContentProps {
  onClose?: () => void;
}

export function ProfileContent({ onClose }: ProfileContentProps) {
  const navigate = useNavigate();
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: launchpadData, isLoading } = useLaunchpadData();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const dashboardData = useUnifiedDashboard();
  const { data: launchpadSummary } = useLaunchpadSummary();
  
  type ModalType = 'identity' | 'direction' | 'insights' | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const consciousnessScore = (launchpadSummary?.consciousness_score as number) || 0;
  const transformationReadiness = (launchpadSummary?.transformation_readiness as number) || 0;
  const clarityScore = dashboardData.lifeDirection?.clarityScore || 0;

  const handleRegenerate = async () => {
    if (!user?.id) return;
    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-launchpad-summary', {
        body: { userId: user.id, regenerate: true },
      });
      if (error) throw error;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['launchpad-data', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['launchpad-summary', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['life-plan', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['aurora-identity-elements', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['aurora-life-direction', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['aurora-life-visions', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['aurora-commitments', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['aurora-onboarding-progress', user.id], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['game-state'], refetchType: 'active' }),
      ]);
      toast.success(language === 'he' ? 'הניתוח עודכן בהצלחה!' : 'Analysis regenerated!');
    } catch (error) {
      console.error('Error regenerating summary:', error);
      toast.error(language === 'he' ? 'שגיאה בחישוב מחדש' : 'Error regenerating');
    } finally {
      setIsRegenerating(false);
    }
  };

  const pillarQuests = (launchpadData?.personalProfile as Record<string, any>)?.pillar_quests;
  const hasCompletedAnyQuest = Object.values(pillarQuests || {}).some((q: any) => q?.completed);

  const handleEditJourney = () => {
    onClose?.();
    navigate('/onboarding');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">



      {/* ===== CAREER + TRANSFORMATION ===== */}
      <div className="grid grid-cols-2 gap-3">
        {(launchpadData?.firstWeek?.career_status || launchpadData?.firstWeek?.career_goal) && (
          <CompactCard icon={<Target className="w-4 h-4 text-amber-500" />} title={language === 'he' ? 'קריירה' : 'Career'}>
            <div className="space-y-1.5 text-sm">
              {launchpadData?.firstWeek?.career_status && (
                <p className="text-muted-foreground line-clamp-1">📍 {launchpadData.firstWeek.career_status}</p>
              )}
              {launchpadData?.firstWeek?.career_goal && (
                <p className="text-muted-foreground line-clamp-1">🚀 {launchpadData.firstWeek.career_goal}</p>
              )}
            </div>
          </CompactCard>
        )}

        {((launchpadData?.firstWeek?.habits_to_quit?.length ?? 0) > 0 || 
          (launchpadData?.firstWeek?.habits_to_build?.length ?? 0) > 0) && (
          <CompactCard icon={<RefreshCw className="w-4 h-4 text-green-500" />} title={language === 'he' ? 'שינוי' : 'Change'}>
            <div className="space-y-1.5">
              {(launchpadData?.firstWeek?.habits_to_quit?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-destructive flex items-center gap-1 mb-0.5"><X className="w-3 h-3" />{language === 'he' ? 'לעזוב' : 'Quit'}</p>
                  <PillChips items={launchpadData?.firstWeek?.habits_to_quit ?? []} colorScheme="red" maxItems={2} />
                </div>
              )}
              {(launchpadData?.firstWeek?.habits_to_build?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-600 dark:text-green-500 flex items-center gap-1 mb-0.5"><Check className="w-3 h-3" />{language === 'he' ? 'לפתח' : 'Build'}</p>
                  <PillChips items={launchpadData?.firstWeek?.habits_to_build ?? []} colorScheme="green" maxItems={2} />
                </div>
              )}
            </div>
          </CompactCard>
        )}
      </div>


      {/* ===== MERGED MODALS ===== */}
      <MergedIdentityModal
        open={activeModal === 'identity'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        language={language}
        values={dashboardData.values}
        principles={dashboardData.principles}
        selfConcepts={dashboardData.selfConcepts}
        identityTitle={dashboardData.identityTitle}
      />
      <MergedDirectionModal
        open={activeModal === 'direction'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        language={language}
        commitments={dashboardData.activeCommitments}
        anchors={dashboardData.dailyAnchors}
      />
      <MergedInsightsModal
        open={activeModal === 'insights'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        language={language}
      />
    </div>
  );
}

// ===== Compact Card sub-component =====
function CompactCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
        {icon}
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default ProfileContent;

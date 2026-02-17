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
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  MergedIdentityModal, MergedDirectionModal, MergedInsightsModal,
} from '@/components/dashboard/MergedModals';
import { PillChips } from '@/components/aurora-ui/PillChips';
import { GradientCTAButton } from '@/components/aurora-ui/GradientCTAButton';

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
      {/* ===== FULL-WIDTH IDENTITY HERO ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border border-primary/30 p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <PersonalizedOrb size={100} state="idle" />
          {dashboardData.identityTitle ? (
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              {dashboardData.identityTitle.icon} {language === 'he' ? dashboardData.identityTitle.title : dashboardData.identityTitle.titleEn}
            </h2>
          ) : (
            <h2 className="text-lg font-medium text-muted-foreground">
              {language === 'he' ? 'המסע מתחיל' : 'Journey Starts'}
            </h2>
          )}
          {/* Gamification chips */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 text-sm font-semibold border border-border/50">
              <Star className="w-4 h-4 text-yellow-500" />Lv.{dashboardData.level}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 text-sm font-semibold border border-border/50">
              <Gem className="w-4 h-4 text-purple-500" />{dashboardData.tokens}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 text-sm font-semibold border border-border/50">
              <Flame className="w-4 h-4 text-orange-500" />{dashboardData.streak}
            </span>
          </div>
          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2 w-full mt-1">
            {[
              { icon: <Zap className="w-4 h-4 text-yellow-500" />, label: language === 'he' ? 'תודעה' : 'Mind', value: consciousnessScore },
              { icon: <Compass className="w-4 h-4 text-blue-400" />, label: language === 'he' ? 'בהירות' : 'Clarity', value: `${clarityScore}%` },
              { icon: <TrendingUp className="w-4 h-4 text-green-400" />, label: language === 'he' ? 'מוכנות' : 'Ready', value: `${transformationReadiness}%` },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl bg-white/5 border border-white/10">
                {s.icon}
                <span className="text-lg font-bold text-white">{s.value}</span>
                <span className="text-xs text-white/60">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== 3 MERGED ACTION BUTTONS ===== */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveModal('identity')}
          className="rounded-xl bg-card border border-border p-3 flex flex-col items-center gap-1.5 hover:bg-primary/10 hover:border-primary/40 transition-all min-h-[60px]"
        >
          <UserCircle className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-medium">{language === 'he' ? 'זהות' : 'Identity'}</span>
        </button>
        <button
          onClick={() => setActiveModal('direction')}
          className="rounded-xl bg-card border border-border p-3 flex flex-col items-center gap-1.5 hover:bg-primary/10 hover:border-primary/40 transition-all min-h-[60px]"
        >
          <Compass className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium">{language === 'he' ? 'כיוון' : 'Direction'}</span>
        </button>
        <button
          onClick={() => setActiveModal('insights')}
          className="rounded-xl bg-card border border-border p-3 flex flex-col items-center gap-1.5 hover:bg-primary/10 hover:border-primary/40 transition-all min-h-[60px]"
        >
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">{language === 'he' ? 'תובנות' : 'Insights'}</span>
        </button>
      </div>

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

      {/* ===== CTA ===== */}
      <div className="flex gap-2">
        <GradientCTAButton
          onClick={handleEditJourney}
          icon={<Sparkles className="w-4 h-4" />}
          label={
            isLaunchpadComplete
              ? (hasCompletedAnyQuest ? t('launchpad.continueTransformationJourney') : t('launchpad.editTransformationJourney'))
              : t('launchpad.startTransformationJourney')
          }
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 border-primary/30"
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
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

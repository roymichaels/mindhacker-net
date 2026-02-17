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
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, Loader2, Check, X, Sparkles, Star, Gem, Flame,
  Heart, Target, Compass, TrendingUp, Zap, Brain, Calendar,
  UserCircle, Activity, Anchor
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AIAnalysisModal, LifePlanModal, ConsciousnessModal, BehavioralModal,
  IdentityModal, TraitsModal, CommitmentsModal, AnchorsModal,
} from '@/components/dashboard/DashboardModals';
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
  
  type ModalType = 'ai' | 'plan' | 'consciousness' | 'behavioral' | 'identity' | 'traits' | 'commitments' | 'anchors' | null;
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
    navigate(isLaunchpadComplete ? '/quests' : '/launchpad');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* ===== 3-COLUMN HERO GRID ===== */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* Column 1: Dark card with Orb + identity */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border border-primary/30 p-2 flex flex-col items-center justify-center text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
          <div className="relative z-10 flex flex-col items-center gap-1">
            <PersonalizedOrb size={60} state="idle" />
            {dashboardData.identityTitle ? (
              <h2 className="text-[10px] font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                {dashboardData.identityTitle.icon} {language === 'he' ? dashboardData.identityTitle.title : dashboardData.identityTitle.titleEn}
              </h2>
            ) : (
              <h2 className="text-[10px] font-medium text-muted-foreground">
                {language === 'he' ? 'המסע מתחיל' : 'Journey Starts'}
              </h2>
            )}
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-background/50 text-[9px] font-semibold border border-border/50">
                <Star className="w-2.5 h-2.5 text-yellow-500" />Lv.{dashboardData.level}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-background/50 text-[9px] font-semibold border border-border/50">
                <Gem className="w-2.5 h-2.5 text-purple-500" />{dashboardData.tokens}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-background/50 text-[9px] font-semibold border border-border/50">
                <Flame className="w-2.5 h-2.5 text-orange-500" />{dashboardData.streak}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Column 2: 3 vertical metrics */}
        <div className="flex flex-col gap-1.5">
          {[
            { icon: <Zap className="w-3 h-3" />, label: language === 'he' ? 'תודעה' : 'Mind', value: consciousnessScore, color: 'text-yellow-500' },
            { icon: <Compass className="w-3 h-3" />, label: language === 'he' ? 'בהירות' : 'Clarity', value: `${clarityScore}%`, color: 'text-blue-500' },
            { icon: <TrendingUp className="w-3 h-3" />, label: language === 'he' ? 'מוכנות' : 'Ready', value: `${transformationReadiness}%`, color: 'text-green-500' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-card border border-border p-1.5 flex items-center gap-1.5 flex-1">
              <div className={cn("shrink-0", s.color)}>{s.icon}</div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-none">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Column 3: 3 action buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setActiveModal('identity')}
            className="flex-1 rounded-lg bg-card border border-border p-1.5 flex items-center gap-1.5 hover:bg-primary/10 hover:border-primary/40 transition-all text-start"
          >
            <Heart className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span className="text-[11px] font-medium">{language === 'he' ? 'הערכים שלי' : 'My Values'}</span>
          </button>
          <button
            onClick={() => setActiveModal('traits')}
            className="flex-1 rounded-lg bg-card border border-border p-1.5 flex items-center gap-1.5 hover:bg-primary/10 hover:border-primary/40 transition-all text-start"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span className="text-[11px] font-medium">{language === 'he' ? 'תכונות דומיננטיות' : 'Key Traits'}</span>
          </button>
          <button
            onClick={() => setActiveModal('behavioral')}
            className="flex-1 rounded-lg bg-card border border-border p-1.5 flex items-center gap-1.5 hover:bg-primary/10 hover:border-primary/40 transition-all text-start"
          >
            <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-[11px] font-medium">{language === 'he' ? 'כיוון החיים' : 'Life Direction'}</span>
          </button>
        </div>
      </div>

      {/* ===== CAREER + TRANSFORMATION - side by side ===== */}
      <div className="grid grid-cols-2 gap-1.5">
        {(launchpadData?.firstWeek?.career_status || launchpadData?.firstWeek?.career_goal) && (
          <CompactCard icon={<Target className="w-3 h-3 text-amber-500" />} title={language === 'he' ? 'קריירה' : 'Career'}>
            <div className="space-y-1 text-xs">
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
          <CompactCard icon={<RefreshCw className="w-3 h-3 text-green-500" />} title={language === 'he' ? 'שינוי' : 'Change'}>
            <div className="space-y-1">
              {(launchpadData?.firstWeek?.habits_to_quit?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-destructive flex items-center gap-0.5 mb-0.5"><X className="w-2.5 h-2.5" />{language === 'he' ? 'לעזוב' : 'Quit'}</p>
                  <PillChips items={launchpadData?.firstWeek?.habits_to_quit ?? []} colorScheme="red" maxItems={2} />
                </div>
              )}
              {(launchpadData?.firstWeek?.habits_to_build?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-green-600 dark:text-green-500 flex items-center gap-0.5 mb-0.5"><Check className="w-2.5 h-2.5" />{language === 'he' ? 'לפתח' : 'Build'}</p>
                  <PillChips items={launchpadData?.firstWeek?.habits_to_build ?? []} colorScheme="green" maxItems={2} />
                </div>
              )}
            </div>
          </CompactCard>
        )}
      </div>

      {/* ===== INSIGHTS GRID ===== */}
      <CompactCard icon={<Brain className="w-3 h-3 text-primary" />} title={language === 'he' ? 'תובנות' : 'Insights'}>
        <div className="grid grid-cols-4 gap-1">
          {([
            { key: 'ai' as ModalType, icon: <Sparkles className="w-3.5 h-3.5" />, label: language === 'he' ? 'AI' : 'AI' },
            { key: 'plan' as ModalType, icon: <Calendar className="w-3.5 h-3.5" />, label: '90D' },
            { key: 'consciousness' as ModalType, icon: <Brain className="w-3.5 h-3.5" />, label: language === 'he' ? 'תודעה' : 'Mind' },
            { key: 'identity' as ModalType, icon: <UserCircle className="w-3.5 h-3.5" />, label: language === 'he' ? 'זהות' : 'ID' },
            { key: 'traits' as ModalType, icon: <Heart className="w-3.5 h-3.5" />, label: language === 'he' ? 'תכונות' : 'Traits' },
            { key: 'behavioral' as ModalType, icon: <Activity className="w-3.5 h-3.5" />, label: language === 'he' ? 'דפוסים' : 'Patterns' },
            { key: 'commitments' as ModalType, icon: <Target className="w-3.5 h-3.5" />, label: language === 'he' ? 'מחויבות' : 'Goals' },
            { key: 'anchors' as ModalType, icon: <Anchor className="w-3.5 h-3.5" />, label: language === 'he' ? 'עוגנים' : 'Anchors' },
          ]).map((tool) => (
            <button
              key={tool.key}
              onClick={() => setActiveModal(tool.key)}
              className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-muted/40 hover:bg-primary/10 border border-border/40 hover:border-primary/40 transition-all text-center group min-h-[36px]"
            >
              <span className="text-muted-foreground group-hover:text-primary transition-colors">{tool.icon}</span>
              <span className="text-[10px] font-medium text-foreground leading-none">{tool.label}</span>
            </button>
          ))}
        </div>
      </CompactCard>

      {/* ===== CTA ===== */}
      <div className="flex gap-1.5">
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
          className="h-9 w-9 shrink-0 border-primary/30"
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>

      {/* ===== MODALS ===== */}
      <AIAnalysisModal open={activeModal === 'ai'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <LifePlanModal open={activeModal === 'plan'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <ConsciousnessModal open={activeModal === 'consciousness'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <BehavioralModal open={activeModal === 'behavioral'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <IdentityModal open={activeModal === 'identity'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} values={dashboardData.values} principles={dashboardData.principles} selfConcepts={dashboardData.selfConcepts} identityTitle={dashboardData.identityTitle} />
      <TraitsModal open={activeModal === 'traits'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <CommitmentsModal open={activeModal === 'commitments'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} commitments={dashboardData.activeCommitments} />
      <AnchorsModal open={activeModal === 'anchors'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} anchors={dashboardData.dailyAnchors} />
    </div>
  );
}

// ===== Compact Card sub-component =====
function CompactCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1 border-b border-border/50 bg-muted/30">
        {icon}
        <h3 className="font-semibold text-[11px] text-foreground">{title}</h3>
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

export default ProfileContent;

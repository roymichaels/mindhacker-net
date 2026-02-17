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
  RefreshCw, 
  Loader2, 
  Check, 
  X, 
  Sparkles, 
  Star, 
  Gem, 
  Flame,
  Heart,
  Target,
  Compass,
  TrendingUp,
  Zap,
  Brain,
  Calendar,
  UserCircle,
  Activity,
  Anchor
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
import { MetricCard } from '@/components/aurora-ui/MetricCard';
import { PillChips } from '@/components/aurora-ui/PillChips';
import { GradientCTAButton } from '@/components/aurora-ui/GradientCTAButton';
import { SectionHeader } from '@/components/aurora-ui/SectionHeader';

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
    <div className="space-y-8">
      <div className="flex justify-end">
        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">UI V2</span>
      </div>
      {/* ===== HERO SECTION - Identity Card ===== */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 backdrop-blur-xl border border-primary/30 shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="relative z-10 p-8 md:p-10 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl scale-110" />
            <PersonalizedOrb size={200} state="idle" />
          </div>
          <div className="mb-4">
            {dashboardData.identityTitle ? (
              <>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
                  <span>{dashboardData.identityTitle.icon}</span>
                  <span>{language === 'he' ? dashboardData.identityTitle.title : dashboardData.identityTitle.titleEn}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'he' ? 'הזהות הדיגיטלית שלך' : 'Your Digital Identity'}
                </p>
              </>
            ) : (
              <h2 className="text-xl font-medium text-muted-foreground">
                {language === 'he' ? 'המסע שלך מתחיל כאן' : 'Your Journey Starts Here'}
              </h2>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-base font-semibold">Lv.{dashboardData.level}</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
              <Gem className="w-4 h-4 text-purple-500" />
              <span className="text-base font-semibold">{dashboardData.tokens}</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-base font-semibold">{dashboardData.streak}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== QUICK STATS BAR ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <MetricCard 
          icon={<Zap className="w-4 h-4" />}
          label={language === 'he' ? 'תודעה' : 'Consciousness'}
          value={consciousnessScore}
          gradient="from-yellow-500 to-orange-500"
        />
        <MetricCard 
          icon={<Compass className="w-4 h-4" />}
          label={language === 'he' ? 'בהירות' : 'Clarity'}
          value={clarityScore}
          suffix="%"
          gradient="from-blue-500 to-cyan-500"
        />
        <MetricCard 
          icon={<TrendingUp className="w-4 h-4" />}
          label={language === 'he' ? 'מוכנות' : 'Readiness'}
          value={transformationReadiness}
          suffix="%"
          gradient="from-green-500 to-emerald-500"
        />
      </motion.div>

      {/* ===== VALUES & TRAITS ===== */}
      {(dashboardData.values.length > 0 || dashboardData.characterTraits.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {dashboardData.values.length > 0 && (
            <AuroraCard 
              icon={<Heart className="w-4 h-4 text-pink-500" />}
              title={language === 'he' ? 'הערכים שלי' : 'My Values'}
            >
              <PillChips items={dashboardData.values} colorScheme="pink" maxItems={5} />
            </AuroraCard>
          )}

          {dashboardData.characterTraits.length > 0 && (
            <AuroraCard 
              icon={<Sparkles className="w-4 h-4 text-violet-500" />}
              title={language === 'he' ? 'תכונות דומיננטיות' : 'Dominant Traits'}
            >
              <PillChips items={dashboardData.characterTraits} colorScheme="violet" maxItems={5} />
            </AuroraCard>
          )}
        </motion.div>
      )}

      {/* ===== LIFE DIRECTION ===== */}
      {dashboardData.lifeDirection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AuroraCard 
            icon={<Compass className="w-4 h-4 text-blue-500" />}
            title={language === 'he' ? 'כיוון החיים' : 'Life Direction'}
          >
            <p className="text-foreground font-medium text-base leading-relaxed mb-3">
              "{dashboardData.lifeDirection.content}"
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{language === 'he' ? 'בהירות' : 'Clarity'}</span>
                <span>{clarityScore}%</span>
              </div>
              <Progress value={clarityScore} className="h-2" />
            </div>
          </AuroraCard>
        </motion.div>
      )}

      {/* ===== CAREER PATH ===== */}
      {(launchpadData?.firstWeek?.career_status || launchpadData?.firstWeek?.career_goal) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AuroraCard 
            icon={<Target className="w-4 h-4 text-amber-500" />}
            title={language === 'he' ? 'נתיב הקריירה' : 'Career Path'}
          >
            <div className="space-y-3">
              {launchpadData?.firstWeek?.career_status && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground text-sm shrink-0">
                    {language === 'he' ? '📍 מעמד:' : '📍 Status:'}
                  </span>
                  <span className="text-foreground text-sm font-medium">
                    {launchpadData.firstWeek.career_status}
                  </span>
                </div>
              )}
              {launchpadData?.firstWeek?.career_goal && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground text-sm shrink-0">
                    {language === 'he' ? '🚀 שאיפה:' : '🚀 Goal:'}
                  </span>
                  <span className="text-foreground text-sm font-medium">
                    {launchpadData.firstWeek.career_goal}
                  </span>
                </div>
              )}
            </div>
          </AuroraCard>
        </motion.div>
      )}

      {/* ===== TRANSFORMATION HABITS ===== */}
      {((launchpadData?.firstWeek?.habits_to_quit?.length ?? 0) > 0 || 
        (launchpadData?.firstWeek?.habits_to_build?.length ?? 0) > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AuroraCard 
            icon={<RefreshCw className="w-4 h-4 text-green-500" />}
            title={language === 'he' ? 'טרנספורמציה' : 'Transformation'}
          >
            <div className="space-y-4">
              {(launchpadData?.firstWeek?.habits_to_quit?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-destructive mb-2 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {language === 'he' ? 'לעזוב' : 'To Quit'}
                  </p>
                  <PillChips items={launchpadData?.firstWeek?.habits_to_quit ?? []} colorScheme="red" />
                </div>
              )}
              {(launchpadData?.firstWeek?.habits_to_build?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-600 dark:text-green-500 mb-2 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {language === 'he' ? 'לפתח' : 'To Build'}
                  </p>
                  <PillChips items={launchpadData?.firstWeek?.habits_to_build ?? []} colorScheme="green" />
                </div>
              )}
            </div>
          </AuroraCard>
        </motion.div>
      )}

      {/* ===== MY INSIGHTS TOOLS GRID ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <AuroraCard
          icon={<Brain className="w-4 h-4 text-primary" />}
          title={language === 'he' ? 'התובנות שלי' : 'My Insights'}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { key: 'ai' as ModalType, icon: <Sparkles className="w-6 h-6" />, label: language === 'he' ? 'ניתוח AI' : 'AI Analysis' },
              { key: 'plan' as ModalType, icon: <Calendar className="w-6 h-6" />, label: language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan' },
              { key: 'consciousness' as ModalType, icon: <Brain className="w-6 h-6" />, label: language === 'he' ? 'מפת תודעה' : 'Consciousness' },
              { key: 'identity' as ModalType, icon: <UserCircle className="w-6 h-6" />, label: language === 'he' ? 'כרטיס זהות' : 'Identity Card' },
              { key: 'traits' as ModalType, icon: <Heart className="w-6 h-6" />, label: language === 'he' ? 'תכונות אופי' : 'Traits' },
              { key: 'behavioral' as ModalType, icon: <Activity className="w-6 h-6" />, label: language === 'he' ? 'תובנות' : 'Insights' },
              { key: 'commitments' as ModalType, icon: <Target className="w-6 h-6" />, label: language === 'he' ? 'התחייבויות' : 'Commitments' },
              { key: 'anchors' as ModalType, icon: <Anchor className="w-6 h-6" />, label: language === 'he' ? 'עוגנים' : 'Anchors' },
            ]).map((tool) => (
              <button
                key={tool.key}
                onClick={() => setActiveModal(tool.key)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/40 hover:bg-primary/10 border border-border/40 hover:border-primary/40 transition-all text-center group min-h-[44px]"
              >
                <span className="text-muted-foreground group-hover:text-primary transition-colors">{tool.icon}</span>
                <span className="text-xs font-medium text-foreground leading-tight">{tool.label}</span>
              </button>
            ))}
          </div>
        </AuroraCard>
      </motion.div>

      {/* ===== CTA BUTTONS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="space-y-3 pt-4 pb-6"
      >
        <GradientCTAButton
          onClick={handleEditJourney}
          icon={<Sparkles className="w-5 h-5" />}
          label={
            isLaunchpadComplete
              ? (hasCompletedAnyQuest ? t('launchpad.continueTransformationJourney') : t('launchpad.editTransformationJourney'))
              : t('launchpad.startTransformationJourney')
          }
        />

        <Button
          variant="outline"
          className="w-full h-10 border-primary/30 hover:bg-primary/5"
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <Loader2 className={cn("w-4 h-4 animate-spin", isRTL ? 'ms-2' : 'me-2')} />
          ) : (
            <RefreshCw className={cn("w-4 h-4", isRTL ? 'ms-2' : 'me-2')} />
          )}
          {language === 'he' ? 'חשב מחדש ניתוח AI' : 'Regenerate AI Analysis'}
        </Button>
      </motion.div>

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

// ===== SUB-COMPONENT =====

interface AuroraCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

function AuroraCard({ icon, title, children }: AuroraCardProps) {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/50 bg-muted/30">
        {icon}
        <h3 className="font-semibold text-base text-foreground">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

export default ProfileContent;

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PersonalizedOrb } from '@/components/orb';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: launchpadData, isLoading } = useLaunchpadData();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const dashboardData = useUnifiedDashboard();
  const { data: launchpadSummary } = useLaunchpadSummary();
  
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

        // Ensure the dashboard "Job" / identity updates immediately after reanalysis
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

  const handleEditJourney = () => {
    onOpenChange(false);
    navigate('/launchpad');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isRTL ? "right" : "left"} 
        className="w-full sm:max-w-lg p-0 bg-gradient-to-b from-background via-background to-muted/30"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            {language === 'he' ? 'כרטיס הזהות שלי' : 'My Identity Card'}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="h-[100vh]">
            <div className="p-4 space-y-4">
              {/* ===== HERO SECTION - Identity Card ===== */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card/80 to-accent/20 backdrop-blur-xl border border-primary/30 shadow-xl"
              >
                {/* Glow background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse" />
                
                <div className="relative z-10 p-6 flex flex-col items-center text-center">
                  {/* Large Orb - Using PersonalizedOrb as base */}
                  <div className="relative mb-6">
                    {/* Glow background */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl scale-110" />
                    <PersonalizedOrb 
                      size={240}
                      showGlow={true}
                      state="idle"
                    />
                  </div>

                  {/* Identity Title */}
                  <div className="mb-4">
                    {dashboardData.identityTitle ? (
                      <>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
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

                  {/* Stats Row */}
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">Lv.{dashboardData.level}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
                      <Gem className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold">{dashboardData.tokens}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/50">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">{dashboardData.streak}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ===== QUICK STATS BAR ===== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-3 gap-3"
              >
                <ScoreCard 
                  icon={<Zap className="w-4 h-4" />}
                  label={language === 'he' ? 'תודעה' : 'Consciousness'}
                  value={consciousnessScore}
                  suffix=""
                  gradient="from-yellow-500 to-orange-500"
                />
                <ScoreCard 
                  icon={<Compass className="w-4 h-4" />}
                  label={language === 'he' ? 'בהירות' : 'Clarity'}
                  value={clarityScore}
                  suffix="%"
                  gradient="from-blue-500 to-cyan-500"
                />
                <ScoreCard 
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
                  className="space-y-3"
                >
                  {/* Values */}
                  {dashboardData.values.length > 0 && (
                    <GlassCard 
                      icon={<Heart className="w-4 h-4 text-pink-500" />}
                      title={language === 'he' ? 'הערכים שלי' : 'My Values'}
                    >
                      <div className="flex flex-wrap gap-2">
                        {dashboardData.values.slice(0, 5).map((value, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-sm font-medium border border-pink-500/20"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Character Traits */}
                  {dashboardData.characterTraits.length > 0 && (
                    <GlassCard 
                      icon={<Sparkles className="w-4 h-4 text-violet-500" />}
                      title={language === 'he' ? 'תכונות דומיננטיות' : 'Dominant Traits'}
                    >
                      <div className="flex flex-wrap gap-2">
                        {dashboardData.characterTraits.slice(0, 5).map((trait, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-medium border border-violet-500/20"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
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
                  <GlassCard 
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
                  </GlassCard>
                </motion.div>
              )}

              {/* ===== CAREER PATH ===== */}
              {(launchpadData?.firstWeek?.career_status || launchpadData?.firstWeek?.career_goal) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <GlassCard 
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
                  </GlassCard>
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
                  <GlassCard 
                    icon={<RefreshCw className="w-4 h-4 text-green-500" />}
                    title={language === 'he' ? 'טרנספורמציה' : 'Transformation'}
                  >
                    <div className="space-y-4">
                      {/* Habits to Quit */}
                      {(launchpadData?.firstWeek?.habits_to_quit?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs font-medium text-destructive mb-2 flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {language === 'he' ? 'לעזוב' : 'To Quit'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {launchpadData?.firstWeek?.habits_to_quit?.map((habit, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20"
                              >
                                {habit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Habits to Build */}
                      {(launchpadData?.firstWeek?.habits_to_build?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs font-medium text-green-600 dark:text-green-500 mb-2 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {language === 'he' ? 'לפתח' : 'To Build'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {launchpadData?.firstWeek?.habits_to_build?.map((habit, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-500 text-xs font-medium border border-green-500/20"
                              >
                                {habit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* ===== ACTION BUTTONS ===== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-3 pt-2 pb-8"
              >
                <Button
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
                  onClick={handleEditJourney}
                >
                  <Sparkles className={cn("w-5 h-5", isRTL ? 'ml-2' : 'mr-2')} />
                  {isLaunchpadComplete 
                    ? (language === 'he' ? 'ערוך מסע טרנספורמציה' : 'Edit Transformation Journey')
                    : (language === 'he' ? 'התחל מסע טרנספורמציה' : 'Start Transformation Journey')
                  }
                  <ArrowRight className={cn("w-4 h-4", isRTL ? 'mr-2 rotate-180' : 'ml-2')} />
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-10 border-primary/30 hover:bg-primary/5"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <Loader2 className={cn("w-4 h-4 animate-spin", isRTL ? 'ml-2' : 'mr-2')} />
                  ) : (
                    <RefreshCw className={cn("w-4 h-4", isRTL ? 'ml-2' : 'mr-2')} />
                  )}
                  {language === 'he' ? 'חשב מחדש ניתוח AI' : 'Regenerate AI Analysis'}
                </Button>
              </motion.div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ===== SUB-COMPONENTS =====

interface ScoreCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  suffix: string;
  gradient: string;
}

function ScoreCard({ icon, label, value, suffix, gradient }: ScoreCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card/60 backdrop-blur-xl border border-border/50 p-3 text-center">
      <div className={cn(
        "absolute inset-0 opacity-10 bg-gradient-to-br",
        gradient
      )} />
      <div className="relative z-10">
        <div className={cn(
          "inline-flex items-center justify-center w-8 h-8 rounded-full mb-1",
          "bg-gradient-to-br",
          gradient,
          "text-white"
        )}>
          {icon}
        </div>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-bold text-foreground">
          {value}{suffix}
        </p>
      </div>
    </div>
  );
}

interface GlassCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

function GlassCard({ icon, title, children }: GlassCardProps) {
  return (
    <div className="rounded-xl bg-card/60 backdrop-blur-xl border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-muted/30">
        {icon}
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export default ProfileDrawer;

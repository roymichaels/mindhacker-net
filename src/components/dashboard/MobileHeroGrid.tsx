/**
 * MobileHeroGrid - 3-column hero grid
 * RTL: Plan (left) | Daily Session (middle) | HUD (right)
 */
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useTokens } from '@/hooks/useGameState';
import { useTodaysHabits } from '@/hooks/useTodaysHabits';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Play, Clock, Flame, Gem, Star, ListChecks, Calendar, Sparkles, TrendingUp, Eye, Zap, ChevronDown, UserCircle, Compass, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import { useHaptics } from '@/hooks/useHaptics';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MergedIdentityModal, MergedDirectionModal, MergedInsightsModal,
} from '@/components/dashboard/MergedModals';

interface MobileHeroGridProps {
  planData: {
    currentWeek: number;
    progressPercent: number;
    currentMonth: number;
    currentMilestone?: { title: string } | null;
  } | null | undefined;
}

export function MobileHeroGrid({ planData }: MobileHeroGridProps) {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useTokens();
  const { suggestedGoal } = useDailyHypnosis();
  const { impact } = useHaptics();
  const { habits, completedCount, totalCount } = useTodaysHabits();

  const { data: taskItems = [] } = useQuery({
    queryKey: ['mobile-grid-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('action_items')
        .select('id, title, status')
        .eq('user_id', user.id)
        .eq('type', 'task')
        .neq('status', 'archived')
        .order('order_index', { ascending: true })
        .limit(10);
      return (data || []).map(t => ({ id: t.id, title: t.title, done: t.status === 'done' }));
    },
    enabled: !!user?.id,
  });

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggle = (id: string) => setExpandedSection(prev => prev === id ? null : id);

  // Track the left column height to sync the orb size
  const leftColRef = useRef<HTMLDivElement>(null);
  const [leftColHeight, setLeftColHeight] = useState(0);

  useEffect(() => {
    if (!leftColRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setLeftColHeight(entry.contentRect.height);
    });
    observer.observe(leftColRef.current);
    return () => observer.disconnect();
  }, []);
  type ModalType = 'identity' | 'direction' | 'insights' | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleStartDailySession = () => {
    impact('medium');
    const params = new URLSearchParams();
    params.set('duration', '15');
    params.set('goal', suggestedGoal);
    params.set('daily', 'true');
    navigate(`/hypnosis/session?${params.toString()}`);
  };

  const identityTitle = dashboard.identityTitle;
  const readinessVal = Math.min(100, xp.percentage || 85);
  const clarityVal = dashboard.selfConcepts.length > 0 ? 65 : 20;
  const consciousnessVal = dashboard.values.length > 0 ? 72 : 15;

  const habitMiniItems = habits.map(h => ({ id: h.id, title: h.title, done: h.isCompleted }));
  const tasksCompleted = taskItems.filter(t => t.done).length;
  const tasksTotal = taskItems.length;
  const tasksPercent = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const nextTask = taskItems.find(t => !t.done);
  const nextHabit = habits.find(h => !h.isCompleted);

  // Orb: use left column height on desktop, fixed 280 on mobile/fallback
  const hudNonOrbHeight = 200;
  const orbSize = leftColHeight > hudNonOrbHeight
    ? Math.max(200, leftColHeight - hudNonOrbHeight)
    : 280;

  return (
    <div className="space-y-3 md:h-[calc(100vh-8rem)]">
      {/* ===== 2-COL GRID: Plan (left on desktop) + HUD (right on desktop) ===== */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-stretch md:h-full">

        {/* ===== COL 1 - HUD ===== */}
        <div className="rounded-2xl border border-border bg-card p-2 flex flex-col items-center gap-2 h-full md:order-2">
          <div className="relative flex items-center justify-center overflow-visible flex-1 min-h-[200px] w-full">
            <PersonalizedOrb size={orbSize} state="idle" />
          </div>
          {identityTitle && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">{identityTitle.icon}</span>
              <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
                {language === 'he' ? identityTitle.title : identityTitle.titleEn}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
              <Star className="h-3 w-3" />Lv.{xp.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
              <Gem className="h-3 w-3" />{tokens.balance}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <Flame className="h-3 w-3" />{streak.streak}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            {[
              { icon: Zap, label: language === 'he' ? 'תודעה' : 'Awareness', value: String(consciousnessVal), color: 'text-amber-500' },
              { icon: Eye, label: language === 'he' ? 'בהירות' : 'Clarity', value: `${clarityVal}%`, color: 'text-blue-500' },
              { icon: TrendingUp, label: language === 'he' ? 'מוכנות' : 'Readiness', value: `${readinessVal}%`, color: 'text-green-500' },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-muted/30 border border-border/50 p-2.5 flex flex-col items-center gap-1">
                <m.icon className={cn("w-4 h-4", m.color)} />
                <span className="text-lg font-bold leading-none">{m.value}</span>
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== COL 2 - Plan Modules ===== */}
        <div ref={leftColRef} className="flex flex-col gap-2 h-full md:order-1">
          {/* Start Session button */}
          <button
            onClick={handleStartDailySession}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-background border border-border px-4 py-2.5 shadow-lg hover:brightness-110 active:brightness-90 transition-all touch-manipulation"
          >
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />15 {language === 'he' ? 'דק׳' : 'min'}
            </span>
            <span className="flex items-center gap-2 text-sm font-bold text-amber-500 dark:text-amber-400">
              <Play className="w-4 h-4 fill-amber-500 dark:fill-amber-400" />
              {language === 'he' ? 'התחל סשן' : 'Start Session'}
            </span>
          </button>

          <CollapsiblePlanRow
            icon={<Sparkles className="w-4 h-4 text-amber-500" />}
            title={language === 'he' ? 'הרגלים' : 'Habits'}
            count={`${completedCount}/${totalCount}`}
            isOpen={expandedSection === 'habits'}
            onToggle={() => toggle('habits')}
            previewText={nextHabit?.title}
            items={habitMiniItems}
          />
          <CollapsiblePlanRow
            icon={<Calendar className="w-4 h-4 text-amber-500" />}
            title={language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}
            count={`${planData?.progressPercent || 0}%`}
            badge={language === 'he' ? `שבוע ${planData?.currentWeek || 1}` : `Week ${planData?.currentWeek || 1}`}
            badgeExtra={language === 'he' ? `חודש ${planData?.currentMonth || 1}` : `M${planData?.currentMonth || 1}`}
            isOpen={expandedSection === 'plan'}
            onToggle={() => toggle('plan')}
            previewText={planData?.currentMilestone?.title ? `→ ${planData.currentMilestone.title}` : undefined}
            progressPercent={planData?.progressPercent || 0}
          />
          <CollapsiblePlanRow
            icon={<ListChecks className="w-4 h-4 text-amber-500" />}
            title={language === 'he' ? 'משימות' : 'Tasks'}
            count={`${tasksCompleted}/${tasksTotal}`}
            countSuffix={`${tasksPercent}%`}
            isOpen={expandedSection === 'tasks'}
            onToggle={() => toggle('tasks')}
            previewText={nextTask?.title}
            items={taskItems}
            progressPercent={tasksPercent}
          />

          {/* 3 Action Buttons: Identity / Direction / Insights */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveModal('identity')}
              className="rounded-xl bg-card border border-border p-2.5 flex flex-col items-center gap-1 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
            >
              <UserCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{language === 'he' ? 'זהות' : 'Identity'}</span>
            </button>
            <button
              onClick={() => setActiveModal('direction')}
              className="rounded-xl bg-card border border-border p-2.5 flex flex-col items-center gap-1 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
            >
              <Compass className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{language === 'he' ? 'כיוון' : 'Direction'}</span>
            </button>
            <button
              onClick={() => setActiveModal('insights')}
              className="rounded-xl bg-card border border-border p-2.5 flex flex-col items-center gap-1 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
            >
              <Brain className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{language === 'he' ? 'תובנות' : 'Insights'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MergedIdentityModal
        open={activeModal === 'identity'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        language={language}
        values={dashboard.values}
        principles={dashboard.principles}
        selfConcepts={dashboard.selfConcepts}
        identityTitle={identityTitle}
      />
      <MergedDirectionModal
        open={activeModal === 'direction'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        language={language}
        commitments={dashboard.activeCommitments}
        anchors={dashboard.dailyAnchors}
      />
      <MergedInsightsModal
        open={activeModal === 'insights'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        language={language}
      />
    </div>
  );
}

/* ---- Collapsible Plan Row Sub-component ---- */
interface CollapsiblePlanRowProps {
  icon: React.ReactNode;
  title: string;
  count: string;
  countSuffix?: string;
  badge?: string;
  badgeExtra?: string;
  isOpen: boolean;
  onToggle: () => void;
  previewText?: string;
  items?: { id: string; title: string; done?: boolean }[];
  progressPercent?: number;
}

function CollapsiblePlanRow({
  icon, title, count, countSuffix, badge, badgeExtra, isOpen, onToggle, previewText, items, progressPercent,
}: CollapsiblePlanRowProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex-1 flex flex-col">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 font-semibold border border-amber-500/20">
              {badge}
            </span>
          )}
          {badgeExtra && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              {badgeExtra}
            </span>
          )}
          <span className="text-xs font-bold text-muted-foreground">{count}</span>
          {countSuffix && (
            <span className="text-[10px] font-medium text-amber-500 dark:text-amber-400">{countSuffix}</span>
          )}
          <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </div>
      </button>

      {!isOpen && previewText && (
        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground truncate">→ {previewText}</p>
          {progressPercent !== undefined && (
            <div className="h-1 rounded-full bg-muted/50 overflow-hidden mt-1.5">
              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {isOpen && items && items.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-2 space-y-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex-shrink-0",
                    item.done ? "bg-amber-500 border-amber-500" : "border-muted-foreground/40"
                  )} />
                  <span className={cn(
                    "text-xs flex-1 min-w-0 truncate",
                    item.done && "line-through text-muted-foreground"
                  )}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {isOpen && progressPercent !== undefined && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2">
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

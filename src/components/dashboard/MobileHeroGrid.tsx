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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Play, Clock, Flame, Gem, Star, ListChecks, Calendar, Sparkles, TrendingUp, Eye, Zap, ChevronDown, UserCircle, Compass, Brain, Map, ScanSearch, IdCard, Target, Headphones } from 'lucide-react';
import { useGameState } from '@/contexts/GameStateContext';
import { useNavigate } from 'react-router-dom';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
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
  const { openHypnosis } = useAuroraActions();
  const { habits, completedCount, totalCount, toggleHabit } = useTodaysHabits();
  const { sessionStats } = useGameState();

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
  const leftColRef = useRef<HTMLDivElement>(null);
  type ModalType = 'identity' | 'direction' | 'insights' | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleStartDailySession = () => {
    impact('medium');
    openHypnosis();
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
  const queryClient = useQueryClient();

  const handleTaskToggle = async (id: string, done: boolean) => {
    await supabase.from('action_items').update({ status: done ? 'done' : 'pending', completed_at: done ? new Date().toISOString() : null }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['mobile-grid-tasks'] });
  };

  // Orb: fixed size on mobile, constrained on desktop
  const orbSize = 280;

  return (
    <div className="flex flex-col w-full">
      {/* ===== 2-COL GRID: Plan (left on desktop) + HUD (right on desktop) ===== */}
      <div className="flex flex-col gap-0 md:grid md:grid-cols-[300px_1fr] md:gap-2 md:items-start">

        {/* ===== COL 1 - HUD (Orb) ===== */}
        <div className="p-4 pt-0 md:pt-0 md:-mt-10 lg:-mt-10 md:order-1 md:flex md:flex-col md:justify-center">
          {/* Mobile: 3-col compact grid */}
          <div className="flex flex-col gap-2 md:hidden">
            {/* Top: Identity + Orb side by side */}
            <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
              {/* Orb - right side (appears first in RTL) */}
              <div className="relative flex items-center justify-center overflow-visible w-[110px] h-[110px] order-2 rtl:order-1">
                <PersonalizedOrb size={110} state="idle" />
              </div>
              {/* Identity + badges - left side */}
              <div className="flex flex-col gap-2 order-1 rtl:order-2">
                {identityTitle && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{identityTitle.icon}</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent leading-tight">
                      {language === 'he' ? identityTitle.title : identityTitle.titleEn}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                    <Star className="h-3 w-3" />Lv.{xp.level}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                    <Gem className="h-3 w-3" />{tokens.balance}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    <Flame className="h-3 w-3" />{streak.streak}
                  </span>
                </div>
              </div>
            </div>
            {/* Bottom: Stats row */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { icon: Zap, label: language === 'he' ? 'תודעה' : 'Awareness', value: String(consciousnessVal), color: 'text-amber-500' },
                { icon: Eye, label: language === 'he' ? 'בהירות' : 'Clarity', value: `${clarityVal}%`, color: 'text-blue-500' },
                { icon: TrendingUp, label: language === 'he' ? 'מוכנות' : 'Readiness', value: `${readinessVal}%`, color: 'text-green-500' },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/30 border border-border/50 px-2 py-1.5 flex items-center gap-1.5">
                  <m.icon className={cn("w-3 h-3 shrink-0", m.color)} />
                  <span className="text-xs font-bold leading-none">{m.value}</span>
                  <span className="text-[9px] text-muted-foreground truncate">{m.label}</span>
                </div>
              ))}
            </div>
            {/* Hypnosis session stats */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { icon: Target, label: language === 'he' ? 'סשנים' : 'Sessions', value: String(sessionStats?.totalSessions || 0), color: 'text-purple-500' },
                { icon: Clock, label: language === 'he' ? 'דקות' : 'Minutes', value: String(sessionStats?.totalDurationSeconds ? Math.floor(sessionStats.totalDurationSeconds / 60) : 0), color: 'text-cyan-500' },
                { icon: Headphones, label: language === 'he' ? 'מועדף' : 'Favorite', value: sessionStats?.favoriteEgoState || '—', color: 'text-pink-500' },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/30 border border-border/50 px-2 py-1.5 flex items-center gap-1.5">
                  <m.icon className={cn("w-3 h-3 shrink-0", m.color)} />
                  <span className="text-xs font-bold leading-none">{m.value}</span>
                  <span className="text-[9px] text-muted-foreground truncate">{m.label}</span>
                </div>
              ))}
            </div>
            {/* Start Session button - mobile only, inside HUD */}
            <button
              onClick={handleStartDailySession}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2.5 hover:brightness-110 active:brightness-90 transition-all touch-manipulation shadow-sm"
            >
              <span className="flex items-center gap-1 text-xs text-amber-950">
                <Clock className="w-3.5 h-3.5" />15 {language === 'he' ? 'דק׳' : 'min'}
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-amber-950">
                <Play className="w-4 h-4 fill-amber-950" />
                {language === 'he' ? 'התחל סשן' : 'Start Session'}
              </span>
            </button>
          </div>

          {/* Desktop: orb + stats below */}
          <div className="hidden md:flex md:flex-col md:items-center md:gap-3 w-full">
            <div className="flex items-center justify-center w-full aspect-square overflow-hidden">
              <PersonalizedOrb size={260} state="idle" />
            </div>
            {/* Identity title - own row */}
            {identityTitle && (
              <div className="flex items-center justify-center gap-1.5 w-full">
                <span className="text-base">{identityTitle.icon}</span>
                <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
                  {language === 'he' ? identityTitle.title : identityTitle.titleEn}
                </span>
              </div>
            )}
            {/* Level / Tokens / Streak badges */}
            <div className="flex items-center justify-center gap-1.5 w-full">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                <Star className="h-2.5 w-2.5" />Lv.{xp.level}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                <Gem className="h-2.5 w-2.5" />{tokens.balance}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                <Flame className="h-2.5 w-2.5" />{streak.streak}
              </span>
            </div>
            {/* Stats grid */}
            <div className="flex flex-col gap-2 w-full">
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { icon: Zap, label: language === 'he' ? 'תודעה' : 'Awareness', value: String(consciousnessVal), color: 'text-amber-500' },
                  { icon: Eye, label: language === 'he' ? 'בהירות' : 'Clarity', value: `${clarityVal}%`, color: 'text-blue-500' },
                  { icon: TrendingUp, label: language === 'he' ? 'מוכנות' : 'Readiness', value: `${readinessVal}%`, color: 'text-green-500' },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-background/60 border border-border/40 p-1.5 flex flex-col items-center gap-0.5">
                    <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                    <span className="text-sm font-bold leading-none">{m.value}</span>
                    <span className="text-[9px] text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>
              {/* Hypnosis session stats - desktop */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { icon: Target, label: language === 'he' ? 'סשנים' : 'Sessions', value: String(sessionStats?.totalSessions || 0), color: 'text-purple-500' },
                  { icon: Clock, label: language === 'he' ? 'דקות' : 'Minutes', value: String(sessionStats?.totalDurationSeconds ? Math.floor(sessionStats.totalDurationSeconds / 60) : 0), color: 'text-cyan-500' },
                  { icon: Headphones, label: language === 'he' ? 'מועדף' : 'Favorite', value: sessionStats?.favoriteEgoState || '—', color: 'text-pink-500' },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-background/60 border border-border/40 p-1.5 flex flex-col items-center gap-0.5">
                    <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                    <span className="text-sm font-bold leading-none">{m.value}</span>
                    <span className="text-[9px] text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>
              {/* Start Session button - desktop, below hypnosis stats */}
              <button
                onClick={handleStartDailySession}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2.5 hover:brightness-110 active:brightness-90 transition-all touch-manipulation shadow-sm"
              >
                <span className="flex items-center gap-1 text-xs text-amber-950">
                  <Clock className="w-3.5 h-3.5" />15 {language === 'he' ? 'דק׳' : 'min'}
                </span>
                <span className="flex items-center gap-2 text-sm font-bold text-amber-950">
                  <Play className="w-4 h-4 fill-amber-950" />
                  {language === 'he' ? 'התחל סשן' : 'Start Session'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== COL 2 - Plan Modules ===== */}
        <div ref={leftColRef} className="flex flex-col gap-2 flex-1 md:flex-none md:order-2 md:overflow-y-auto md:min-h-0">
          {/* Spacer for desktop */}
          <div className="hidden md:block pt-4" />

          <CollapsiblePlanRow
            icon={<Sparkles className="w-4 h-4 text-amber-500" />}
            title={language === 'he' ? 'הרגלים' : 'Habits'}
            count={`${completedCount}/${totalCount}`}
            isOpen={expandedSection === 'habits'}
            onToggle={() => toggle('habits')}
            previewText={nextHabit?.title}
            items={habitMiniItems}
            onItemToggle={(id, done) => toggleHabit(id, done)}
          />
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
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
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
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
            onItemToggle={handleTaskToggle}
          />

          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-1" />

          {/* Row 1: Identity / Direction / Insights */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveModal('identity')}
              className="rounded-xl bg-card/30 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-amber-500/10 transition-all"
            >
              <UserCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{language === 'he' ? 'זהות' : 'Identity'}</span>
            </button>
            <button
              onClick={() => setActiveModal('direction')}
              className="rounded-xl bg-card/30 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-amber-500/10 transition-all"
            >
              <Compass className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{language === 'he' ? 'כיוון' : 'Direction'}</span>
            </button>
            <button
              onClick={() => setActiveModal('insights')}
              className="rounded-xl bg-card/30 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-amber-500/10 transition-all"
            >
              <Brain className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{language === 'he' ? 'תובנות' : 'Insights'}</span>
            </button>
          </div>

          {/* Row 2: Identity Card / 90-Day Plan / AI Analysis */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="rounded-xl bg-card/30 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-amber-500/10 transition-all"
            >
              <IdCard className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{language === 'he' ? 'כרטיס זהות' : 'ID Card'}</span>
            </button>
            <button
              onClick={() => navigate('/plan')}
              className="rounded-xl bg-card/30 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-amber-500/10 transition-all"
            >
              <Map className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}</span>
            </button>
            <button
              onClick={() => setActiveModal('insights')}
              className="rounded-xl bg-card/30 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-amber-500/10 transition-all"
            >
              <ScanSearch className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{language === 'he' ? 'ניתוח AI' : 'AI Analysis'}</span>
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
  onItemToggle?: (id: string, done: boolean) => void;
}

function CollapsiblePlanRow({
  icon, title, count, countSuffix, badge, badgeExtra, isOpen, onToggle, previewText, items, progressPercent, onItemToggle,
}: CollapsiblePlanRowProps) {
  const firstUndone = items?.find(i => !i.done);
  return (
    <div className="rounded-xl border-b border-border/30 overflow-hidden flex flex-col">
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

      {!isOpen && (
        <div className="px-3 pb-2">
          {/* Mobile: single preview line only */}
          <div className="md:hidden">
            {previewText ? (
              <p className="text-xs text-muted-foreground truncate">→ {previewText}</p>
            ) : items && items.length > 0 ? (
              <p className="text-xs text-muted-foreground truncate">→ {items.find(i => !i.done)?.title || items[0].title}</p>
            ) : null}
          </div>
          {/* Desktop: checkable items */}
          <div className="hidden md:block">
            {items && items.length > 0 && onItemToggle ? (
              <div className="space-y-1">
                {items.filter(i => !i.done).slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onItemToggle(item.id, true); }}
                      className="w-4 h-4 rounded-full border-2 border-muted-foreground/40 flex-shrink-0 hover:border-amber-500 hover:bg-amber-500/10 transition-colors"
                      aria-label="Complete item"
                    />
                    <span className="text-xs text-muted-foreground truncate flex-1">{item.title}</span>
                  </div>
                ))}
              </div>
            ) : previewText ? (
              <p className="text-xs text-muted-foreground truncate">→ {previewText}</p>
            ) : null}
          </div>
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

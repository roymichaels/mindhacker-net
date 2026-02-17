/**
 * MobileHeroGrid - 3-row (mobile) / 3-column (desktop) hero grid
 * RTL order: HUD (right/first) | Daily Session (middle) | Plan+Tasks (left/last)
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useTokens } from '@/hooks/useGameState';
import { useTodaysHabits } from '@/hooks/useTodaysHabits';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Play, Clock, Flame, Gem, Star, ListChecks, Calendar, Sparkles, TrendingUp, Eye, Zap, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import { useHaptics } from '@/hooks/useHaptics';
import { AnimatePresence, motion } from 'framer-motion';

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

  // Fetch tasks (checklists / action_items of type task)
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

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-start">
      {/* ===== ROW 1 / RIGHT COL - HUD ===== */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/30 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-950 p-4 flex flex-col items-center gap-3">
        <motion.div
          className="relative"
          animate={{ width: expandedSection ? 120 : 64, height: expandedSection ? 120 : 64 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl scale-150" />
          <div className="relative w-full h-full">
            <PersonalizedOrb size={expandedSection ? 120 : 64} state="idle" />
          </div>
        </motion.div>
        {identityTitle && (
          <div className="flex items-center gap-1.5">
            <span className="text-base">{identityTitle.icon}</span>
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {language === 'he' ? identityTitle.title : identityTitle.titleEn}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
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
            { icon: TrendingUp, label: language === 'he' ? 'מוכנות' : 'Readiness', value: `${readinessVal}%`, color: 'text-green-500' },
            { icon: Eye, label: language === 'he' ? 'בהירות' : 'Clarity', value: `${clarityVal}%`, color: 'text-blue-500' },
            { icon: Zap, label: language === 'he' ? 'תודעה' : 'Awareness', value: String(consciousnessVal), color: 'text-purple-500' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-muted/30 dark:bg-muted/10 border border-border/50 p-2.5 flex flex-col items-center gap-1">
              <m.icon className={cn("w-4 h-4", m.color)} />
              <span className="text-lg font-bold leading-none">{m.value}</span>
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ROW 2 / MIDDLE COL - Daily Session Hero ===== */}
      <div
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer active:brightness-90 transition-all touch-manipulation min-h-[160px]"
        onClick={handleStartDailySession}
      >
        <div className="absolute inset-0 bg-white/5" />
        <span className="relative text-4xl">✨</span>
        <h3 className="relative text-lg font-bold text-white leading-tight text-center">
          {language === 'he' ? 'הסשן היומי שלך' : 'Your Daily Session'}
        </h3>
        <span className="relative text-sm text-white/80 flex items-center gap-1">
          <Clock className="w-4 h-4" />15 {language === 'he' ? 'דקות' : 'minutes'}
        </span>
        <div className="relative flex items-center gap-1.5 bg-background/90 text-foreground rounded-full px-5 py-2 text-sm font-semibold shadow-lg mt-1">
          <Play className="w-4 h-4" />
          {language === 'he' ? 'התחל עכשיו' : 'Start Now'}
        </div>
      </div>

      {/* ===== ROW 3 / LEFT COL - Plan Modules (collapsible rows) ===== */}
      <div className="space-y-2">
        {/* Habits */}
        <CollapsiblePlanRow
          icon={<Sparkles className="w-4 h-4 text-primary" />}
          title={language === 'he' ? 'הרגלים' : 'Habits'}
          count={`${completedCount}/${totalCount}`}
          isOpen={expandedSection === 'habits'}
          onToggle={() => toggle('habits')}
          previewText={nextHabit?.title}
          items={habitMiniItems}
        />

        {/* 90-Day Plan */}
        <CollapsiblePlanRow
          icon={<Calendar className="w-4 h-4 text-primary" />}
          title={language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}
          count={`${planData?.progressPercent || 0}%`}
          badge={language === 'he' ? `שבוע ${planData?.currentWeek || 1}` : `Week ${planData?.currentWeek || 1}`}
          badgeExtra={language === 'he' ? `חודש ${planData?.currentMonth || 1}` : `M${planData?.currentMonth || 1}`}
          isOpen={expandedSection === 'plan'}
          onToggle={() => toggle('plan')}
          previewText={planData?.currentMilestone?.title ? `→ ${planData.currentMilestone.title}` : undefined}
          progressPercent={planData?.progressPercent || 0}
        />

        {/* Tasks */}
        <CollapsiblePlanRow
          icon={<ListChecks className="w-4 h-4 text-primary" />}
          title={language === 'he' ? 'משימות' : 'Tasks'}
          count={`${tasksCompleted}/${tasksTotal}`}
          countSuffix={`${tasksPercent}%`}
          isOpen={expandedSection === 'tasks'}
          onToggle={() => toggle('tasks')}
          previewText={nextTask?.title}
          items={taskItems}
          progressPercent={tasksPercent}
        />
      </div>
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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
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
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold border border-primary/20">
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
            <span className="text-[10px] font-medium text-primary">{countSuffix}</span>
          )}
          <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </div>
      </button>

      {/* Preview line (when collapsed) */}
      {!isOpen && previewText && (
        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground truncate">→ {previewText}</p>
          {progressPercent !== undefined && (
            <div className="h-1 rounded-full bg-muted/50 overflow-hidden mt-1.5">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Expanded content */}
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
                    item.done ? "bg-primary border-primary" : "border-muted-foreground/40"
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
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

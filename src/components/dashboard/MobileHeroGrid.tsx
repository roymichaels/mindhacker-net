/**
 * MobileHeroGrid — Hub action cards dashboard.
 * Shows a mini-dashboard card per hub with key stats + CTA.
 */
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useTodayExecution } from '@/hooks/useTodayExecution';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageShell } from '@/components/aurora-ui/PageShell';
import {
  Flame, Swords, Users, GraduationCap, Store,
  ChevronRight, CheckCircle2, Target, Zap, TrendingUp,
  BookOpen, MessageSquare, Play
} from 'lucide-react';

interface MobileHeroGridProps {
  planData: any;
}

export function MobileHeroGrid({ planData }: MobileHeroGridProps) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useEnergy();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const { plan, milestones } = useLifePlanWithMilestones();
  const execution = useTodayExecution();

  // Community stats
  const { data: communityStats } = useQuery({
    queryKey: ['community-stats', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      return { postsCount: count || 0 };
    },
    enabled: !!user?.id,
    staleTime: 120_000,
  });

  // Plan stats
  const completedMilestones = milestones?.filter((m: any) => m.is_completed).length || 0;
  const totalMilestones = milestones?.length || 0;
  const hasPlan = !!plan;

  // Today stats
  const todayCompleted = execution.queue?.filter((a: any) => a.status === 'done').length || 0;
  const todayTotal = execution.queue?.length || 0;

  const hubs: HubCard[] = [
    {
      id: 'core',
      icon: Flame,
      labelEn: 'Core',
      labelHe: 'ליבה',
      descEn: 'Assessment & Planning',
      descHe: 'אבחון ותכנון',
      path: '/life',
      color: 'from-orange-500/15 to-amber-500/10 border-orange-500/25',
      iconColor: 'text-orange-500',
      stats: hasPlan
        ? [
            { labelEn: 'Milestones', labelHe: 'אבני דרך', value: `${completedMilestones}/${totalMilestones}` },
            { labelEn: 'Progress', labelHe: 'התקדמות', value: `${planData?.progressPercent || 0}%` },
          ]
        : [{ labelEn: 'Status', labelHe: 'סטטוס', value: isHe ? 'טרם הוגדר' : 'Not started' }],
      ctaEn: hasPlan ? 'Continue Plan' : (isLaunchpadComplete ? 'Create 100-Day Plan' : 'Start Assessment'),
      ctaHe: hasPlan ? 'המשך תוכנית' : (isLaunchpadComplete ? 'צור תוכנית 100 יום' : 'התחל אבחון'),
    },
    {
      id: 'arena',
      icon: Swords,
      labelEn: 'Arena',
      labelHe: 'זירה',
      descEn: 'Daily Execution',
      descHe: 'ביצוע יומי',
      path: '/arena',
      color: 'from-red-500/15 to-rose-500/10 border-red-500/25',
      iconColor: 'text-red-500',
      stats: [
        { labelEn: 'Today', labelHe: 'היום', value: `${todayCompleted}/${todayTotal}` },
        { labelEn: 'Streak', labelHe: 'רצף', value: `🔥 ${streak.streak}` },
      ],
      ctaEn: todayTotal > 0 ? 'Execute Now' : 'View Arena',
      ctaHe: todayTotal > 0 ? 'בצע עכשיו' : 'צפה בזירה',
    },
    {
      id: 'community',
      icon: Users,
      labelEn: 'Community',
      labelHe: 'קומיוניטי',
      descEn: '14 pillars. One civilization.',
      descHe: '14 עמודים. ציוויליזציה אחת.',
      path: '/community',
      color: 'from-violet-500/15 to-purple-500/10 border-violet-500/25',
      iconColor: 'text-violet-500',
      stats: [
        { labelEn: 'Your Posts', labelHe: 'הפוסטים שלך', value: String(communityStats?.postsCount || 0) },
      ],
      ctaEn: 'Browse Feed',
      ctaHe: 'גלוש בפיד',
    },
    {
      id: 'study',
      icon: GraduationCap,
      labelEn: 'Study',
      labelHe: 'לימוד',
      descEn: 'AI-powered learning',
      descHe: 'למידה מונעת AI',
      path: '/learn',
      color: 'from-emerald-500/15 to-green-500/10 border-emerald-500/25',
      iconColor: 'text-emerald-500',
      stats: [],
      ctaEn: 'Explore Courses',
      ctaHe: 'חקור קורסים',
    },
    {
      id: 'fm',
      icon: Store,
      labelEn: 'Free Market',
      labelHe: 'שוק חופשי',
      descEn: 'Earn, trade & grow',
      descHe: 'הרווח, סחור וצמח',
      path: '/fm',
      color: 'from-cyan-500/15 to-sky-500/10 border-cyan-500/25',
      iconColor: 'text-cyan-500',
      stats: [
        { labelEn: 'Tokens', labelHe: 'טוקנים', value: `⚡ ${tokens.balance}` },
      ],
      ctaEn: 'Open Market',
      ctaHe: 'פתח שוק',
    },
  ];

  return (
    <PageShell>
      <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pb-8">
        {/* Quick stats bar */}
        <div className="flex items-center justify-center gap-3 py-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">
            <Target className="h-3 w-3" /> Lv.{xp.level}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
            <Zap className="h-3 w-3" /> {tokens.balance}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <Flame className="h-3 w-3" /> {streak.streak}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <TrendingUp className="h-3 w-3" /> {xp.totalXp} XP
          </span>
        </div>

        {/* Hub cards */}
        <div className="flex flex-col gap-3">
          {hubs.map((hub) => (
            <HubActionCard key={hub.id} hub={hub} isHe={isHe} onNavigate={() => navigate(hub.path)} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

interface HubStat {
  labelEn: string;
  labelHe: string;
  value: string;
}

interface HubCard {
  id: string;
  icon: any;
  labelEn: string;
  labelHe: string;
  descEn: string;
  descHe: string;
  path: string;
  color: string;
  iconColor: string;
  stats: HubStat[];
  ctaEn: string;
  ctaHe: string;
}

function HubActionCard({ hub, isHe, onNavigate }: { hub: HubCard; isHe: boolean; onNavigate: () => void }) {
  const Icon = hub.icon;

  return (
    <button
      onClick={onNavigate}
      className={cn(
        "w-full rounded-2xl border p-4 flex items-center gap-4 text-start",
        "bg-gradient-to-br transition-all hover:shadow-md active:scale-[0.99]",
        hub.color
      )}
    >
      {/* Icon */}
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-background/60 backdrop-blur-sm border border-border/30")}>
        <Icon className={cn("h-6 w-6", hub.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-foreground">
          {isHe ? hub.labelHe : hub.labelEn}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {isHe ? hub.descHe : hub.descEn}
        </p>

        {/* Stats */}
        {hub.stats.length > 0 && (
          <div className="flex items-center gap-3 mt-1.5">
            {hub.stats.map((stat, i) => (
              <span key={i} className="text-[10px] text-muted-foreground">
                <span className="font-semibold text-foreground">{stat.value}</span>
                {' '}{isHe ? stat.labelHe : stat.labelEn}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center gap-1 mt-2">
          <span className={cn("text-xs font-semibold", hub.iconColor)}>
            {isHe ? hub.ctaHe : hub.ctaEn}
          </span>
          <ChevronRight className={cn("h-3.5 w-3.5", hub.iconColor, isHe && "rotate-180")} />
        </div>
      </div>
    </button>
  );
}

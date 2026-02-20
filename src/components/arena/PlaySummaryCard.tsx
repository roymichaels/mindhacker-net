/**
 * PlaySummaryCard — Displays Play/Regeneration stats in the Arena hub.
 */
import { useTranslation } from '@/hooks/useTranslation';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import { Gamepad2, CalendarDays, BarChart3, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { differenceInDays, startOfMonth, isAfter } from 'date-fns';

export function PlaySummaryCard() {
  const { language } = useTranslation();
  const { projects } = useProjects();
  const isHe = language === 'he';

  const playProjects = useMemo(() => projects.filter(p => p.project_type === 'play'), [projects]);

  const stats = useMemo(() => {
    const completed = playProjects.filter(p => p.status === 'completed');
    const now = new Date();
    const monthStart = startOfMonth(now);

    // Days since last play
    const lastCompleted = completed
      .filter(p => p.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];
    const daysSinceLast = lastCompleted ? differenceInDays(now, new Date(lastCompleted.completed_at!)) : null;

    // This month count
    const thisMonth = completed.filter(p => p.completed_at && isAfter(new Date(p.completed_at), monthStart)).length;

    // Most common category
    const catCounts: Record<string, number> = {};
    playProjects.forEach(p => {
      if (p.play_category) catCounts[p.play_category] = (catCounts[p.play_category] || 0) + 1;
    });
    const topCat = Object.entries(catCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    // Upcoming
    const upcoming = playProjects.filter(p => p.status === 'active' && p.target_date && isAfter(new Date(p.target_date), now)).length;

    return { daysSinceLast, thisMonth, topCat, upcoming };
  }, [playProjects]);

  const CATEGORY_LABELS: Record<string, { en: string; he: string }> = {
    nature: { en: 'Nature', he: 'טבע' },
    movement: { en: 'Movement', he: 'תנועה' },
    social: { en: 'Social', he: 'חברתי' },
    creative: { en: 'Creative', he: 'יצירתי' },
    adventure: { en: 'Adventure', he: 'הרפתקה' },
    recovery: { en: 'Recovery', he: 'התאוששות' },
    exploration: { en: 'Exploration', he: 'חקירה' },
    travel: { en: 'Travel', he: 'טיולים' },
    other: { en: 'Other', he: 'אחר' },
  };

  const items = [
    {
      icon: CalendarDays,
      label: isHe ? 'ימים מאז' : 'Days Since',
      value: stats.daysSinceLast !== null ? `${stats.daysSinceLast}` : '—',
      color: 'text-violet-400',
    },
    {
      icon: BarChart3,
      label: isHe ? 'החודש' : 'This Month',
      value: `${stats.thisMonth}`,
      color: 'text-emerald-400',
    },
    {
      icon: Sparkles,
      label: isHe ? 'קטגוריה מובילה' : 'Top Category',
      value: stats.topCat ? (isHe ? CATEGORY_LABELS[stats.topCat]?.he : CATEGORY_LABELS[stats.topCat]?.en) || stats.topCat : '—',
      color: 'text-pink-400',
    },
    {
      icon: Gamepad2,
      label: isHe ? 'מתוכננים' : 'Upcoming',
      value: `${stats.upcoming}`,
      color: 'text-amber-400',
    },
  ];

  if (playProjects.length === 0) return null;

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-purple-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gamepad2 className="w-5 h-5 text-violet-400" />
        <h3 className="text-sm font-semibold text-foreground">
          {isHe ? '🎮 פעילות Play' : '🎮 Play Activity'}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(item => (
          <div key={item.label} className="rounded-xl bg-card/40 border border-border/20 p-2.5 flex flex-col items-center gap-1">
            <item.icon className={cn("w-4 h-4", item.color)} />
            <span className="text-sm font-bold leading-none">{item.value}</span>
            <span className="text-[9px] text-muted-foreground text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

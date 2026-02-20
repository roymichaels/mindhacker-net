/**
 * SidebarOrbWidget - Full identity card for sidebar with orb, title, stats, XP bar.
 * Matches the gamified profile card design.
 */
import { cn } from '@/lib/utils';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useTranslation } from '@/hooks/useTranslation';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Star, Flame, Zap } from 'lucide-react';

interface SidebarOrbWidgetProps {
  collapsed?: boolean;
}

export function SidebarOrbWidget({ collapsed = false }: SidebarOrbWidgetProps) {
  const dashboard = useUnifiedDashboard();
  const { language } = useTranslation();
  const isHe = language === 'he';

  const level = dashboard.level;
  const tokens = dashboard.tokens;
  const streak = dashboard.streak;
  const { current, required, percentage } = dashboard.xpProgress;
  const identityTitle = dashboard.identityTitle;

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-1">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <PersonalizedOrb size={36} />
        </div>
        <span className="text-[9px] font-bold text-muted-foreground">
          Lv.{level}
        </span>
        {/* Mini progress bar */}
        <div className="w-8 h-1 rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full px-2">
      {/* Orb */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-[-30%] rounded-full bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-xl pointer-events-none" />
        <div className="relative z-10">
          <PersonalizedOrb size={72} state="idle" />
        </div>
      </div>

      {/* Identity title */}
      {identityTitle && (
        <div className="flex items-center gap-1.5">
          <span className="text-base">{identityTitle.icon}</span>
          <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {isHe ? identityTitle.title : identityTitle.titleEn}
          </span>
        </div>
      )}

      {/* Stat badges */}
      <div className="flex items-center justify-center gap-2 w-full">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-[11px]">
          <Flame className="h-3 w-3" />
          <span className="font-semibold">{streak}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-[11px]">
          <Zap className="h-3 w-3" />
          <span className="font-semibold">{tokens}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[11px]">
          <Star className="h-3 w-3" />
          <span className="font-semibold">Lv.{level}</span>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="w-full space-y-1">
        <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden border border-primary/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[10px] text-center text-muted-foreground font-mono tracking-wide">
          EXP {current} / {required} ({percentage}%)
        </p>
      </div>
    </div>
  );
}

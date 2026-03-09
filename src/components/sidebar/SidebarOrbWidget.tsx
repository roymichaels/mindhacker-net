/**
 * SidebarOrbWidget - Full identity card for sidebar with orb, title, stats, XP bar.
 * Matches the gamified profile card design.
 * Pulses with a work-glow ring when an active work session is running.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useTranslation } from '@/hooks/useTranslation';
import { useActiveWorkSession } from '@/hooks/useActiveWorkSession';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { OrbFullscreenViewer } from '@/components/orb/OrbFullscreenViewer';
import { Star, Flame, Zap } from 'lucide-react';

interface SidebarOrbWidgetProps {
  collapsed?: boolean;
}

export function SidebarOrbWidget({ collapsed = false }: SidebarOrbWidgetProps) {
  const dashboard = useUnifiedDashboard();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [orbViewerOpen, setOrbViewerOpen] = useState(false);
  const { isWorking, isDeepWork } = useActiveWorkSession();

  const level = dashboard.level;
  const tokens = dashboard.tokens;
  const streak = dashboard.streak;
  const { current, required, percentage } = dashboard.xpProgress;
  const identityTitle = dashboard.identityTitle;

  if (collapsed) {
    return (
      <>
      <OrbFullscreenViewer open={orbViewerOpen} onClose={() => setOrbViewerOpen(false)} />
      <div className="flex flex-col items-center gap-1.5 px-1">
        <div
          className={cn(
            "relative w-12 h-12 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform",
            isWorking && "animate-pulse"
          )}
          onClick={() => setOrbViewerOpen(true)}
        >
          {isWorking && (
            <div className={cn(
              "absolute inset-[-4px] rounded-full animate-ping opacity-30",
              isDeepWork ? "bg-violet-500" : "bg-primary"
            )} />
          )}
          <PersonalizedOrb size={44} />
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
      </>
    );
  }

  return (
    <>
    <OrbFullscreenViewer open={orbViewerOpen} onClose={() => setOrbViewerOpen(false)} />
    <div className="flex flex-col items-center gap-3 w-full px-2">
      {/* Orb */}
      <div
        className={cn(
          "relative w-24 h-24 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform",
          isWorking && "animate-pulse"
        )}
        onClick={() => setOrbViewerOpen(true)}
      >
        <div className={cn(
          "absolute inset-[-30%] rounded-full blur-xl pointer-events-none transition-colors duration-700",
          isWorking && isDeepWork
            ? "bg-gradient-radial from-violet-500/40 via-violet-500/15 to-transparent"
            : isWorking
              ? "bg-gradient-radial from-primary/40 via-primary/15 to-transparent"
              : "bg-gradient-radial from-primary/30 via-primary/10 to-transparent"
        )} />
        {isWorking && (
          <div className={cn(
            "absolute inset-[-8px] rounded-full animate-ping opacity-20",
            isDeepWork ? "bg-violet-500" : "bg-primary"
          )} />
        )}
        <div className="relative z-10">
          <PersonalizedOrb size={88} state={isWorking ? 'listening' : 'idle'} />
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
    </>
  );
}

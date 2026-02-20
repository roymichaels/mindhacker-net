/**
 * SidebarOrbWidget - Orb + Level + XP progress bar for sidebar use.
 * Supports collapsed (compact) and expanded (full) variants.
 */
import { cn } from '@/lib/utils';
import { useGameState } from '@/contexts/GameStateContext';
import { useTranslation } from '@/hooks/useTranslation';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';

interface SidebarOrbWidgetProps {
  collapsed?: boolean;
}

const XP_PER_LEVEL = 100;

export function SidebarOrbWidget({ collapsed = false }: SidebarOrbWidgetProps) {
  const { gameState } = useGameState();
  const { language } = useTranslation();
  const isHe = language === 'he';

  const level = gameState?.level ?? 1;
  const experience = gameState?.experience ?? 0;
  const xpInLevel = experience % XP_PER_LEVEL;

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 px-1">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <PersonalizedOrb size={36} />
        </div>
        <span className="text-[9px] font-bold text-muted-foreground">
          Lv.{level}
        </span>
        {/* Mini progress bar */}
        <div className="w-8 h-1 rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${xpInLevel}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 w-full rounded-xl bg-muted/20 dark:bg-muted/10 border border-border/20 p-2.5">
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <PersonalizedOrb size={44} />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-xs font-bold text-foreground">
          Lv.{level}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${xpInLevel}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground whitespace-nowrap">
            EXP {xpInLevel}/{XP_PER_LEVEL}
          </span>
        </div>
      </div>
    </div>
  );
}

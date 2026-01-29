import React from 'react';
import { cn } from '@/lib/utils';
import { useEgoState } from '@/hooks/useGameState';
import { getAllEgoStates, getEgoState, type EgoState } from '@/lib/egoStates';
import { useLanguage } from '@/contexts/LanguageContext';

interface EgoStateSelectorProps {
  className?: string;
  onSelect?: (egoState: EgoState) => void;
  showUsage?: boolean;
}

export function EgoStateSelector({ className, onSelect, showUsage = false }: EgoStateSelectorProps) {
  const { activeEgoState, usage, setActive } = useEgoState();
  const { language } = useLanguage();
  const isHebrew = language === 'he';

  const egoStates = getAllEgoStates();

  const handleSelect = async (egoState: EgoState) => {
    await setActive(egoState.id);
    onSelect?.(egoState);
  };

  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4', className)}>
      {egoStates.map((ego) => {
        const isActive = activeEgoState === ego.id;
        const usageCount = usage[ego.id] || 0;

        return (
          <button
            key={ego.id}
            onClick={() => handleSelect(ego)}
            className={cn(
              'relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200',
              'hover:scale-105 hover:shadow-lg',
              isActive
                ? 'glass-card-premium ring-2 ring-primary'
                : 'glass-card opacity-70 hover:opacity-100'
            )}
            style={{
              '--ego-color': ego.colors.primary,
            } as React.CSSProperties}
          >
            <span className="text-2xl">{ego.icon}</span>
            <span className={cn(
              'text-xs font-medium truncate max-w-full',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {isHebrew ? ego.nameHe : ego.name}
            </span>
            {showUsage && usageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {usageCount > 99 ? '99+' : usageCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

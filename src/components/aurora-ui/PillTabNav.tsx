import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { LucideIcon } from 'lucide-react';

export interface PillTab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface PillTabNavProps {
  tabs: PillTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  activeGradient?: string;
  className?: string;
}

export function PillTabNav({
  tabs,
  activeTab,
  onTabChange,
  activeGradient = 'from-primary to-primary',
  className,
}: PillTabNavProps) {
  return (
    <ScrollArea className={cn('w-full', className)}>
      <div className="flex gap-1.5 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                isActive
                  ? cn('bg-gradient-to-r text-white shadow-md', activeGradient)
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

interface SubTabNavProps {
  tabs: PillTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  accentColor?: string;
  className?: string;
}

export function SubTabNav({
  tabs,
  activeTab,
  onTabChange,
  accentColor = 'border-primary',
  className,
}: SubTabNavProps) {
  return (
    <ScrollArea className={cn('w-full', className)}>
      <div className="flex gap-1 border-b border-border pb-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-3 py-2 text-sm whitespace-nowrap transition-colors',
                isActive
                  ? cn('text-foreground font-medium border-b-2', accentColor)
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

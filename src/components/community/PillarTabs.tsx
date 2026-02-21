import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';

interface PillarTabsProps {
  selected: string;
  onSelect: (id: string) => void;
}

const PILLAR_ICONS: Record<string, string> = {
  consciousness: '🔮',
  presence: '👁️',
  power: '💪',
  vitality: '☀️',
  focus: '🎯',
  combat: '⚔️',
  expansion: '🧠',
  wealth: '📈',
  influence: '👑',
  relationships: '🤝',
  business: '💼',
  projects: '📋',
  play: '🎮',
};

export default function PillarTabs({ selected, onSelect }: PillarTabsProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <ScrollArea className="w-full" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="flex gap-2 px-4 pb-3">
        {LIFE_DOMAINS.map((domain) => (
          <button
            key={domain.id}
            onClick={() => onSelect(domain.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              selected === domain.id
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50"
            )}
          >
            <span className="text-xs">{PILLAR_ICONS[domain.id] || '⚡'}</span>
            <span>{isHe ? domain.labelHe : domain.labelEn}</span>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

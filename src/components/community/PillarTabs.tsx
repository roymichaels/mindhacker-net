import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';

interface PillarTabsProps {
  selected: string;
  onSelect: (id: string) => void;
}

const PILLAR_ICONS: Record<string, string> = {
  consciousness: '🔮', presence: '👁️', power: '💪', vitality: '☀️',
  focus: '🎯', combat: '⚔️', expansion: '🧠', wealth: '📈',
  influence: '👑', relationships: '🤝', business: '💼', projects: '📋',
  play: '🎮', order: '✨', romantics: '💋',
};

const activeBgMap: Record<string, string> = {
  violet: 'bg-violet-500/15 border-violet-500/40 text-violet-500',
  fuchsia: 'bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-500',
  red: 'bg-red-500/15 border-red-500/40 text-red-500',
  amber: 'bg-amber-500/15 border-amber-500/40 text-amber-500',
  cyan: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-500',
  slate: 'bg-slate-500/15 border-slate-500/40 text-slate-500',
  indigo: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-500',
  emerald: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500',
  purple: 'bg-purple-500/15 border-purple-500/40 text-purple-500',
  sky: 'bg-sky-500/15 border-sky-500/40 text-sky-500',
  orange: 'bg-orange-500/15 border-orange-500/40 text-orange-500',
  blue: 'bg-blue-500/15 border-blue-500/40 text-blue-500',
  lime: 'bg-lime-500/15 border-lime-500/40 text-lime-500',
  teal: 'bg-teal-500/15 border-teal-500/40 text-teal-500',
  rose: 'bg-rose-500/15 border-rose-500/40 text-rose-500',
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
                ? (activeBgMap[domain.color] || "bg-primary/15 border-primary/40 text-primary")
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

import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const COMBAT_CATEGORIES = [
  { id: 'all', labelEn: 'All', labelHe: 'הכל', icon: '⚔️' },
  { id: 'striking', labelEn: 'Striking', labelHe: 'הכאה', icon: '🥊' },
  { id: 'grappling', labelEn: 'Grappling', labelHe: 'היאבקות', icon: '🤼' },
  { id: 'tactical', labelEn: 'Tactical', labelHe: 'טקטיקה', icon: '🧠' },
  { id: 'weapons', labelEn: 'Weapons', labelHe: 'נשק', icon: '🗡️' },
  { id: 'conditioning', labelEn: 'Conditioning', labelHe: 'כושר לחימה', icon: '💪' },
  { id: 'solo-training', labelEn: 'Solo Training', labelHe: 'אימון עצמאי', icon: '🎯' },
  { id: 'mistake-analysis', labelEn: 'Mistake Analysis', labelHe: 'ניתוח טעויות', icon: '⚠️' },
  { id: 'sparring-iq', labelEn: 'Sparring IQ', labelHe: 'IQ קרב', icon: '♟️' },
  { id: 'biomechanics', labelEn: 'Biomechanics', labelHe: 'ביומכניקה', icon: '⚙️' },
];

interface CombatCategoryTabsProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function CombatCategoryTabs({ selected, onSelect }: CombatCategoryTabsProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <ScrollArea className="w-full" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="flex gap-2 px-4 pb-3">
        {COMBAT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              selected === cat.id
                ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50"
            )}
          >
            <span className="text-xs">{cat.icon}</span>
            <span>{isHe ? cat.labelHe : cat.labelEn}</span>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

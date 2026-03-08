/**
 * InventoryBag — RPG-style inventory grid showing collected loot items.
 * MapleStory merchant aesthetic with rarity filtering.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useInventory } from '@/hooks/useInventory';
import { LootItemCard } from './LootItemCard';
import { Package, Sparkles, Gem, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Rarity } from '@/data/galleryOrbData';

const FILTERS = [
  { id: 'all' as const, labelEn: 'All', labelHe: 'הכל', icon: Package },
  { id: 'legendary' as const, labelEn: 'Legendary', labelHe: 'אגדי', icon: Crown },
  { id: 'epic' as const, labelEn: 'Epic', labelHe: 'אפי', icon: Gem },
  { id: 'rare' as const, labelEn: 'Rare', labelHe: 'נדיר', icon: Sparkles },
  { id: 'common' as const, labelEn: 'Common', labelHe: 'רגיל', icon: Star },
] as const;

type FilterId = typeof FILTERS[number]['id'];

const RARITY_ORDER: Record<string, number> = { legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 };

export function InventoryBag() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: items, isLoading } = useInventory();
  const [filter, setFilter] = useState<FilterId>('all');

  const filtered = filter === 'all'
    ? items || []
    : (items || []).filter(i => i.rarity === filter);

  const sorted = [...filtered].sort((a, b) =>
    (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0)
  );

  const totalItems = (items || []).reduce((s, i) => s + i.qty, 0);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-32 rounded bg-muted/30 animate-pulse" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-400" />
          {isHe ? 'שק השלל' : 'Loot Bag'}
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          {totalItems} {isHe ? 'פריטים' : 'items'}
        </span>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => {
          const Icon = f.icon;
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all border',
                isActive
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-muted/20 border-border/30 text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3 h-3" />
              {isHe ? f.labelHe : f.labelEn}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-4 gap-2"
        >
          {sorted.length > 0 ? (
            sorted.map((item, i) => (
              <LootItemCard key={item.loot_id} item={item} isHe={isHe} index={i} />
            ))
          ) : (
            <div className="col-span-4 py-8 text-center">
              <Package className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">
                {isHe ? 'השק ריק — השלם משימות כדי לקבל שלל!' : 'Bag empty — complete quests to earn loot!'}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

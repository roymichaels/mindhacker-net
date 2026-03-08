/**
 * LootItemCard — NFT-style card for a single loot/inventory item.
 * Uses shared rarity system from galleryOrbData.
 */
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Rarity } from '@/data/galleryOrbData';
import { RARITY_COLORS, RARITY_LABELS } from '@/data/galleryOrbData';
import type { InventoryItem } from '@/hooks/useInventory';

const RARITY_CARD_STYLES: Record<Rarity, { border: string; bg: string; glow: string; shimmer: boolean }> = {
  common: { border: 'border-zinc-500/25', bg: 'from-zinc-500/8 to-zinc-600/3', glow: '', shimmer: false },
  uncommon: { border: 'border-emerald-500/30', bg: 'from-emerald-500/8 to-teal-500/3', glow: 'shadow-emerald-500/8', shimmer: false },
  rare: { border: 'border-blue-500/40', bg: 'from-blue-500/10 to-indigo-500/3', glow: 'shadow-blue-500/10', shimmer: false },
  epic: { border: 'border-purple-500/40', bg: 'from-purple-500/12 to-fuchsia-500/4', glow: 'shadow-purple-500/15', shimmer: true },
  legendary: { border: 'border-amber-500/50', bg: 'from-amber-500/12 to-orange-500/4', glow: 'shadow-amber-500/20', shimmer: true },
};

const TYPE_ICONS: Record<string, string> = {
  scroll: '📜',
  potion: '🧪',
  crystal: '💎',
  badge: '🏅',
  weapon: '⚔️',
  armor: '🛡️',
  aura: '✨',
  mount: '🐉',
  pet: '🐾',
  title: '👑',
  unknown: '📦',
};

interface LootItemCardProps {
  item: InventoryItem;
  isHe: boolean;
  index?: number;
}

export function LootItemCard({ item, isHe, index = 0 }: LootItemCardProps) {
  const rarity = (item.rarity as Rarity) || 'common';
  const style = RARITY_CARD_STYLES[rarity] || RARITY_CARD_STYLES.common;
  const color = RARITY_COLORS[rarity] || RARITY_COLORS.common;
  const rarityLabel = RARITY_LABELS[rarity] || RARITY_LABELS.common;
  const typeIcon = TYPE_ICONS[item.type] || TYPE_ICONS.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.035, duration: 0.3 }}
      className={cn(
        'relative rounded-xl border overflow-hidden bg-gradient-to-br transition-all cursor-default group',
        style.bg, style.border,
        style.shimmer && 'shadow-lg',
        style.glow,
      )}
    >
      {/* Shimmer overlay for epic/legendary */}
      {style.shimmer && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              background: `linear-gradient(105deg, transparent 40%, hsl(${color} / 0.6) 50%, transparent 60%)`,
              animation: 'loot-shimmer 4s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Corner ornaments */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l rounded-tl-xl pointer-events-none" style={{ borderColor: `hsl(${color} / 0.2)` }} />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r rounded-br-xl pointer-events-none" style={{ borderColor: `hsl(${color} / 0.2)` }} />

      {/* Qty badge */}
      {item.qty > 1 && (
        <div
          className="absolute top-1 end-1 z-20 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-black text-white"
          style={{ background: `hsl(${color})` }}
        >
          ×{item.qty}
        </div>
      )}

      <div className="p-2.5 flex flex-col items-center text-center gap-1 relative z-20">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `linear-gradient(135deg, hsl(${color} / 0.18), hsl(${color} / 0.05))` }}
        >
          {item.icon_url ? (
            <img src={item.icon_url} alt={item.name} className="w-6 h-6 object-contain" />
          ) : (
            typeIcon
          )}
        </div>

        {/* Name */}
        <h4 className="text-[10px] font-bold text-foreground leading-tight line-clamp-2 min-h-[24px]">
          {item.name}
        </h4>

        {/* Rarity + type */}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-[7px] font-black uppercase tracking-[0.2em]"
            style={{ color: `hsl(${color})` }}
          >
            {isHe ? rarityLabel.he : rarityLabel.en}
          </span>
          <span className="text-[8px] text-muted-foreground capitalize">{item.type}</span>
        </div>
      </div>

      <style>{`
        @keyframes loot-shimmer {
          0%, 100% { transform: translateX(-200%); }
          50% { transform: translateX(200%); }
        }
      `}</style>
    </motion.div>
  );
}

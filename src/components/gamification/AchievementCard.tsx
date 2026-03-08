/**
 * AchievementCard — NFT-style collectible card for achievements.
 * Fantasy RPG aesthetic with rarity borders based on XP value.
 */
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/lib/achievements';
import type { Rarity } from '@/data/galleryOrbData';
import { RARITY_COLORS, RARITY_LABELS } from '@/data/galleryOrbData';

function achievementToRarity(achievement: Achievement): Rarity {
  if (achievement.xp >= 750) return 'legendary';
  if (achievement.xp >= 200) return 'epic';
  if (achievement.xp >= 100) return 'rare';
  if (achievement.xp >= 50) return 'uncommon';
  return 'common';
}

const RARITY_CARD_STYLES: Record<Rarity, { border: string; bg: string; glow: string; shimmer: boolean }> = {
  common: { border: 'border-zinc-500/25', bg: 'from-zinc-500/8 to-zinc-600/3', glow: '', shimmer: false },
  uncommon: { border: 'border-emerald-500/30', bg: 'from-emerald-500/8 to-teal-500/3', glow: 'shadow-emerald-500/8', shimmer: false },
  rare: { border: 'border-blue-500/40', bg: 'from-blue-500/10 to-indigo-500/3', glow: 'shadow-blue-500/10', shimmer: false },
  epic: { border: 'border-purple-500/40', bg: 'from-purple-500/12 to-fuchsia-500/4', glow: 'shadow-purple-500/15', shimmer: true },
  legendary: { border: 'border-amber-500/50', bg: 'from-amber-500/12 to-orange-500/4', glow: 'shadow-amber-500/20', shimmer: true },
};

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  isHe: boolean;
  index?: number;
}

export function AchievementCard({ achievement, unlocked, isHe, index = 0 }: AchievementCardProps) {
  const rarity = achievementToRarity(achievement);
  const style = RARITY_CARD_STYLES[rarity];
  const color = RARITY_COLORS[rarity];
  const rarityLabel = RARITY_LABELS[rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={cn(
        'relative rounded-xl border overflow-hidden bg-gradient-to-br transition-all',
        style.bg,
        unlocked ? style.border : 'border-border/30',
        unlocked && style.shimmer && 'shadow-lg',
        unlocked ? style.glow : 'opacity-50 grayscale-[40%]',
      )}
    >
      {/* Shimmer for epic/legendary unlocked */}
      {unlocked && style.shimmer && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              background: `linear-gradient(105deg, transparent 40%, hsl(${color} / 0.6) 50%, transparent 60%)`,
              animation: 'card-shimmer 4s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Corner ornaments */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l rounded-tl-xl pointer-events-none" style={{ borderColor: unlocked ? `hsl(${color} / 0.25)` : 'transparent' }} />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r rounded-br-xl pointer-events-none" style={{ borderColor: unlocked ? `hsl(${color} / 0.25)` : 'transparent' }} />

      <div className="p-3 flex flex-col items-center text-center gap-1.5 relative z-20">
        {/* Icon / Lock */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
            unlocked ? 'bg-gradient-to-br' : 'bg-muted/40'
          )}
          style={unlocked ? {
            background: `linear-gradient(135deg, hsl(${color} / 0.2), hsl(${color} / 0.05))`,
          } : undefined}
        >
          {unlocked ? achievement.icon : <Lock className="w-4 h-4 text-muted-foreground" />}
        </div>

        {/* Name */}
        <h4 className="text-[11px] font-bold text-foreground leading-tight line-clamp-2">
          {isHe ? achievement.nameHe : achievement.name}
        </h4>

        {/* Rarity tag */}
        <span
          className="text-[8px] font-black uppercase tracking-[0.2em]"
          style={{ color: unlocked ? `hsl(${color})` : 'hsl(var(--muted-foreground))' }}
        >
          {isHe ? rarityLabel.he : rarityLabel.en}
        </span>

        {/* Reward row */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-amber-400">+{achievement.xp} XP</span>
          {achievement.tokens && (
            <span className="text-[9px] font-mono text-cyan-400">+{achievement.tokens} ⚡</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes card-shimmer {
          0%, 100% { transform: translateX(-200%); }
          50% { transform: translateX(200%); }
        }
      `}</style>
    </motion.div>
  );
}

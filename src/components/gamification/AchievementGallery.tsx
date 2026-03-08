/**
 * AchievementGallery — NFT-style collection grid of all achievement cards.
 * Shows unlocked vs locked status with rarity styling.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useGameState } from '@/hooks/useGameState';
import { getAllAchievements, getAchievementsByCategory, type Achievement } from '@/lib/achievements';
import { AchievementCard } from './AchievementCard';
import { Trophy, Flame, Compass, Crown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all' as const, labelEn: 'All', labelHe: 'הכל', icon: Trophy },
  { id: 'session' as const, labelEn: 'Sessions', labelHe: 'סשנים', icon: Crown },
  { id: 'streak' as const, labelEn: 'Streaks', labelHe: 'רצפים', icon: Flame },
  { id: 'exploration' as const, labelEn: 'Explorer', labelHe: 'חקירה', icon: Compass },
  { id: 'mastery' as const, labelEn: 'Mastery', labelHe: 'שליטה', icon: Crown },
  { id: 'social' as const, labelEn: 'Social', labelHe: 'חברתי', icon: Users },
] as const;

type CategoryFilter = typeof CATEGORIES[number]['id'];

export function AchievementGallery() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { unlockedAchievements } = useGameState();
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const allAchievements = getAllAchievements();
  const filtered = filter === 'all'
    ? allAchievements
    : getAchievementsByCategory(filter as Achievement['category']);

  // Sort: unlocked first, then by XP descending
  const sorted = [...filtered].sort((a, b) => {
    const aUnlocked = unlockedAchievements.includes(a.id) ? 1 : 0;
    const bUnlocked = unlockedAchievements.includes(b.id) ? 1 : 0;
    if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
    return b.xp - a.xp;
  });

  const unlockedCount = allAchievements.filter(a => unlockedAchievements.includes(a.id)).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          {isHe ? 'אוסף הישגים' : 'Achievement Collection'}
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          {unlockedCount}/{allAchievements.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, hsl(45 90% 55%), hsl(35 80% 50%))' }}
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / allAchievements.length) * 100}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = filter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all border',
                isActive
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-muted/20 border-border/30 text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3 h-3" />
              {isHe ? cat.labelHe : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-3 gap-2"
        >
          {sorted.map((achievement, i) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={unlockedAchievements.includes(achievement.id)}
              isHe={isHe}
              index={i}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

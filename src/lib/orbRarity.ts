/**
 * orbRarity.ts — Maps user level to NFT-style rarity tiers.
 * Uses the existing Rarity type from galleryOrbData.
 */
import type { Rarity } from '@/data/galleryOrbData';
import { RARITY_COLORS, RARITY_LABELS } from '@/data/galleryOrbData';

export interface OrbRarityInfo {
  rarity: Rarity;
  label: { en: string; he: string };
  color: string; // HSL string
  borderClass: string;
  bgClass: string;
  glowClass: string;
  shimmer: boolean;
}

const RARITY_THRESHOLDS: { min: number; rarity: Rarity }[] = [
  { min: 25, rarity: 'legendary' },
  { min: 15, rarity: 'epic' },
  { min: 8, rarity: 'rare' },
  { min: 3, rarity: 'uncommon' },
  { min: 0, rarity: 'common' },
];

const RARITY_STYLING: Record<Rarity, { borderClass: string; bgClass: string; glowClass: string; shimmer: boolean }> = {
  common: {
    borderClass: 'border-zinc-500/30',
    bgClass: 'from-zinc-500/10 to-zinc-600/5',
    glowClass: '',
    shimmer: false,
  },
  uncommon: {
    borderClass: 'border-emerald-500/40',
    bgClass: 'from-emerald-500/10 to-teal-500/5',
    glowClass: 'shadow-emerald-500/10',
    shimmer: false,
  },
  rare: {
    borderClass: 'border-blue-500/50',
    bgClass: 'from-blue-500/12 to-indigo-500/5',
    glowClass: 'shadow-blue-500/15',
    shimmer: false,
  },
  epic: {
    borderClass: 'border-purple-500/50',
    bgClass: 'from-purple-500/15 to-fuchsia-500/5',
    glowClass: 'shadow-purple-500/20',
    shimmer: true,
  },
  legendary: {
    borderClass: 'border-amber-500/60',
    bgClass: 'from-amber-500/15 to-orange-500/5',
    glowClass: 'shadow-amber-500/25',
    shimmer: true,
  },
};

export function getOrbRarity(level: number): OrbRarityInfo {
  const match = RARITY_THRESHOLDS.find(t => level >= t.min) ?? RARITY_THRESHOLDS[RARITY_THRESHOLDS.length - 1];
  const rarity = match.rarity;
  const styling = RARITY_STYLING[rarity];

  return {
    rarity,
    label: RARITY_LABELS[rarity],
    color: RARITY_COLORS[rarity],
    ...styling,
  };
}

/** Number of levels until next rarity tier */
export function levelsToNextRarity(level: number): number | null {
  const sorted = [...RARITY_THRESHOLDS].sort((a, b) => a.min - b.min);
  const nextTier = sorted.find(t => t.min > level);
  return nextTier ? nextTier.min - level : null;
}

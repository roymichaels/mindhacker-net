/**
 * Theme configurations for all journey types
 */
import { Sparkles, Briefcase, Heart, Users, Wallet, GraduationCap, Palette } from 'lucide-react';
import type { JourneyTheme, JourneyThemeConfig } from './types';

export const JOURNEY_THEMES: Record<JourneyTheme, JourneyThemeConfig> = {
  launchpad: {
    id: 'launchpad',
    colors: {
      primary: 'blue-500',
      secondary: 'cyan-400',
      background: 'from-blue-950 to-gray-900',
      border: 'border-border/50',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/30',
      progressBg: 'bg-blue-500/10',
    },
    icon: Sparkles,
    title: { he: 'מסע הטרנספורמציה', en: 'Transformation Journey' },
  },
  business: {
    id: 'business',
    colors: {
      primary: 'amber-500',
      secondary: 'yellow-400',
      background: 'from-amber-950 to-gray-900',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/30',
      progressBg: 'bg-amber-500/10',
    },
    icon: Briefcase,
    title: { he: 'מסע עסקי', en: 'Business Journey' },
  },
  health: {
    id: 'health',
    colors: {
      primary: 'red-500',
      secondary: 'rose-400',
      background: 'from-red-950 to-gray-900',
      border: 'border-red-800/30',
      text: 'text-red-400',
      glow: 'shadow-red-500/30',
      progressBg: 'bg-red-500/10',
    },
    icon: Heart,
    title: { he: 'מסע הבריאות', en: 'Health Journey' },
  },
  relationships: {
    id: 'relationships',
    colors: {
      primary: 'pink-500',
      secondary: 'rose-400',
      background: 'from-pink-950 to-gray-900',
      border: 'border-pink-800/30',
      text: 'text-pink-400',
      glow: 'shadow-pink-500/30',
      progressBg: 'bg-pink-500/10',
    },
    icon: Users,
    title: { he: 'מסע הקשרים', en: 'Relationships Journey' },
  },
  finances: {
    id: 'finances',
    colors: {
      primary: 'emerald-500',
      secondary: 'green-400',
      background: 'from-emerald-950 to-gray-900',
      border: 'border-emerald-800/30',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/30',
      progressBg: 'bg-emerald-500/10',
    },
    icon: Wallet,
    title: { he: 'מסע פיננסי', en: 'Financial Journey' },
  },
  learning: {
    id: 'learning',
    colors: {
      primary: 'indigo-500',
      secondary: 'violet-400',
      background: 'from-indigo-950 to-gray-900',
      border: 'border-indigo-800/30',
      text: 'text-indigo-400',
      glow: 'shadow-indigo-500/30',
      progressBg: 'bg-indigo-500/10',
    },
    icon: GraduationCap,
    title: { he: 'מסע הלמידה', en: 'Learning Journey' },
  },
  hobbies: {
    id: 'hobbies',
    colors: {
      primary: 'teal-500',
      secondary: 'cyan-400',
      background: 'from-teal-950 to-gray-900',
      border: 'border-teal-800/30',
      text: 'text-teal-400',
      glow: 'shadow-teal-500/30',
      progressBg: 'bg-teal-500/10',
    },
    icon: Palette,
    title: { he: 'מסע התחביבים', en: 'Hobbies Journey' },
  },
};

// Phase color presets that can be used by any journey
export const PHASE_COLORS = {
  1: { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-500', glow: 'shadow-blue-500/30' },
  2: { bg: 'from-amber-500 to-orange-500', text: 'text-amber-500', glow: 'shadow-amber-500/30' },
  3: { bg: 'from-emerald-500 to-green-500', text: 'text-emerald-500', glow: 'shadow-emerald-500/30' },
  4: { bg: 'from-purple-500 to-pink-500', text: 'text-purple-500', glow: 'shadow-purple-500/30' },
};

export function getThemeConfig(theme: JourneyTheme): JourneyThemeConfig {
  return JOURNEY_THEMES[theme];
}

/**
 * useRouteTheme — Returns color theme tokens based on the current route,
 * matching the bottom tab bar color scheme for each section.
 * 
 * Sections:
 * - Path (plan/dashboard/now): cyan
 * - FM (fm/coaches/business/freelancer/creator): amber
 * - Community: emerald  
 * - Study: violet
 */
import { useLocation } from 'react-router-dom';

export type RouteThemeId = 'plan' | 'fm' | 'community' | 'study';

export interface RouteTheme {
  id: RouteThemeId;
  borderColor: string;
  headerBg: string;
  headerBgDark: string;
  ambientGlow: string;
  ambientGlowDark: string;
  activeText: string;
  accentBg: string;
  accentBorder: string;
}

const THEMES: Record<RouteThemeId, RouteTheme> = {
  plan: {
    id: 'plan',
    borderColor: 'hsl(var(--border))',
    headerBg: 'hsl(var(--background) / 0.95)',
    headerBgDark: 'hsl(var(--background) / 0.95)',
    ambientGlow: 'none',
    ambientGlowDark: 'none',
    activeText: 'text-cyan-700 dark:text-cyan-300',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/20',
  },
  fm: {
    id: 'fm',
    borderColor: 'hsl(var(--border))',
    headerBg: 'hsl(var(--background) / 0.95)',
    headerBgDark: 'hsl(var(--background) / 0.95)',
    ambientGlow: 'none',
    ambientGlowDark: 'none',
    activeText: 'text-amber-700 dark:text-amber-300',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/20',
  },
  community: {
    id: 'community',
    borderColor: 'hsl(var(--border))',
    headerBg: 'hsl(var(--background) / 0.95)',
    headerBgDark: 'hsl(var(--background) / 0.95)',
    ambientGlow: 'none',
    ambientGlowDark: 'none',
    activeText: 'text-emerald-700 dark:text-emerald-300',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
  },
  study: {
    id: 'study',
    borderColor: 'hsla(var(--border), 0.5)',
    headerBg: 'hsl(var(--background) / 0.95)',
    headerBgDark: 'hsl(var(--background) / 0.95)',
    ambientGlow: 'none',
    ambientGlowDark: 'none',
    activeText: 'text-violet-700 dark:text-violet-300',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/20',
  },
};

export function useRouteTheme(): RouteTheme {
  const location = useLocation();
  const p = location.pathname;

  if (p.startsWith('/fm') || p.startsWith('/coaches') || p.startsWith('/business') || p.startsWith('/freelancer') || p.startsWith('/creator')) {
    return THEMES.fm;
  }
  if (p.startsWith('/community')) return THEMES.community;
  if (p.startsWith('/study') || p.startsWith('/learn')) return THEMES.study;
  // Default: plan/path
  return THEMES.plan;
}

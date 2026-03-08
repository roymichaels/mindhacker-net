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
  /** Header border color */
  borderColor: string;
  /** Header bg gradient (light) */
  headerGradient: string;
  /** Header bg gradient (dark) */
  headerGradientDark: string;
  /** Page ambient glow */
  ambientGlow: string;
  /** Text color for active elements */
  activeText: string;
  /** Accent bg for buttons/badges */
  accentBg: string;
  /** Accent border */
  accentBorder: string;
}

const THEMES: Record<RouteThemeId, RouteTheme> = {
  plan: {
    id: 'plan',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    headerGradient: 'from-cyan-50/95 via-sky-50/90 to-background/95',
    headerGradientDark: 'dark:from-cyan-950/40 dark:via-cyan-900/20 dark:to-background/95',
    ambientGlow: 'radial-gradient(ellipse at top, rgba(6, 182, 212, 0.04), transparent 50%)',
    activeText: 'text-cyan-700 dark:text-cyan-300',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/20',
  },
  fm: {
    id: 'fm',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    headerGradient: 'from-amber-50/95 via-orange-50/90 to-background/95',
    headerGradientDark: 'dark:from-amber-950/40 dark:via-amber-900/20 dark:to-background/95',
    ambientGlow: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.04), transparent 50%)',
    activeText: 'text-amber-700 dark:text-amber-300',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/20',
  },
  community: {
    id: 'community',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    headerGradient: 'from-emerald-50/95 via-green-50/90 to-background/95',
    headerGradientDark: 'dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-background/95',
    ambientGlow: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.04), transparent 50%)',
    activeText: 'text-emerald-700 dark:text-emerald-300',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
  },
  study: {
    id: 'study',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    headerGradient: 'from-violet-50/95 via-purple-50/90 to-background/95',
    headerGradientDark: 'dark:from-violet-950/40 dark:via-violet-900/20 dark:to-background/95',
    ambientGlow: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.04), transparent 50%)',
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

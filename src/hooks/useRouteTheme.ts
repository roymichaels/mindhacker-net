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
    borderColor: 'rgba(6, 182, 212, 0.3)',
    headerBg: 'linear-gradient(to bottom, rgba(236, 254, 255, 0.95), rgba(240, 249, 255, 0.9), rgba(var(--background-rgb, 255,255,255), 0.95))',
    headerBgDark: 'linear-gradient(to bottom, rgba(22, 78, 99, 0.4), rgba(21, 94, 117, 0.2), rgba(var(--background-rgb, 0,0,0), 0.95))',
    ambientGlow: 'radial-gradient(ellipse at top, rgba(6, 182, 212, 0.04), transparent 50%)',
    ambientGlowDark: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6, 182, 212, 0.12), rgba(6, 182, 212, 0.04) 40%, transparent 70%)',
    activeText: 'text-cyan-700 dark:text-cyan-300',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/20',
  },
  fm: {
    id: 'fm',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    headerBg: 'linear-gradient(to bottom, rgba(255, 251, 235, 0.95), rgba(255, 247, 237, 0.9), rgba(var(--background-rgb, 255,255,255), 0.95))',
    headerBgDark: 'linear-gradient(to bottom, rgba(69, 26, 3, 0.4), rgba(120, 53, 15, 0.2), rgba(var(--background-rgb, 0,0,0), 0.95))',
    ambientGlow: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.04), transparent 50%)',
    ambientGlowDark: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.04) 40%, transparent 70%)',
    activeText: 'text-amber-700 dark:text-amber-300',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/20',
  },
  community: {
    id: 'community',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    headerBg: 'linear-gradient(to bottom, rgba(236, 253, 245, 0.95), rgba(240, 253, 244, 0.9), rgba(var(--background-rgb, 255,255,255), 0.95))',
    headerBgDark: 'linear-gradient(to bottom, rgba(6, 78, 59, 0.4), rgba(6, 95, 70, 0.2), rgba(var(--background-rgb, 0,0,0), 0.95))',
    ambientGlow: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.04), transparent 50%)',
    ambientGlowDark: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04) 40%, transparent 70%)',
    activeText: 'text-emerald-700 dark:text-emerald-300',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/20',
  },
  study: {
    id: 'study',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    headerBg: 'linear-gradient(to bottom, rgba(245, 243, 255, 0.95), rgba(250, 245, 255, 0.9), rgba(var(--background-rgb, 255,255,255), 0.95))',
    headerBgDark: 'linear-gradient(to bottom, rgba(46, 16, 101, 0.4), rgba(76, 29, 149, 0.2), rgba(var(--background-rgb, 0,0,0), 0.95))',
    ambientGlow: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.04), transparent 50%)',
    ambientGlowDark: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
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

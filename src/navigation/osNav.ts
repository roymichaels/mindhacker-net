/**
 * @module navigation/osNav
 * @purpose Single source of truth for all OS-level tabs, routes, role gating, and i18n labels
 * 
 * Replaces navConfig.ts. Consumed by TopNavBar, BottomTabBar, and sidebar components.
 */

import { LayoutDashboard, Flame, FolderKanban, Shield, type LucideIcon } from 'lucide-react';

// ─── Tab Definition ──────────────────────────────────────────────────────────

export interface OsTab {
  id: string;
  path: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  /** Role required to see this tab (undefined = visible to all authenticated users) */
  requiredRole?: 'admin' | 'practitioner';
  comingSoon?: boolean;
}

/** The 3 tabs visible to every authenticated user */
export const OS_TABS: OsTab[] = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, labelEn: 'Dashboard', labelHe: 'דאשבורד' },
  { id: 'life',      path: '/life',      icon: Flame,          labelEn: 'Life',      labelHe: 'חיים' },
  { id: 'projects',  path: '/projects',  icon: FolderKanban,   labelEn: 'Projects',  labelHe: 'פרויקטים' },
];

/** Admin-only tab, appended when user has 'admin' role */
export const ADMIN_TAB: OsTab = {
  id: 'admin',
  path: '/admin-hub',
  icon: Shield,
  labelEn: 'Admin',
  labelHe: 'ניהול',
  requiredRole: 'admin',
};

// ─── Sub-routes per tab (for sidebar consumption) ────────────────────────────

export interface SubRoute {
  id: string;
  labelEn: string;
  labelHe: string;
  /** Relative path segment (appended to tab path or used as search param) */
  segment: string;
}

export const COACH_SUB_ROUTES: SubRoute[] = [
  { id: 'overview',   labelEn: 'Overview',   labelHe: 'סקירה',     segment: 'overview' },
  { id: 'clients',    labelEn: 'Clients',    labelHe: 'מתאמנים',   segment: 'clients' },
  { id: 'plans',      labelEn: 'Plans',      labelHe: 'תוכניות',   segment: 'plans' },
  { id: 'marketing',  labelEn: 'Marketing',  labelHe: 'שיווק',     segment: 'marketing' },
  { id: 'settings',   labelEn: 'Settings',   labelHe: 'הגדרות',    segment: 'settings' },
];

export const ADMIN_SUB_ROUTES: SubRoute[] = [
  { id: 'overview',     labelEn: 'Overview',     labelHe: 'סקירה',         segment: 'overview' },
  { id: 'admin',        labelEn: 'Admin',        labelHe: 'ניהול',         segment: 'admin' },
  { id: 'campaigns',    labelEn: 'Campaigns',    labelHe: 'קמפיינים',     segment: 'campaigns' },
  { id: 'content',      labelEn: 'Content',      labelHe: 'תוכן',         segment: 'content' },
  { id: 'site',         labelEn: 'Site',         labelHe: 'אתר',          segment: 'site' },
  { id: 'system',       labelEn: 'System',       labelHe: 'מערכת',        segment: 'system' },
];

export const PROJECTS_SUB_ROUTES: SubRoute[] = [
  { id: 'board',      labelEn: 'Board',      labelHe: 'לוח',       segment: 'board' },
  { id: 'timeline',   labelEn: 'Timeline',   labelHe: 'ציר זמן',   segment: 'timeline' },
  { id: 'settings',   labelEn: 'Settings',   labelHe: 'הגדרות',    segment: 'settings' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the visible tabs array based on user roles.
 */
export function getVisibleTabs(roles: { hasRole: (role: string) => boolean }): OsTab[] {
  const tabs = [...OS_TABS];
  if (roles.hasRole('admin')) {
    tabs.push(ADMIN_TAB);
  }
  return tabs;
}

/**
 * @module navigation/osNav
 * @purpose Single source of truth for app-level tabs, routes, and role-gated nav items.
 */

import { Brain, Shield, Users, Briefcase, GraduationCap, Store, type LucideIcon } from 'lucide-react';

export interface OsTab {
  id: string;
  path: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  requiredRole?: 'admin' | 'practitioner';
  comingSoon?: boolean;
}

export const OS_TABS: OsTab[] = [
  { id: 'fm', path: '/fm', icon: Store, labelEn: 'Free Market', labelHe: 'שוק חופשי' },
  { id: 'mindos', path: '/mindos/chat', icon: Brain, labelEn: 'MindOS', labelHe: 'MindOS' },
  { id: 'community', path: '/community', icon: Users, labelEn: 'Community', labelHe: 'קהילה' },
  { id: 'study', path: '/learn', icon: GraduationCap, labelEn: 'Study', labelHe: 'לימוד' },
];

export const COACH_TAB: OsTab = {
  id: 'coach',
  path: '/coaches',
  icon: Briefcase,
  labelEn: 'Coaches',
  labelHe: 'מאמנים',
};

export const ADMIN_TAB: OsTab = {
  id: 'admin',
  path: '/admin-hub',
  icon: Shield,
  labelEn: 'Admin',
  labelHe: 'ניהול',
  requiredRole: 'admin',
};

export interface SubRoute {
  id: string;
  labelEn: string;
  labelHe: string;
  segment: string;
}

export const COACH_SUB_ROUTES: SubRoute[] = [
  { id: 'overview', labelEn: 'Overview', labelHe: 'סקירה', segment: 'overview' },
  { id: 'clients', labelEn: 'Clients', labelHe: 'לקוחות', segment: 'clients' },
  { id: 'plans', labelEn: 'Plans', labelHe: 'תוכניות', segment: 'plans' },
  { id: 'marketing', labelEn: 'Marketing', labelHe: 'שיווק', segment: 'marketing' },
  { id: 'landing-pages', labelEn: 'Landing Pages', labelHe: 'דפי נחיתה', segment: 'landing-pages' },
  { id: 'settings', labelEn: 'Settings', labelHe: 'הגדרות', segment: 'settings' },
];

export const ADMIN_SUB_ROUTES: SubRoute[] = [
  { id: 'overview', labelEn: 'Overview', labelHe: 'סקירה', segment: 'overview' },
  { id: 'admin', labelEn: 'Admin', labelHe: 'ניהול', segment: 'admin' },
  { id: 'campaigns', labelEn: 'Campaigns', labelHe: 'קמפיינים', segment: 'campaigns' },
  { id: 'content', labelEn: 'Content', labelHe: 'תוכן', segment: 'content' },
  { id: 'site', labelEn: 'Site', labelHe: 'אתר', segment: 'site' },
  { id: 'system', labelEn: 'System', labelHe: 'מערכת', segment: 'system' },
];

export const PROJECTS_SUB_ROUTES: SubRoute[] = [
  { id: 'board', labelEn: 'Board', labelHe: 'לוח', segment: 'board' },
  { id: 'timeline', labelEn: 'Timeline', labelHe: 'ציר זמן', segment: 'timeline' },
  { id: 'settings', labelEn: 'Settings', labelHe: 'הגדרות', segment: 'settings' },
];

export function getVisibleTabs(_roles: { hasRole: (role: string) => boolean }): OsTab[] {
  return [...OS_TABS];
}

/**
 * @module navigation/navConfig
 * @purpose Single source of truth for app tab definitions
 * 
 * Used by BottomTabBar and TopNavBar. Centralizes tab IDs, paths, icons, labels.
 */

import { LayoutDashboard, FolderKanban, Store, Briefcase, Shield, type LucideIcon } from 'lucide-react';

export interface TabConfig {
  id: string;
  path: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  comingSoon?: boolean;
}

export const APP_TABS: TabConfig[] = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, labelEn: 'Dashboard', labelHe: 'דאשבורד' },
  { id: 'projects', path: '/projects', icon: FolderKanban, labelEn: 'Projects', labelHe: 'פרויקטים' },
  { id: 'coaches', path: '/coaches', icon: Store, labelEn: 'Coaches', labelHe: 'מאמנים' },
  { id: 'business', path: '/business', icon: Briefcase, labelEn: 'Business', labelHe: 'עסקים', comingSoon: true },
];

export const ADMIN_TAB: TabConfig = {
  id: 'admin',
  path: '/admin-hub',
  icon: Shield,
  labelEn: 'Admin',
  labelHe: 'ניהול',
};

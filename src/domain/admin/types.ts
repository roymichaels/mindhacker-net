/**
 * @module domain/admin/types
 * @purpose Domain types for the Admin hub system
 * 
 * Re-exports entity types from their source hooks and defines
 * the tab configuration types used by AdminHub.
 */

import type { LucideIcon } from 'lucide-react';

// ─── Re-exported Entity Types ───────────────────────────────────────────────

export type { AdminNotification } from '@/hooks/useAdminNotifications';
export type { AdminUserData } from '@/hooks/useAdminUserView';

// ─── Tab Configuration Types ────────────────────────────────────────────────

export interface AdminSubTabConfig {
  id: string;
  labelHe: string;
  labelEn: string;
  component: React.LazyExoticComponent<any>;
}

export interface AdminTabConfig {
  id: string;
  labelHe: string;
  labelEn: string;
  icon: LucideIcon;
  subTabs: AdminSubTabConfig[];
}

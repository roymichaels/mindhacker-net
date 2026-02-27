/**
 * @module domain/admin/tabConfig
 * @purpose Centralised tab + sub-tab configuration for AdminHub
 * 
 * All lazy imports for admin sub-pages live here so that
 * AdminHub.tsx remains a thin rendering shell.
 */

import { lazy } from 'react';
import {
  LayoutDashboard,
  Shield,
  Megaphone,
  FileText,
  Settings,
  Globe,
} from 'lucide-react';
import type { AdminTabConfig } from './types';

// ─── Lazy-loaded Admin Sub-Pages ────────────────────────────────────────────

// PanelDashboard was removed — admin overview now uses Analytics as default
const AdminDashboardOverview = lazy(() => import('@/pages/admin/Analytics'));
const Analytics         = lazy(() => import('@/pages/admin/Analytics'));
const NotificationCenter = lazy(() => import('@/pages/admin/NotificationCenter'));
const Users             = lazy(() => import('@/pages/admin/Users'));

const Leads             = lazy(() => import('@/pages/admin/Leads'));
const Businesses        = lazy(() => import('@/pages/admin/Businesses'));
const AuroraInsights    = lazy(() => import('@/pages/admin/AuroraInsights'));
const AdminAffiliates   = lazy(() => import('@/pages/admin/Affiliates'));
const Newsletter        = lazy(() => import('@/pages/admin/Newsletter'));
const AdminOffers       = lazy(() => import('@/pages/admin/Offers'));
const Purchases         = lazy(() => import('@/pages/admin/Purchases'));
const AdminProducts     = lazy(() => import('@/pages/admin/Products'));
const Content           = lazy(() => import('@/pages/admin/Content'));
const Videos            = lazy(() => import('@/pages/admin/Videos'));
const Recordings        = lazy(() => import('@/pages/admin/Recordings'));
const Forms             = lazy(() => import('@/pages/admin/Forms'));
const LandingPages      = lazy(() => import('@/pages/admin/LandingPages'));
const HomepageSections  = lazy(() => import('@/pages/admin/HomepageSections'));
const AdminTheme        = lazy(() => import('@/pages/admin/Theme'));
const FAQs              = lazy(() => import('@/pages/admin/FAQs'));
const Testimonials      = lazy(() => import('@/pages/admin/Testimonials'));
const BugReports        = lazy(() => import('@/pages/admin/BugReports'));
const ChatAssistant     = lazy(() => import('@/pages/admin/ChatAssistant'));
const AdminSettings     = lazy(() => import('@/pages/admin/Settings'));
const TemplateCoverage  = lazy(() => import('@/components/admin/TemplateCoveragePanel'));

// ─── Tab Configuration ──────────────────────────────────────────────────────

export const ADMIN_TABS: AdminTabConfig[] = [
  {
    id: 'overview',
    labelHe: 'סקירה',
    labelEn: 'Overview',
    icon: LayoutDashboard,
    subTabs: [
      { id: 'dashboard', labelHe: 'דאשבורד', labelEn: 'Dashboard', component: AdminDashboardOverview },
      { id: 'analytics', labelHe: 'אנליטיקס', labelEn: 'Analytics', component: Analytics },
      { id: 'notifications', labelHe: 'התראות', labelEn: 'Notifications', component: NotificationCenter },
    ],
  },
  {
    id: 'admin',
    labelHe: 'ניהול',
    labelEn: 'Admin',
    icon: Shield,
    subTabs: [
      { id: 'users', labelHe: 'משתמשים', labelEn: 'Users', component: Users },
      { id: 'leads', labelHe: 'לידים', labelEn: 'Leads', component: Leads },
      { id: 'businesses', labelHe: 'עסקים', labelEn: 'Businesses', component: Businesses },
      { id: 'aurora-insights', labelHe: 'תובנות', labelEn: 'Insights', component: AuroraInsights },
    ],
  },
  {
    id: 'campaigns',
    labelHe: 'קמפיינים',
    labelEn: 'Campaigns',
    icon: Megaphone,
    subTabs: [
      { id: 'affiliates', labelHe: 'שותפים', labelEn: 'Affiliates', component: AdminAffiliates },
      { id: 'newsletter', labelHe: 'ניוזלטר', labelEn: 'Newsletter', component: Newsletter },
      { id: 'offers', labelHe: 'הצעות', labelEn: 'Offers', component: AdminOffers },
      { id: 'purchases', labelHe: 'רכישות', labelEn: 'Purchases', component: Purchases },
    ],
  },
  {
    id: 'content',
    labelHe: 'תוכן',
    labelEn: 'Content',
    icon: FileText,
    subTabs: [
      { id: 'products', labelHe: 'מוצרים', labelEn: 'Products', component: AdminProducts },
      { id: 'content-mgmt', labelHe: 'תוכן', labelEn: 'Content', component: Content },
      { id: 'videos', labelHe: 'סרטונים', labelEn: 'Videos', component: Videos },
      { id: 'recordings', labelHe: 'הקלטות', labelEn: 'Recordings', component: Recordings },
      { id: 'forms', labelHe: 'טפסים', labelEn: 'Forms', component: Forms },
    ],
  },
  {
    id: 'site',
    labelHe: 'אתר',
    labelEn: 'Site',
    icon: Globe,
    subTabs: [
      { id: 'landing-pages', labelHe: 'דפי נחיתה', labelEn: 'Landing Pages', component: LandingPages },
      { id: 'homepage', labelHe: 'עמוד הבית', labelEn: 'Homepage', component: HomepageSections },
      { id: 'theme', labelHe: 'ערכת נושא', labelEn: 'Theme', component: AdminTheme },
      { id: 'faqs', labelHe: 'שאלות נפוצות', labelEn: 'FAQs', component: FAQs },
      { id: 'testimonials', labelHe: 'המלצות', labelEn: 'Testimonials', component: Testimonials },
    ],
  },
  {
    id: 'system',
    labelHe: 'מערכת',
    labelEn: 'System',
    icon: Settings,
    subTabs: [
      { id: 'bug-reports', labelHe: 'דיווחי באגים', labelEn: 'Bug Reports', component: BugReports },
      { id: 'chat-assistant', labelHe: 'עוזר צ\'אט', labelEn: 'Chat Assistant', component: ChatAssistant },
      { id: 'settings', labelHe: 'הגדרות', labelEn: 'Settings', component: AdminSettings },
    ],
  },
];

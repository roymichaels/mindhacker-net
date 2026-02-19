import { lazy, Suspense, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import { PageSkeleton } from '@/components/ui/skeleton';
import { NotificationBell } from '@/components/admin/NotificationBell';
import {
  LayoutDashboard,
  Shield,
  Megaphone,
  FileText,
  Settings,
  Globe,
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Lazy load all admin sub-pages
const PanelDashboard = lazy(() => import('@/components/panel/PanelDashboard'));
const Analytics = lazy(() => import('./admin/Analytics'));
const Users = lazy(() => import('./admin/Users'));
const RolesManager = lazy(() => import('./panel/RolesManager'));
const Leads = lazy(() => import('./admin/Leads'));
const Businesses = lazy(() => import('./admin/Businesses'));
const AuroraInsights = lazy(() => import('./admin/AuroraInsights'));
const AdminAffiliates = lazy(() => import('./admin/Affiliates'));
const Newsletter = lazy(() => import('./admin/Newsletter'));
const AdminOffers = lazy(() => import('./admin/Offers'));
const Purchases = lazy(() => import('./admin/Purchases'));
const AdminProducts = lazy(() => import('./admin/Products'));
const Content = lazy(() => import('./admin/Content'));
const Videos = lazy(() => import('./admin/Videos'));
const Recordings = lazy(() => import('./admin/Recordings'));
const Forms = lazy(() => import('./admin/Forms'));
const LandingPages = lazy(() => import('./admin/LandingPages'));
const HomepageSections = lazy(() => import('./admin/HomepageSections'));
const AdminTheme = lazy(() => import('./admin/Theme'));
const FAQs = lazy(() => import('./admin/FAQs'));
const Testimonials = lazy(() => import('./admin/Testimonials'));
const BugReports = lazy(() => import('./admin/BugReports'));
const ChatAssistant = lazy(() => import('./admin/ChatAssistant'));
const AdminSettings = lazy(() => import('./admin/Settings'));
const NotificationCenter = lazy(() => import('./admin/NotificationCenter'));

interface TabConfig {
  id: string;
  labelHe: string;
  labelEn: string;
  icon: typeof LayoutDashboard;
  subTabs: { id: string; labelHe: string; labelEn: string; component: React.LazyExoticComponent<any> }[];
}

const ADMIN_TABS: TabConfig[] = [
  {
    id: 'overview',
    labelHe: 'סקירה',
    labelEn: 'Overview',
    icon: LayoutDashboard,
    subTabs: [
      { id: 'dashboard', labelHe: 'דאשבורד', labelEn: 'Dashboard', component: PanelDashboard },
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
      { id: 'roles', labelHe: 'תפקידים', labelEn: 'Roles', component: RolesManager },
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

export default function AdminHub() {
  const { language, isRTL } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isHebrew = language === 'he';

  const activeTab = searchParams.get('tab') || 'overview';
  const activeSubTab = searchParams.get('sub') || '';

  const currentTabConfig = useMemo(
    () => ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0],
    [activeTab]
  );

  const currentSubTab = activeSubTab || currentTabConfig.subTabs[0]?.id || '';

  const setTab = (tab: string) => {
    const newParams = new URLSearchParams();
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  };

  const setSubTab = (sub: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sub', sub);
    setSearchParams(newParams, { replace: true });
  };

  const ActiveSubComponent = useMemo(() => {
    const sub = currentTabConfig.subTabs.find(s => s.id === currentSubTab);
    return sub?.component || currentTabConfig.subTabs[0]?.component;
  }, [currentTabConfig, currentSubTab]);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-4 py-2" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl md:text-2xl font-bold">
          {isHebrew ? 'מרכז בקרה' : 'Control Center'}
        </h1>
        <NotificationBell />
      </div>

      {/* Primary tabs - category level */}
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-2">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {isHebrew ? tab.labelHe : tab.labelEn}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Secondary tabs - sub-page level */}
      {currentTabConfig.subTabs.length > 1 && (
        <ScrollArea className="w-full">
          <div className="flex gap-1 border-b border-border pb-1">
            {currentTabConfig.subTabs.map((sub) => {
              const isActive = currentSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubTab(sub.id)}
                  className={`px-3 py-1.5 text-sm whitespace-nowrap transition-colors rounded-t-md ${
                    isActive
                      ? 'text-foreground border-b-2 border-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isHebrew ? sub.labelHe : sub.labelEn}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Content */}
      <div className="min-h-[60vh]">
        <Suspense fallback={<PageSkeleton />}>
          {ActiveSubComponent && <ActiveSubComponent />}
        </Suspense>
      </div>
    </div>
  );
}

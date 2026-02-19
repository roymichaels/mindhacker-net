import { useTranslation } from '@/hooks/useTranslation';
import { useSearchParams } from 'react-router-dom';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { Users, Brain, ShoppingBag, Megaphone, Settings, Briefcase } from 'lucide-react';
import { HeroBanner } from '@/components/aurora-ui/HeroBanner';
import { PillTabNav } from '@/components/aurora-ui/PillTabNav';
import { PageShell } from '@/components/aurora-ui/PageShell';
import CoachClientsTab from '@/components/coach/CoachClientsTab';
import CoachPlansTab from '@/components/coach/CoachPlansTab';
import CoachProductsTab from '@/components/coach/CoachProductsTab';
import CoachMarketingTab from '@/components/coach/CoachMarketingTab';
import CoachSettingsTab from '@/components/coach/CoachSettingsTab';

const TAB_CONFIG = [
  { value: 'clients', icon: Users, labelHe: 'מתאמנים', labelEn: 'Clients' },
  { value: 'plans', icon: Brain, labelHe: 'תוכניות AI', labelEn: 'AI Plans' },
  { value: 'products', icon: ShoppingBag, labelHe: 'מוצרים', labelEn: 'Products' },
  { value: 'marketing', icon: Megaphone, labelHe: 'שיווק', labelEn: 'Marketing' },
  { value: 'settings', icon: Settings, labelHe: 'הגדרות', labelEn: 'Settings' },
] as const;

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  clients: CoachClientsTab,
  plans: CoachPlansTab,
  products: CoachProductsTab,
  marketing: CoachMarketingTab,
  settings: CoachSettingsTab,
};

const CoachHub = () => {
  const { language, isRTL } = useTranslation();
  const isHebrew = language === 'he';
  const { data: myProfile } = useMyPractitionerProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'clients';
  
  const handleTabChange = (value: string) => {
    setSearchParams(value === 'clients' ? {} : { tab: value }, { replace: true });
  };

  const storefrontUrl = myProfile?.slug
    ? `${window.location.origin}/p/${myProfile.slug}`
    : '';

  const pillTabs = TAB_CONFIG.map((tab) => ({
    id: tab.value,
    label: isHebrew ? tab.labelHe : tab.labelEn,
    icon: tab.icon,
  }));

  const ActiveComponent = TAB_COMPONENTS[currentTab] || CoachClientsTab;

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Hero Banner */}
        <HeroBanner
          gradient="from-purple-500/15 to-indigo-500/15"
          icon={
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
              <Briefcase className="h-5 w-5" />
            </div>
          }
          title={isHebrew ? 'מרכז השליטה' : 'Coach Hub'}
          subtitle={isHebrew ? 'נהלו את העסק שלכם במקום אחד' : 'Manage your coaching business in one place'}
          action={storefrontUrl ? () => window.open(storefrontUrl, '_blank') : undefined}
          actionLabel={storefrontUrl ? (isHebrew ? 'צפה בחנות' : 'View Storefront') : undefined}
          className="border-purple-500/20"
        />

        {/* Pill Navigation */}
        <PillTabNav
          tabs={pillTabs}
          activeTab={currentTab}
          onTabChange={handleTabChange}
          activeGradient="from-purple-500 to-indigo-600"
        />

        {/* Tab Content */}
        <ActiveComponent />
      </div>
    </PageShell>
  );
};

export default CoachHub;

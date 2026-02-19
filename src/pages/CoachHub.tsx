import { useTranslation } from '@/hooks/useTranslation';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { Button } from '@/components/ui/button';
import { ExternalLink, LayoutDashboard, Users, Brain, ShoppingBag, Megaphone, Settings } from 'lucide-react';
import CoachDashboardTab from '@/components/coach/CoachDashboardTab';
import CoachClientsTab from '@/components/coach/CoachClientsTab';
import CoachPlansTab from '@/components/coach/CoachPlansTab';
import CoachProductsTab from '@/components/coach/CoachProductsTab';
import CoachMarketingTab from '@/components/coach/CoachMarketingTab';
import CoachSettingsTab from '@/components/coach/CoachSettingsTab';

const TAB_CONFIG = [
  { value: 'dashboard', icon: LayoutDashboard, labelHe: 'סקירה', labelEn: 'Dashboard' },
  { value: 'clients', icon: Users, labelHe: 'מתאמנים', labelEn: 'Clients' },
  { value: 'plans', icon: Brain, labelHe: 'תוכניות AI', labelEn: 'AI Plans' },
  { value: 'products', icon: ShoppingBag, labelHe: 'מוצרים', labelEn: 'Products' },
  { value: 'marketing', icon: Megaphone, labelHe: 'שיווק', labelEn: 'Marketing' },
  { value: 'settings', icon: Settings, labelHe: 'הגדרות', labelEn: 'Settings' },
] as const;

const CoachHub = () => {
  const { language, isRTL } = useTranslation();
  const isHebrew = language === 'he';
  const { data: myProfile } = useMyPractitionerProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  const handleTabChange = (value: string) => {
    setSearchParams(value === 'dashboard' ? {} : { tab: value }, { replace: true });
  };

  const storefrontUrl = myProfile?.slug
    ? `${window.location.origin}/p/${myProfile.slug}`
    : '';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isHebrew ? 'מרכז השליטה' : 'Coach Hub'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isHebrew ? 'נהלו את העסק שלכם במקום אחד' : 'Manage your coaching business in one place'}
          </p>
        </div>
        {storefrontUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 me-2" />
              {isHebrew ? 'צפה בחנות' : 'View Storefront'}
            </a>
          </Button>
        )}
      </div>

      {/* Tabbed Interface */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          <TabsList className="inline-flex w-auto min-w-full sm:w-full sm:grid sm:grid-cols-6">
            {TAB_CONFIG.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"
              >
                <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{isHebrew ? tab.labelHe : tab.labelEn}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="dashboard">
          <CoachDashboardTab />
        </TabsContent>
        <TabsContent value="clients">
          <CoachClientsTab />
        </TabsContent>
        <TabsContent value="plans">
          <CoachPlansTab />
        </TabsContent>
        <TabsContent value="products">
          <CoachProductsTab />
        </TabsContent>
        <TabsContent value="marketing">
          <CoachMarketingTab />
        </TabsContent>
        <TabsContent value="settings">
          <CoachSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachHub;

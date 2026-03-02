import CoachDashboardOverview from '@/components/coach/CoachDashboardOverview';
import CoachMarketingTab from '@/components/coach/CoachMarketingTab';
import CoachSettingsTab from '@/components/coach/CoachSettingsTab';
import CoachLandingPagesTab from '@/components/coach/CoachLandingPagesTab';
import CoachLeadsTab from '@/components/coach/CoachLeadsTab';
import CoachAnalyticsTab from '@/components/coach/CoachAnalyticsTab';
import CoachContentTab from '@/components/coach/CoachContentTab';
import CoachProductsTab from '@/components/coach/CoachProductsTab';
import CoachClientsTab from '@/components/coach/CoachClientsTab';
import CoachPlansTab from '@/components/coach/CoachPlansTab';

interface CoachHubProps {
  selectedClientId?: string | null;
  onClearClient?: () => void;
  activeTab?: string;
}

export default function CoachHub({ selectedClientId, onClearClient, activeTab = 'dashboard' }: CoachHubProps) {
  if (activeTab === 'clients') return <CoachClientsTab />;
  if (activeTab === 'leads') return <CoachLeadsTab />;
  if (activeTab === 'products') return <CoachProductsTab />;
  if (activeTab === 'content') return <CoachContentTab />;
  if (activeTab === 'plans') return <CoachPlansTab />;
  if (activeTab === 'marketing') return <CoachMarketingTab />;
  if (activeTab === 'analytics') return <CoachAnalyticsTab />;
  if (activeTab === 'landing-pages') return <CoachLandingPagesTab />;
  if (activeTab === 'settings') return <CoachSettingsTab />;
  return <CoachDashboardOverview />;
}

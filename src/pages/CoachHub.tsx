import CoachDashboardOverview from '@/components/coach/CoachDashboardOverview';
import CoachMarketingTab from '@/components/coach/CoachMarketingTab';
import CoachSettingsTab from '@/components/coach/CoachSettingsTab';
import CoachLandingPagesTab from '@/components/coach/CoachLandingPagesTab';

interface CoachHubProps {
  selectedClientId?: string | null;
  onClearClient?: () => void;
  activeTab?: string;
}

export default function CoachHub({ selectedClientId, onClearClient, activeTab = 'dashboard' }: CoachHubProps) {
  if (activeTab === 'marketing') return <CoachMarketingTab />;
  if (activeTab === 'landing-pages') return <CoachLandingPagesTab />;
  if (activeTab === 'settings') return <CoachSettingsTab />;
  return <CoachDashboardOverview />;
}

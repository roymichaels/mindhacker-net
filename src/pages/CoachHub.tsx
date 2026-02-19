import { useTranslation } from '@/hooks/useTranslation';
import { useSearchParams } from 'react-router-dom';
import { Megaphone, Settings } from 'lucide-react';
import { PillTabNav } from '@/components/aurora-ui/PillTabNav';
import { PageShell } from '@/components/aurora-ui/PageShell';
import CoachMarketingTab from '@/components/coach/CoachMarketingTab';
import CoachSettingsTab from '@/components/coach/CoachSettingsTab';
import ClientProfilePanel from '@/components/coach/ClientProfilePanel';
import { useCoachClients } from '@/hooks/useCoachClients';

const TAB_CONFIG = [
  { value: 'marketing', icon: Megaphone, labelHe: 'שיווק', labelEn: 'Marketing' },
  { value: 'settings', icon: Settings, labelHe: 'הגדרות', labelEn: 'Settings' },
] as const;

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  marketing: CoachMarketingTab,
  settings: CoachSettingsTab,
};

interface CoachHubProps {
  selectedClientId?: string | null;
  onClearClient?: () => void;
}

const CoachHub = ({ selectedClientId, onClearClient }: CoachHubProps) => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: clients } = useCoachClients();

  const currentTab = searchParams.get('tab') || 'marketing';

  const handleTabChange = (value: string) => {
    setSearchParams(value === 'marketing' ? {} : { tab: value }, { replace: true });
  };

  const pillTabs = TAB_CONFIG.map((tab) => ({
    id: tab.value,
    label: isHebrew ? tab.labelHe : tab.labelEn,
    icon: tab.icon,
  }));

  // If a client is selected, show their profile panel
  const selectedClient = selectedClientId
    ? clients?.find((c) => c.id === selectedClientId)
    : null;

  if (selectedClient) {
    return (
      <PageShell>
        <ClientProfilePanel client={selectedClient} onBack={() => onClearClient?.()} />
      </PageShell>
    );
  }

  const ActiveComponent = TAB_COMPONENTS[currentTab] || CoachMarketingTab;

  return (
    <PageShell>
      <div className="space-y-6">
        <PillTabNav
          tabs={pillTabs}
          activeTab={currentTab}
          onTabChange={handleTabChange}
          activeGradient="from-purple-500 to-indigo-600"
        />
        <ActiveComponent />
      </div>
    </PageShell>
  );
};

export default CoachHub;

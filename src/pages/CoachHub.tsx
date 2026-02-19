import { useTranslation } from '@/hooks/useTranslation';
import { PageShell } from '@/components/aurora-ui/PageShell';
import CoachMarketingTab from '@/components/coach/CoachMarketingTab';
import CoachSettingsTab from '@/components/coach/CoachSettingsTab';
import ClientProfilePanel from '@/components/coach/ClientProfilePanel';
import { useCoachClients } from '@/hooks/useCoachClients';

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  marketing: CoachMarketingTab,
  settings: CoachSettingsTab,
};

interface CoachHubProps {
  selectedClientId?: string | null;
  onClearClient?: () => void;
  activeTab?: string;
}

const CoachHub = ({ selectedClientId, onClearClient, activeTab = 'marketing' }: CoachHubProps) => {
  const { data: clients } = useCoachClients();

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

  const ActiveComponent = TAB_COMPONENTS[activeTab] || CoachMarketingTab;

  return (
    <PageShell>
      <ActiveComponent />
    </PageShell>
  );
};

export default CoachHub;

import CoachDashboardOverview from '@/components/coach/CoachDashboardOverview';

interface CoachHubProps {
  selectedClientId?: string | null;
  onClearClient?: () => void;
  activeTab?: string;
}

export default function CoachHub({ selectedClientId, onClearClient, activeTab = 'dashboard' }: CoachHubProps) {
  return <CoachDashboardOverview />;
}

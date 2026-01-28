import { useTranslation } from '@/hooks/useTranslation';
import CompactCourses from './CompactCourses';
import CompactRecordings from './CompactRecordings';
import CompactSessions from './CompactSessions';
import CompactAffiliate from './CompactAffiliate';

const DashboardRightPanel = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-lg px-1">{t('dashboard.yourContent')}</h3>
      
      <CompactCourses />
      <CompactRecordings />
      <CompactSessions />
      <CompactAffiliate />
    </div>
  );
};

export default DashboardRightPanel;

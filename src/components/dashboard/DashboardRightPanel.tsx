import { useTranslation } from '@/hooks/useTranslation';
import CompactCourses from './CompactCourses';
import CompactRecordings from './CompactRecordings';
import CompactSessions from './CompactSessions';

const DashboardRightPanel = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-lg px-1">{t('dashboard.yourContent')}</h3>
      
      <CompactCourses />
      <CompactRecordings />
      <CompactSessions />
    </div>
  );
};

export default DashboardRightPanel;

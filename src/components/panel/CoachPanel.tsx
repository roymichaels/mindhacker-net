import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import CoachSidebar from './CoachSidebar';
import { useTranslation } from '@/hooks/useTranslation';

const CoachPanel = () => {
  const { isRTL } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header variant="admin" />
      <div className="flex">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <CoachSidebar />
        </div>
        {/* Main content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CoachPanel;

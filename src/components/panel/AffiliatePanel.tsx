import { Outlet } from 'react-router-dom';
import AffiliateSidebar from './AffiliateSidebar';
import { useTranslation } from '@/hooks/useTranslation';

const AffiliatePanel = () => {
  const { isRTL } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop sidebar - hidden on mobile, full height */}
      <div className="hidden lg:block">
        <AffiliateSidebar />
      </div>
      {/* Main content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AffiliatePanel;

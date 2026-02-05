import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import { useBusinessJourneys } from "@/hooks/useBusinessJourneys";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessCard } from "@/components/business/BusinessCard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Briefcase, Rocket, Stethoscope, Plus } from "lucide-react";
import { BusinessStatusCard, BusinessToolsGrid } from "@/components/business-hub";
import {
  FinancialsModal,
  MarketingModal,
  OperationsModal,
  StrategyModal,
  BrandingModal,
  GrowthModal,
} from "@/components/business-hub/modals";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";

type BusinessModalType = 'financials' | 'marketing' | 'operations' | 'strategy' | 'branding' | 'growth' | null;

const Business = () => {
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { journeys, isLoading: journeysLoading, deleteJourney } = useBusinessJourneys();
  const { isLoading } = useLaunchpadData();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<BusinessModalType>(null);

  // SEO Configuration
  useSEO({
    title: language === 'he' ? 'עסקים | MindOS' : 'Business | MindOS',
    description: language === 'he' 
      ? 'מרכז הצמיחה העסקית שלך - כלים, אסטרטגיות ותוכניות לטרנספורמציה קריירתית'
      : 'Your business growth hub - tools, strategies and plans for career transformation',
    url: `${window.location.origin}/business`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: language === 'he' ? 'דף הבית' : 'Home', url: window.location.origin },
        { name: language === 'he' ? 'עסקים' : 'Business', url: `${window.location.origin}/business` },
      ]),
    ],
  });

  const handleOpenModal = (modalType: string) => {
    // Handle special cases - hypnosis and 90-day plan are handled in the grid
    if (modalType === 'hypnosis' || modalType === '90-day-plan') {
      return;
    }
    setActiveModal(modalType as BusinessModalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout hideRightPanel>
      <div className="space-y-6 pb-24 pt-9" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Section - Dark HUD style with amber/gold theme */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950 dark:to-gray-900 p-6 shadow-lg border border-amber-200 dark:border-amber-800/50"
        >
          <div className="relative z-10">
            <div className="flex flex-col gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 dark:bg-amber-800/30 rounded-lg backdrop-blur-sm">
                  <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-amber-700 dark:text-amber-400">
                  {t('business.title')}
                </h1>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => navigate('/business/journey')}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 shadow-lg font-bold border border-amber-400/30"
                >
                  <Rocket className="w-4 h-4 me-2" />
                  {language === 'he' ? 'התחל מסע' : 'Start Journey'}
                </Button>
                <Button
                  onClick={() => handleOpenModal('financials')}
                  variant="outline"
                  className="flex-1 border-amber-400 dark:border-amber-600/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                >
                  <Stethoscope className="w-4 h-4 me-2" />
                  {language === 'he' ? 'בדוק סטטוס' : 'Check Status'}
                </Button>
              </div>
            </div>
            <p className="text-amber-600/80 dark:text-amber-200 text-sm md:text-base">
              {t('business.subtitle')}
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 end-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-700/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-24 h-24 bg-amber-500/10 dark:bg-amber-700/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Business Tools Grid - FIRST (Action-oriented) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            {language === 'he' ? 'כלים עסקיים' : 'Business Tools'}
          </h2>
           <BusinessToolsGrid onOpenModal={handleOpenModal} />
        </motion.div>

        {/* My Businesses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {language === 'he' ? 'העסקים שלי' : 'My Businesses'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/business/journey')}
              className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
            >
              <Plus className="h-4 w-4 me-1" />
              {language === 'he' ? 'עסק חדש' : 'New Business'}
            </Button>
          </div>
          
          {journeysLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : journeys.length > 0 ? (
            <div className="space-y-3">
              {journeys.map((journey) => (
                <BusinessCard
                  key={journey.id}
                  journey={journey}
                  onDelete={async (id) => {
                    setDeletingId(id);
                    const success = await deleteJourney(id);
                    if (success) {
                      toast.success(language === 'he' ? 'העסק נמחק בהצלחה' : 'Business deleted successfully');
                    } else {
                      toast.error(language === 'he' ? 'שגיאה במחיקת העסק' : 'Error deleting business');
                    }
                    setDeletingId(null);
                  }}
                  isDeleting={deletingId === journey.id}
                />
              ))}
            </div>
          ) : (
            <Card className="backdrop-blur-xl bg-background/60 border-border/50 border-dashed">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-4">
                  <Briefcase className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-2">
                  {language === 'he' ? 'אין לך עסקים עדיין' : 'No businesses yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'he' 
                    ? 'התחל את המסע העסקי הראשון שלך ובנה את העסק שחלמת עליו'
                    : 'Start your first business journey and build the business you have been dreaming of'
                  }
                </p>
                <Button
                  onClick={() => navigate('/business/journey')}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400"
                >
                  <Rocket className="h-4 w-4 me-2" />
                  {language === 'he' ? 'התחל עכשיו' : 'Start Now'}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Business Status Card - THIRD (Data display) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
           <BusinessStatusCard />
        </motion.div>
      </div>

      {/* Modals */}
      <FinancialsModal 
        isOpen={activeModal === 'financials'} 
         onClose={handleCloseModal}
      />
      <MarketingModal 
        isOpen={activeModal === 'marketing'} 
         onClose={handleCloseModal}
      />
      <OperationsModal 
        isOpen={activeModal === 'operations'} 
         onClose={handleCloseModal}
      />
      <StrategyModal 
        isOpen={activeModal === 'strategy'} 
         onClose={handleCloseModal}
      />
      <BrandingModal 
        isOpen={activeModal === 'branding'} 
         onClose={handleCloseModal}
      />
      <GrowthModal 
        isOpen={activeModal === 'growth'} 
         onClose={handleCloseModal}
      />
    </DashboardLayout>
  );
};

export default Business;

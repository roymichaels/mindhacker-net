import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Heart, Stethoscope, Rocket } from "lucide-react";
import { HealthStatusCard, HealthToolsGrid } from "@/components/health-hub";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";
import {
  PhysicalHealthModal,
  MentalHealthModal,
  EnergeticHealthModal,
  SubconsciousHealthModal,
  SleepModal,
  MeditationModal,
} from "@/components/health-hub/modals";

type HealthModalType = 'physical' | 'mental' | 'energetic' | 'subconscious' | 'sleep' | 'meditation' | 'habits' | 'status' | null;

const Health = () => {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { isLoading } = useLaunchpadData();
  const [activeModal, setActiveModal] = useState<HealthModalType>(null);

  // SEO Configuration
  useSEO({
    title: language === 'he' ? 'בריאות | MindOS' : 'Health | MindOS',
    description: language === 'he' 
      ? 'מרכז הבריאות הכוללת שלך - גוף, נפש, אנרגיה ותודעה'
      : 'Your holistic health center - body, mind, energy and consciousness',
    url: `${window.location.origin}/health`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: language === 'he' ? 'דף הבית' : 'Home', url: window.location.origin },
        { name: language === 'he' ? 'בריאות' : 'Health', url: `${window.location.origin}/health` },
      ]),
    ],
  });

  const handleOpenModal = (modalType: string) => {
    // Handle special cases
    if (modalType === 'hypnosis') {
      navigate('/hypnosis?goal=health');
      return;
    }
    if (modalType === 'habits') {
      navigate('/dashboard?tab=missions&category=health');
      return;
    }
    setActiveModal(modalType as HealthModalType);
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
    <DashboardLayout>
      <div className="space-y-6 pb-24 sm:pt-9" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Section - Red/Primary gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-100 to-red-50 dark:from-red-950 dark:to-gray-900 p-6 shadow-lg border border-red-200 dark:border-red-800/50"
        >
          <div className="relative z-10">
            <div className="flex flex-col gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 dark:bg-red-800/30 rounded-lg backdrop-blur-sm">
                  <Heart className="h-6 w-6 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-red-700 dark:text-red-400">
                  {language === 'he' ? 'בריאות' : 'Health'}
                </h1>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => navigate('/health/journey')}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg font-bold border border-red-400/30"
                >
                  <Rocket className="w-4 h-4 me-2" />
                  {language === 'he' ? 'התחל מסע' : 'Start Journey'}
                </Button>
                <Button
                  onClick={() => handleOpenModal('physical')}
                  variant="outline"
                  className="flex-1 border-red-400 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <Stethoscope className="w-4 h-4 me-2" />
                  {language === 'he' ? 'בדוק סטטוס' : 'Check Status'}
                </Button>
              </div>
            </div>
            <p className="text-red-600/80 dark:text-red-200 text-sm md:text-base">
              {language === 'he' 
                ? 'מרכז הבריאות הכוללת שלך - גוף, נפש, אנרגיה ותודעה'
                : 'Your holistic health center - body, mind, energy and consciousness'}
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 end-0 w-32 h-32 bg-red-500/10 dark:bg-red-700/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-24 h-24 bg-red-500/10 dark:bg-red-700/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Health Tools Grid - FIRST (Action-oriented) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            {language === 'he' ? 'כלי בריאות' : 'Health Tools'}
          </h2>
          <HealthToolsGrid language={language} onOpenModal={handleOpenModal} />
        </motion.div>

        {/* Health Status Card - SECOND (Data display) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HealthStatusCard language={language} />
        </motion.div>
      </div>

      {/* Modals */}
      <PhysicalHealthModal 
        isOpen={activeModal === 'physical'} 
        onClose={handleCloseModal} 
        language={language} 
      />
      <MentalHealthModal 
        isOpen={activeModal === 'mental'} 
        onClose={handleCloseModal} 
        language={language} 
      />
      <EnergeticHealthModal 
        isOpen={activeModal === 'energetic'} 
        onClose={handleCloseModal} 
        language={language} 
      />
      <SubconsciousHealthModal 
        isOpen={activeModal === 'subconscious'} 
        onClose={handleCloseModal} 
        language={language} 
      />
      <SleepModal 
        isOpen={activeModal === 'sleep'} 
        onClose={handleCloseModal} 
        language={language} 
      />
      <MeditationModal 
        isOpen={activeModal === 'meditation'} 
        onClose={handleCloseModal} 
        language={language} 
      />
    </DashboardLayout>
  );
};

export default Health;

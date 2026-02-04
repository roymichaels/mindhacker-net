import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Heart, Stethoscope } from "lucide-react";
import { HealthStatusCard, HealthToolsGrid } from "@/components/health-hub";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";

const Health = () => {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { isLoading } = useLaunchpadData();
  const [activeModal, setActiveModal] = useState<string | null>(null);

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
    setActiveModal(modalType);
    // TODO: Implement modal functionality when needed
    console.log('Opening modal:', modalType);
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
        {/* Header Section - Emerald gradient with white text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-6 shadow-lg border border-emerald-400/30"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {language === 'he' ? 'בריאות' : 'Health'}
                </h1>
              </div>
              
              {/* Check Status Button */}
              <Button
                onClick={() => handleOpenModal('status')}
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 shadow-lg font-bold border border-white/30"
              >
                <Stethoscope className="w-4 h-4 me-2" />
                {language === 'he' ? 'בדוק סטטוס' : 'Check Status'}
              </Button>
            </div>
            <p className="text-emerald-100 text-sm md:text-base">
              {language === 'he' 
                ? 'מרכז הבריאות הכוללת שלך - גוף, נפש, אנרגיה ותודעה'
                : 'Your holistic health center - body, mind, energy and consciousness'}
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Health Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HealthStatusCard language={language} />
        </motion.div>

        {/* Health Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            {language === 'he' ? 'כלי בריאות' : 'Health Tools'}
          </h2>
          <HealthToolsGrid language={language} onOpenModal={handleOpenModal} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Health;

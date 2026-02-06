import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useBusinessJourneys } from "@/hooks/useBusinessJourneys";
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
import { PillarHubLayout, pillarColors } from "@/components/hub-shared";

type BusinessModalType = 'financials' | 'marketing' | 'operations' | 'strategy' | 'branding' | 'growth' | null;

const Business = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { journeys, isLoading: journeysLoading, deleteJourney } = useBusinessJourneys();
  const { isLoading } = useLaunchpadData();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<BusinessModalType>(null);
  const colors = pillarColors.business;

  const handleOpenModal = (modalType: string) => {
    if (modalType === 'hypnosis' || modalType === '90-day-plan') return;
    setActiveModal(modalType as BusinessModalType);
  };

  const handleCloseModal = () => setActiveModal(null);

  return (
    <PillarHubLayout
      colors={colors}
      icon={Briefcase}
      title={{ he: 'עסקים', en: 'Business' }}
      description={{ he: t('business.subtitle'), en: t('business.subtitle') }}
      journeyPath="/business/journey"
      seoPath="/business"
      isLoading={isLoading}
      extraHeaderButtons={
        <Button
          onClick={() => handleOpenModal('financials')}
          variant="outline"
          className={`flex-1 ${colors.outlineBtn}`}
        >
          <Stethoscope className="w-4 h-4 me-2" />
          {language === 'he' ? 'בדוק סטטוס' : 'Check Status'}
        </Button>
      }
    >
      {/* Business Tools Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-lg font-semibold mb-4">
          {language === 'he' ? 'כלים עסקיים' : 'Business Tools'}
        </h2>
        <BusinessToolsGrid onOpenModal={handleOpenModal} />
      </motion.div>

      {/* My Businesses Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
                  : 'Start your first business journey and build the business you have been dreaming of'}
              </p>
              <Button
                onClick={() => navigate('/business/journey')}
                className={colors.primaryBtn}
              >
                <Rocket className="h-4 w-4 me-2" />
                {language === 'he' ? 'התחל עכשיו' : 'Start Now'}
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Business Status Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <BusinessStatusCard />
      </motion.div>

      {/* Modals */}
      <FinancialsModal isOpen={activeModal === 'financials'} onClose={handleCloseModal} />
      <MarketingModal isOpen={activeModal === 'marketing'} onClose={handleCloseModal} />
      <OperationsModal isOpen={activeModal === 'operations'} onClose={handleCloseModal} />
      <StrategyModal isOpen={activeModal === 'strategy'} onClose={handleCloseModal} />
      <BrandingModal isOpen={activeModal === 'branding'} onClose={handleCloseModal} />
      <GrowthModal isOpen={activeModal === 'growth'} onClose={handleCloseModal} />
    </PillarHubLayout>
  );
};

export default Business;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Heart, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthStatusCard, HealthToolsGrid } from "@/components/health-hub";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";
import { PillarHubLayout, pillarColors } from "@/components/hub-shared";
import { motion } from "framer-motion";
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
  const { language } = useTranslation();
  const navigate = useNavigate();
  const { isLoading } = useLaunchpadData();
  const [activeModal, setActiveModal] = useState<HealthModalType>(null);
  const colors = pillarColors.health;

  const handleOpenModal = (modalType: string) => {
    if (modalType === 'hypnosis') { navigate('/hypnosis?goal=health'); return; }
    if (modalType === 'habits') { navigate('/dashboard?tab=missions&category=health'); return; }
    setActiveModal(modalType as HealthModalType);
  };

  const handleCloseModal = () => setActiveModal(null);

  return (
    <PillarHubLayout
      colors={colors}
      icon={Heart}
      title={{ he: 'בריאות', en: 'Health' }}
      description={{ he: 'מרכז הבריאות הכוללת שלך - גוף, נפש, אנרגיה ותודעה', en: 'Your holistic health center - body, mind, energy and consciousness' }}
      journeyPath="/health/journey"
      seoPath="/health"
      isLoading={isLoading}
      extraHeaderButtons={
        <Button
          onClick={() => handleOpenModal('physical')}
          variant="outline"
          className={`flex-1 ${colors.outlineBtn}`}
        >
          <Stethoscope className="w-4 h-4 me-2" />
          {language === 'he' ? 'בדוק סטטוס' : 'Check Status'}
        </Button>
      }
    >
      {/* Health Tools Grid - custom component (unique layout) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-lg font-semibold mb-4">
          {language === 'he' ? 'כלי בריאות' : 'Health Tools'}
        </h2>
        <HealthToolsGrid language={language} onOpenModal={handleOpenModal} />
      </motion.div>

      {/* Health Status Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <HealthStatusCard language={language} />
      </motion.div>

      {/* Modals */}
      <PhysicalHealthModal isOpen={activeModal === 'physical'} onClose={handleCloseModal} language={language} />
      <MentalHealthModal isOpen={activeModal === 'mental'} onClose={handleCloseModal} language={language} />
      <EnergeticHealthModal isOpen={activeModal === 'energetic'} onClose={handleCloseModal} language={language} />
      <SubconsciousHealthModal isOpen={activeModal === 'subconscious'} onClose={handleCloseModal} language={language} />
      <SleepModal isOpen={activeModal === 'sleep'} onClose={handleCloseModal} language={language} />
      <MeditationModal isOpen={activeModal === 'meditation'} onClose={handleCloseModal} language={language} />
    </PillarHubLayout>
  );
};

export default Health;

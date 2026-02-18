import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";
import { PillarHubLayout, pillarColors } from "@/components/hub-shared";
import { BusinessToolsGrid } from "@/components/business-hub";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Briefcase, Clock } from "lucide-react";

const Business = () => {
  const { t, language } = useTranslation();
  const { isLoading } = useLaunchpadData();

  const colors = {
    ...pillarColors.business,
    // Override to gray
    headerGradient: 'from-muted/80 to-muted/40 dark:from-gray-800/80 dark:to-gray-900/40',
    headerBorder: 'border-border/50',
    iconBg: 'bg-muted-foreground/10',
    iconColor: 'text-muted-foreground',
    iconFill: '',
    titleColor: 'text-muted-foreground',
    descColor: 'text-muted-foreground/70',
    primaryBtn: 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none',
    outlineBtn: 'border-border text-muted-foreground cursor-not-allowed pointer-events-none',
    circle1: 'bg-muted-foreground/5',
    circle2: 'bg-muted-foreground/5',
  };

  return (
    <PillarHubLayout
      colors={colors}
      icon={Briefcase}
      title={{ he: 'עסקים', en: 'Business' }}
      description={{ he: t('business.subtitle'), en: t('business.subtitle') }}
      journeyPath="/business/journey"
      onJourneyClick={() => true}
      seoPath="/business"
      isLoading={isLoading}
    >
      {/* Coming Soon Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-muted/50 border-border/50 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted-foreground/10 mb-4">
              <Clock className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground mb-2">
              {language === 'he' ? 'בקרוב...' : 'Coming Soon...'}
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
              {language === 'he'
                ? 'אנחנו עובדים קשה כדי להביא לך את הכלים העסקיים הטובים ביותר. הישארו מעודכנים!'
                : 'We\'re working hard to bring you the best business tools. Stay tuned!'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grayed-out Business Tools Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
          {language === 'he' ? 'כלים עסקיים' : 'Business Tools'}
        </h2>
        <div className="opacity-40 grayscale pointer-events-none select-none">
          <BusinessToolsGrid onOpenModal={() => {}} />
        </div>
      </motion.div>
    </PillarHubLayout>
  );
};

export default Business;

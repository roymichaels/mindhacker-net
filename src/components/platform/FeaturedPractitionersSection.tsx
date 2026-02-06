import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { usePractitionersModal } from "@/contexts/PractitionersModalContext";
import { usePractitioners } from "@/hooks/usePractitioners";
import { FeaturedPractitioners } from "../practitioners";
import { motion } from "framer-motion";

const FeaturedPractitionersSection = () => {
  const { t, isRTL } = useTranslation();
  const { data: practitioners, isLoading } = usePractitioners({ featured: true });
  const { openPractitioners } = usePractitionersModal();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Don't show section if no featured practitioners
  if (!isLoading && (!practitioners || practitioners.length === 0)) {
    return null;
  }

  return (
    <section 
      className="py-16 sm:py-24 px-4 bg-muted/30"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-6">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-sm text-secondary font-medium">{t('platform.expertCoaches')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('platform.featuredPractitionersTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('platform.featuredPractitionersSubtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FeaturedPractitioners />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Button 
            variant="outline"
            size="lg" 
            className="font-bold"
            onClick={() => openPractitioners()}
          >
            {t('platform.viewAllPractitioners')}
            <ArrowIcon className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedPractitionersSection;

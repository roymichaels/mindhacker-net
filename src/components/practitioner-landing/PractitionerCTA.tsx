import { Calendar, MessageCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { PractitionerWithDetails } from "@/hooks/usePractitioners";
import { motion } from "framer-motion";

interface PractitionerCTAProps {
  practitioner: PractitionerWithDetails;
}

const PractitionerCTA = ({ practitioner }: PractitionerCTAProps) => {
  const { t, isRTL, language } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const displayName = language === 'en' && practitioner.display_name_en 
    ? practitioner.display_name_en 
    : practitioner.display_name;

  // At least one contact method required
  if (!practitioner.calendly_url && !practitioner.whatsapp) return null;

  return (
    <section 
      className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('practitionerLanding.ctaTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {t('practitionerLanding.ctaSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {practitioner.calendly_url && (
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 font-bold"
                asChild
              >
                <a href={practitioner.calendly_url} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-5 w-5 me-2" />
                  {t('practitionerLanding.bookNow')}
                  <ArrowIcon className="h-5 w-5 ms-2" />
                </a>
              </Button>
            )}

            {practitioner.whatsapp && (
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 font-bold"
                asChild
              >
                <a href={`https://wa.me/${practitioner.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 me-2" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            {t('practitionerLanding.freeConsultation')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PractitionerCTA;

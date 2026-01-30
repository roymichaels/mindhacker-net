import { useTranslation } from "@/hooks/useTranslation";
import { PractitionerWithDetails } from "@/hooks/usePractitioners";
import { motion } from "framer-motion";

interface PractitionerAboutProps {
  practitioner: PractitionerWithDetails;
}

const PractitionerAbout = ({ practitioner }: PractitionerAboutProps) => {
  const { t, isRTL, language } = useTranslation();

  const bio = language === 'en' && practitioner.bio_en 
    ? practitioner.bio_en 
    : practitioner.bio;

  if (!bio) return null;

  return (
    <section 
      className="py-16 px-4 bg-muted/30"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            {t('practitionerLanding.aboutTitle')}
          </h2>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Video if exists */}
            {practitioner.intro_video_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="aspect-video rounded-2xl overflow-hidden bg-muted shadow-lg">
                  <iframe
                    src={practitioner.intro_video_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}

            {/* Bio text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={practitioner.intro_video_url ? 'lg:col-span-2' : 'lg:col-span-3'}
            >
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
                <p className="text-lg leading-relaxed whitespace-pre-line text-muted-foreground">
                  {bio}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PractitionerAbout;

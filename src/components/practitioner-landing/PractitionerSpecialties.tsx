import { CheckCircle, Award } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { PractitionerWithDetails } from "@/hooks/usePractitioners";
import { motion } from "framer-motion";

interface PractitionerSpecialtiesProps {
  practitioner: PractitionerWithDetails;
}

const PractitionerSpecialties = ({ practitioner }: PractitionerSpecialtiesProps) => {
  const { t, isRTL, language } = useTranslation();

  if (!practitioner.specialties || practitioner.specialties.length === 0) return null;

  return (
    <section 
      className="py-16 px-4 bg-background"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {t('practitionerLanding.specialtiesTitle')}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {practitioner.specialties.map((specialty, index) => (
            <motion.div
              key={specialty.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    {language === 'en' && specialty.specialty_label_en 
                      ? specialty.specialty_label_en 
                      : specialty.specialty_label}
                  </h3>
                  {specialty.years_experience > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {specialty.years_experience} {t('practitionerLanding.yearsExp')}
                    </p>
                  )}
                  {specialty.certification_name && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                      <Award className="w-3 h-3" />
                      {specialty.certification_name}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PractitionerSpecialties;

import { Clock, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { PractitionerWithDetails } from "@/hooks/usePractitioners";
import { formatCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

interface PractitionerServicesProps {
  practitioner: PractitionerWithDetails;
}

const PractitionerServices = ({ practitioner }: PractitionerServicesProps) => {
  const { t, isRTL, language } = useTranslation();

  if (!practitioner.services || practitioner.services.length === 0) return null;

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'session': return Clock;
      case 'package': return Package;
      default: return ShoppingBag;
    }
  };

  const getServiceBadge = (type: string) => {
    switch (type) {
      case 'session': return t('practitionerLanding.singleSession');
      case 'package': return t('practitionerLanding.package');
      default: return t('practitioners.product');
    }
  };

  return (
    <section 
      className="py-16 px-4 bg-muted/30"
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
            {t('practitionerLanding.servicesTitle')}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {practitioner.services.map((service, index) => {
            const Icon = getServiceIcon(service.service_type);
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary">
                      {getServiceBadge(service.service_type)}
                    </Badge>
                  </div>
                  <div className="text-end">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(service.price, service.price_currency)}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">
                  {language === 'en' && service.title_en ? service.title_en : service.title}
                </h3>
                
                <p className="text-muted-foreground mb-4">
                  {language === 'en' && service.description_en 
                    ? service.description_en 
                    : service.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {service.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {service.duration_minutes} {t('practitionerLanding.minutes')}
                      </span>
                    )}
                    {service.sessions_count && (
                      <span>
                        {service.sessions_count} {t('practitioners.sessions')}
                      </span>
                    )}
                  </div>

                  {practitioner.calendly_url && (
                    <Button size="sm" asChild>
                      <a href={practitioner.calendly_url} target="_blank" rel="noopener noreferrer">
                        {t('practitionerLanding.bookNow')}
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PractitionerServices;

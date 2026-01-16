import PricingCards from "./PricingCards";
import PersonalQuote from "./PersonalQuote";
import { useTranslation } from "@/hooks/useTranslation";
import { useHomepageSection } from "@/hooks/useHomepageSection";

const BookingSection = () => {
  const { t } = useTranslation();
  const { title, subtitle, isVisible } = useHomepageSection("booking");

  if (!isVisible) return null;

  return (
    <section id="pricing" className="relative py-16 md:py-32 px-4 bg-background" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-6 md:p-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 text-center cyber-glow">
            {title || t('booking.sectionTitle')}
          </h2>

          <p className="text-center text-base md:text-xl text-muted-foreground mb-2">
            {subtitle || t('booking.selectPackage')}
          </p>

          {/* Personal Quote */}
          <PersonalQuote 
            settingKey="pricing_personal_quote" 
            defaultQuote={t('booking.personalQuote')}
            className="mb-6"
          />

          <PricingCards />

          <div className="text-center mt-8 space-y-2">
            <p className="text-lg font-semibold cyber-glow">
              {t('booking.selectiveTitle')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('booking.noDirectPurchase')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;

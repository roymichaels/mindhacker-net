import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Phone, MessageCircle } from "lucide-react";

interface DynamicCTAProps {
  brand_color?: string;
  cta_type?: string | null;
  cta_text_he?: string | null;
  cta_text_en?: string | null;
  cta_link?: string | null;
  section_title_he?: string;
  section_title_en?: string;
  section_subtitle_he?: string;
  section_subtitle_en?: string;
  onCtaClick?: () => void;
}

export const DynamicCTA = ({
  brand_color = '#8B5CF6',
  cta_type = 'link',
  cta_text_he = 'התחל עכשיו',
  cta_text_en = 'Get Started',
  cta_link,
  section_title_he = 'מוכן להתחיל?',
  section_title_en = 'Ready to start?',
  section_subtitle_he,
  section_subtitle_en,
  onCtaClick,
}: DynamicCTAProps) => {
  const { language, isRTL } = useLanguage();
  
  const sectionTitle = language === 'he' ? section_title_he : section_title_en;
  const sectionSubtitle = language === 'he' ? section_subtitle_he : section_subtitle_en;
  const ctaText = language === 'he' ? cta_text_he : cta_text_en;

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else if (cta_link) {
      if (cta_type === 'whatsapp') {
        window.open(`https://wa.me/${cta_link}`, '_blank');
      } else {
        window.location.href = cta_link;
      }
    }
  };

  const getIcon = () => {
    switch (cta_type) {
      case 'contact':
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />;
    }
  };

  return (
    <section 
      className="py-20 relative overflow-hidden" 
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        background: `linear-gradient(135deg, ${brand_color}10 0%, ${brand_color}05 100%)`
      }}
    >
      {/* Decorative elements */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: brand_color }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: brand_color }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {sectionTitle}
          </h2>
          
          {sectionSubtitle && (
            <p className="text-xl text-muted-foreground mb-8">
              {sectionSubtitle}
            </p>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              className="text-lg px-10 py-7 rounded-full gap-2 shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: brand_color }}
              onClick={handleCta}
            >
              {ctaText}
              {getIcon()}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";

interface DynamicHeroProps {
  heading_he?: string | null;
  heading_en?: string | null;
  subheading_he?: string | null;
  subheading_en?: string | null;
  badge_text_he?: string | null;
  badge_text_en?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  brand_color?: string | null;
  cta_text_he?: string | null;
  cta_text_en?: string | null;
  cta_link?: string | null;
  cta_type?: string | null;
  onCtaClick?: () => void;
}

export const DynamicHero = ({
  heading_he,
  heading_en,
  subheading_he,
  subheading_en,
  badge_text_he,
  badge_text_en,
  image_url,
  video_url,
  brand_color = '#8B5CF6',
  cta_text_he,
  cta_text_en,
  cta_link,
  cta_type,
  onCtaClick,
}: DynamicHeroProps) => {
  const { language, isRTL } = useLanguage();
  
  const heading = language === 'he' ? heading_he : heading_en;
  const subheading = language === 'he' ? subheading_he : subheading_en;
  const badgeText = language === 'he' ? badge_text_he : badge_text_en;
  const ctaText = language === 'he' ? cta_text_he : cta_text_en;

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else if (cta_link) {
      window.location.href = cta_link;
    }
  };

  return (
    <section 
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background */}
      {video_url ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src={video_url} type="video/mp4" />
        </video>
      ) : image_url ? (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${image_url})` }}
        />
      ) : null}
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${brand_color}10 0%, transparent 50%, ${brand_color}05 100%)`
        }}
      />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {badgeText && (
            <Badge 
              className="mb-6 text-sm px-4 py-2"
              style={{ backgroundColor: brand_color, color: 'white' }}
            >
              {badgeText}
            </Badge>
          )}

          {heading && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              {heading}
            </h1>
          )}

          {subheading && (
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {subheading}
            </p>
          )}

          {ctaText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full"
                style={{ backgroundColor: brand_color }}
                onClick={handleCta}
              >
                {cta_type === 'whatsapp' && <Play className="w-5 h-5 mr-2" />}
                {ctaText}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ArrowDown className="w-6 h-6 animate-bounce text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  );
};

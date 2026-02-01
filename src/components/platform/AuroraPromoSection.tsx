import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Brain, 
  Target, 
  Headphones,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CSSOrb } from "../orb/CSSOrb";
import { motion } from "framer-motion";

const AuroraPromoSection = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const features = [
    {
      icon: Clock,
      title: t('home.auroraFeature1'),
    },
    {
      icon: Brain,
      title: t('home.auroraFeature2'),
    },
    {
      icon: Target,
      title: t('home.auroraFeature3'),
    },
    {
      icon: Headphones,
      title: t('home.auroraFeature4'),
    },
  ];

  return (
    <section 
      className="py-16 sm:py-24 px-4 bg-gradient-to-b from-background to-muted/30"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={isRTL ? 'lg:order-2' : ''}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">{t('home.aiPowered')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {t('home.auroraTitle')}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              {t('home.auroraDesc')}
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{feature.title}</span>
                </motion.div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              onClick={() => navigate('/launchpad')}
            >
              {t('home.startWithAurora')}
              <ArrowIcon className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
            </Button>
          </motion.div>

          {/* Orb Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`flex justify-center ${isRTL ? 'lg:order-1' : ''}`}
          >
            <div className="relative">
              {/* Glow effect behind orb */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
              
              <CSSOrb 
                size={280} 
                state="speaking" 
                egoState="guardian" 
                className="relative z-10"
              />

              {/* Floating labels */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg"
              >
                <span className="text-sm font-medium">24/7 {t('home.available')}</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg"
              >
                <span className="text-sm font-medium">{t('home.personalizedAI')}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuroraPromoSection;

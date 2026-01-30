import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CSSOrb } from "@/components/orb/CSSOrb";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const NewHeroSection = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  
  const animations = [
    t('home.heroAnimation1'),
    t('home.heroAnimation2'),
    t('home.heroAnimation3'),
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(animations[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % animations.length);
        setDisplayText(animations[(currentIndex + 1) % animations.length]);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, animations]);

  return (
    <section 
      className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden bg-gradient-to-b from-background via-background to-muted/30"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          {/* Aurora Orb */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
            <CSSOrb 
              size={200} 
              state="speaking" 
              egoState="guardian" 
              className="relative z-10"
            />
          </motion.div>

          {/* Main title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            {t('home.heroTitle')}
          </h1>

          {/* Animated subtitle */}
          <div className="h-12 flex items-center justify-center mb-6">
            <span 
              className={`text-2xl sm:text-3xl md:text-4xl font-bold text-primary transition-all duration-300 ${
                isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
              }`}
            >
              {displayText}
            </span>
          </div>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8">
            {t('home.heroSubtitle')}
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 h-auto"
              onClick={() => navigate('/launchpad')}
            >
              <Rocket className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('home.heroCta')}
              <ArrowIcon className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
            </Button>
          </motion.div>

          {/* Meta info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-sm text-muted-foreground mt-6"
          >
            ⏱️ {t('home.heroMeta')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewHeroSection;

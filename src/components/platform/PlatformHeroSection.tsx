import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DecryptText from "../DecryptText";
import TrustBadges from "../TrustBadges";
import { ArrowLeft, ArrowRight, Sparkles, Users, Bot, Gift } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CSSOrb } from "../orb/CSSOrb";
import { motion } from "framer-motion";

const PlatformHeroSection = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  
  const wordsHe = ["התפתחות", "שינוי", "חופש", "עוצמה", "תודעה"];
  const wordsEn = ["Growth", "Change", "Freedom", "Power", "Consciousness"];
  const words = isRTL ? wordsHe : wordsEn;
  
  const [currentWord, setCurrentWord] = useState(0);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [words.length]);

  const cards = [
    {
      id: 'aurora',
      icon: Bot,
      title: t('platform.auroraCardTitle'),
      description: t('platform.auroraCardDesc'),
      cta: t('platform.auroraCardCta'),
      badge: t('platform.aiCoach'),
      onClick: () => navigate('/aurora'),
      gradient: 'from-primary/20 to-primary/5',
      borderColor: 'border-primary/40 hover:border-primary/70',
      iconBg: 'bg-primary/20 border-primary',
      iconColor: 'text-primary',
      buttonClass: 'bg-primary hover:bg-primary/90',
    },
    {
      id: 'practitioners',
      icon: Users,
      title: t('platform.findCoachCardTitle'),
      description: t('platform.findCoachCardDesc'),
      cta: t('platform.findCoachCardCta'),
      badge: t('platform.humanCoach'),
      onClick: () => navigate('/practitioners'),
      gradient: 'from-secondary/20 to-secondary/5',
      borderColor: 'border-secondary/40 hover:border-secondary/70',
      iconBg: 'bg-secondary/20 border-secondary',
      iconColor: 'text-secondary',
      buttonClass: 'bg-secondary hover:bg-secondary/90',
    },
    {
      id: 'free',
      icon: Gift,
      title: t('platform.freeCardTitle'),
      description: t('platform.freeCardDesc'),
      cta: t('platform.freeCardCta'),
      badge: t('platform.freeGift'),
      onClick: () => navigate('/launchpad'),
      gradient: 'from-accent/20 to-accent/5',
      borderColor: 'border-accent/40 hover:border-accent/70',
      iconBg: 'bg-accent/20 border-accent',
      iconColor: 'text-accent',
      buttonClass: 'bg-accent hover:bg-accent/90 text-accent-foreground',
    },
  ];

  return (
    <section 
      className="relative min-h-screen flex items-start justify-center px-3 sm:px-4 pt-8 sm:pt-12 md:pt-20 pb-16 sm:pb-20 md:pb-24 bg-background overflow-hidden" 
      style={{ zIndex: 2 }} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background effects */}
      <div 
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background: "radial-gradient(circle at center, hsl(var(--primary) / 0.03) 0%, transparent 70%)"
        }}
      />

      {/* Floating orb decoration */}
      <div className="absolute top-20 left-10 opacity-20 hidden lg:block">
        <CSSOrb size={100} state="idle" egoState="guardian" />
      </div>
      <div className="absolute bottom-40 right-10 opacity-20 hidden lg:block">
        <CSSOrb size={80} state="idle" egoState="explorer" />
      </div>

      <div className="relative text-center max-w-6xl mx-auto">
        {/* Small orb as logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="mx-auto">
            <CSSOrb size={120} state="idle" egoState="guardian" />
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight"
        >
          <span className="text-foreground">{t('platform.heroTitlePart1')}</span>
          <br className="hidden sm:block" />
          <DecryptText 
            text={words[currentWord]} 
            className="text-primary"
          />
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-2 sm:mb-4 font-medium px-2"
        >
          {t('platform.heroSubtitle')}
        </motion.p>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-sm sm:text-base md:text-lg text-secondary mb-8 sm:mb-12 font-light px-2"
        >
          {t('platform.heroTagline')}
        </motion.p>

        {/* Three Options Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto mb-10"
        >
          {cards.map((card, index) => (
            <Card 
              key={card.id}
              className={`group relative bg-gradient-to-br ${card.gradient} backdrop-blur border ${card.borderColor} p-5 md:p-6 transition-all duration-500 hover:shadow-xl cursor-pointer overflow-hidden`}
              onClick={card.onClick}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full ${card.iconBg} border-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>
                </div>
                
                <div className={`inline-flex items-center gap-2 ${card.iconBg.replace('border', 'bg').replace('/20', '/15')} rounded-full px-3 py-1 mb-3`}>
                  <Sparkles className={`w-3 h-3 ${card.iconColor}`} />
                  <span className={`text-xs ${card.iconColor} font-medium`}>{card.badge}</span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold mb-2">{card.title}</h3>
                
                <p className="text-muted-foreground mb-4 text-sm min-h-[40px]">
                  {card.description}
                </p>
                
                <Button className={`w-full ${card.buttonClass} font-bold transition-all`}>
                  {card.cta}
                  <ArrowIcon className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <TrustBadges />
        </motion.div>
      </div>
    </section>
  );
};

export default PlatformHeroSection;

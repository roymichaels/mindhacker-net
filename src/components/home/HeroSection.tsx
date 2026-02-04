/**
 * HeroSection - Clean, conversion-focused hero
 * Minimalist design driving signups
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const [orbState, setOrbState] = useState<'idle' | 'speaking' | 'thinking'>('idle');
  
  // Orb animation cycle
  useEffect(() => {
    const states: Array<'idle' | 'speaking' | 'thinking'> = ['idle', 'speaking', 'thinking'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      setOrbState(states[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const benefits = isRTL ? [
    'מאמן AI אישי 24/7',
    'תוכנית התפתחות מותאמת',
    'היפנוזה מותאמת אישית',
  ] : [
    'Personal AI Coach 24/7',
    'Custom Growth Plan',
    'Personalized Hypnosis',
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Theme-aware gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)/0.5) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)/0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-8">
          
          {/* 3D Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
            </div>
            <PersonalizedOrb 
              size={140}
              state={orbState}
              className="mx-auto relative z-10"
            />
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              <span className="block text-foreground">
                {isRTL ? 'המערכת שתשנה' : 'The System That'}
              </span>
              <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                {isRTL ? 'את החיים שלך' : 'Changes Your Life'}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isRTL 
                ? 'AI אישי, היפנוזה מותאמת, ומערכת גיימיפיקציה שמהפכת את ההתפתחות האישית שלך'
                : 'Personal AI, custom hypnosis, and gamification that transforms your personal development'
              }
            </p>
          </motion.div>

          {/* Benefits list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {benefits.map((benefit, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
              >
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="group text-lg px-10 py-7 rounded-2xl 
                bg-gradient-to-r from-primary via-primary to-[hsl(var(--primary-glow))]
                hover:opacity-90
                text-primary-foreground font-bold
                shadow-lg shadow-primary/25
                transition-all duration-300 hover:scale-105"
            >
              <Sparkles className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'התחל עכשיו - חינם' : 'Start Now - Free'}
              <ArrowRight className={cn("h-5 w-5 transition-transform group-hover:translate-x-1", isRTL ? "mr-2 rotate-180 group-hover:-translate-x-1" : "ml-2")} />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/free-journey')}
              className="text-lg px-8 py-6 rounded-2xl border-2 group"
            >
              <Play className={cn("h-5 w-5 fill-current", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'גלה את עצמך' : 'Discover Yourself'}
            </Button>
          </motion.div>

          {/* Trust signal */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-sm text-muted-foreground"
          >
            {isRTL ? '✨ ללא כרטיס אשראי • 5 דקות להתחיל' : '✨ No credit card • 5 minutes to start'}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

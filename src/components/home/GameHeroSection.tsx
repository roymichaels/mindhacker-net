import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { PersonalizedOrb } from '@/components/orb';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function GameHeroSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orbState, setOrbState] = useState<'idle' | 'speaking' | 'thinking'>('idle');

  // Cycle through orb states for visual interest
  useEffect(() => {
    const states: Array<'idle' | 'speaking' | 'thinking'> = ['idle', 'speaking', 'thinking'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      setOrbState(states[index]);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {isRTL ? 'חוויית טרנספורמציה ייחודית' : 'Unique Transformation Experience'}
            </span>
          </motion.div>

          {/* 3D Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mx-auto"
          >
            <PersonalizedOrb 
              size={180}
              state={orbState}
              showGlow={true}
              className="mx-auto"
              disablePersonalization={!user}
            />
          </motion.div>

          {/* Main Title - Larger and more impactful */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight"
          >
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent drop-shadow-sm">
              {t('home.heroTitle')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {t('home.heroSubtitle')}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="group text-lg px-8 py-6 rounded-2xl 
                bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600
                hover:from-cyan-300 hover:via-cyan-400 hover:to-cyan-500
                text-cyan-950 font-bold
                shadow-[0_0_25px_rgba(34,211,238,0.5),0_8px_20px_rgba(0,0,0,0.2)]
                hover:shadow-[0_0_35px_rgba(34,211,238,0.7),0_12px_30px_rgba(0,0,0,0.3)]
                border-2 border-cyan-200/40
                transition-all duration-300 hover:scale-105
                animate-pulse-glow"
            >
              <Rocket className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} group-hover:animate-bounce`} />
              {t('home.heroCta')}
            </Button>
            
            <p className="text-sm text-muted-foreground">
              {t('home.heroMeta')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

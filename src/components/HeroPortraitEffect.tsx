import { memo, useMemo } from "react";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { Sparkle } from "lucide-react";

interface HeroPortraitEffectProps {
  portraitUrl: string;
  alt: string;
}

const HeroPortraitEffect = ({ portraitUrl, alt }: HeroPortraitEffectProps) => {
  const { theme } = useThemeSettings();
  
  const effect = theme.hero_portrait_effect || 'cyber_glow';
  const glowColor = theme.hero_portrait_glow_color || '';
  const speed = theme.hero_portrait_animation_speed || 'normal';
  
  // Calculate animation duration based on speed
  const animationDuration = useMemo(() => {
    switch (speed) {
      case 'slow': return { float: '6s', ring: '4s', sparkle: '3s', breathe: '12s' };
      case 'fast': return { float: '2.5s', ring: '1.5s', sparkle: '1.2s', breathe: '6s' };
      default: return { float: '4s', ring: '2.5s', sparkle: '2s', breathe: '8s' };
    }
  }, [speed]);
  
  // No effect
  if (effect === 'none') {
    return (
      <div className="relative mx-auto mb-4 sm:mb-6 md:mb-8 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 mx-auto">
          <img 
            src={portraitUrl} 
            alt={alt}
            className="relative w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
    );
  }
  
  // Consciousness Aura Effect - calm, breathing, turquoise glow
  if (effect === 'consciousness_aura') {
    return (
      <div className="relative mx-auto mb-4 sm:mb-6 md:mb-8 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div 
          className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 mx-auto"
          style={{ animation: `float-gentle ${animationDuration.float} ease-in-out infinite` }}
        >
          {/* Deep aura layers - breathing effect */}
          <div 
            className="absolute -inset-8 sm:-inset-10 md:-inset-12 rounded-full opacity-20"
            style={{ 
              background: `radial-gradient(circle, ${glowColor || 'hsl(var(--primary) / 0.6)'} 0%, transparent 70%)`,
              animation: `breathe ${animationDuration.breathe} ease-in-out infinite`
            }}
          />
          <div 
            className="absolute -inset-4 sm:-inset-6 md:-inset-8 rounded-full opacity-30"
            style={{ 
              background: `radial-gradient(circle, ${glowColor || 'hsl(var(--primary) / 0.7)'} 0%, transparent 70%)`,
              animation: `breathe ${animationDuration.breathe} ease-in-out infinite`,
              animationDelay: '1s'
            }}
          />
          
          {/* Soft inner glow */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${glowColor || 'hsl(var(--primary) / 0.4)'} 0%, transparent 60%)`,
              filter: 'blur(12px)',
              transform: 'scale(1.3)'
            }}
          />
          
          {/* Image */}
          <img 
            src={portraitUrl} 
            alt={alt}
            className="relative w-full h-full object-cover rounded-full"
            style={{
              maskImage: 'radial-gradient(circle, black 55%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 100%)',
            }}
          />
          
          {/* Soft breathing ring - using theme primary */}
          <div 
            className="absolute inset-0 rounded-full border border-primary/40 pointer-events-none"
            style={{ animation: `breathe ${animationDuration.breathe} ease-in-out infinite` }}
          />
          <div 
            className="absolute -inset-3 sm:-inset-4 rounded-full border border-primary/20 pointer-events-none"
            style={{ animation: `breathe ${animationDuration.breathe} ease-in-out infinite`, animationDelay: '2s' }}
          />
          
          {/* Floating consciousness symbols - using theme primary */}
          <span 
            className="absolute -top-4 -right-2 text-primary/60 text-lg sm:text-xl"
            style={{ animation: `sparkle ${animationDuration.sparkle} ease-in-out infinite` }}
          >∞</span>
          <span 
            className="absolute top-1/3 -left-5 text-primary/50 text-sm sm:text-base"
            style={{ animation: `sparkle ${animationDuration.sparkle} ease-in-out infinite`, animationDelay: '0.5s' }}
          >◌</span>
          <span 
            className="absolute -bottom-3 right-1/4 text-primary/50 text-sm"
            style={{ animation: `sparkle ${animationDuration.sparkle} ease-in-out infinite`, animationDelay: '1s' }}
          >∴</span>
          <span 
            className="absolute bottom-1/3 -right-4 text-primary/40 text-xs sm:text-sm"
            style={{ animation: `sparkle ${animationDuration.sparkle} ease-in-out infinite`, animationDelay: '1.5s' }}
          >○</span>
        </div>
      </div>
    );
  }
  
  // Cyber Glow Effect (default) - vibrant, sparkles, pulsing rings
  // In light mode, we simplify the effect significantly
  return (
    <div className="relative mx-auto mb-4 sm:mb-6 md:mb-8 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <div 
        className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 mx-auto"
        style={{ animation: `float-gentle ${animationDuration.float} ease-in-out infinite` }}
      >
        {/* Glow effect behind image - hidden in light mode */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl scale-150 hidden dark:block"
          style={{ 
            background: glowColor 
              ? `radial-gradient(circle, ${glowColor}80 0%, ${glowColor}60 30%, ${glowColor}00 70%)`
              : 'linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.4), hsl(var(--primary) / 0.3))'
          }}
        />

        {/* Light mode shadow */}
        <div className="absolute inset-0 rounded-full shadow-xl dark:shadow-none" />
        
        {/* Image with mask for seamless blend */}
        <img 
          src={portraitUrl} 
          alt={alt}
          className="relative w-full h-full object-cover rounded-full border-2 border-border dark:border-transparent shadow-lg dark:shadow-none"
          style={{
            maskImage: 'radial-gradient(circle, black 50%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 100%)',
          }}
        />
        
        {/* Pulsing glow rings - dark mode only */}
        <div 
          className="absolute inset-0 rounded-full border-2 sm:border-3 border-primary/30 dark:border-primary/60 pointer-events-none hidden dark:block"
          style={{ 
            animation: `ring-pulse ${animationDuration.ring} ease-in-out infinite`,
            borderColor: glowColor || undefined
          }}
        />
        <div 
          className="absolute -inset-2 sm:-inset-3 rounded-full border border-primary/20 dark:border-primary/30 pointer-events-none hidden dark:block"
          style={{ 
            animation: `ring-pulse ${animationDuration.ring} ease-in-out infinite`,
            animationDelay: '0.5s',
            borderColor: glowColor ? `${glowColor}50` : undefined
          }}
        />
        
        {/* Sparkle effects - dark mode only */}
        <Sparkle 
          className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-4 h-4 sm:w-5 sm:h-5 text-primary hidden dark:block"
          style={{ animation: `sparkle ${animationDuration.sparkle} ease-in-out infinite`, color: glowColor || undefined }}
        />
        <Sparkle 
          className="absolute top-1/4 -left-3 sm:-left-4 w-3 h-3 sm:w-4 sm:h-4 text-accent hidden dark:block"
          style={{ animation: `sparkle ${animationDuration.sparkle} ease-in-out infinite`, animationDelay: '0.3s' }}
        />
        <Sparkle 
          className="absolute -bottom-2 right-1/4 w-3 h-3 sm:w-4 sm:h-4 text-primary hidden dark:block"
          style={{ animation: `sparkle ${animationDuration.sparkle} ease-in-out infinite`, animationDelay: '0.6s', color: glowColor || undefined }}
        />
        <Sparkle 
          className="absolute top-0 left-1/3 w-2 h-2 sm:w-3 sm:h-3 text-secondary hidden dark:block"
          style={{ animation: `sparkle ${animationDuration.sparkle} ease-in-out infinite`, animationDelay: '0.9s' }}
        />
        <Sparkle 
          className="absolute bottom-1/4 -right-3 sm:-right-4 w-3 h-3 sm:w-4 sm:h-4 text-accent hidden dark:block"
          style={{ animation: `sparkle ${animationDuration.sparkle} ease-in-out infinite`, animationDelay: '1.2s' }}
        />
      </div>
    </div>
  );
};

export default memo(HeroPortraitEffect);

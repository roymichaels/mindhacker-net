/**
 * OrbHeroSection - Displays the personalized orb prominently at the top of the dashboard
 * with identity title and archetype information.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { PersonalizedOrb } from '@/components/orb';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';

interface OrbHeroSectionProps {
  identityTitle?: { title: string; icon: string } | null;
  egoState?: { 
    id: string;
    name: string; 
    nameHe: string;
    icon?: string;
  } | null;
  className?: string;
  compact?: boolean;
}

export function OrbHeroSection({ 
  identityTitle, 
  egoState,
  className,
  compact = false,
}: OrbHeroSectionProps) {
  const { language } = useTranslation();
  const { profile, isPersonalized } = useOrbProfile();
  
  const orbSize = compact ? 120 : 160;
  
  return (
    <motion.div 
      className={cn(
        "relative flex flex-col items-center py-4",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow Background - uses orb's primary color */}
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${profile.primaryColor}15 0%, transparent 60%)`,
        }}
      />
      
      {/* Animated ring effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-20"
        style={{
          background: `conic-gradient(from 0deg, ${profile.primaryColor}00, ${profile.primaryColor}40, ${profile.primaryColor}00)`,
          animation: 'spin 8s linear infinite',
        }}
      />
      
      {/* Orb Container */}
      <div className="relative z-10">
        <PersonalizedOrb
          size={orbSize}
          showGlow={true}
          showLoadingSkeleton={true}
          className="transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Identity Title */}
      {identityTitle && (
        <motion.div 
          className="mt-3 text-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-2xl">{identityTitle.icon}</span>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {identityTitle.title}
          </h2>
        </motion.div>
      )}
      
      {/* Ego State Badge */}
      {egoState && !identityTitle && (
        <motion.div 
          className="mt-3 text-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {egoState.icon && <span className="text-xl">{egoState.icon}</span>}
          <p className="text-sm font-medium text-muted-foreground">
            {language === 'he' ? egoState.nameHe : egoState.name}
          </p>
        </motion.div>
      )}
      
      {/* DNA Archetype indicator */}
      {isPersonalized && profile.computedFrom.dominantArchetype && (
        <motion.div 
          className="mt-2 px-3 py-1 rounded-full text-xs font-medium z-10"
          style={{
            backgroundColor: `${profile.primaryColor}20`,
            color: profile.primaryColor,
            border: `1px solid ${profile.primaryColor}40`,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {getArchetypeLabel(profile.computedFrom.dominantArchetype, language)}
        </motion.div>
      )}
    </motion.div>
  );
}

// Helper to get archetype display name
function getArchetypeLabel(archetypeId: string, language: string): string {
  const labels: Record<string, { he: string; en: string }> = {
    warrior: { he: 'לוחם', en: 'Warrior' },
    sage: { he: 'חכם', en: 'Sage' },
    explorer: { he: 'חוקר', en: 'Explorer' },
    creator: { he: 'יוצר', en: 'Creator' },
    caregiver: { he: 'מטפל', en: 'Caregiver' },
    ruler: { he: 'מנהיג', en: 'Ruler' },
    magician: { he: 'קוסם', en: 'Magician' },
    lover: { he: 'אוהב', en: 'Lover' },
    jester: { he: 'ליצן', en: 'Jester' },
    everyman: { he: 'אדם פשוט', en: 'Everyman' },
    hero: { he: 'גיבור', en: 'Hero' },
    outlaw: { he: 'מורד', en: 'Outlaw' },
    innocent: { he: 'תמים', en: 'Innocent' },
  };
  
  const label = labels[archetypeId];
  return label ? (language === 'he' ? label.he : label.en) : archetypeId;
}

export default OrbHeroSection;

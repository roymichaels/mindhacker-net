/**
 * OrbHeroSection - Compact display of the personalized orb at the top of dashboard
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

// Convert HSL string like "200 80% 50%" to proper CSS format
function hslToColor(hsl: string): string {
  if (hsl.startsWith('hsl(') || hsl.startsWith('#')) return hsl;
  return `hsl(${hsl.replace(/\s+/g, ', ')})`;
}

export function OrbHeroSection({ 
  identityTitle, 
  egoState,
  className,
  compact = false,
}: OrbHeroSectionProps) {
  const { language } = useTranslation();
  const { profile, isPersonalized } = useOrbProfile();
  
  // Compact sizes for dashboard
  const orbSize = compact ? 100 : 140;
  
  // Convert profile color to CSS-valid format
  const primaryColor = hslToColor(profile.primaryColor);
  
  return (
    <motion.div 
      className={cn(
        "relative flex flex-col items-center py-3",
        className
      )}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle glow background */}
      <div 
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${primaryColor.replace(')', '/0.15)')} 0%, transparent 60%)`,
        }}
      />
      
      {/* Orb Container - Compact */}
      <div className="relative z-10">
        <PersonalizedOrb
          size={orbSize}
          showGlow={true}
          showLoadingSkeleton={true}
          className="transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Identity Title - Inline and compact */}
      {identityTitle && (
        <motion.div 
          className="mt-2 text-center z-10 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-lg">{identityTitle.icon}</span>
          <h2 className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {identityTitle.title}
          </h2>
        </motion.div>
      )}
      
      {/* Ego State Badge - only if no identity title */}
      {egoState && !identityTitle && (
        <motion.div 
          className="mt-2 text-center z-10 flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {egoState.icon && <span className="text-sm">{egoState.icon}</span>}
          <p className="text-xs font-medium text-muted-foreground">
            {language === 'he' ? egoState.nameHe : egoState.name}
          </p>
        </motion.div>
      )}
      
      {/* Archetype badge - Compact */}
      {isPersonalized && profile.computedFrom.dominantArchetype && (
        <motion.div 
          className="mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium z-10"
          style={{
            backgroundColor: primaryColor.replace(')', '/0.15)'),
            color: primaryColor,
            border: `1px solid ${primaryColor.replace(')', '/0.3)')}`,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
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
    mystic: { he: 'מיסטיקן', en: 'Mystic' },
    healer: { he: 'מרפא', en: 'Healer' },
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

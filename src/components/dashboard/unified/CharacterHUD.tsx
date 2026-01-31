/**
 * CharacterHUD - MapleStory-style compact HUD displaying:
 * - Avatar/Orb (small) with DNA Threads
 * - Identity title + Level
 * - XP Progress bar
 * - Streak + Tokens
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { useMultiThreadOrbProfile } from '@/hooks/useMultiThreadOrbProfile';
import { Progress } from '@/components/ui/progress';
import { Flame, Gem, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface CharacterHUDProps {
  identityTitle?: { title: string; icon: string } | null;
  level: number;
  xp: { current: number; required: number; percentage: number };
  streak: number;
  tokens: number;
  className?: string;
}

// Convert HSL string like "200 80% 50%" to proper CSS format
function hslToColor(hsl: string): string {
  if (!hsl) return 'hsl(var(--primary))';
  if (hsl.startsWith('hsl(') || hsl.startsWith('#')) return hsl;
  return `hsl(${hsl.replace(/\s+/g, ', ')})`;
}

export function CharacterHUD({
  identityTitle,
  level,
  xp,
  streak,
  tokens,
  className,
}: CharacterHUDProps) {
  const { profile, isPersonalized, threadCount } = useMultiThreadOrbProfile();
  
  // Get primary color from dominant thread or default
  const primaryColor = profile.dominantColors[0] 
    ? hslToColor(profile.dominantColors[0]) 
    : 'hsl(var(--primary))';
  
  return (
    <motion.div
      className={cn(
        "relative flex items-center gap-4 p-3 rounded-xl",
        "backdrop-blur-xl bg-card/60 border border-primary/20",
        "shadow-[0_0_20px_rgba(var(--primary),0.15)]",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect behind */}
      <div 
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${primaryColor.replace(')', '/0.1)')} 0%, transparent 50%)`,
        }}
      />
      
      {/* Orb - Small with DNA Threads */}
      <div className="relative z-10 flex-shrink-0">
        <div 
          className="rounded-full ring-2 ring-primary/40 overflow-hidden w-16 h-16 flex items-center justify-center"
          style={{
            boxShadow: `0 0 12px ${primaryColor.replace(')', '/0.4)')}`,
          }}
        >
          <MultiThreadOrb
            size={64}
            showGlow={true}
            profile={profile}
          />
        </div>
      </div>
      
      {/* Info Section */}
      <div className="flex-1 min-w-0 z-10 space-y-1.5">
        {/* Top Row: Identity + Level */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {identityTitle && (
              <>
                <span className="text-base flex-shrink-0">{identityTitle.icon}</span>
                <span 
                  className="text-sm font-semibold truncate bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                >
                  {identityTitle.title}
                </span>
              </>
            )}
          </div>
          
          {/* Level Badge */}
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
            style={{
              backgroundColor: primaryColor.replace(')', '/0.2)'),
              color: primaryColor,
              border: `1px solid ${primaryColor.replace(')', '/0.3)')}`,
            }}
          >
            <Star className="h-3 w-3" />
            <span>Lv.{level}</span>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Progress 
              value={xp.percentage} 
              className="h-2 bg-muted/50"
            />
            {/* XP Glow overlay */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent, ${primaryColor.replace(')', '/0.3)')} ${xp.percentage}%, transparent ${xp.percentage}%)`,
              }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
            {xp.current}/{xp.required} XP
          </span>
        </div>
        
        {/* Bottom Row: Streak + Tokens */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="h-3.5 w-3.5" />
            <span className="font-medium">{streak}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Gem className="h-3.5 w-3.5" />
            <span className="font-medium">{tokens}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CharacterHUD;

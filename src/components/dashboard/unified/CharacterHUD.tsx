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
  onClick?: () => void;
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
  onClick,
}: CharacterHUDProps) {
  const { profile, isPersonalized, threadCount } = useMultiThreadOrbProfile();
  
  // Get primary color from dominant thread or default
  const primaryColor = profile.dominantColors[0] 
    ? hslToColor(profile.dominantColors[0]) 
    : 'hsl(var(--primary))';
  
  return (
    <motion.div
      className={cn(
        "relative flex items-center gap-3 p-2 rounded-xl w-full",
        "backdrop-blur-xl bg-card/60 border border-primary/20",
        "shadow-[0_0_20px_rgba(var(--primary),0.15)]",
        onClick && "cursor-pointer hover:border-primary/40 hover:shadow-[0_0_30px_rgba(var(--primary),0.25)] transition-all duration-200",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {/* Glow effect behind */}
      <div 
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${primaryColor.replace(')', '/0.1)')} 0%, transparent 50%)`,
        }}
      />
      
      {/* Orb - Using MultiThreadOrb for DNA visualization */}
      <div className="relative z-10 flex-shrink-0">
        <MultiThreadOrb
          size={140}
          showGlow={true}
          profile={profile}
        />
      </div>
      
      {/* Info Section - Full Width */}
      <div className="flex-1 min-w-0 z-10 space-y-2">
        {/* Top Row: Identity Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          {identityTitle && (
            <>
              <span className="text-base flex-shrink-0">{identityTitle.icon}</span>
              <span 
                className="text-xs font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight"
              >
                {identityTitle.title}
              </span>
            </>
          )}
        </div>
        
        {/* XP Text Above Bar */}
        <div className="text-xs text-muted-foreground font-medium">
          XP {xp.current}/{xp.required}
        </div>
        
        {/* XP Progress Bar - Full Width */}
        <div className="w-full relative">
          <Progress 
            value={xp.percentage} 
            className="h-2.5 bg-muted/50 w-full"
          />
          {/* XP Glow overlay */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${primaryColor.replace(')', '/0.3)')} ${xp.percentage}%, transparent ${xp.percentage}%)`,
            }}
          />
        </div>
        
        {/* Bottom Row: Level + Tokens + Streak */}
        <div className="flex items-center gap-3 text-xs">
          {/* Level Badge */}
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full font-bold flex-shrink-0"
            style={{
              backgroundColor: primaryColor.replace(')', '/0.2)'),
              color: primaryColor,
              border: `1px solid ${primaryColor.replace(')', '/0.3)')}`,
            }}
          >
            <Star className="h-3 w-3" />
            <span>Lv.{level}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Gem className="h-3.5 w-3.5" />
            <span className="font-medium">{tokens}</span>
          </div>
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="h-3.5 w-3.5" />
            <span className="font-medium">{streak}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CharacterHUD;

/**
 * CharacterHUD - MapleStory-style compact HUD displaying:
 * - Avatar/Orb (small) with DNA-based personalization
 * - Identity title + Level
 * - XP Progress bar
 * - Streak + Tokens
 */

import React from 'react';
import { cn } from '@/lib/utils';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
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

export function CharacterHUD({
  identityTitle,
  level,
  xp,
  streak,
  tokens,
  className,
  onClick,
}: CharacterHUDProps) {
  return (
    <motion.div
      className={cn(
        "relative flex items-center gap-4 p-3 rounded-2xl w-full",
        "backdrop-blur-xl bg-gradient-to-br from-muted via-background to-muted dark:from-gray-950 dark:via-gray-900 dark:to-gray-950",
        "border border-border dark:border-primary/30 shadow-xl",
        onClick && "cursor-pointer hover:border-primary/40 hover:shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all duration-300",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      </div>
      
      {/* Orb - Using PersonalizedOrb with user profile */}
      <div className="relative z-10 flex-shrink-0">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl scale-125" />
        {/* Inner container with proper sizing */}
        <div className="relative" style={{ width: 100, height: 100 }}>
          <PersonalizedOrb size={100} state="idle" />
        </div>
      </div>
      
      {/* Info Section - Full Width */}
      <div className="flex-1 min-w-0 z-10 space-y-2">
        {/* Top Row: Identity Title */}
        <div className="flex items-center gap-2 min-w-0">
          {identityTitle && (
            <>
              <span className="text-lg flex-shrink-0">{identityTitle.icon}</span>
              <span 
                className="text-sm font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight"
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
        
        {/* XP Progress Bar - Full Width with glow */}
        <div className="w-full relative">
          <Progress 
            value={xp.percentage} 
            className="h-3 bg-muted/50 w-full"
          />
          {/* XP Glow overlay */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none opacity-60"
            style={{
              background: `linear-gradient(90deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.4) ${xp.percentage}%, transparent ${xp.percentage}%)`,
              filter: 'blur(2px)',
            }}
          />
        </div>
        
        {/* Bottom Row: Level + Tokens + Streak */}
        <div className="flex items-center gap-4 text-sm">
          {/* Level Badge */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold flex-shrink-0 bg-primary/20 text-primary border border-primary/30"
          >
            <Star className="h-3.5 w-3.5" />
            <span>Lv.{level}</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-500">
            <Gem className="h-4 w-4" />
            <span className="font-semibold">{tokens}</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="font-semibold">{streak}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CharacterHUD;

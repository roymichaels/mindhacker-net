/**
 * SidebarCharacterHUD - Compact version of CharacterHUD for sidebar
 * Shows Orb, identity, XP, level, tokens, streak in a compact layout
 */

import React from 'react';
import { cn } from '@/lib/utils';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Progress } from '@/components/ui/progress';
import { Flame, Gem, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarCharacterHUDProps {
  identityTitle?: { title: string; icon: string } | null;
  level: number;
  xp: { current: number; required: number; percentage: number };
  streak: number;
  tokens: number;
  className?: string;
  onClick?: () => void;
}

export function SidebarCharacterHUD({
  identityTitle,
  level,
  xp,
  streak,
  tokens,
  className,
  onClick,
}: SidebarCharacterHUDProps) {
  return (
    <motion.div
      className={cn(
        "relative p-3 rounded-xl w-full",
        "backdrop-blur-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950",
        "border border-primary/30 shadow-lg",
        onClick && "cursor-pointer hover:border-primary/40 transition-all duration-300",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
      </div>
      
      <div className="relative z-10 flex items-center gap-3">
        {/* Orb - Smaller for sidebar */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-lg scale-125" />
          <div className="relative" style={{ width: 56, height: 56 }}>
            <PersonalizedOrb size={56} state="idle" />
          </div>
        </div>
        
        {/* Info Section */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Identity Title */}
          {identityTitle && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm flex-shrink-0">{identityTitle.icon}</span>
              <span className="text-xs font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                {identityTitle.title}
              </span>
            </div>
          )}
          
          {/* XP Bar with text */}
          <div className="space-y-0.5">
            <div className="text-[10px] text-muted-foreground font-medium">
              XP {xp.current}/{xp.required}
            </div>
            <Progress 
              value={xp.percentage} 
              className="h-1.5 bg-muted/50 w-full"
            />
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              <Star className="h-3 w-3" />
              <span className="font-bold">Lv.{level}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Gem className="h-3 w-3" />
              <span className="font-semibold">{tokens}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-3 w-3" />
              <span className="font-semibold">{streak}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SidebarCharacterHUD;

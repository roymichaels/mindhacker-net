import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface HawkinsLevel {
  level: number;
  name: string;
  nameHe: string;
  color: string;
}

const HAWKINS_LEVELS: HawkinsLevel[] = [
  { level: 700, name: 'Enlightenment', nameHe: 'הארה', color: 'bg-violet-500' },
  { level: 600, name: 'Peace', nameHe: 'שלום', color: 'bg-purple-500' },
  { level: 540, name: 'Joy', nameHe: 'שמחה', color: 'bg-indigo-500' },
  { level: 500, name: 'Love', nameHe: 'אהבה', color: 'bg-pink-500' },
  { level: 400, name: 'Reason', nameHe: 'הגיון', color: 'bg-blue-500' },
  { level: 350, name: 'Acceptance', nameHe: 'קבלה', color: 'bg-cyan-500' },
  { level: 310, name: 'Willingness', nameHe: 'נכונות', color: 'bg-teal-500' },
  { level: 250, name: 'Neutrality', nameHe: 'ניטרליות', color: 'bg-green-500' },
  { level: 200, name: 'Courage', nameHe: 'אומץ', color: 'bg-emerald-500' },
  { level: 175, name: 'Pride', nameHe: 'גאווה', color: 'bg-yellow-600' },
  { level: 150, name: 'Anger', nameHe: 'כעס', color: 'bg-orange-500' },
  { level: 125, name: 'Desire', nameHe: 'תשוקה', color: 'bg-amber-600' },
  { level: 100, name: 'Fear', nameHe: 'פחד', color: 'bg-red-500' },
  { level: 75, name: 'Grief', nameHe: 'אבל', color: 'bg-red-600' },
  { level: 50, name: 'Apathy', nameHe: 'אדישות', color: 'bg-gray-600' },
  { level: 30, name: 'Guilt', nameHe: 'אשמה', color: 'bg-gray-700' },
  { level: 20, name: 'Shame', nameHe: 'בושה', color: 'bg-gray-800' },
];

interface HawkinsScaleProps {
  userScore: number;
  className?: string;
}

export function HawkinsScale({ userScore, className }: HawkinsScaleProps) {
  const { language, isRTL } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  // Map 0-100 score to Hawkins 20-700 scale
  const mapToHawkins = (score: number): number => {
    if (score <= 50) {
      return 20 + (score / 50) * 180;
    } else {
      return 200 + ((score - 50) / 50) * 300;
    }
  };
  
  const hawkinsScore = Math.round(mapToHawkins(userScore));
  
  const getCurrentLevel = (): HawkinsLevel => {
    for (let i = 0; i < HAWKINS_LEVELS.length; i++) {
      if (hawkinsScore >= HAWKINS_LEVELS[i].level) {
        return HAWKINS_LEVELS[i];
      }
    }
    return HAWKINS_LEVELS[HAWKINS_LEVELS.length - 1];
  };
  
  const currentLevel = getCurrentLevel();
  
  const getPositionPercent = (): number => {
    const minLevel = 20;
    const maxLevel = 700;
    return ((hawkinsScore - minLevel) / (maxLevel - minLevel)) * 100;
  };
  
  const positionPercent = getPositionPercent();
  const isAboveThreshold = hawkinsScore >= 200;

  return (
    <div className={cn("space-y-3", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Compact header with score */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-1.5">
          🌈 {language === 'he' ? 'מפת הוקינס' : 'Hawkins Map'}
        </h4>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={cn(
            "px-3 py-1 rounded-full text-white text-sm font-bold",
            currentLevel.color
          )}
        >
          {hawkinsScore} - {language === 'he' ? currentLevel.nameHe : currentLevel.name}
        </motion.div>
      </div>

      {/* Compact scale bar */}
      <div className="relative h-6">
        <div className="absolute inset-0 rounded-full overflow-hidden flex">
          <div className="flex-1 bg-gradient-to-r from-gray-700 via-red-500 to-yellow-500" />
          <div className="flex-[1.5] bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500" />
        </div>
        
        {/* Threshold marker at 200 */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white/50"
          style={{ left: `${((200 - 20) / (700 - 20)) * 100}%` }}
        />
        
        {/* User marker */}
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${positionPercent}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-lg"
          style={{ left: `${positionPercent}%` }}
        />
        
        {/* Labels */}
        <div className="absolute -bottom-4 left-0 text-[10px] text-muted-foreground">20</div>
        <div 
          className="absolute -bottom-4 text-[10px] text-emerald-500 font-medium"
          style={{ left: `${((200 - 20) / (700 - 20)) * 100}%`, transform: 'translateX(-50%)' }}
        >
          200
        </div>
        <div className="absolute -bottom-4 right-0 text-[10px] text-muted-foreground">700</div>
      </div>

      {/* Status indicator */}
      <div className={cn(
        "text-xs text-center py-1 rounded mt-5",
        isAboveThreshold 
          ? "text-green-600 dark:text-green-400" 
          : "text-amber-600 dark:text-amber-400"
      )}>
        {isAboveThreshold 
          ? (language === 'he' ? '✨ מעל סף האומץ - אנרגיה בונה' : '✨ Above Courage - Constructive energy')
          : (language === 'he' ? '💪 היעד: סף האומץ (200)' : '💪 Goal: Courage threshold (200)')
        }
      </div>

      {/* Expandable levels */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        {expanded 
          ? (language === 'he' ? 'הסתר רמות' : 'Hide levels')
          : (language === 'he' ? 'הצג את כל הרמות' : 'Show all levels')
        }
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="grid grid-cols-2 gap-1 text-xs"
        >
          {HAWKINS_LEVELS.slice(0, 10).map((level) => {
            const isCurrent = level.level === currentLevel.level;
            return (
              <div
                key={level.level}
                className={cn(
                  "flex items-center gap-2 p-1.5 rounded",
                  isCurrent && "bg-primary/10 ring-1 ring-primary"
                )}
              >
                <div className={cn("w-6 h-4 rounded text-[10px] text-white flex items-center justify-center font-medium", level.color)}>
                  {level.level}
                </div>
                <span className={cn(isCurrent && "font-medium")}>
                  {language === 'he' ? level.nameHe : level.name}
                  {isCurrent && ' ⭐'}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

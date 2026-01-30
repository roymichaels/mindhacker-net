import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface HawkinsLevel {
  level: number;
  name: string;
  nameHe: string;
  emotion: string;
  emotionHe: string;
  color: string;
  bgColor: string;
}

const HAWKINS_LEVELS: HawkinsLevel[] = [
  { level: 700, name: 'Enlightenment', nameHe: 'הארה', emotion: 'Ineffable', emotionHe: 'בלתי ניתן לתיאור', color: 'text-violet-100', bgColor: 'bg-violet-500' },
  { level: 600, name: 'Peace', nameHe: 'שלום', emotion: 'Bliss', emotionHe: 'אושר עילאי', color: 'text-purple-100', bgColor: 'bg-purple-500' },
  { level: 540, name: 'Joy', nameHe: 'שמחה', emotion: 'Serenity', emotionHe: 'שלווה', color: 'text-indigo-100', bgColor: 'bg-indigo-500' },
  { level: 500, name: 'Love', nameHe: 'אהבה', emotion: 'Reverence', emotionHe: 'הערצה', color: 'text-pink-100', bgColor: 'bg-pink-500' },
  { level: 400, name: 'Reason', nameHe: 'הגיון', emotion: 'Understanding', emotionHe: 'הבנה', color: 'text-blue-100', bgColor: 'bg-blue-500' },
  { level: 350, name: 'Acceptance', nameHe: 'קבלה', emotion: 'Forgiveness', emotionHe: 'סליחה', color: 'text-cyan-100', bgColor: 'bg-cyan-500' },
  { level: 310, name: 'Willingness', nameHe: 'נכונות', emotion: 'Optimism', emotionHe: 'אופטימיות', color: 'text-teal-100', bgColor: 'bg-teal-500' },
  { level: 250, name: 'Neutrality', nameHe: 'ניטרליות', emotion: 'Trust', emotionHe: 'אמון', color: 'text-green-100', bgColor: 'bg-green-500' },
  { level: 200, name: 'Courage', nameHe: 'אומץ', emotion: 'Affirmation', emotionHe: 'אישור', color: 'text-emerald-100', bgColor: 'bg-emerald-500' },
  { level: 175, name: 'Pride', nameHe: 'גאווה', emotion: 'Scorn', emotionHe: 'בוז', color: 'text-yellow-100', bgColor: 'bg-yellow-600' },
  { level: 150, name: 'Anger', nameHe: 'כעס', emotion: 'Hate', emotionHe: 'שנאה', color: 'text-orange-100', bgColor: 'bg-orange-500' },
  { level: 125, name: 'Desire', nameHe: 'תשוקה', emotion: 'Craving', emotionHe: 'כמיהה', color: 'text-amber-100', bgColor: 'bg-amber-600' },
  { level: 100, name: 'Fear', nameHe: 'פחד', emotion: 'Anxiety', emotionHe: 'חרדה', color: 'text-red-100', bgColor: 'bg-red-500' },
  { level: 75, name: 'Grief', nameHe: 'אבל', emotion: 'Regret', emotionHe: 'חרטה', color: 'text-red-100', bgColor: 'bg-red-600' },
  { level: 50, name: 'Apathy', nameHe: 'אדישות', emotion: 'Despair', emotionHe: 'ייאוש', color: 'text-gray-100', bgColor: 'bg-gray-600' },
  { level: 30, name: 'Guilt', nameHe: 'אשמה', emotion: 'Blame', emotionHe: 'האשמה', color: 'text-gray-100', bgColor: 'bg-gray-700' },
  { level: 20, name: 'Shame', nameHe: 'בושה', emotion: 'Humiliation', emotionHe: 'השפלה', color: 'text-gray-100', bgColor: 'bg-gray-800' },
];

interface HawkinsScaleProps {
  userScore: number; // 0-100 scale, will be mapped to Hawkins 20-700
  className?: string;
}

export function HawkinsScale({ userScore, className }: HawkinsScaleProps) {
  const { language, isRTL } = useTranslation();
  
  // Map 0-100 score to Hawkins 20-700 scale
  // Using logarithmic-ish mapping to make it more meaningful
  const mapToHawkins = (score: number): number => {
    // Score 0-100 maps to Hawkins 20-700
    // But we want most users to be in the 100-400 range
    // Linear mapping for simplicity: 0->20, 50->200, 100->500
    if (score <= 50) {
      return 20 + (score / 50) * 180; // 0-50 -> 20-200
    } else {
      return 200 + ((score - 50) / 50) * 300; // 50-100 -> 200-500
    }
  };
  
  const hawkinsScore = Math.round(mapToHawkins(userScore));
  
  // Find the current level
  const getCurrentLevel = (): HawkinsLevel => {
    for (let i = 0; i < HAWKINS_LEVELS.length; i++) {
      if (hawkinsScore >= HAWKINS_LEVELS[i].level) {
        return HAWKINS_LEVELS[i];
      }
    }
    return HAWKINS_LEVELS[HAWKINS_LEVELS.length - 1];
  };
  
  const currentLevel = getCurrentLevel();
  
  // Calculate position percentage on the scale (0-100)
  const getPositionPercent = (): number => {
    const minLevel = 20;
    const maxLevel = 700;
    return ((hawkinsScore - minLevel) / (maxLevel - minLevel)) * 100;
  };
  
  const positionPercent = getPositionPercent();

  // Key threshold at 200 (Courage) - below this is "destructive", above is "constructive"
  const isAboveThreshold = hawkinsScore >= 200;

  return (
    <div className={cn("space-y-6", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          🌈 {language === 'he' ? 'מפת התודעה של הוקינס' : 'Hawkins Map of Consciousness'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? 'מודד את רמת התודעה שלך על סולם 20-700' 
            : 'Measuring your consciousness level on a 20-700 scale'}
        </p>
      </div>

      {/* Current Score Display */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "p-6 rounded-2xl text-center space-y-2",
          currentLevel.bgColor,
          currentLevel.color
        )}
      >
        <div className="text-5xl font-bold">{hawkinsScore}</div>
        <div className="text-xl font-medium">
          {language === 'he' ? currentLevel.nameHe : currentLevel.name}
        </div>
        <div className="text-sm opacity-80">
          {language === 'he' ? currentLevel.emotionHe : currentLevel.emotion}
        </div>
      </motion.div>

      {/* Threshold indicator */}
      <div className={cn(
        "p-3 rounded-lg text-center text-sm",
        isAboveThreshold 
          ? "bg-green-500/20 text-green-700 dark:text-green-300" 
          : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
      )}>
        {isAboveThreshold ? (
          language === 'he' 
            ? '✨ אתה מעל סף האומץ (200) - באנרגיה בונה!'
            : '✨ You are above the Courage threshold (200) - in constructive energy!'
        ) : (
          language === 'he'
            ? '💪 היעד שלך: להגיע לסף האומץ (200) - הנקודה שבה האנרגיה הופכת לבונה'
            : '💪 Your goal: Reach the Courage threshold (200) - where energy becomes constructive'
        )}
      </div>

      {/* Visual Scale */}
      <div className="relative">
        {/* Scale bar */}
        <div className="h-8 rounded-full overflow-hidden flex">
          {/* Destructive zone (20-200) */}
          <div className="flex-1 bg-gradient-to-r from-gray-800 via-red-500 to-yellow-500 relative">
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium opacity-70">
              {language === 'he' ? 'אנרגיה הרסנית' : 'Destructive'}
            </span>
          </div>
          {/* Constructive zone (200-700) */}
          <div className="flex-[1.5] bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 relative">
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium opacity-70">
              {language === 'he' ? 'אנרגיה בונה' : 'Constructive'}
            </span>
          </div>
        </div>
        
        {/* User marker */}
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${positionPercent}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="absolute -top-2 transform -translate-x-1/2"
          style={{ left: `${positionPercent}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="text-2xl">👆</div>
            <div className="bg-background border-2 border-primary px-2 py-1 rounded text-xs font-bold shadow-lg">
              {hawkinsScore}
            </div>
          </div>
        </motion.div>

        {/* Scale markers */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>20</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">200</span>
          <span>700</span>
        </div>
      </div>

      {/* Levels breakdown */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium mb-3">
          {language === 'he' ? 'רמות התודעה:' : 'Consciousness Levels:'}
        </h4>
        <div className="grid gap-1 max-h-64 overflow-y-auto pr-2">
          {HAWKINS_LEVELS.slice(0, 10).map((level, index) => {
            const isCurrentLevel = level.level === currentLevel.level;
            const isBelow = hawkinsScore < level.level;
            
            return (
              <motion.div
                key={level.level}
                initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all",
                  isCurrentLevel 
                    ? "bg-primary/20 border-2 border-primary" 
                    : isBelow 
                      ? "opacity-40" 
                      : "opacity-70"
                )}
              >
                <div className={cn(
                  "w-10 h-6 rounded text-xs font-bold flex items-center justify-center",
                  level.bgColor,
                  level.color
                )}>
                  {level.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {language === 'he' ? level.nameHe : level.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {language === 'he' ? level.emotionHe : level.emotion}
                  </div>
                </div>
                {isCurrentLevel && (
                  <span className="text-primary text-lg">⭐</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground text-center">
        {language === 'he' 
          ? 'מבוסס על עבודתו של ד"ר דייוויד הוקינס - "כוח מול עוצמה"'
          : 'Based on Dr. David Hawkins\' work - "Power vs. Force"'}
      </p>
    </div>
  );
}

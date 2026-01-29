import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface FocusAreasStepProps {
  onComplete: (data: { focus_areas: string[] }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

const FOCUS_AREAS = [
  { id: 'health', icon: '💪', label: 'בריאות וגוף', labelEn: 'Health & Body' },
  { id: 'money', icon: '💰', label: 'כסף ושפע', labelEn: 'Money & Abundance' },
  { id: 'mind', icon: '🧠', label: 'תודעה ומיינד', labelEn: 'Mind & Consciousness' },
  { id: 'relationships', icon: '❤️', label: 'זוגיות ומערכות יחסים', labelEn: 'Relationships' },
  { id: 'career', icon: '💼', label: 'קריירה ועבודה', labelEn: 'Career & Work' },
  { id: 'creativity', icon: '🎨', label: 'יצירה והבעה', labelEn: 'Creativity & Expression' },
  { id: 'social', icon: '👥', label: 'חברה וקהילה', labelEn: 'Social & Community' },
  { id: 'spirituality', icon: '✨', label: 'רוחניות ומשמעות', labelEn: 'Spirituality & Meaning' },
];

export function FocusAreasStep({ onComplete, isCompleting, rewards }: FocusAreasStepProps) {
  const { language, isRTL } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleArea = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(a => a !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id]; // Replace oldest selection
      }
      return [...prev, id];
    });
  };

  const isValid = selected.length === 3;

  const handleSubmit = () => {
    if (isValid) {
      onComplete({ focus_areas: selected });
    }
  };

  return (
    <div className="space-y-8 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-4"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <span className="text-4xl">🎪</span>
        </div>
        
        <h1 className="text-3xl font-bold">
          {language === 'he' ? 'בחר 3 תחומי פוקוס' : 'Choose 3 Focus Areas'}
        </h1>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'באילו תחומים אתה רוצה להתמקד בתקופה הקרובה? בחר 3 תחומים.'
            : 'Which areas do you want to focus on in the near future? Choose 3 areas.'
          }
        </p>
        
        <p className="text-sm font-medium text-primary">
          {selected.length}/3 {language === 'he' ? 'נבחרו' : 'selected'}
        </p>
      </motion.div>

      {/* Focus Areas Grid */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        {FOCUS_AREAS.map((area, index) => {
          const isSelected = selected.includes(area.id);
          const selectionIndex = selected.indexOf(area.id);
          
          return (
            <motion.button
              key={area.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => toggleArea(area.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all text-start",
                isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-muted-foreground/20 hover:border-muted-foreground/40"
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold"
                >
                  {selectionIndex + 1}
                </motion.div>
              )}
              
              <div className="flex items-center gap-3">
                <span className="text-2xl">{area.icon}</span>
                <span className={cn(
                  "font-medium text-sm",
                  isSelected && "text-primary"
                )}>
                  {language === 'he' ? area.label : area.labelEn}
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Rewards & Submit */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
            <span>+{rewards.xp} XP</span>
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={handleSubmit}
          disabled={!isValid || isCompleting}
          className="min-w-[200px]"
        >
          {isCompleting 
            ? (language === 'he' ? 'שומר...' : 'Saving...') 
            : (language === 'he' ? 'המשך' : 'Continue')
          }
        </Button>
      </motion.div>
    </div>
  );
}

export default FocusAreasStep;

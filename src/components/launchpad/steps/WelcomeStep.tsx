import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onComplete: (data: { intention: string }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

export function WelcomeStep({ onComplete, isCompleting, rewards }: WelcomeStepProps) {
  const { language, isRTL } = useTranslation();
  const [intention, setIntention] = useState('');

  const isValid = intention.trim().length >= 10;

  const handleSubmit = () => {
    if (isValid) {
      onComplete({ intention: intention.trim() });
    }
  };

  return (
    <div className="space-y-8 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-4xl">👋</span>
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {language === 'he' ? 'ברוך הבא לאורורה' : 'Welcome to Aurora'}
        </h1>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'אני כאן לעזור לך לבנות את החיים שאתה באמת רוצה. בוא נתחיל בשאלה פשוטה...'
            : "I'm here to help you build the life you truly want. Let's start with a simple question..."
          }
        </p>
      </motion.div>

      {/* Question */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {language === 'he' 
            ? 'מה אתה רוצה שיקרה בחיים שלך בזמן הקרוב?'
            : 'What do you want to happen in your life soon?'
          }
        </h2>
        
        <Textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder={language === 'he' 
            ? 'כתוב 2-3 משפטים על מה שאתה רוצה להשיג, לשנות, או ליצור...'
            : 'Write 2-3 sentences about what you want to achieve, change, or create...'
          }
          className="min-h-[120px] text-base resize-none"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        
        <p className="text-xs text-muted-foreground">
          {intention.length < 10 && (
            language === 'he' ? 'כתוב לפחות 10 תווים' : 'Write at least 10 characters'
          )}
        </p>
      </motion.div>

      {/* Rewards preview */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4 text-sm"
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-4 h-4" />
          <span>+{rewards.xp} XP</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent-foreground">
          <Gift className="w-4 h-4" />
          <span>
            {language === 'he' ? 'נפתח: צ׳אט מלא' : 'Unlock: Full Chat'}
          </span>
        </div>
      </motion.div>

      {/* Submit */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
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

export default WelcomeStep;

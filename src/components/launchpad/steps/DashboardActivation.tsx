import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, Rocket, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardActivationProps {
  onComplete: () => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

const UNLOCKS = [
  { icon: '🧭', label: 'Life OS Dashboard', labelHe: 'דשבורד חיים מלא' },
  { icon: '📊', label: 'Weekly Planning', labelHe: 'תכנון שבועי' },
  { icon: '🎯', label: 'Focus Plans', labelHe: 'תוכניות פוקוס' },
  { icon: '⚓', label: 'Daily Anchors', labelHe: 'עוגנים יומיים' },
  { icon: '🧘', label: 'Hypnosis Sessions', labelHe: 'סשני היפנוזה' },
  { icon: '🤖', label: 'Full Aurora Coaching', labelHe: 'אימון מלא עם אורורה' },
];

export function DashboardActivation({ onComplete, isCompleting, rewards }: DashboardActivationProps) {
  const { language, isRTL } = useTranslation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  const handleActivate = async () => {
    setIsGenerating(true);
    
    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          title: language === 'he' ? 'שגיאה' : 'Error',
          description: language === 'he' ? 'יש להתחבר מחדש' : 'Please log in again',
          variant: 'destructive',
        });
        setIsGenerating(false);
        return;
      }

      // Call edge function to generate summary and plan
      const { data, error } = await supabase.functions.invoke('generate-launchpad-summary', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error generating summary:', error);
        toast({
          title: language === 'he' ? 'שגיאה ביצירת הסיכום' : 'Error generating summary',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        console.log('Summary generated:', data);
        setGenerationComplete(true);
        toast({
          title: language === 'he' ? '🎉 הסיכום נוצר!' : '🎉 Summary generated!',
          description: language === 'he' 
            ? 'התוכנית שלך ל-90 ימים מוכנה' 
            : 'Your 90-day plan is ready',
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsGenerating(false);
      // Complete the flow even if summary generation failed
      onComplete();
    }
  };

  return (
    <div className="space-y-8 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-4"
      >
        <motion.div 
          className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center"
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(var(--primary), 0.3)',
              '0 0 40px rgba(var(--primary), 0.5)',
              '0 0 20px rgba(var(--primary), 0.3)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Rocket className="w-12 h-12 text-primary-foreground" />
        </motion.div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {language === 'he' ? '🎉 סיימת את ה-Launchpad!' : '🎉 Launchpad Complete!'}
        </h1>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'אורורה יודעת עכשיו מספיק כדי לבנות לך מודל חיים אישי. כל הכלים פתוחים!'
            : 'Aurora now knows enough to build you a personal life model. All tools are unlocked!'
          }
        </p>
      </motion.div>

      {/* Rewards */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-4 text-sm"
      >
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold">+{rewards.xp} XP</span>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600">
          <Gift className="w-5 h-5" />
          <span className="font-bold">+{rewards.tokens} {language === 'he' ? 'טוקנים' : 'Tokens'}</span>
        </div>
      </motion.div>

      {/* Unlocks Grid */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h3 className="font-semibold text-lg">
          {language === 'he' ? 'מה נפתח לך:' : 'What\'s unlocked:'}
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {UNLOCKS.map((unlock, index) => (
            <motion.div
              key={unlock.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + (index * 0.1) }}
              className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20"
            >
              <span className="text-2xl">{unlock.icon}</span>
              <span className="text-sm font-medium text-start">
                {language === 'he' ? unlock.labelHe : unlock.label}
              </span>
              <Check className="w-4 h-4 text-primary ms-auto" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Button 
          size="lg" 
          onClick={handleActivate}
          disabled={isCompleting || isGenerating}
          className="min-w-[250px] h-14 text-lg gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {language === 'he' ? 'יוצר סיכום ותוכנית...' : 'Creating summary & plan...'}
            </>
          ) : isCompleting ? (
            language === 'he' ? 'מפעיל...' : 'Activating...'
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              {language === 'he' ? 'הפעל את הדשבורד' : 'Activate Dashboard'}
            </>
          )}
        </Button>
        
        {generationComplete && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-green-500 mt-2 flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4" />
            {language === 'he' ? 'התוכנית נוצרה בהצלחה!' : 'Plan created successfully!'}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default DashboardActivation;

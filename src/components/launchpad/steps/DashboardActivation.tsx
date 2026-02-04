import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, Rocket, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardActivationProps {
  onComplete: () => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

const UNLOCKS = [
  { icon: '🧭', label: 'Life OS Dashboard', labelHe: 'דשבורד חיים' },
  { icon: '📊', label: 'Weekly Planning', labelHe: 'תכנון שבועי' },
  { icon: '🎯', label: 'Focus Plans', labelHe: 'תוכניות פוקוס' },
  { icon: '⚓', label: 'Daily Anchors', labelHe: 'עוגנים יומיים' },
  { icon: '🧘', label: 'Hypnosis', labelHe: 'היפנוזה' },
  { icon: '🤖', label: 'Aurora Coaching', labelHe: 'אימון אורורה' },
];

export function DashboardActivation({ onComplete, isCompleting, rewards }: DashboardActivationProps) {
  const { language, isRTL } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  const handleActivate = async () => {
    setIsGenerating(true);
    
    try {
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

      const { data, error } = await supabase.functions.invoke('generate-launchpad-summary', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error generating summary:', error);
        toast({
          title: language === 'he' ? 'שגיאה' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        console.log('Summary generated:', data);
        setGenerationComplete(true);
        toast({
          title: language === 'he' ? '🎉 הסיכום נוצר!' : '🎉 Summary generated!',
          description: language === 'he' ? 'התוכנית שלך מוכנה' : 'Your plan is ready',
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsGenerating(false);
      navigate('/launchpad/complete');
    }
  };

  return (
    <div className="space-y-4 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Compact Hero */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-2"
      >
        <motion.div 
          className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center"
          animate={{ 
            boxShadow: [
              '0 0 15px rgba(var(--primary), 0.3)',
              '0 0 25px rgba(var(--primary), 0.5)',
              '0 0 15px rgba(var(--primary), 0.3)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Rocket className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {language === 'he' ? '🎉 סיימת את ה-Launchpad!' : '🎉 Launchpad Complete!'}
        </h1>
        
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {language === 'he' 
            ? 'אורורה יודעת עכשיו מספיק כדי לבנות לך מודל חיים אישי. כל הכלים פתוחים!'
            : 'Aurora now knows enough to build you a personal life model. All tools unlocked!'
          }
        </p>
      </motion.div>

      {/* Compact Rewards */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center gap-3"
      >
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
          <Sparkles className="w-4 h-4" />
          <span className="font-bold">+{rewards.xp} XP</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm">
          <Gift className="w-4 h-4" />
          <span className="font-bold">+{rewards.tokens} {language === 'he' ? 'טוקנים' : 'Tokens'}</span>
        </div>
      </motion.div>

      {/* Compact Unlocks Grid - 3 columns */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h3 className="font-medium text-sm text-muted-foreground">
          {language === 'he' ? 'מה נפתח לך:' : 'What\'s unlocked:'}
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          {UNLOCKS.map((unlock, index) => (
            <motion.div
              key={unlock.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (index * 0.05) }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/5 border border-primary/20"
            >
              <span className="text-lg">{unlock.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {language === 'he' ? unlock.labelHe : unlock.label}
              </span>
              <Check className="w-3 h-3 text-primary" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="pt-2"
      >
        <Button 
          size="lg" 
          onClick={handleActivate}
          disabled={isCompleting || isGenerating}
          className={cn(
            "min-w-[260px] h-16 text-lg font-bold gap-2 transition-all duration-300",
            "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-400",
            "hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 border border-amber-500/30",
            (isCompleting || isGenerating) && "opacity-60"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {language === 'he' ? 'יוצר סיכום...' : 'Creating...'}
            </>
          ) : isCompleting ? (
            language === 'he' ? 'מפעיל...' : 'Activating...'
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              {language === 'he' ? '🚀 הפעל את הדשבורד' : '🚀 Activate Dashboard'}
            </>
          )}
        </Button>
        
        {generationComplete && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-green-500 mt-1.5 flex items-center justify-center gap-1"
          >
            <Check className="w-3 h-3" />
            {language === 'he' ? 'התוכנית נוצרה!' : 'Plan created!'}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default DashboardActivation;

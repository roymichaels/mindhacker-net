import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useGuestLaunchpadProgress } from '@/hooks/useGuestLaunchpadProgress';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Gift, Rocket, CheckCircle2 } from 'lucide-react';
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { cn } from '@/lib/utils';

interface GuestDashboardActivationProps {
  onComplete: () => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number };
}

export function GuestDashboardActivation({ onComplete, isCompleting, rewards }: GuestDashboardActivationProps) {
  const { language, isRTL } = useTranslation();
  const { getGuestData } = useGuestLaunchpadProgress();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const guestData = getGuestData();
      
      // Call edge function with guest mode
      const { data, error: fnError } = await supabase.functions.invoke('generate-launchpad-summary', {
        body: {
          mode: 'guest',
          guestData,
        },
      });

      if (fnError) throw fnError;

      // Store the result in localStorage for the completion page
      localStorage.setItem('guest_launchpad_result', JSON.stringify(data));
      
      onComplete();
    } catch (err) {
      console.error('Error generating guest summary:', err);
      setError(language === 'he' 
        ? 'שגיאה ביצירת הניתוח. נסה שוב.' 
        : 'Error generating analysis. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const features = [
    {
      icon: '🧠',
      titleHe: 'ניתוח תודעה מבוסס AI',
      titleEn: 'AI Consciousness Analysis',
      descHe: 'ציון על סולם הוקינס + תובנות עמוקות',
      descEn: 'Hawkins scale score + deep insights',
    },
    {
      icon: '📋',
      titleHe: 'תוכנית 90 יום',
      titleEn: '90-Day Plan',
      descHe: '12 אבני דרך שבועיות מותאמות אישית',
      descEn: '12 personalized weekly milestones',
    },
    {
      icon: '📄',
      titleHe: 'PDF מקצועי',
      titleEn: 'Professional PDF',
      descHe: 'הורד והדפס את הפרופיל שלך',
      descEn: 'Download and print your profile',
    },
    {
      icon: '🎯',
      titleHe: 'פרופיל זהות',
      titleEn: 'Identity Profile',
      descHe: 'תכונות, ערכים וכיוון חיים',
      descEn: 'Traits, values & life direction',
    },
  ];

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-lg w-full space-y-6"
      >
        {/* Orb */}
        <div className="relative mx-auto w-24 h-24">
          <MultiThreadOrb size={96} state={isGenerating ? 'thinking' : 'idle'} />
          <motion.div
            animate={isGenerating ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className={cn("absolute inset-0 rounded-full border-2 border-dashed border-primary/30", !isGenerating && "hidden")}
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {isRTL ? '🎉 סיימת את המסע!' : '🎉 Journey Complete!'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'Aurora מוכנה לנתח את כל המידע שלך וליצור פרופיל אישי ותוכנית טרנספורמציה'
              : 'Aurora is ready to analyze your data and create a personal profile and transformation plan'}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleEn}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-3 rounded-xl bg-card/50 border border-border/50 text-start"
            >
              <span className="text-2xl">{feature.icon}</span>
              <p className="text-sm font-medium mt-1">
                {isRTL ? feature.titleHe : feature.titleEn}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRTL ? feature.descHe : feature.descEn}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* CTA */}
        <Button
          size="lg"
          onClick={handleActivate}
          disabled={isGenerating || isCompleting}
          className="w-full h-14 text-lg gap-2"
        >
          {isGenerating || isCompleting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isRTL ? 'Aurora מנתחת...' : 'Aurora is analyzing...'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {isRTL ? 'קבל את הניתוח שלי' : 'Get My Analysis'}
              <Rocket className="w-5 h-5" />
            </>
          )}
        </Button>

        {/* Trust signal */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {isRTL ? 'הנתונים נשמרים רק במכשיר שלך' : 'Data stays only on your device'}
        </div>
      </motion.div>
    </div>
  );
}

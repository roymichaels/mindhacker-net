/**
 * PillarSynthesisModal — Auto-triggered when all 14 domains are complete.
 * Calls generate-pillar-synthesis to create a new comprehensive 100-day plan.
 */
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Target, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PillarSynthesisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Phase = 'intro' | 'analyzing' | 'complete' | 'error';

export function PillarSynthesisModal({ open, onOpenChange }: PillarSynthesisModalProps) {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>('intro');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setPhase('intro');
      setProgress(0);
      setResult(null);
    }
  }, [open]);

  const runSynthesis = async () => {
    if (!user) return;
    setPhase('analyzing');
    setProgress(10);

    // Simulate progress while waiting for AI
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 8, 90));
    }, 2000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('generate-pillar-synthesis', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      clearInterval(interval);

      if (response.error) throw response.error;
      if (!response.data?.success) throw new Error(response.data?.error || 'Synthesis failed');

      setProgress(100);
      setResult(response.data);
      setPhase('complete');

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['life-domains'] });
      queryClient.invalidateQueries({ queryKey: ['pillar-synthesis-done'] });
      queryClient.invalidateQueries({ queryKey: ['launchpad-summary'] });
      queryClient.invalidateQueries({ queryKey: ['life-plan'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });

      toast.success(isHe ? '🎯 תוכנית 100 הימים החדשה שלך מוכנה!' : '🎯 Your new 100-day plan is ready!');
    } catch (error) {
      clearInterval(interval);
      console.error('[PillarSynthesisModal] Error:', error);
      setPhase('error');
      toast.error(isHe ? 'שגיאה בסינתזה' : 'Synthesis error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-primary/30 bg-background/95 backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 text-center space-y-6"
            >
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  {isHe ? '🏆 השלמת את כל הפילרים!' : '🏆 All Pillars Complete!'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {isHe
                    ? 'סיימת את ההערכה בכל 14 תחומי החיים. עכשיו המערכת תנתח את כל המידע ותבנה תוכנית 90 ימים חדשה ומקיפה — עם זהות, כיוון ותובנות מעודכנים.'
                    : 'You completed assessments across all 14 life domains. The system will now synthesize everything into a comprehensive new 90-day plan — with updated identity, direction, and insights.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { icon: Brain, label: isHe ? 'זהות מעודכנת' : 'Updated Identity' },
                  { icon: Target, label: isHe ? 'כיוון חדש' : 'New Direction' },
                  { icon: Sparkles, label: isHe ? 'תובנות עמוקות' : 'Deep Insights' },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={runSynthesis}
                className="w-full h-12 text-base gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                {isHe ? 'בנה תוכנית חדשה' : 'Build New Plan'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 text-center space-y-6"
            >
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold">
                  {isHe ? 'מנתח את כל הפילרים...' : 'Analyzing all pillars...'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isHe
                    ? 'המערכת מסנתזת נתונים מ-14 תחומי חיים ובונה תוכנית מותאמת אישית'
                    : 'Synthesizing data from 14 life domains into a personalized plan'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
              </div>

              {/* Analysis steps */}
              <div className="space-y-2 text-start text-sm">
                {[
                  { threshold: 10, text: isHe ? 'קורא נתוני פילרים...' : 'Reading pillar data...' },
                  { threshold: 30, text: isHe ? 'מזהה תבניות חוצות-תחומים...' : 'Detecting cross-domain patterns...' },
                  { threshold: 50, text: isHe ? 'בונה פרופיל זהות...' : 'Building identity profile...' },
                  { threshold: 70, text: isHe ? 'מייצר תוכנית 90 ימים...' : 'Generating 90-day plan...' },
                  { threshold: 90, text: isHe ? 'שומר תוצאות...' : 'Saving results...' },
                ].map(({ threshold, text }) => (
                  <div key={threshold} className="flex items-center gap-2">
                    {progress >= threshold ? (
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={progress >= threshold ? 'text-foreground' : 'text-muted-foreground/50'}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center space-y-6"
            >
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-chart-2/20 to-primary/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-chart-2" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  {isHe ? '🎯 הסינתזה הושלמה!' : '🎯 Synthesis Complete!'}
                </h2>
                <p className="text-muted-foreground">
                  {isHe
                    ? 'הזהות, הכיוון והתובנות שלך עודכנו. תוכנית 90 הימים החדשה מוכנה.'
                    : 'Your identity, direction, and insights have been updated. New 90-day plan is ready.'}
                </p>
              </div>

              {result?.scores && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: isHe ? 'תודעה' : 'Consciousness', value: result.scores.consciousness },
                    { label: isHe ? 'מוכנות' : 'Readiness', value: result.scores.readiness },
                    { label: isHe ? 'בהירות' : 'Clarity', value: result.scores.clarity },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="text-2xl font-bold text-primary">{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {result?.milestones_count && (
                <p className="text-sm text-muted-foreground">
                  {isHe
                    ? `${result.milestones_count} אבני דרך נוצרו ל-90 הימים הקרובים`
                    : `${result.milestones_count} milestones created for the next 90 days`}
                </p>
              )}

              <Button
                onClick={() => {
                  onOpenChange(false);
                  // Force page refresh to show new data
                  window.location.reload();
                }}
                className="w-full h-12 text-base gap-2"
              >
                {isHe ? 'צפה בדאשבורד המעודכן' : 'View Updated Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center space-y-4"
            >
              <p className="text-destructive font-medium">
                {isHe ? 'שגיאה בסינתזה. נסה שוב.' : 'Synthesis error. Try again.'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setPhase('intro')}>
                  {isHe ? 'נסה שוב' : 'Try Again'}
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  {isHe ? 'סגור' : 'Close'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

/**
 * AIONNamingGate — Game-like modal shown when user hasn't named their AION yet.
 * Presents the personalized orb and asks the user to name their Future Self.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAION } from '@/identity';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIONNamingGateProps {
  children: React.ReactNode;
}

export function AIONNamingGate({ children }: AIONNamingGateProps) {
  const { aion, isActivated, isLoading } = useAION();
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [step, setStep] = useState(0); // 0 = reveal, 1 = name input
  const [saving, setSaving] = useState(false);

  const saveAndContinue = useCallback(async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({
          aion_name: name.trim() || 'AION',
          aion_activated: true,
        } as any)
        .eq('id', user.id);
      queryClient.invalidateQueries({ queryKey: ['aion-identity'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (e) {
      console.warn('[AION] Naming save failed:', e);
    } finally {
      setSaving(false);
    }
  }, [user?.id, name, queryClient]);

  // Loading or already activated — show children
  if (isLoading || isActivated) return <>{children}</>;
  if (!user) return <>{children}</>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="aion-naming-gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at center, hsl(var(--background)) 0%, hsl(var(--background) / 0.98) 100%)' }}
      >
        {/* Ambient particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-md w-full">
          {/* Step 0: Reveal */}
          {step === 0 && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-8 text-center"
            >
              {/* Orb with glow */}
              <div className="relative">
                <motion.div
                  className="absolute -inset-8 rounded-full blur-3xl"
                  style={{ background: 'hsl(var(--primary) / 0.15)' }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <PersonalizedOrb size={160} />
              </div>

              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {isHe ? 'AION מוכן' : 'AION Ready'}
                  </span>
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-2xl md:text-3xl font-black text-foreground"
                >
                  {isHe ? 'העתיד שלך מחכה' : 'Your Future Self Awaits'}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto"
                >
                  {isHe
                    ? 'זה אתה — בלי רעש. גרסה שלך שכבר עברה את הדרך. תן לו שם.'
                    : "This is you — without the noise. A version of you that's already walked the path. Give it a name."}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <Button
                  onClick={() => setStep(1)}
                  className="px-8 py-3 text-sm font-bold rounded-full bg-primary hover:bg-primary/90"
                >
                  {isHe ? 'בוא נתחיל' : "Let's Begin"}
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 1: Name input */}
          {step === 1 && (
            <motion.div
              key="naming"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-8 text-center w-full"
            >
              {/* Smaller orb */}
              <PersonalizedOrb size={100} />

              <div className="space-y-2">
                <h2 className="text-xl font-black text-foreground">
                  {isHe ? 'תן שם ל-AION שלך' : 'Name Your AION'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isHe
                    ? 'זה השם שבו תקרא לו. תבחר שם שמרגיש כמוך — בגרסה הכי חזקה.'
                    : 'This is how you\'ll call your Future Self. Pick a name that feels like you — at your strongest.'}
                </p>
              </div>

              <div className="w-full max-w-xs space-y-4">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isHe ? 'שם ה-AION שלך...' : 'Your AION name...'}
                  className="text-center text-lg font-bold h-12 rounded-xl border-primary/30 focus:border-primary bg-muted/30"
                  maxLength={20}
                  autoFocus
                />

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(0)}
                    className="flex-1 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 me-1" />
                    {isHe ? 'חזרה' : 'Back'}
                  </Button>
                  <Button
                    onClick={saveAndContinue}
                    disabled={saving}
                    className="flex-[2] rounded-full bg-primary hover:bg-primary/90 font-bold"
                  >
                    {saving
                      ? (isHe ? 'שומר...' : 'Saving...')
                      : (isHe ? `הפעל את ${name || 'AION'}` : `Activate ${name || 'AION'}`)}
                  </Button>
                </div>

                <button
                  onClick={() => { setName('AION'); saveAndContinue(); }}
                  className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {isHe ? 'דלג — השתמש ב-AION כברירת מחדל' : 'Skip — use AION as default'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * OrbNarrativeCard — AI-generated lore story for the user's orb evolution.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export function OrbNarrativeCard() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [narrative, setNarrative] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateNarrative = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-orb-narrative', {
        body: { language },
      });
      if (error) throw error;
      setNarrative(data.narrative);
      setIsExpanded(true);
    } catch (err) {
      console.error('Failed to generate narrative:', err);
      toast.error(isHe ? 'שגיאה ביצירת הסיפור' : 'Failed to generate story');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
    >
      <button
        onClick={narrative ? () => setIsExpanded(!isExpanded) : generateNarrative}
        disabled={isLoading}
        className="w-full flex items-center justify-between gap-3 p-4 text-start hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-violet-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {isHe ? 'סיפור האורב שלך' : 'Your Orb Lore'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {isHe ? 'סיפור התפתחות מותאם אישית מבוסס AI' : 'AI-generated evolution narrative'}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : narrative ? (
            isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Sparkles className="h-4 w-4 text-violet-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && narrative && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/30 pt-3">
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-muted-foreground" dir={isRTL ? 'rtl' : 'ltr'}>
                <ReactMarkdown>{narrative}</ReactMarkdown>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); generateNarrative(); }}
                disabled={isLoading}
                className="mt-3 text-xs text-violet-400 hover:text-violet-300"
              >
                <Sparkles className="h-3 w-3 me-1" />
                {isHe ? 'צור סיפור חדש' : 'Generate new story'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

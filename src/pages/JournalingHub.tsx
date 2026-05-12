/**
 * JournalingHub — Intent-first conversational journal.
 *
 * Philosophy: The user just talks. AION categorizes, summarizes, tags and
 * links — silently. Categories exist only as backend metadata; the UI never
 * asks the user to classify themselves.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getAllJournalEntries, deleteJournalEntry, type JournalEntry } from '@/services/journalEntries';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

const CATEGORY_LABEL: Record<string, { he: string; en: string }> = {
  gratitude:    { he: 'תודה',          en: 'Gratitude' },
  plan:         { he: 'תוכנית',         en: 'Plan' },
  beliefs:      { he: 'אמונה',          en: 'Belief' },
  dream:        { he: 'חלום',           en: 'Dream' },
  reflection:   { he: 'רפלקציה',        en: 'Reflection' },
  breakthrough: { he: 'פריצת דרך',     en: 'Breakthrough' },
  emotion:      { he: 'רגש',            en: 'Emotion' },
  lesson:       { he: 'לקח',            en: 'Lesson' },
  win:          { he: 'ניצחון',         en: 'Win' },
};

export default function JournalingHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries-all', user?.id],
    queryFn: () => getAllJournalEntries(user!.id, 50),
    enabled: !!user?.id,
  });

  const onSave = async () => {
    const value = text.trim();
    if (!value || saving) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('aurora-capture-journal', {
        body: { excerpt: value, force_save: true },
      });
      if (error) throw error;
      if (data?.saved) {
        setText('');
        toast.success(isHe ? 'נשמר. AION ארגן את המשמעות.' : 'Saved. AION organized the meaning.');
        qc.invalidateQueries({ queryKey: ['journal-entries-all'] });
      } else {
        toast(isHe ? 'לא היה משהו לשמור.' : 'Nothing meaningful to save.');
      }
    } catch (e) {
      console.error('journal save', e);
      toast.error(isHe ? 'השמירה נכשלה. נסה שוב.' : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteJournalEntry(id);
      qc.invalidateQueries({ queryKey: ['journal-entries-all'] });
    } catch {
      toast.error(isHe ? 'מחיקה נכשלה.' : 'Delete failed.');
    }
  };

  // ⌘/Ctrl + Enter to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, saving]);

  const locale = isHe ? he : enUS;

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 px-3 py-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Conversational composer */}
      <div className="rounded-3xl bg-card/60 backdrop-blur-xl ring-1 ring-white/[0.06] p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="relative h-7 w-7 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/70 to-primary/20 animate-pulse" />
            <div className="absolute inset-[3px] rounded-full bg-background/60 backdrop-blur" />
          </div>
          <p className="text-[13px] text-muted-foreground leading-snug">
            {isHe
              ? 'דבר/י איתי. אני אארגן את המשמעות.'
              : 'Talk to me. I’ll organize the meaning.'}
          </p>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isHe ? 'מה עובר עליך עכשיו…' : 'What’s on your mind…'}
          rows={5}
          className="resize-none bg-background/40 border-white/[0.06] rounded-2xl text-[14.5px] leading-relaxed focus-visible:ring-1 focus-visible:ring-primary/40"
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/70">
            {isHe ? '⌘↵ לשמירה' : '⌘↵ to save'}
          </span>
          <Button
            size="sm"
            onClick={onSave}
            disabled={!text.trim() || saving}
            className="rounded-full px-4"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 me-1.5" />
                {isHe ? 'שמור' : 'Save'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Timeline — unified, no category sections */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 text-[13px] text-muted-foreground/70">
            {isHe
              ? 'הזיכרון עוד שקט. כל מה שתשתף/י כאן או עם AION יישמר אוטומטית.'
              : 'Memory is quiet. Anything you share here — or with AION — is saved automatically.'}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isHe={isHe}
                locale={locale}
                onDelete={() => onDelete(entry.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  isHe,
  locale,
  onDelete,
}: {
  entry: JournalEntry;
  isHe: boolean;
  locale: Locale;
  onDelete: () => void;
}) {
  const cat = CATEGORY_LABEL[entry.journal_type];
  const catLabel = cat ? (isHe ? cat.he : cat.en) : entry.journal_type;
  const title = entry.title || entry.summary || entry.content.slice(0, 80);
  const body = entry.summary || entry.content;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group rounded-2xl bg-card/50 ring-1 ring-white/[0.05] p-3.5 hover:ring-white/[0.1] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground/80 font-medium">
            {catLabel}
          </span>
          {entry.source === 'aion' && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary/80 font-medium">
              AION
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60">
            {format(new Date(entry.created_at), 'PPp', { locale })}
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete entry"
          className="opacity-0 group-hover:opacity-100 text-muted-foreground/60 hover:text-destructive transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {entry.title && (
        <h3 className="text-[14px] font-semibold leading-snug text-foreground mb-1">
          {title}
        </h3>
      )}
      <p className="text-[13.5px] text-foreground/85 leading-relaxed whitespace-pre-wrap">
        {body}
      </p>

      {entry.ai_insight && (
        <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-primary/[0.06] px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-primary/80 mt-0.5 shrink-0" />
          <p className="text-[12.5px] text-foreground/80 leading-snug">
            {entry.ai_insight}
          </p>
        </div>
      )}

      {(entry.tags?.length || entry.mood) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {entry.mood && (
            <span className="text-[10.5px] text-muted-foreground/80 px-1.5 py-0.5 rounded bg-muted/30">
              {entry.mood}
            </span>
          )}
          {entry.tags?.slice(0, 6).map((t) => (
            <span key={t} className="text-[10.5px] text-muted-foreground/70">
              #{t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
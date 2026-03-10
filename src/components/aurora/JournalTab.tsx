/**
 * JournalTab — Reusable journal tab for Dream, Reflection, and Gratitude entries.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useJournalEntries, useCreateJournalEntry, useDeleteJournalEntry } from '@/hooks/useJournalEntries';
import type { JournalType } from '@/services/journalEntries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Moon, Sun, Heart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

const JOURNAL_CONFIG: Record<JournalType, {
  titleHe: string; titleEn: string;
  placeholderHe: string; placeholderEn: string;
  emptyHe: string; emptyEn: string;
  icon: typeof Moon;
}> = {
  dream: {
    titleHe: 'יומן חלומות', titleEn: 'Dream Journal',
    placeholderHe: 'ספר/י על החלום שלך...', placeholderEn: 'Describe your dream...',
    emptyHe: 'אין חלומות מתועדים עדיין. שתפ/י את החלום הראשון שלך!', emptyEn: 'No dreams logged yet. Share your first dream!',
    icon: Moon,
  },
  reflection: {
    titleHe: 'רפלקציה יומית', titleEn: 'Daily Reflection',
    placeholderHe: 'מה למדת היום? מה עבד טוב? מה תשפר/י?', placeholderEn: 'What did you learn today? What went well? What will you improve?',
    emptyHe: 'אין רפלקציות עדיין. התחל/י לכתוב!', emptyEn: 'No reflections yet. Start writing!',
    icon: Sun,
  },
  gratitude: {
    titleHe: 'יומן הכרת תודה', titleEn: 'Gratitude Journal',
    placeholderHe: 'על מה את/ה אסיר/ת תודה היום?', placeholderEn: 'What are you grateful for today?',
    emptyHe: 'אין רשומות הכרת תודה. שתפ/י על מה את/ה מודה!', emptyEn: 'No gratitude entries. Share what you\'re thankful for!',
    icon: Heart,
  },
};

export function JournalTab({ type }: { type: JournalType }) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const config = JOURNAL_CONFIG[type];
  const Icon = config.icon;

  const { data: entries = [], isLoading } = useJournalEntries(type);
  const createMut = useCreateJournalEntry();
  const deleteMut = useDeleteJournalEntry(type);
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    createMut.mutate(
      { journal_type: type, content: content.trim() },
      {
        onSuccess: () => {
          setContent('');
          setIsOpen(false);
          toast.success(isHe ? 'נשמר!' : 'Saved!');
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold">{isHe ? config.titleHe : config.titleEn}</h3>
            <p className="text-[10px] text-muted-foreground">
              {entries.length} {isHe ? 'רשומות' : 'entries'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={isOpen ? 'secondary' : 'default'}
          onClick={() => setIsOpen(!isOpen)}
          className="gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          {isHe ? 'חדש' : 'New'}
        </Button>
      </div>

      {/* New entry form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="p-4 space-y-3">
              <Textarea
                placeholder={isHe ? config.placeholderHe : config.placeholderEn}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); setContent(''); }}>
                  {isHe ? 'ביטול' : 'Cancel'}
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={createMut.isPending || !content.trim()}>
                  {createMut.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                  {isHe ? 'שמור' : 'Save'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Icon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{isHe ? config.emptyHe : config.emptyEn}</p>
            </div>
          ) : (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap flex-1">{entry.content}</p>
                  <button
                    onClick={() => deleteMut.mutate(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {format(new Date(entry.created_at), 'PPp', { locale: isHe ? he : enUS })}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

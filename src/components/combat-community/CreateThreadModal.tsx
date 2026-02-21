import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGameState } from '@/contexts/GameStateContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const THREAD_CATEGORIES = [
  { nameEn: 'Striking', nameHe: 'הכאה', icon: '🥊' },
  { nameEn: 'Grappling', nameHe: 'היאבקות', icon: '🤼' },
  { nameEn: 'Tactical', nameHe: 'טקטיקה', icon: '🧠' },
  { nameEn: 'Weapons', nameHe: 'נשק', icon: '🗡️' },
  { nameEn: 'Conditioning', nameHe: 'כושר לחימה', icon: '💪' },
  { nameEn: 'Solo Training', nameHe: 'אימון עצמאי', icon: '🎯' },
  { nameEn: 'Mistake Analysis', nameHe: 'ניתוח טעויות', icon: '⚠️' },
  { nameEn: 'Sparring IQ', nameHe: 'IQ קרב', icon: '♟️' },
  { nameEn: 'Biomechanics', nameHe: 'ביומכניקה', icon: '⚙️' },
];

interface CreateThreadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateThreadModal({ open, onOpenChange }: CreateThreadModalProps) {
  const { t, language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addEnergy } = useGameState();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = selectedCategory && title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async () => {
    if (!user?.id || !canSubmit) return;
    setSubmitting(true);

    try {
      // Find the category ID
      const { data: catData } = await supabase
        .from('community_categories')
        .select('id')
        .eq('name_en', selectedCategory)
        .single();

      if (!catData) throw new Error('Category not found');

      // Create the post
      const { data: post, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          category_id: catData.id,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Aurora auto-reply
      if (post) {
        const auroraReply = generateAuroraReply(selectedCategory, title.trim(), content.trim().slice(0, 200), isHe);
        await supabase
          .from('community_comments')
          .insert({
            post_id: post.id,
            user_id: user.id, // Will show as Aurora via is_aurora flag approach
            content: auroraReply,
          });
      }

      // Award energy
      await addEnergy(8, 'combat_community', 'Created combat thread');
      toast.success(t('combatCommunity.threadCreated'));
      toast('+8 Energy ⚡', { duration: 2000 });

      queryClient.invalidateQueries({ queryKey: ['combat-threads'] });
      queryClient.invalidateQueries({ queryKey: ['combat-daily-limit'] });

      // Reset
      setSelectedCategory('');
      setTitle('');
      setContent('');
      onOpenChange(false);
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('combatCommunity.newThread')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Category */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              {t('combatCommunity.selectCategory')}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {THREAD_CATEGORIES.map((cat) => (
                <button
                  key={cat.nameEn}
                  onClick={() => setSelectedCategory(cat.nameEn)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                    selectedCategory === cat.nameEn
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span>{cat.icon}</span>
                  <span>{isHe ? cat.nameHe : cat.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Title */}
          <div>
            <Label className="text-sm text-muted-foreground mb-1 block">
              {t('combatCommunity.threadTitle')}
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              placeholder={t('combatCommunity.threadTitlePlaceholder')}
              maxLength={120}
              dir={isHe ? 'rtl' : 'ltr'}
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block text-end">
              {title.length}/120
            </span>
          </div>

          {/* Step 3: Content */}
          <div>
            <Label className="text-sm text-muted-foreground mb-1 block">
              {t('combatCommunity.threadContent')}
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('combatCommunity.threadContentPlaceholder')}
              rows={5}
              dir={isHe ? 'rtl' : 'ltr'}
            />
          </div>

          <Button
            className="w-full"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
          >
            {submitting ? t('common.loading') : t('combatCommunity.publishThread')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Deterministic Aurora auto-reply based on category + title + content snippet */
function generateAuroraReply(category: string, title: string, snippet: string, isHe: boolean): string {
  const summaryTemplates: Record<string, { en: string; he: string }> = {
    'Striking': { en: 'Striking technique thread.', he: 'שרשור טכניקת הכאה.' },
    'Grappling': { en: 'Ground game discussion.', he: 'דיון על משחק קרקע.' },
    'Tactical': { en: 'Tactical breakdown.', he: 'פירוק טקטי.' },
    'Weapons': { en: 'Weapons training thread.', he: 'שרשור אימון נשק.' },
    'Conditioning': { en: 'Combat conditioning focus.', he: 'מיקוד בכושר לחימה.' },
    'Solo Training': { en: 'Solo drill breakdown.', he: 'פירוק דריל סולו.' },
    'Mistake Analysis': { en: 'Mistake pattern identified.', he: 'דפוס טעות זוהה.' },
    'Sparring IQ': { en: 'Sparring intelligence thread.', he: 'שרשור אינטליגנציה קרבית.' },
    'Biomechanics': { en: 'Movement analysis.', he: 'ניתוח תנועה.' },
  };

  const drills: Record<string, { en: string; he: string }> = {
    'Striking': { en: '3x2min shadow boxing focusing on guard return after each combination.', he: '3x2 דקות שדו בוקסינג עם חזרת גארד אחרי כל קומבינציה.' },
    'Grappling': { en: 'Positional sparring: start from half guard, 5 rounds of 3min.', he: 'ספארינג פוזיציוני: התחלה מחצי גארד, 5 סיבובים של 3 דקות.' },
    'Tactical': { en: 'Film study: watch 3 rounds of a fighter with similar style, note patterns.', he: 'צפייה בסרטון: צפו ב-3 סיבובים של לוחם בסגנון דומה, סמנו דפוסים.' },
    'Weapons': { en: 'Kata practice: 50 reps of basic strikes with focus on edge alignment.', he: 'תרגול קאטה: 50 חזרות של מכות בסיסיות עם מיקוד ביישור.' },
    'Conditioning': { en: 'Tabata protocol: 8 rounds of sprawls (20s work / 10s rest).', he: 'פרוטוקול טבאטה: 8 סיבובים של ספרולים (20 שניות עבודה / 10 מנוחה).' },
    'Solo Training': { en: 'Footwork ladder: 3 sets of in-out-lateral, 30 seconds each.', he: 'סולם עבודת רגליים: 3 סטים של פנימה-החוצה-צד, 30 שניות כל אחד.' },
    'Mistake Analysis': { en: 'Record your next 3 rounds. Watch at 0.5x speed. Note the first mistake in each.', he: 'הקליטו את 3 הסיבובים הבאים. צפו ב-0.5 מהירות. סמנו את הטעות הראשונה בכל אחד.' },
    'Sparring IQ': { en: 'Next sparring: set one rule — only react, don\'t initiate for round 1.', he: 'ספארינג הבא: כלל אחד — רק להגיב, לא ליזום בסיבוב 1.' },
    'Biomechanics': { en: 'Hip rotation drill: 30 slow-motion crosses focusing on hip-shoulder chain.', he: 'דריל סיבוב מותניים: 30 קרוסים באיטיות עם מיקוד בשרשרת מותניים-כתף.' },
  };

  const summary = summaryTemplates[category] || { en: 'Combat discussion.', he: 'דיון לחימה.' };
  const drill = drills[category] || { en: 'Shadow work: 3x3min rounds, focus on technique.', he: 'עבודת צל: 3 סיבובים של 3 דקות, מיקוד בטכניקה.' };

  if (isHe) {
    return `🤖 **Aurora**

🧠 **סיכום:** ${summary.he} "${title}"

🔎 **מנוף מרכזי:** הנקודה המכרעת כאן היא לא מה שנראה על פני השטח — אלא מה קורה ברגע שלפני.

⚔️ **דריל מוצע:** ${drill.he}

🎯 **שאלה:** מה הדבר הראשון שאתה מרגיש ששובר לך את הביצוע — עייפות, חוסר ביטחון, או תזמון?`;
  }

  return `🤖 **Aurora**

🧠 **Summary:** ${summary.en} "${title}"

🔎 **Core Lever:** The decisive factor here isn't what's on the surface — it's what happens in the moment before.

⚔️ **Suggested Drill:** ${drill.en}

🎯 **Question:** What's the first thing you feel breaks your execution — fatigue, lack of confidence, or timing?`;
}

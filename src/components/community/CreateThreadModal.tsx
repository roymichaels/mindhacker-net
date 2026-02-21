import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGameState } from '@/contexts/GameStateContext';
import { toast } from 'sonner';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import { PILLAR_SUBCATEGORIES, generateAuroraReply } from '@/lib/communityHelpers';
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

const PILLAR_ICONS: Record<string, string> = {
  consciousness: '🔮', presence: '👁️', power: '💪', vitality: '☀️',
  focus: '🎯', combat: '⚔️', expansion: '🧠', wealth: '📈',
  influence: '👑', relationships: '🤝', business: '💼', projects: '📋', play: '🎮',
};

interface CreateThreadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPillar?: string;
}

export default function CreateThreadModal({ open, onOpenChange, defaultPillar }: CreateThreadModalProps) {
  const { t, language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addEnergy } = useGameState();
  
  const [selectedPillar, setSelectedPillar] = useState(defaultPillar || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subcategories = selectedPillar ? PILLAR_SUBCATEGORIES[selectedPillar] || [] : [];
  const canSubmit = selectedPillar && title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async () => {
    if (!user?.id || !canSubmit) return;
    setSubmitting(true);

    try {
      // Find sub-category ID if selected
      let categoryId: string | null = null;
      if (selectedSubCategory) {
        const subCat = subcategories.find(s => s.id === selectedSubCategory);
        if (subCat) {
          const { data: catData } = await supabase
            .from('community_categories')
            .select('id')
            .eq('name_en', subCat.en)
            .single();
          categoryId = catData?.id || null;
        }
      }

      // Create the post with 'pending' status (Aurora gate)
      const { data: post, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId,
          pillar: selectedPillar,
          status: 'pending',
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      // Aurora auto-approves and replies (simulated gate)
      if (post) {
        const auroraReply = generateAuroraReply(selectedPillar, selectedSubCategory, title.trim(), content.trim().slice(0, 200), isHe);
        
        // Approve the post
        await supabase
          .from('community_posts')
          .update({ status: 'approved' } as any)
          .eq('id', post.id);

        // Aurora comment
        await supabase
          .from('community_comments')
          .insert({
            post_id: post.id,
            user_id: user.id,
            content: auroraReply,
            is_aurora: true,
          } as any);

        // Energy awarded AFTER approval
        await addEnergy(8, 'community', 'Created community thread');
        toast.success(isHe ? 'השרשור אושר על ידי Aurora' : 'Thread approved by Aurora');
        toast('+8 Energy ⚡', { duration: 2000 });
      }

      queryClient.invalidateQueries({ queryKey: ['community-threads'] });
      queryClient.invalidateQueries({ queryKey: ['community-daily-limit'] });

      // Reset
      setSelectedPillar('');
      setSelectedSubCategory('');
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('combatCommunity.newThread')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Pillar */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              {isHe ? 'בחר פילר' : 'Select Pillar'}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {LIFE_DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => { setSelectedPillar(domain.id); setSelectedSubCategory(''); }}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                    selectedPillar === domain.id
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span>{PILLAR_ICONS[domain.id]}</span>
                  <span>{isHe ? domain.labelHe : domain.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 1b: Sub-category (if pillar has them) */}
          {subcategories.length > 0 && (
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                {isHe ? 'תת-קטגוריה (אופציונלי)' : 'Sub-category (optional)'}
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCategory(sub.id === selectedSubCategory ? '' : sub.id)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
                      selectedSubCategory === sub.id
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    <span>{sub.icon}</span>
                    <span>{isHe ? sub.he : sub.en}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
            {submitting 
              ? t('common.loading') 
              : (isHe ? '🤖 שלח לאישור Aurora' : '🤖 Submit for Aurora Review')
            }
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            {isHe ? 'Aurora תאשר ותגיב אוטומטית לשרשור שלך' : 'Aurora will review and auto-reply to your thread'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

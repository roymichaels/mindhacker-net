/**
 * CreateStoryModal — Instagram-style story creation flow.
 * Step 1: Pick pillar → Step 2: Pick subcategory → Step 3: Upload media + caption
 */
import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Camera, Image as ImageIcon, Upload, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import { PILLAR_SUBCATEGORIES, type PillarSubcategory } from '@/lib/communityHelpers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'pillar' | 'topic' | 'upload';

const GRADIENT_MAP: Record<string, string> = {
  violet: 'from-violet-500 to-violet-700',
  fuchsia: 'from-fuchsia-500 to-pink-600',
  red: 'from-red-500 to-red-700',
  amber: 'from-amber-500 to-orange-600',
  cyan: 'from-cyan-500 to-cyan-700',
  slate: 'from-slate-500 to-slate-700',
  indigo: 'from-indigo-500 to-indigo-700',
  emerald: 'from-emerald-500 to-emerald-700',
  purple: 'from-purple-500 to-purple-700',
  sky: 'from-sky-500 to-sky-700',
  orange: 'from-orange-500 to-orange-700',
  blue: 'from-blue-500 to-blue-700',
  lime: 'from-lime-500 to-lime-700',
  teal: 'from-teal-500 to-teal-700',
  rose: 'from-rose-500 to-rose-700',
  pink: 'from-pink-500 to-pink-700',
};

export default function CreateStoryModal({ open, onOpenChange }: CreateStoryModalProps) {
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('pillar');
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<PillarSubcategory | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('pillar');
    setSelectedPillar(null);
    setSelectedTopic(null);
    setMediaFile(null);
    setMediaPreview(null);
    setCaption('');
    setIsUploading(false);
  }, []);

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error(isHe ? 'הקובץ גדול מדי (מקסימום 20MB)' : 'File too large (max 20MB)');
      return;
    }
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user || !selectedPillar || !selectedTopic || !mediaFile) return;
    setIsUploading(true);

    try {
      // Upload media to storage
      const ext = mediaFile.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('community-stories')
        .upload(path, mediaFile, { contentType: mediaFile.type });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community-stories')
        .getPublicUrl(path);

      // Find or create category
      let categoryId: string | null = null;
      const { data: existingCat } = await supabase
        .from('community_categories')
        .select('id')
        .eq('name_en', selectedTopic.en)
        .maybeSingle();

      if (existingCat) {
        categoryId = existingCat.id;
      } else {
        const { data: newCat } = await supabase
          .from('community_categories')
          .insert({
            name: selectedTopic.he,
            name_en: selectedTopic.en,
            icon: selectedTopic.icon,
            is_active: true,
          })
          .select('id')
          .single();
        categoryId = newCat?.id || null;
      }

      // Create story post
      const { error: postError } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: caption || (isHe ? 'סטורי חדש' : 'New story'),
          pillar: selectedPillar,
          category_id: categoryId,
          media_urls: [publicUrl],
          status: 'approved',
          post_type: 'story',
        } as any);

      if (postError) throw postError;

      toast.success(isHe ? 'הסטורי פורסם! 🎉' : 'Story published! 🎉');
      queryClient.invalidateQueries({ queryKey: ['community-threads'] });
      queryClient.invalidateQueries({ queryKey: ['community-stories'] });
      close();
    } catch (err) {
      console.error('Story upload failed:', err);
      toast.error(isHe ? 'שגיאה בהעלאת הסטורי' : 'Failed to upload story');
    } finally {
      setIsUploading(false);
    }
  };

  const subcategories = selectedPillar ? (PILLAR_SUBCATEGORIES[selectedPillar] || []) : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col" style={{ backgroundColor: 'hsl(var(--background))' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={step === 'pillar' ? close : () => setStep(step === 'upload' ? 'topic' : 'pillar')}
          className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          {step === 'pillar' ? (
            <X className="w-5 h-5 text-foreground" />
          ) : (
            <ChevronLeft className={cn("w-5 h-5 text-foreground", isRTL && "rotate-180")} />
          )}
        </button>
        <h2 className="text-base font-bold text-foreground">
          {step === 'pillar' && (isHe ? 'בחר תחום' : 'Choose Pillar')}
          {step === 'topic' && (isHe ? 'בחר נושא' : 'Choose Topic')}
          {step === 'upload' && (isHe ? 'צור סטורי' : 'Create Story')}
        </h2>
        <div className="w-9" />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 px-4 pb-3">
        {['pillar', 'topic', 'upload'].map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= ['pillar', 'topic', 'upload'].indexOf(step) ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {/* Step 1: Pick Pillar */}
          {step === 'pillar' && (
            <motion.div
              key="pillar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-2 gap-3"
            >
              {LIFE_DOMAINS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedPillar(d.id); setStep('topic'); }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-4 text-start transition-all active:scale-[0.98]",
                    "border border-border/30 hover:border-primary/40"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 opacity-10 bg-gradient-to-br",
                    GRADIENT_MAP[d.color] || 'from-primary to-primary/80'
                  )} />
                  <div className="relative">
                    <d.icon className="h-6 w-6 mb-2 text-foreground/80" />
                    <p className="text-sm font-bold text-foreground">
                      {isHe ? d.labelHe : d.labelEn}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 2: Pick Subcategory */}
          {step === 'topic' && (
            <motion.div
              key="topic"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-2"
            >
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => { setSelectedTopic(sub); setStep('upload'); }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border/30 hover:border-primary/40 hover:bg-muted/30 transition-all active:scale-[0.99] text-start"
                >
                  <span className="text-xl">{sub.icon}</span>
                  <span className="text-sm font-medium text-foreground">
                    {isHe ? sub.he : sub.en}
                  </span>
                </button>
              ))}
              {subcategories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {isHe ? 'אין נושאים זמינים' : 'No topics available'}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Upload Media */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Selected context */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {LIFE_DOMAINS.find(d => d.id === selectedPillar)
                    ? (isHe ? LIFE_DOMAINS.find(d => d.id === selectedPillar)!.labelHe : LIFE_DOMAINS.find(d => d.id === selectedPillar)!.labelEn)
                    : selectedPillar}
                </span>
                <span>→</span>
                <span className="px-2 py-1 rounded-full bg-muted/50 font-medium">
                  {selectedTopic?.icon} {isHe ? selectedTopic?.he : selectedTopic?.en}
                </span>
              </div>

              {/* Media upload area */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {mediaPreview ? (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[60vh] mx-auto">
                  {mediaFile?.type.startsWith('video') ? (
                    <video
                      src={mediaPreview}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Story preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                    className="absolute top-3 end-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[9/16] max-h-[50vh] rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-muted/30 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">
                      {isHe ? 'הוסף תמונה או סרטון' : 'Add photo or video'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isHe ? 'לחץ לבחירה מהגלריה' : 'Tap to choose from gallery'}
                    </p>
                  </div>
                </button>
              )}

              {/* Caption */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={isHe ? 'כתוב משהו...' : 'Write something...'}
                className="w-full bg-muted/30 rounded-xl border border-border/30 p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                rows={3}
                maxLength={500}
              />

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!mediaFile || isUploading}
                className="w-full gap-2"
                size="lg"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isHe ? 'פרסם סטורי' : 'Publish Story'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

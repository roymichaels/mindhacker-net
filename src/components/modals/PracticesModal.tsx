/**
 * PracticesModal — Fullscreen practice management panel.
 * Shows active practices grid, detail view with stats,
 * add wizard, and remove capability.
 * Matches the Royal Empire aesthetic of CharacterProfileModal.
 */
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAutoPopulatePractices } from '@/hooks/useAutoPopulatePractices';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useUserPractices,
  usePracticeLibrary,
  useAddPractice,
  useRemovePractice,
  useUpdatePractice,
  PRACTICE_CATEGORIES,
  ENERGY_PHASE_META,
  type UserPractice,
  type PracticeLibraryItem,
} from '@/hooks/useUserPractices';
import { PILLAR_COLORS } from '@/hooks/useTraitGallery';
import {
  X, ChevronLeft, Plus, Trash2, Clock, Repeat, Zap,
  Loader2, CheckCircle2, Dumbbell, Sparkles, Settings2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PILLAR_LABELS_HE: Record<string, string> = {
  consciousness: 'תודעה', presence: 'נוכחות', power: 'כוח', vitality: 'חיוניות',
  focus: 'מיקוד', combat: 'לחימה', expansion: 'התרחבות', wealth: 'עושר',
  influence: 'השפעה', relationships: 'מערכות יחסים', business: 'עסקים',
  projects: 'פרויקטים', play: 'משחק', order: 'סדר',
};
const PILLAR_LABELS_EN: Record<string, string> = {
  consciousness: 'Consciousness', presence: 'Presence', power: 'Power', vitality: 'Vitality',
  focus: 'Focus', combat: 'Combat', expansion: 'Expansion', wealth: 'Wealth',
  influence: 'Influence', relationships: 'Relationships', business: 'Business',
  projects: 'Projects', play: 'Play', order: 'Order',
};

interface PracticesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PracticesModal({ open, onOpenChange }: PracticesModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [view, setView] = useState<'gallery' | 'detail' | 'add'>('gallery');
  const [selectedPractice, setSelectedPractice] = useState<UserPractice | null>(null);
  const { isPopulating } = useAutoPopulatePractices(open);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(180deg, hsl(220 25% 6%) 0%, hsl(225 20% 10%) 40%, hsl(220 25% 6%) 100%)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 z-10">
        <button
          onClick={() => {
            if (view !== 'gallery') {
              setView('gallery');
              setSelectedPractice(null);
            } else {
              onOpenChange(false);
            }
          }}
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          {view !== 'gallery' ? (
            <ChevronLeft className="w-5 h-5 text-white/70" />
          ) : (
            <X className="w-5 h-5 text-white/70" />
          )}
        </button>
        <h2 className="text-base font-bold text-white/90 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-amber-400" />
          {isHe ? 'תרגולים' : 'Practices'}
        </h2>
        {view === 'gallery' ? (
          <button
            onClick={() => setView('add')}
            className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-amber-400" />
          </button>
        ) : (
          <div className="w-9" /> // spacer
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-24">
        <AnimatePresence mode="wait">
          {view === 'gallery' && (
            <PracticesGallery
              key="gallery"
              isHe={isHe}
              onSelect={(p) => { setSelectedPractice(p); setView('detail'); }}
            />
          )}
          {view === 'detail' && selectedPractice && (
            <PracticeDetail
              key="detail"
              practice={selectedPractice}
              isHe={isHe}
              onBack={() => { setView('gallery'); setSelectedPractice(null); }}
              onRemoved={() => { setView('gallery'); setSelectedPractice(null); }}
            />
          )}
          {view === 'add' && (
            <AddPracticeWizard
              key="add"
              isHe={isHe}
              onDone={() => setView('gallery')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body,
  );
}

// ═══════════════════════════════════════════════════
// PRACTICES GALLERY — Grid of active practices
// ═══════════════════════════════════════════════════
function PracticesGallery({ isHe, onSelect }: { isHe: boolean; onSelect: (p: UserPractice) => void }) {
  const { data: practices, isLoading } = useUserPractices();

  // Group by category
  const grouped = useMemo(() => {
    if (!practices) return new Map<string, UserPractice[]>();
    const map = new Map<string, UserPractice[]>();
    for (const p of practices) {
      const cat = p.practice?.category || 'other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return map;
  }, [practices]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-white/30" />
        </div>
      ) : !practices || practices.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Dumbbell className="w-10 h-10 text-white/10 mx-auto" />
          <p className="text-sm text-white/40">
            {isHe ? 'אין תרגולים פעילים עדיין' : 'No active practices yet'}
          </p>
          <p className="text-xs text-white/25">
            {isHe ? 'לחץ + להוספת תרגולים לתוכנית' : 'Tap + to add practices to your plan'}
          </p>
        </div>
      ) : (
        <div className="space-y-5 pt-2">
          {Array.from(grouped.entries()).map(([category, items]) => {
            const catMeta = PRACTICE_CATEGORIES[category] || { he: category, en: category, emoji: '📌' };
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-base">{catMeta.emoji}</span>
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                    {isHe ? catMeta.he : catMeta.en}
                  </span>
                  <span className="text-[10px] text-white/20">{items.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {items.map((up, i) => (
                    <PracticeCard key={up.id} practice={up} isHe={isHe} index={i} onClick={() => onSelect(up)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// PRACTICE CARD — NFT-style card in grid
// ═══════════════════════════════════════════════════
function PracticeCard({ practice, isHe, index, onClick }: {
  practice: UserPractice; isHe: boolean; index: number; onClick: () => void;
}) {
  const p = practice.practice;
  const pillarColor = PILLAR_COLORS[p?.pillar] || '200 70% 50%';
  const phaseMeta = ENERGY_PHASE_META[practice.energy_phase] || ENERGY_PHASE_META.day;
  const name = isHe ? (p?.name_he || p?.name || '?') : (p?.name || '?');

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-xl border p-2",
        "flex flex-col items-center justify-center gap-1",
        "transition-all duration-200 cursor-pointer group",
        "hover:scale-[1.03] active:scale-[0.97]",
        "bg-white/[0.03] border-white/[0.08] backdrop-blur-sm",
      )}
      style={{
        boxShadow: `0 0 16px hsla(${pillarColor}, 0.12), inset 0 1px 0 hsla(${pillarColor}, 0.08)`,
      }}
    >
      {/* Category emoji */}
      <span className="text-2xl">{PRACTICE_CATEGORIES[p?.category]?.emoji || '📌'}</span>

      {/* Name */}
      <span className="text-[10px] font-bold text-white/80 text-center leading-tight line-clamp-2">
        {name}
      </span>

      {/* Bottom badges */}
      <div className="flex items-center gap-1">
        <span
          className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: `hsla(${pillarColor}, 0.12)`,
            color: `hsl(${pillarColor})`,
          }}
        >
          {isHe ? PILLAR_LABELS_HE[p?.pillar] : PILLAR_LABELS_EN[p?.pillar] || p?.pillar}
        </span>
        <span className="text-[7px] text-white/30">{phaseMeta.emoji}</span>
      </div>

      {/* Core badge */}
      {practice.is_core_practice && (
        <div className="absolute top-1 end-1 w-3 h-3 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Sparkles className="w-2 h-2 text-amber-400" />
        </div>
      )}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════
// PRACTICE DETAIL — Full info + settings + remove
// ═══════════════════════════════════════════════════
function PracticeDetail({ practice, isHe, onBack, onRemoved }: {
  practice: UserPractice; isHe: boolean; onBack: () => void; onRemoved: () => void;
}) {
  const { toast } = useToast();
  const removePractice = useRemovePractice();
  const updatePractice = useUpdatePractice();
  const p = practice.practice;
  const pillarColor = PILLAR_COLORS[p?.pillar] || '200 70% 50%';
  const name = isHe ? (p?.name_he || p?.name || '?') : (p?.name || '?');
  const phaseMeta = ENERGY_PHASE_META[practice.energy_phase] || ENERGY_PHASE_META.day;

  const handleRemove = async () => {
    try {
      await removePractice.mutateAsync(practice.id);
      toast({ title: isHe ? '✅ תרגול הוסר' : '✅ Practice removed' });
      onRemoved();
    } catch {
      toast({ title: isHe ? 'שגיאה בהסרה' : 'Failed to remove', variant: 'destructive' });
    }
  };

  const handleToggleCore = async () => {
    await updatePractice.mutateAsync({ id: practice.id, is_core_practice: !practice.is_core_practice });
  };

  const frequencyOptions = [1, 2, 3, 4, 5, 6, 7];
  const durationOptions = [5, 10, 15, 20, 30, 45, 60];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-4 pb-6">
        <span className="text-5xl mb-3">{PRACTICE_CATEGORIES[p?.category]?.emoji || '📌'}</span>
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: `hsla(${pillarColor}, 0.15)`, color: `hsl(${pillarColor})` }}
          >
            {isHe ? PILLAR_LABELS_HE[p?.pillar] : PILLAR_LABELS_EN[p?.pillar]}
          </span>
          <span className="text-xs text-white/40 flex items-center gap-1">
            {phaseMeta.emoji} {isHe ? phaseMeta.he : phaseMeta.en}
          </span>
          {practice.is_core_practice && (
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" /> {isHe ? 'ליבה' : 'Core'}
            </span>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <StatCard
          icon={<Clock className="w-4 h-4 text-blue-400" />}
          value={`${practice.preferred_duration}′`}
          label={isHe ? 'משך' : 'Duration'}
        />
        <StatCard
          icon={<Repeat className="w-4 h-4 text-emerald-400" />}
          value={`${practice.frequency_per_week}x`}
          label={isHe ? 'לשבוע' : '/Week'}
        />
        <StatCard
          icon={<Zap className="w-4 h-4 text-amber-400" />}
          value={`Lv.${practice.skill_level}`}
          label={isHe ? 'רמה' : 'Level'}
        />
      </div>

      {/* Instructions */}
      {(p?.instructions || p?.instructions_he) && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 mb-4">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5">
            {isHe ? 'הנחיות' : 'Instructions'}
          </p>
          <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
            {isHe ? (p?.instructions_he || p?.instructions) : p?.instructions}
          </p>
        </div>
      )}

      {/* Traits connection */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 mb-4">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5">
          {isHe ? 'עמוד ותכונות' : 'Pillar & Traits'}
        </p>
        <p className="text-xs text-white/60">
          {isHe
            ? `תרגול זה מקדם את עמוד ה${PILLAR_LABELS_HE[p?.pillar] || p?.pillar}. ביצוע עקבי מתורגם למשימות ואבני דרך בתוכנית ה-100 ימים.`
            : `This practice advances the ${PILLAR_LABELS_EN[p?.pillar] || p?.pillar} pillar. Consistent execution translates to missions and milestones in your 100-day plan.`}
        </p>
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="w-3.5 h-3.5 text-white/30" />
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
            {isHe ? 'הגדרות' : 'Settings'}
          </p>
        </div>

        {/* Duration selector */}
        <div className="mb-3">
          <p className="text-[10px] text-white/40 mb-1.5">{isHe ? 'משך (דקות)' : 'Duration (min)'}</p>
          <div className="flex gap-1.5 flex-wrap">
            {durationOptions.map(d => (
              <button
                key={d}
                onClick={() => updatePractice.mutate({ id: practice.id, preferred_duration: d })}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all",
                  practice.preferred_duration === d
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60"
                )}
              >
                {d}′
              </button>
            ))}
          </div>
        </div>

        {/* Frequency selector */}
        <div className="mb-3">
          <p className="text-[10px] text-white/40 mb-1.5">{isHe ? 'תדירות (פעמים בשבוע)' : 'Frequency (per week)'}</p>
          <div className="flex gap-1.5">
            {frequencyOptions.map(f => (
              <button
                key={f}
                onClick={() => updatePractice.mutate({ id: practice.id, frequency_per_week: f })}
                className={cn(
                  "w-8 h-8 rounded-lg text-[11px] font-bold border transition-all",
                  practice.frequency_per_week === f
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Core toggle */}
        <button
          onClick={handleToggleCore}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all w-full",
            practice.is_core_practice
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-white/[0.03] border-white/[0.06] text-white/40"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-xs font-medium flex-1 text-start">
            {isHe ? 'תרגול ליבה (תמיד בתוכנית)' : 'Core practice (always in plan)'}
          </span>
          {practice.is_core_practice && <CheckCircle2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        disabled={removePractice.isPending}
        className="flex items-center gap-2 w-full justify-center py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {isHe ? 'הסר מהתוכנית' : 'Remove from plan'}
      </button>
    </motion.div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col items-center gap-1">
      {icon}
      <span className="text-sm font-bold text-white">{value}</span>
      <span className="text-[9px] text-white/30">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ADD PRACTICE WIZARD — Browse & add from library
// ═══════════════════════════════════════════════════
function AddPracticeWizard({ isHe, onDone }: { isHe: boolean; onDone: () => void }) {
  const { data: library, isLoading } = usePracticeLibrary();
  const { data: existing } = useUserPractices();
  const addPractice = useAddPractice();
  const { toast } = useToast();
  const [adding, setAdding] = useState<string | null>(null);

  const existingIds = useMemo(() => new Set((existing || []).map(e => e.practice_id)), [existing]);

  // Group by category
  const grouped = useMemo(() => {
    if (!library) return new Map<string, PracticeLibraryItem[]>();
    const map = new Map<string, PracticeLibraryItem[]>();
    for (const p of library) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return map;
  }, [library]);

  const handleAdd = async (practice: PracticeLibraryItem) => {
    setAdding(practice.id);
    try {
      await addPractice.mutateAsync({
        practice_id: practice.id,
        energy_phase: practice.energy_type || 'day',
        preferred_duration: practice.default_duration || 15,
        frequency_per_week: 3,
      });
      toast({ title: isHe ? `✅ ${practice.name_he || practice.name} נוסף` : `✅ ${practice.name} added` });
    } catch {
      toast({ title: isHe ? 'שגיאה' : 'Error', variant: 'destructive' });
    } finally {
      setAdding(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
      <p className="text-sm text-white/50 text-center mb-4">
        {isHe ? 'בחר תרגולים להוספה לתוכנית שלך' : 'Choose practices to add to your plan'}
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-white/30" />
        </div>
      ) : (
        <div className="space-y-5">
          {Array.from(grouped.entries()).map(([category, items]) => {
            const catMeta = PRACTICE_CATEGORIES[category] || { he: category, en: category, emoji: '📌' };
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{catMeta.emoji}</span>
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                    {isHe ? catMeta.he : catMeta.en}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {items.map(p => {
                    const alreadyAdded = existingIds.has(p.id);
                    const name = isHe ? (p.name_he || p.name) : p.name;
                    const pillarColor = PILLAR_COLORS[p.pillar] || '200 70% 50%';
                    const isAdding = adding === p.id;
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all",
                          alreadyAdded
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                        )}
                      >
                        <span className="text-lg">{catMeta.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/80">{name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: `hsla(${pillarColor}, 0.12)`, color: `hsl(${pillarColor})` }}
                            >
                              {isHe ? PILLAR_LABELS_HE[p.pillar] : PILLAR_LABELS_EN[p.pillar]}
                            </span>
                            <span className="text-[9px] text-white/30">
                              {p.default_duration}′ · {ENERGY_PHASE_META[p.energy_type]?.emoji || '☀️'}
                            </span>
                          </div>
                        </div>
                        {alreadyAdded ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <button
                            onClick={() => handleAdd(p)}
                            disabled={isAdding}
                            className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                          >
                            {isAdding ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            ) : (
                              <Plus className="w-4 h-4 text-amber-400" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Done button */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-[hsl(220,25%,6%)] via-[hsl(220,25%,6%)] to-transparent">
        <button
          onClick={onDone}
          className="w-full py-3 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 text-sm font-bold hover:bg-amber-500/20 transition-all"
        >
          {isHe ? '✓ סיימתי' : '✓ Done'}
        </button>
      </div>
    </motion.div>
  );
}

export default PracticesModal;

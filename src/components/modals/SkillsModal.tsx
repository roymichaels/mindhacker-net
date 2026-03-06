/**
 * SkillsModal — Trait Gallery with NFT-style card grid.
 * Shows character traits as visual cards.
 * Clicking a trait opens its detail panel with missions/milestones.
 * NO LV/XP display — traits use mission/milestone progress instead.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useTraitGallery, PILLAR_COLORS, type TraitCard } from '@/hooks/useTraitGallery';
import { getTraitDisplayName } from '@/utils/traitNameSanitizer';
import { useTraitDetail } from '@/hooks/useTraitDetail';
import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles, ChevronLeft, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SkillsModal({ open, onOpenChange }: SkillsModalProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: traits, isLoading } = useTraitGallery();
  const [selectedTraitId, setSelectedTraitId] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0" dir={isHe ? 'rtl' : 'ltr'}>
        <AnimatePresence mode="wait">
          {selectedTraitId ? (
            <TraitDetailView
              key="detail"
              traitId={selectedTraitId}
              onBack={() => setSelectedTraitId(null)}
              isHe={isHe}
            />
          ) : (
            <TraitGalleryView
              key="gallery"
              traits={traits || []}
              isLoading={isLoading}
              isHe={isHe}
              onSelectTrait={setSelectedTraitId}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ========== Gallery Grid View ==========
function TraitGalleryView({
  traits,
  isLoading,
  isHe,
  onSelectTrait,
}: {
  traits: TraitCard[];
  isLoading: boolean;
  isHe: boolean;
  onSelectTrait: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="p-4"
    >
      <DialogHeader
        title={isHe ? 'תכונות' : 'Traits'}
        icon={<Sparkles className="h-5 w-5" />}
        showBackArrow={false}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          {isHe ? 'טוען...' : 'Loading...'}
        </div>
      ) : traits.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {isHe ? 'אין תכונות עדיין — צור תוכנית 100 יום כדי לפתוח תכונות!' : 'No traits yet — generate your 100-day plan to unlock traits!'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {traits.map((trait, i) => (
            <TraitCardComponent
              key={trait.id}
              trait={trait}
              isHe={isHe}
              index={i}
              onClick={() => onSelectTrait(trait.id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ========== Single Trait Card (Clean Style — No LV/XP) ==========
function TraitCardComponent({
  trait,
  isHe,
  index,
  onClick,
}: {
  trait: TraitCard;
  isHe: boolean;
  index: number;
  onClick: () => void;
}) {
  const pillarColor = PILLAR_COLORS[trait.pillar] || '200 70% 50%';
  const displayName = isHe ? trait.displayName : getTraitDisplayName(trait.name, trait.name_he, false);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-2xl border border-border/40 p-3",
        "flex flex-col items-center justify-center gap-1.5",
        "transition-all duration-300 cursor-pointer group",
        "hover:scale-[1.04] hover:shadow-lg active:scale-[0.98]",
        "bg-card/60 backdrop-blur-sm",
      )}
      style={{
        boxShadow: `0 0 20px hsla(${pillarColor}, 0.15), inset 0 1px 0 hsla(${pillarColor}, 0.1)`,
      }}
    >
      {/* Glow border on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 30px hsla(${pillarColor}, 0.3), inset 0 0 20px hsla(${pillarColor}, 0.05)`,
        }}
      />

      {/* Icon */}
      <span className="text-3xl sm:text-4xl">{trait.icon}</span>

      {/* Trait name */}
      <span className="text-[11px] sm:text-xs font-bold text-foreground text-center leading-tight line-clamp-2 mt-0.5 min-h-[2.2em]">
        {displayName || (isHe ? 'תכונה' : 'Trait')}
      </span>

      {/* Pillar badge */}
      <span
        className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: `hsla(${pillarColor}, 0.15)`,
          color: `hsl(${pillarColor})`,
        }}
      >
        {isHe ? PILLAR_LABELS_HE[trait.pillar] : PILLAR_LABELS_EN[trait.pillar] || trait.pillar}
      </span>
    </motion.button>
  );
}

// ========== Trait Detail View (No LV/XP) ==========
function TraitDetailView({
  traitId,
  onBack,
  isHe,
}: {
  traitId: string;
  onBack: () => void;
  isHe: boolean;
}) {
  const { data: detail, isLoading } = useTraitDetail(traitId);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  if (isLoading || !detail) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="p-4 flex items-center justify-center py-12 text-muted-foreground text-sm"
      >
        {isHe ? 'טוען...' : 'Loading...'}
      </motion.div>
    );
  }

  const pillarColor = PILLAR_COLORS[detail.pillar] || '200 70% 50%';
  const displayName = isHe ? getTraitDisplayName(detail.name, detail.name_he, true) : getTraitDisplayName(detail.name, detail.name_he, false);
  
  // Calculate mission/milestone stats
  const totalMilestones = detail.missions.reduce((s: number, m: any) => s + (m.milestones?.length || 0), 0);
  const completedMilestones = detail.missions.reduce((s: number, m: any) => s + (m.milestones?.filter((ms: any) => ms.is_completed)?.length || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="p-4"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        {isHe ? 'חזרה לגלריה' : 'Back to Gallery'}
      </button>

      {/* Trait Hero */}
      <div className="flex flex-col items-center text-center mb-6">
        <span className="text-5xl mb-3">{detail.icon}</span>

        <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
        
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `hsla(${pillarColor}, 0.15)`,
              color: `hsl(${pillarColor})`,
            }}
          >
            {detail.missions.length} {isHe ? 'משימות' : 'missions'}
          </span>
          <span className="text-xs text-muted-foreground">
            {completedMilestones}/{totalMilestones} {isHe ? 'אבני דרך' : 'milestones'}
          </span>
        </div>

        {detail.description && (
          <p className="text-xs text-muted-foreground mt-2 max-w-xs">
            {detail.description}
          </p>
        )}
      </div>

      {/* Missions */}
      {detail.missions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
            {isHe ? 'משימות אימון' : 'Training Missions'}
          </p>
          {detail.missions.map((mission) => {
            const missionTitle = isHe
              ? (mission.title || mission.title_en || '')
              : (mission.title_en || mission.title || '');
            const isExpanded = expandedMission === mission.id;
            const completedMs = mission.milestones.filter(m => m.is_completed).length;
            const totalMs = mission.milestones.length;

            return (
              <div key={mission.id} className="rounded-xl border border-border/30 overflow-hidden bg-card/30">
                <button
                  onClick={() => setExpandedMission(isExpanded ? null : mission.id)}
                  className="w-full flex items-center gap-2 p-3 text-start hover:bg-muted/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground line-clamp-2">{missionTitle}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {completedMs}/{totalMs} {isHe ? 'אבני דרך' : 'milestones'}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-1">
                        {mission.milestones.map((ms) => {
                          const msTitle = isHe
                            ? (ms.title || ms.title_en || '')
                            : (ms.title_en || ms.title || '');
                          return (
                            <div
                              key={ms.id}
                              className={cn(
                                "flex items-start gap-2 py-1.5 px-2 rounded-lg",
                                ms.is_completed ? "bg-primary/5" : "bg-muted/10"
                              )}
                            >
                              {ms.is_completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                              )}
                              <span className={cn(
                                "text-xs leading-snug",
                                ms.is_completed ? "text-foreground/50 line-through" : "text-foreground/80"
                              )}>
                                {msTitle}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

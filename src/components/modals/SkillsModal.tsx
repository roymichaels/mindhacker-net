/**
 * SkillsModal — Trait Gallery with NFT-style card grid.
 * Shows character traits as visual cards with XP rings.
 * Clicking a trait opens its detail panel with missions/milestones.
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

const XP_PER_LEVEL = 100;

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

// ========== Single Trait Card (NFT Style) ==========
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
  // CRITICAL: Always use sanitized displayName, never raw name
  const displayName = isHe ? trait.displayName : getTraitDisplayName(trait.name, trait.name_he, false);
  const circumference = 2 * Math.PI * 38; // radius 38
  const strokeDashoffset = circumference - (trait.xp_progress / 100) * circumference;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-2xl border border-border/40 p-3",
        "flex flex-col items-center justify-center gap-1",
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

      {/* XP Progress Ring */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          {/* Background ring */}
          <circle
            cx="40" cy="40" r="38"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/30"
          />
          {/* Progress ring */}
          <circle
            cx="40" cy="40" r="38"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              stroke: `hsl(${pillarColor})`,
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.8s ease-out',
            }}
          />
        </svg>
        {/* Icon in center */}
        <span className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl">
          {trait.icon}
        </span>
      </div>

      {/* Trait name */}
      <span className="text-[11px] sm:text-xs font-bold text-foreground text-center leading-tight line-clamp-2 mt-0.5 min-h-[2.2em]">
        {displayName || (isHe ? 'תכונה' : 'Trait')}
      </span>

      {/* Level badge */}
      <span
        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
        style={{
          backgroundColor: `hsla(${pillarColor}, 0.15)`,
          color: `hsl(${pillarColor})`,
        }}
      >
        LV.{trait.level}
      </span>

      {/* XP / progress */}
      <span className="text-[8px] text-muted-foreground">
        {trait.xp_total} XP
      </span>
    </motion.button>
  );
}

// ========== Trait Detail View ==========
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
  const xpInLevel = detail.xp_total % XP_PER_LEVEL;
  const xpProgress = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (xpProgress / 100) * circumference;

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
        {/* Large XP Ring */}
        <div className="relative w-28 h-28 mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
            <circle
              cx="55" cy="55" r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/20"
            />
            <circle
              cx="55" cy="55" r="52"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                stroke: `hsl(${pillarColor})`,
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: 'stroke-dashoffset 1s ease-out',
                filter: `drop-shadow(0 0 6px hsla(${pillarColor}, 0.5))`,
              }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-4xl">
            {detail.icon}
          </span>
        </div>

        <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
        
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `hsla(${pillarColor}, 0.15)`,
              color: `hsl(${pillarColor})`,
            }}
          >
            LV.{detail.level}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {xpInLevel}/{XP_PER_LEVEL} XP
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

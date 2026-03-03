/**
 * PillarSelectionModal — Lets users choose which pillars to activate based on their tier.
 * Free: 1 core + 1 arena
 * Plus: 3 core + 3 arena
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { usePillarAccess } from '@/hooks/usePillarAccess';
import { CORE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

const cardBgMap: Record<string, string> = {
  blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/40',
  fuchsia: 'from-fuchsia-500/10 to-fuchsia-600/5 border-fuchsia-500/40',
  red: 'from-red-500/10 to-red-600/5 border-red-500/40',
  amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/40',
  cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/40',
  slate: 'from-slate-500/10 to-slate-600/5 border-slate-500/40',
  indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/40',
  emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/40',
  purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/40',
  sky: 'from-sky-500/10 to-sky-600/5 border-sky-500/40',
  rose: 'from-rose-500/10 to-rose-600/5 border-rose-500/40',
  violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/40',
  teal: 'from-teal-500/10 to-teal-600/5 border-teal-500/40',
};

interface PillarSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function PillarSelectionModal({ open, onOpenChange, onComplete }: PillarSelectionModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { selectedPillars, limits, togglePillar, updateSelection } = usePillarAccess();
  const totalLimit = limits.core + limits.arena;
  
  const [localSelected, setLocalSelected] = useState<string[]>([...selectedPillars.core, ...selectedPillars.arena]);
  const [saving, setSaving] = useState(false);

  const handleToggle = (domain: LifeDomain, hub: 'core' | 'arena') => {
    const list = hub === 'core' ? localCore : localArena;
    const setList = hub === 'core' ? setLocalCore : setLocalArena;
    const limit = limits[hub];

    if (list.includes(domain.id)) {
      setList(list.filter(id => id !== domain.id));
    } else if (list.length < limit) {
      setList([...list, domain.id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSelection.mutateAsync({ core: localCore, arena: localArena });
      onComplete?.();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const canSave = localCore.length > 0 && localArena.length > 0;

  const renderGrid = (domains: LifeDomain[], hub: 'core' | 'arena', selected: string[], limit: number) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-foreground/90">
          {hub === 'core' ? (isHe ? 'ליבה' : 'Core') : (isHe ? 'זירה' : 'Arena')}
        </h4>
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          selected.length >= limit ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {selected.length}/{limit}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {domains.map((domain, i) => {
          const isSelected = selected.includes(domain.id);
          const atLimit = selected.length >= limit;
          const Icon = domain.icon;
          
          return (
            <motion.button
              key={domain.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => handleToggle(domain, hub)}
              disabled={!isSelected && atLimit}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border bg-gradient-to-br p-3 text-center transition-all cursor-pointer relative',
                isSelected
                  ? cardBgMap[domain.color]
                  : 'bg-card/20 border-border/20',
                !isSelected && atLimit && 'opacity-30 cursor-not-allowed',
                isSelected && 'ring-1 ring-primary/50'
              )}
            >
              {isSelected && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute top-1.5 end-1.5" />
              )}
              {!isSelected && atLimit && (
                <Lock className="w-3 h-3 text-muted-foreground/40 absolute top-1.5 end-1.5" />
              )}
              <Icon className={cn('w-5 h-5', isSelected ? domainColorMap[domain.color] : 'text-muted-foreground/50')} />
              <span className={cn(
                'text-[10px] font-semibold leading-tight',
                isSelected ? domainColorMap[domain.color] : 'text-foreground/50'
              )}>
                {isHe ? domain.labelHe : domain.labelEn}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isHe ? 'בחר את הפילרים שלך' : 'Choose Your Pillars'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isHe
              ? `בחר ${limits.core} פילר${limits.core > 1 ? 'ים' : ''} מהליבה ו-${limits.arena} מהזירה. תוכל לשנות מאוחר יותר.`
              : `Select ${limits.core} Core pillar${limits.core > 1 ? 's' : ''} and ${limits.arena} Arena pillar${limits.arena > 1 ? 's' : ''}. You can change later.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {renderGrid(CORE_DOMAINS, 'core', localCore, limits.core)}
          {renderGrid(ARENA_DOMAINS, 'arena', localArena, limits.arena)}
        </div>

        <Button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="w-full mt-4"
        >
          {saving
            ? (isHe ? 'שומר...' : 'Saving...')
            : (isHe ? 'אשר בחירה' : 'Confirm Selection')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

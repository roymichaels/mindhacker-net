/**
 * WizardHeader — Shared header for multi-step wizard flows (onboarding, career, etc.).
 * Shows phase label, segmented progress bar, optional language toggle, and exit button.
 */
import { motion } from 'framer-motion';
import { Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardSegment {
  /** 0-1 fill ratio for this segment */
  fill: number;
}

interface WizardHeaderProps {
  /** Phase/section label */
  label?: string;
  /** Progress segments — one per step/phase */
  segments: WizardSegment[];
  /** Called when exit (X) is clicked */
  onExit: () => void;
  /** Optional language toggle */
  languageToggle?: {
    current: string;
    onToggle: () => void;
  };
  /** Extra icon to render before the label */
  icon?: React.ReactNode;
  className?: string;
}

export function WizardHeader({
  label,
  segments,
  onExit,
  languageToggle,
  icon,
  className,
}: WizardHeaderProps) {
  return (
    <div className={cn('px-6 pt-6 space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          {label && (
            <span className="text-xs uppercase tracking-wider text-primary font-semibold">
              {label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {languageToggle && (
            <button
              onClick={languageToggle.onToggle}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-medium flex items-center gap-1"
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4" />
              {languageToggle.current === 'he' ? 'EN' : 'עב'}
            </button>
          )}
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Exit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex gap-1">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${Math.min(100, Math.max(0, seg.fill * 100))}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

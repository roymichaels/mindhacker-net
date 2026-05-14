import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { useTranslation } from '@/hooks/useTranslation';
import { Loader2, X } from 'lucide-react';
import AtmoArtifact from '@/components/aion/artifacts/AtmoArtifact';

type Kind = 'regenerate' | 'delete';

/**
 * StrategyApprovalCard — listens for `aion:strategy-confirm` events emitted by
 * AION action tags and presents an in-chat confirmation card before any
 * destructive action runs against the user's 100-day plan.
 */
export default function StrategyApprovalCard() {
  const { isRTL } = useTranslation();
  const { generateStrategy, deleteAllStrategies, isGenerating, isDeleting } = useStrategyPlans();
  const [kind, setKind] = useState<Kind | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind?: Kind } | undefined;
      if (detail?.kind === 'delete' || detail?.kind === 'regenerate') {
        setKind(detail.kind);
      }
    };
    window.addEventListener('aion:strategy-confirm', handler);
    return () => window.removeEventListener('aion:strategy-confirm', handler);
  }, []);

  const close = (result: 'confirmed' | 'cancelled') => {
    window.dispatchEvent(new CustomEvent('aion:strategy-confirm-result', { detail: { kind, result } }));
    setKind(null);
  };

  const onConfirm = async () => {
    if (!kind) return;
    if (kind === 'delete') {
      await deleteAllStrategies.mutateAsync();
    } else {
      await generateStrategy.mutateAsync({ hub: 'both' });
    }
    close('confirmed');
  };

  const busy = isGenerating || isDeleting;

  const title = kind === 'delete'
    ? (isRTL ? 'למחוק את התוכנית שלך?' : 'Delete your 100-day plan?')
    : (isRTL ? 'לבנות מחדש את התוכנית?' : 'Replace your 100-day plan?');

  const body = isRTL
    ? 'הפעולה תארכב את התוכנית הנוכחית ותמחק את כל המשימות, היעדים, אבני הדרך והכישורים המקושרים אליה.'
    : 'This will archive your current plan and clear all linked missions, daily actions, milestones and skills.';

  return (
    <AnimatePresence>
      {kind && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center px-4"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => !busy && close('cancelled')} />
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-sm"
          >
            <AtmoArtifact kind="confirm" breathing artifactId={`strategy-confirm-${kind}`}>
            <button
              type="button"
              onClick={() => !busy && close('cancelled')}
              className="absolute end-3 top-3 p-1.5 rounded-full hover:bg-white/[0.05]"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-foreground/50" />
            </button>
            <h3 className="text-lg font-semibold mb-2 text-foreground/95">{title}</h3>
            <p className="text-sm text-foreground/65 mb-5 leading-relaxed">{body}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => close('cancelled')}
                className="flex-1 h-11 rounded-full bg-white/[0.04] text-sm font-medium text-foreground/80 hover:bg-white/[0.08] disabled:opacity-50 transition-colors"
              >
                {isRTL ? 'ביטול' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onConfirm}
                className="flex-1 h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {kind === 'delete'
                  ? (isRTL ? 'מחק' : 'Delete')
                  : (isRTL ? 'בנה מחדש' : 'Regenerate')}
              </button>
            </div>
            </AtmoArtifact>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * InventoryBagModal — Fullscreen portal modal for loot inventory.
 * Matches the Royal Empire aesthetic of PracticesModal.
 */
import { createPortal } from 'react-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { InventoryBag } from '@/components/gamification/InventoryBag';
import { X, Package } from 'lucide-react';

interface InventoryBagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryBagModal({ open, onOpenChange }: InventoryBagModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

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
          onClick={() => onOpenChange(false)}
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>
        <h2 className="text-base font-bold text-white/90 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-400" />
          {isHe ? 'שק השלל' : 'Loot Bag'}
        </h2>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-24">
        <InventoryBag />
      </div>
    </div>,
    document.body,
  );
}

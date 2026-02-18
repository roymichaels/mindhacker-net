/**
 * OrbDNAModal – Compact dialog showing Orb DNA breakdown.
 * View-only: archetype blend, orb stats, color palette.
 * Tight layout with smaller orb preview.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { OrbDNACard } from './OrbDNACard';
import { ScrollArea } from '@/components/ui/scroll-area';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { OrbFullscreenViewer } from '@/components/orb/OrbFullscreenViewer';

interface OrbDNAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrbDNAModal({ open, onOpenChange }: OrbDNAModalProps) {
  const { language } = useTranslation();
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const isHe = language === 'he';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="text-base font-bold">
              {isHe ? 'ה-DNA של האורב שלך' : 'Your Orb DNA'}
            </DialogTitle>
          </DialogHeader>

          {/* Compact orb preview - click to fullscreen */}
          <div className="flex justify-center py-3">
            <button
              onClick={() => { onOpenChange(false); setFullscreenOpen(true); }}
              className="cursor-pointer hover:scale-105 transition-transform duration-200"
              title={isHe ? 'לחץ למסך מלא' : 'Click for fullscreen'}
            >
              <PersonalizedOrb size={120} state="idle" />
            </button>
          </div>

          <ScrollArea className="px-5 pb-5 max-h-[55vh]">
            <OrbDNACard />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <OrbFullscreenViewer open={fullscreenOpen} onClose={() => setFullscreenOpen(false)} />
    </>
  );
}

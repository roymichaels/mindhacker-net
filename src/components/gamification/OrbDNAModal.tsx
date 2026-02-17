/**
 * OrbDNAModal – Dialog wrapper around OrbDNACard, triggered by clicking the orb.
 */

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

interface OrbDNAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrbDNAModal({ open, onOpenChange }: OrbDNAModalProps) {
  const { language } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-bold">
            {language === 'he' ? 'ה-DNA של האורב שלך' : 'Your Orb DNA'}
          </DialogTitle>
        </DialogHeader>
        {/* Mini orb preview */}
        <div className="flex justify-center py-2">
          <PersonalizedOrb size={100} state="idle" />
        </div>
        <ScrollArea className="px-6 pb-6 max-h-[55vh]">
          <OrbDNACard />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

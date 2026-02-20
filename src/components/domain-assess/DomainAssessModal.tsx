/**
 * DomainAssessModal — Wraps DomainAssessChat in a full-screen Dialog.
 * Used on pillar home pages to auto-open assessment when no data exists.
 */
import { Dialog, DialogContent } from '@/components/ui/dialog';
import DomainAssessChat from './DomainAssessChat';

interface DomainAssessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainId: string;
}

export function DomainAssessModal({ open, onOpenChange, domainId }: DomainAssessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-xl flex flex-col">
        <DomainAssessChat domainId={domainId} asModal onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

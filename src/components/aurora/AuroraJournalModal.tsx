import { Dialog, DialogContent } from '@/components/ui/dialog';
import { JournalTab } from './JournalTab';
import type { JournalType } from '@/services/journalEntries';

interface AuroraJournalModalProps {
  type: JournalType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuroraJournalModal({ type, open, onOpenChange }: AuroraJournalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] p-0 flex flex-col overflow-hidden">
        <JournalTab type={type} />
      </DialogContent>
    </Dialog>
  );
}

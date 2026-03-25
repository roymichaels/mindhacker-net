import { Moon, Heart } from 'lucide-react';
import { JournalTab } from './JournalTab';
import type { JournalType } from '@/services/journalEntries';
import { AIONDialogShell } from '@/components/orb/AIONSignature';

interface AuroraJournalModalProps {
  type: JournalType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuroraJournalModal({ type, open, onOpenChange }: AuroraJournalModalProps) {
  const isDream = type === 'dream';

  return (
    <AIONDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isDream ? 'Dreams' : 'Gratitude'}
      subtitle={isDream ? 'Capture symbols, fragments, and meanings' : 'Record what grounded you today'}
      description={`AION ${type} journal`}
      icon={isDream ? <Moon className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
      className="max-w-lg h-[80vh]"
      contentClassName="overflow-hidden"
    >
      <JournalTab type={type} />
    </AIONDialogShell>
  );
}

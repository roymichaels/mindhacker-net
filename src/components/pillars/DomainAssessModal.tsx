/**
 * DomainAssessModal - Wraps DomainAssessChat in the shared AION dialog shell.
 */
import { Brain } from 'lucide-react';
import { AIONDialogShell } from '@/components/orb/AIONSignature';
import DomainAssessChat from './DomainAssessChat';

interface DomainAssessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainId: string;
}

export function DomainAssessModal({ open, onOpenChange, domainId }: DomainAssessModalProps) {
  return (
    <AIONDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="AION Assessment"
      subtitle="Domain scan and guided reflection"
      description="AION domain assessment conversation"
      icon={<Brain className="w-4 h-4" />}
      preventClose
      contentClassName="overflow-hidden"
    >
      <DomainAssessChat domainId={domainId} asModal onClose={() => onOpenChange(false)} />
    </AIONDialogShell>
  );
}

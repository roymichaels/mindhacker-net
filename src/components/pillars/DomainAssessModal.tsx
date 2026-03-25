/**
 * DomainAssessModal - Wraps DomainAssessChat in the shared story assessment shell.
 */
import DomainAssessChat from './DomainAssessChat';
import { StoryAssessmentSurface } from '@/components/story/StorySurfaceShell';

interface DomainAssessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainId: string;
}

export function DomainAssessModal({ open, onOpenChange, domainId }: DomainAssessModalProps) {
  return (
    <StoryAssessmentSurface
      open={open}
      onOpenChange={onOpenChange}
      title="AION Assessment"
      subtitle="Domain scan and guided reflection"
      description="AION domain assessment conversation"
      preventClose
      contentClassName="overflow-hidden"
    >
      <DomainAssessChat domainId={domainId} asModal onClose={() => onOpenChange(false)} />
    </StoryAssessmentSurface>
  );
}

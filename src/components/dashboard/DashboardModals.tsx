import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AIAnalysisDisplay } from '@/components/launchpad/AIAnalysisDisplay';
import LifePlanCard from './unified/LifePlanCard';
import { ChecklistsCard, ConsciousnessCard, BehavioralInsightsCard, IdentityProfileCard, TraitsCard, CommitmentsCard, DailyAnchorsDisplay, CurrentFocusCard } from './unified';

interface DashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
}

export function AIAnalysisModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'ניתוח AI מלא' : 'Full AI Analysis'}
          </DialogTitle>
        </DialogHeader>
        <AIAnalysisDisplay language={language} />
      </DialogContent>
    </Dialog>
  );
}

export function LifePlanModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}
          </DialogTitle>
        </DialogHeader>
        <LifePlanCard />
      </DialogContent>
    </Dialog>
  );
}

export function ChecklistsModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'המשימות שלי' : 'My Tasks'}
          </DialogTitle>
        </DialogHeader>
        <ChecklistsCard />
      </DialogContent>
    </Dialog>
  );
}

export function ConsciousnessModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'מפת התודעה' : 'Consciousness Map'}
          </DialogTitle>
        </DialogHeader>
        <ConsciousnessCard />
      </DialogContent>
    </Dialog>
  );
}

export function BehavioralModal({ open, onOpenChange, language }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'תובנות התנהגותיות' : 'Behavioral Insights'}
          </DialogTitle>
        </DialogHeader>
        <BehavioralInsightsCard />
      </DialogContent>
    </Dialog>
  );
}

interface IdentityModalProps extends DashboardModalProps {
  values: string[];
  principles: string[];
  selfConcepts: string[];
}

export function IdentityModal({ open, onOpenChange, language, values, principles, selfConcepts }: IdentityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'פרופיל זהות' : 'Identity Profile'}
          </DialogTitle>
        </DialogHeader>
        <IdentityProfileCard values={values} principles={principles} selfConcepts={selfConcepts} />
      </DialogContent>
    </Dialog>
  );
}

interface TraitsModalProps extends DashboardModalProps {
  traitIds: string[];
}

export function TraitsModal({ open, onOpenChange, language, traitIds }: TraitsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'תכונות אופי' : 'Character Traits'}
          </DialogTitle>
        </DialogHeader>
        <TraitsCard traitIds={traitIds} />
      </DialogContent>
    </Dialog>
  );
}

interface CommitmentsModalProps extends DashboardModalProps {
  commitments: Array<{ id: string; title: string; description: string | null }>;
}

export function CommitmentsModal({ open, onOpenChange, language, commitments }: CommitmentsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'התחייבויות' : 'Commitments'}
          </DialogTitle>
        </DialogHeader>
        <CommitmentsCard commitments={commitments} />
      </DialogContent>
    </Dialog>
  );
}

interface AnchorsModalProps extends DashboardModalProps {
  anchors: Array<{ id: string; title: string; category: string | null }>;
}

export function AnchorsModal({ open, onOpenChange, language, anchors }: AnchorsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'עוגנים יומיים' : 'Daily Anchors'}
          </DialogTitle>
        </DialogHeader>
        <DailyAnchorsDisplay anchors={anchors} />
      </DialogContent>
    </Dialog>
  );
}

interface FocusModalProps extends DashboardModalProps {
  focusPlan: {
    title: string;
    description: string | null;
    durationDays: number;
    daysRemaining: number;
  } | null;
}

export function FocusModal({ open, onOpenChange, language, focusPlan }: FocusModalProps) {
  if (!focusPlan) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'פוקוס נוכחי' : 'Current Focus'}
          </DialogTitle>
        </DialogHeader>
        <CurrentFocusCard
          title={focusPlan.title}
          description={focusPlan.description}
          durationDays={focusPlan.durationDays}
          daysRemaining={focusPlan.daysRemaining}
        />
      </DialogContent>
    </Dialog>
  );
}

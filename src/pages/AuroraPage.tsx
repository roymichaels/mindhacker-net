/**
 * AuroraPage - Full-page AION chat surface.
 * Keeps the same signature header and quick actions as the floating widget.
 */
import { useState } from 'react';
import { MessageSquare, Moon, Heart, Target, Brain } from 'lucide-react';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/pillars/DomainAssessChat';
import { AuroraJournalModal } from '@/components/aurora/AuroraJournalModal';
import { AuroraPlanModal } from '@/components/aurora/AuroraPlanModal';
import { AuroraBeliefsModal } from '@/components/aurora/AuroraBeliefsModal';
import { AIONNamingGate } from '@/components/aurora/AIONNamingGate';
import { AIONContextBadges, AIONHeader, AIONQuickActions } from '@/components/orb/AIONSignature';

type WidgetModal = 'dream' | 'gratitude' | 'plan' | 'beliefs' | null;

export default function AuroraPage() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { activePillar, assessmentDomainId, endAssessment } = useAuroraChatContext();
  const [activeModal, setActiveModal] = useState<WidgetModal>(null);

  const isAssessing = !!assessmentDomainId;
  const pillarDomain = activePillar ? LIFE_DOMAINS.find((d) => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find((d) => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  const quickActions = [
    {
      id: 'dream',
      icon: Moon,
      label: isHe ? 'חלומות' : 'Dreams',
      gradient: 'from-indigo-500 to-indigo-700',
      onClick: () => setActiveModal('dream'),
    },
    {
      id: 'gratitude',
      icon: Heart,
      label: isHe ? 'תודה' : 'Gratitude',
      gradient: 'from-rose-500 to-pink-600',
      onClick: () => setActiveModal('gratitude'),
    },
    {
      id: 'plan',
      icon: Target,
      label: isHe ? 'תוכנית' : 'Plan',
      gradient: 'from-cyan-500 to-teal-600',
      onClick: () => setActiveModal('plan'),
    },
    {
      id: 'beliefs',
      icon: Brain,
      label: isHe ? 'אמונות' : 'Beliefs',
      gradient: 'from-violet-500 to-purple-600',
      onClick: () => setActiveModal('beliefs'),
    },
  ] as const;

  return (
    <AIONNamingGate>
      <div className="fixed inset-0 top-14 z-40 flex flex-col bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,rgba(10,18,34,0.98),rgba(7,11,20,0.96))] overflow-hidden">
        <AIONHeader
          title="AION"
          subtitle={isHe ? 'מרכז השיחה של MindOS' : 'MindOS conversation hub'}
          icon={<MessageSquare className="w-4 h-4" />}
          className="bg-black/10"
        />

        {(pillarLabel || (isAssessing && assessLabel)) && (
          <AIONContextBadges>
            {pillarLabel && !isAssessing ? (
              <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                {pillarLabel}
              </span>
            ) : null}
            {isAssessing && assessLabel ? (
              <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                {isHe ? 'סריקה' : 'Scan'}: {assessLabel}
              </span>
            ) : null}
          </AIONContextBadges>
        )}

        <AIONQuickActions actions={[...quickActions]} className="pt-3" />

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-1 pb-[140px]">
          {isAssessing && assessmentDomainId ? (
            <DomainAssessChat
              domainId={assessmentDomainId}
              asDock
              dockHeightVh={85}
              onClose={() => endAssessment()}
            />
          ) : (
            <AuroraChatBubbles showOrbAboveMessages={false} />
          )}
        </div>

        <div className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] inset-x-0 z-30 px-3 pb-2">
          <div className="rounded-2xl bg-slate-950/45 border border-white/10 shadow-[0_18px_50px_rgba(8,15,28,0.45)] backdrop-blur-xl p-2">
            <GlobalChatInput />
          </div>
        </div>

        <AuroraJournalModal
          type="dream"
          open={activeModal === 'dream'}
          onOpenChange={(nextOpen) => !nextOpen && setActiveModal(null)}
        />
        <AuroraJournalModal
          type="gratitude"
          open={activeModal === 'gratitude'}
          onOpenChange={(nextOpen) => !nextOpen && setActiveModal(null)}
        />
        <AuroraPlanModal
          open={activeModal === 'plan'}
          onOpenChange={(nextOpen) => !nextOpen && setActiveModal(null)}
        />
        <AuroraBeliefsModal
          open={activeModal === 'beliefs'}
          onOpenChange={(nextOpen) => !nextOpen && setActiveModal(null)}
        />
      </div>
    </AIONNamingGate>
  );
}

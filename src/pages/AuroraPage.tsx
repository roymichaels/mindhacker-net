/**
 * AIONPage - Full-page AION chat surface.
 * Keeps the same signature header and quick actions as the floating widget.
 */
import { useState } from 'react';
import { Menu, Play, ChevronDown, Moon, Heart, Target, Brain } from 'lucide-react';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAIONDisplayName } from '@/hooks/useAIONDisplayName';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/pillars/DomainAssessChat';
import { AuroraJournalModal } from '@/components/aurora/AuroraJournalModal';
import { AuroraPlanModal } from '@/components/aurora/AuroraPlanModal';
import { AuroraBeliefsModal } from '@/components/aurora/AuroraBeliefsModal';
import { AIONNamingGate } from '@/components/aurora/AIONNamingGate';

type WidgetModal = 'dream' | 'gratitude' | 'plan' | 'beliefs' | null;

export default function AIONPage() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { displayName: aionName } = useAIONDisplayName();
  const { activePillar, assessmentDomainId, endAssessment } = useAuroraChatContext();
  const [activeModal, setActiveModal] = useState<WidgetModal>(null);

  const isAssessing = !!assessmentDomainId;
  const pillarDomain = activePillar ? LIFE_DOMAINS.find((d) => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find((d) => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  const quickActions = [
    { id: 'dream', icon: Moon, label: isHe ? 'חלומות' : 'Dreams', onClick: () => setActiveModal('dream') },
    { id: 'gratitude', icon: Heart, label: isHe ? 'תודה' : 'Gratitude', onClick: () => setActiveModal('gratitude') },
    { id: 'plan', icon: Target, label: isHe ? 'תוכנית' : 'Plan', onClick: () => setActiveModal('plan') },
    { id: 'beliefs', icon: Brain, label: isHe ? 'אמונות' : 'Beliefs', onClick: () => setActiveModal('beliefs') },
  ] as const;

  const contextLabel = isAssessing && assessLabel
    ? `${isHe ? 'סריקה' : 'Scan'}: ${assessLabel}`
    : (pillarLabel || (isHe ? 'מיינד-OS' : 'MindOS'));

  return (
    <AIONNamingGate>
      <div className="flex-1 min-h-0 -mx-2 lg:-mx-3 flex flex-col bg-background overflow-hidden">
        {/* Lovable-style top bar */}
        <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2.5">
          <button
            type="button"
            aria-label="Menu"
            className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="flex-1 max-w-[60%] mx-auto h-9 rounded-full border border-white/10 bg-white/[0.03] px-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-foreground hover:bg-white/[0.06] transition-colors truncate"
          >
            <span className="truncate">{contextLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
          </button>

          <button
            type="button"
            aria-label="Quick action"
            className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation surface */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-1">
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

        {/* Suggestion chips */}
        <div className="shrink-0 px-3 pt-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1 [mask-image:linear-gradient(to_right,black_85%,transparent)]">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.onClick}
                  className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-foreground/90 hover:bg-white/[0.08] transition-colors whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 px-3 py-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-2 py-2 backdrop-blur-xl">
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

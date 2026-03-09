/**
 * AuroraPage — Full-page Aurora chat wrapped in the ProtectedAppShell.
 * Renders the same chat UI as the dock but as a regular routed page
 * with header and bottom tabs visible.
 */
import { Bug } from 'lucide-react';
import { useState } from 'react';
import SocraticModeToggle from '@/components/aurora/SocraticModeToggle';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';

import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/domain-assess/DomainAssessChat';
import { BugReportDialog } from '@/components/aurora/BugReportDialog';
import { AuroraSearchBar } from '@/components/aurora/AuroraSearchBar';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { AURORA_ORB_PROFILE } from '@/components/aurora/AuroraHoloOrb';

export default function AuroraPage() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const {
    activePillar,
    assessmentDomainId,
    endAssessment,
  } = useAuroraChatContext();
  const [bugReportOpen, setBugReportOpen] = useState(false);

  const isAssessing = !!assessmentDomainId;

  // Get pillar/assessment labels
  const pillarDomain = activePillar ? LIFE_DOMAINS.find(d => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find(d => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)]">
      <BugReportDialog open={bugReportOpen} onOpenChange={setBugReportOpen} />

      {/* Aurora sub-header */}
      <div className="relative flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <StandaloneMorphOrb size={28} profile={AURORA_ORB_PROFILE} geometryFamily="octa" level={100} />
          <span className="text-base font-semibold text-foreground">
            {isHe ? 'אורורה' : 'Aurora'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {pillarLabel && !isAssessing && (
            <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
              {pillarLabel}
            </span>
          )}
          {isAssessing && assessLabel && (
            <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
              {isHe ? 'סריקה' : 'Scan'}: {assessLabel}
            </span>
          )}
          <AuroraSearchBar />
          <button
            onClick={() => setBugReportOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            title={isHe ? 'דווח על באג' : 'Report Bug'}
          >
            <Bug className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isAssessing && assessmentDomainId ? (
          <DomainAssessChat
            domainId={assessmentDomainId}
            asDock
            dockHeightVh={85}
            onClose={() => endAssessment()}
          />
        ) : (
          <AuroraChatBubbles />
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 pb-2 pt-2 border-t border-border">
        <GlobalChatInput />
      </div>
    </div>
  );
}

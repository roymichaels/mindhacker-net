import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bug, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';

import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import DomainAssessChat from '@/components/domain-assess/DomainAssessChat';
import { cn } from '@/lib/utils';
import { BugReportDialog } from '@/components/aurora/BugReportDialog';

export function AuroraDock() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { language } = useTranslation();
  const {
    isChatExpanded,
    setIsChatExpanded,
    isStreaming,
    activePillar,
    assessmentDomainId,
    endAssessment,
  } = useAuroraChatContext();
  const [bugReportOpen, setBugReportOpen] = useState(false);

  const isHe = language === 'he';

  // Hide dock on non-dashboard pages (panels, etc.)
  const isPanel = location.pathname.startsWith('/panel') ||
    location.pathname.startsWith('/coach') ||
    location.pathname.startsWith('/affiliate');
  if (isPanel) return null;

  const isAssessing = !!assessmentDomainId;

  // Get pillar label if active
  const pillarDomain = activePillar ? LIFE_DOMAINS.find(d => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;

  // Get assessment domain label
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find(d => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  return (
    <>
      <BugReportDialog open={bugReportOpen} onOpenChange={setBugReportOpen} />

      <div
        className={cn(
          "fixed left-0 right-0 z-40 flex flex-col",
          "bg-background/100 backdrop-blur-none border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.5)]",
          isMobile
            ? "bottom-14"
            : "bottom-0",
          // No full-height override for assessments — keep normal dock size
        )}
      >
        {/* Assessment mode: full-height DomainAssessChat */}
        {isAssessing && assessmentDomainId ? (
          <div className="flex flex-col h-full">
            {/* Close button for assessment */}
            <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
              <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                {isHe ? 'סריקה' : 'Scan'}: {assessLabel}
              </span>
              <button
                onClick={() => endAssessment()}
                className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                title={isHe ? 'סגור' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <DomainAssessChat
                domainId={assessmentDomainId}
                asDock
                onClose={() => endAssessment()}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Bug report + pillar indicator (visible only when expanded) */}
            {isChatExpanded && (
              <div className="w-full max-w-3xl mx-auto flex items-center justify-between px-3 pt-1.5 mb-0.5">
                {pillarLabel ? (
                  <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                    {pillarLabel}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => setBugReportOpen(true)}
                  className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  title={isHe ? 'דווח על באג' : 'Report Bug'}
                >
                  <Bug className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Chat bubbles (expanded only) */}
            <AnimatePresence>
              {isChatExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full overflow-hidden"
                >
                  <AuroraChatBubbles />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar (always visible) */}
            <GlobalChatInput />
          </>
        )}
      </div>
    </>
  );
}

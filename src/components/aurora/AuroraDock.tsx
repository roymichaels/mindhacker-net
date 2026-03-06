import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Bug, GripHorizontal, X } from 'lucide-react';
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
import { AuroraDockOrb } from '@/components/aurora/AuroraFloatingOrb';

/** Min/max height for the expanded chat area (vh units) */
const MIN_CHAT_VH = 15;
const MAX_CHAT_VH = 85;
const DEFAULT_CHAT_VH = 55;
const CLOSE_THRESHOLD_VH = 20;

export function AuroraDock() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { language } = useTranslation();
  const {
    isChatExpanded,
    setIsChatExpanded,
    isDockVisible,
    setIsDockVisible,
    isStreaming,
    activePillar,
    assessmentDomainId,
    endAssessment,
  } = useAuroraChatContext();
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const [chatHeightVh, setChatHeightVh] = useState(DEFAULT_CHAT_VH);
  const dragRef = useRef<{ startY: number; startVh: number } | null>(null);

  const isHe = language === 'he';

  const isAssessing = !!assessmentDomainId;

  // Get pillar label if active
  const pillarDomain = activePillar ? LIFE_DOMAINS.find(d => d.id === activePillar) : null;
  const pillarLabel = pillarDomain ? (isHe ? pillarDomain.labelHe : pillarDomain.labelEn) : null;

  // Get assessment domain label
  const assessDomain = assessmentDomainId ? LIFE_DOMAINS.find(d => d.id === assessmentDomainId) : null;
  const assessLabel = assessDomain ? (isHe ? assessDomain.labelHe : assessDomain.labelEn) : null;

  // Drag handle logic for resizing
  const handleDragStart = useCallback((clientY: number) => {
    dragRef.current = { startY: clientY, startVh: chatHeightVh };
  }, [chatHeightVh]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragRef.current) return;
    const deltaY = dragRef.current.startY - clientY;
    const viewportH = window.innerHeight;
    const deltaVh = (deltaY / viewportH) * 100;
    const newVh = Math.min(MAX_CHAT_VH, Math.max(MIN_CHAT_VH, dragRef.current.startVh + deltaVh));
    setChatHeightVh(newVh);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragRef.current && chatHeightVh <= CLOSE_THRESHOLD_VH) {
      setIsChatExpanded(false);
      setChatHeightVh(DEFAULT_CHAT_VH);
      // Also hide dock when dragged below threshold
      setIsDockVisible(false);
    }
    dragRef.current = null;
  }, [chatHeightVh, setIsChatExpanded, setIsDockVisible]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onUp = () => { handleDragEnd(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  const closeDock = useCallback(() => {
    setIsChatExpanded(false);
    setIsDockVisible(false);
    setChatHeightVh(DEFAULT_CHAT_VH);
  }, [setIsChatExpanded, setIsDockVisible]);

  // Hide dock on non-dashboard pages (panels, etc.)
  const isFM = location.pathname.startsWith('/fm');
  const isPanel = location.pathname.startsWith('/panel') ||
    location.pathname.startsWith('/coach/') ||
    location.pathname.startsWith('/affiliate');
  if (isPanel) return null;
  if (!isDockVisible) return null;

  const dragHandle = isChatExpanded ? (
    <div className="flex items-center justify-center py-1 shrink-0">
      <div
        className="flex-1 flex items-center justify-center cursor-row-resize touch-none select-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <GripHorizontal className="w-5 h-5 text-muted-foreground/40" />
      </div>
    </div>
  ) : null;

  return (
    <>
      <BugReportDialog open={bugReportOpen} onOpenChange={setBugReportOpen} />

      <motion.div
        data-aurora-dock
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-background"
      >
        {/* Top bar with back button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <button
            onClick={closeDock}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{isHe ? 'חזרה' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
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
            <button
              onClick={() => setBugReportOpen(true)}
              className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              title={isHe ? 'דווח על באג' : 'Report Bug'}
            >
              <Bug className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat area — fills remaining space */}
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

        {/* Input bar at bottom */}
        <div className="shrink-0 px-4 pb-safe pt-2 border-t border-border">
          <GlobalChatInput />
        </div>
      </motion.div>
    </>
  );
}

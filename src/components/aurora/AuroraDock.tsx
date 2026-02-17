import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/useTranslation';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
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
  } = useAuroraChatContext();
  const [bugReportOpen, setBugReportOpen] = useState(false);

  // Hide dock on non-dashboard pages (panels, etc.)
  const isPanel = location.pathname.startsWith('/panel') ||
    location.pathname.startsWith('/coach') ||
    location.pathname.startsWith('/affiliate');
  if (isPanel) return null;

  return (
    <>
      <BugReportDialog open={bugReportOpen} onOpenChange={setBugReportOpen} />

      <div
        className={cn(
          "fixed left-0 right-0 z-40 flex flex-col items-center",
          "bg-background/100 backdrop-blur-none border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.5)]",
          isMobile
            ? "bottom-14"
            : "bottom-0"
        )}
      >
        {/* Collapse/Expand toggle + Bug report */}
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between px-3 pt-1.5 mb-0.5">
          <button
            onClick={() => setBugReportOpen(true)}
            className={cn(
              "p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground",
              !isChatExpanded && "opacity-0 pointer-events-none"
            )}
            title={language === 'he' ? 'דווח על באג' : 'Report Bug'}
          >
            <Bug className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsChatExpanded(!isChatExpanded)}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <AuroraOrbIcon className="w-4 h-4" size={16} />
            {isChatExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <>
                <span className="text-xs font-medium">Aurora</span>
                <ChevronUp className="w-3.5 h-3.5" />
                {isStreaming && (
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                )}
              </>
            )}
          </button>
        </div>

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
      </div>
    </>
  );
}

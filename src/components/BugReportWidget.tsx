import { useState, useCallback, useEffect } from 'react';
import { Bug, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useBugReport } from '@/hooks/useBugReport';
import BugReportChat from '@/components/bug-report/BugReportChat';
import { cn } from '@/lib/utils';

const PROMPT_DISMISSED_KEY = 'bug-report-prompt-dismissed-v2';

export const BugReportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { t, language } = useTranslation();
  const { captureContext } = useBugReport();

  // Show the prompt after a delay if not dismissed
  useEffect(() => {
    const wasDismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (!wasDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-hide prompt after 10 seconds
  useEffect(() => {
    if (showPrompt) {
      const timer = setTimeout(() => {
        setShowPrompt(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showPrompt]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setShowPrompt(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
  }, []);

  const context = captureContext();
  const deviceInfo = `${context.browser} / ${context.os} / ${context.deviceType}`;

  return (
    <>
      {/* Floating Button Container - positioned bottom-right, below Aurora chat z-index */}
      <div
        id="bug-report-widget"
        className="fixed end-4 bottom-[140px] sm:bottom-[124px] z-30"
      >
        <div className="relative flex flex-col items-end gap-2">
          {/* Prompt Bubble */}
          <AnimatePresence>
            {showPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className={cn(
                  "flex items-center gap-2",
                  "bg-background/95 backdrop-blur-xl",
                  "border border-border rounded-lg px-3 py-2",
                  "shadow-lg",
                  "max-w-[200px]"
                )}
              >
                <p className="text-xs text-foreground leading-tight">
                  {language === 'he' ? 'נתקלת בבאג? ספר לי!' : 'Found a bug? Tell me!'}
                </p>
                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="p-0.5 rounded-full hover:bg-muted transition-colors shrink-0"
                  aria-label={t('common.close')}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bug Button - more prominent with chat icon */}
          <motion.button
            onClick={handleOpen}
            className={cn(
              "relative p-3.5 rounded-full",
              "bg-gradient-to-br from-primary to-primary/80",
              "text-primary-foreground",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            title={t('bugReport.buttonTooltip')}
          >
            {/* Pulse animation */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/50"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="relative z-10 flex items-center gap-1.5">
              <Bug className="h-5 w-5" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Dialog with Chat */}
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent 
              className="max-w-md h-[85svh] max-h-[600px] flex flex-col overflow-hidden p-0"
              hideCloseButton
            >
              <DialogHeader 
                title={language === 'he' ? 'דיווח על באג' : 'Report a Bug'}
                icon={<MessageCircle className="h-5 w-5" />}
                showBackArrow={false}
                className="flex-shrink-0 p-4 pb-2"
              />
              
              <BugReportChat
                onSuccess={handleClose}
                contextInfo={{
                  pagePath: context.pagePath,
                  deviceInfo,
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default BugReportWidget;

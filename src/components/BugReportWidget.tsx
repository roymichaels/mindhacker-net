import { useState, useCallback, useEffect } from 'react';
import { Bug, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useBugReport } from '@/hooks/useBugReport';
import { BugReportForm } from '@/components/bug-report/BugReportForm';
import { cn } from '@/lib/utils';

const PROMPT_DISMISSED_KEY = 'bug-report-prompt-dismissed';

export const BugReportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { t, isRTL } = useTranslation();
  const { captureContext } = useBugReport();

  // Show the prompt after a delay if not dismissed
  useEffect(() => {
    const wasDismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (!wasDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds
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
      {/* Floating Button Container - positioned on left, above bottom dock */}
      <div
        id="bug-report-widget"
        className="fixed left-4 bottom-20 z-40 pointer-events-none"
      >
        <div className="relative flex items-center gap-2">
          {/* Prompt Bubble */}
          <AnimatePresence>
            {showPrompt && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                className={cn(
                  "pointer-events-auto absolute bottom-0 flex items-center gap-2",
                  "bg-gradient-to-r from-gray-900 to-gray-800",
                  "border border-primary/30 rounded-lg px-3 py-2",
                  "shadow-lg shadow-primary/20",
                  isRTL ? "right-14" : "left-14"
                )}
              >
                <p className="text-xs text-foreground whitespace-nowrap">
                  {isRTL ? "נתקלת בבאג? לחץ כאן 👈" : "Found a bug? Click here 👉"}
                </p>
                <button
                  onClick={dismissPrompt}
                  className="p-0.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bug Button */}
          <motion.button
            onClick={handleOpen}
            className={cn(
              "pointer-events-auto relative p-3 rounded-full",
              "bg-gradient-to-br from-gray-900 to-gray-800",
              "border border-primary/30",
              "shadow-lg shadow-primary/20",
              "hover:shadow-xl hover:shadow-primary/30",
              "transition-shadow duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.3 }}
            title={t('bugReport.buttonTooltip')}
          >
            {/* Gradient border animation */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 opacity-50 blur-sm"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="relative z-10 text-primary">
              <Bug className="h-5 w-5" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Dialog */}
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent 
              className="max-w-md max-h-[90vh] overflow-y-auto"
              hideCloseButton
            >
              <DialogHeader 
                title={t('bugReport.title')} 
                icon={<Bug className="h-5 w-5" />}
                showBackArrow={false}
              />
              <DialogDescription className="text-center text-muted-foreground -mt-2">
                {t('bugReport.subtitle')}
              </DialogDescription>
              
              <BugReportForm
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

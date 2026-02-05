import { useState, useCallback } from 'react';
import { Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { useBugReport } from '@/hooks/useBugReport';
import { BugReportForm } from '@/components/bug-report/BugReportForm';
import { cn } from '@/lib/utils';

export const BugReportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, isRTL } = useTranslation();
  const { captureContext } = useBugReport();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const context = captureContext();
  const deviceInfo = `${context.browser} / ${context.os} / ${context.deviceType}`;

  return (
    <>
      {/* Floating Button Container */}
      <div
        id="bug-report-widget"
        className={cn(
          "fixed bottom-6 z-50 pointer-events-none",
          isRTL ? "right-6" : "left-6"
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side={isRTL ? 'left' : 'right'} sideOffset={10}>
            {t('bugReport.buttonTooltip')}
          </TooltipContent>
        </Tooltip>
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

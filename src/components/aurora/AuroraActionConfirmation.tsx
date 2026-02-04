import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuroraActionConfirmationProps {
  actionType: string;
  actionDescription: string;
  onConfirm: () => void;
  onCancel: () => void;
  onAlwaysAllow?: () => void;
  isRTL?: boolean;
  className?: string;
}

const AuroraActionConfirmation = ({
  actionType,
  actionDescription,
  onConfirm,
  onCancel,
  onAlwaysAllow,
  isRTL = false,
  className,
}: AuroraActionConfirmationProps) => {
  const [showAlwaysOption, setShowAlwaysOption] = useState(false);

  const getActionIcon = () => {
    switch (actionType) {
      case 'task_complete':
        return '✅';
      case 'task_delete':
        return '🗑️';
      case 'habit_log':
        return '💪';
      case 'reminder_set':
        return '⏰';
      case 'navigate':
        return '🧭';
      default:
        return '⚡';
    }
  };

  const getActionLabel = () => {
    if (isRTL) {
      switch (actionType) {
        case 'task_complete':
          return 'השלמת משימה';
        case 'task_delete':
          return 'מחיקת משימה';
        case 'habit_log':
          return 'רישום הרגל';
        case 'reminder_set':
          return 'הגדרת תזכורת';
        case 'navigate':
          return 'ניווט';
        default:
          return 'פעולה';
      }
    }
    switch (actionType) {
      case 'task_complete':
        return 'Complete Task';
      case 'task_delete':
        return 'Delete Task';
      case 'habit_log':
        return 'Log Habit';
      case 'reminder_set':
        return 'Set Reminder';
      case 'navigate':
        return 'Navigate';
      default:
        return 'Action';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg',
        'max-w-sm',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{getActionIcon()}</span>
        <span className="text-sm font-medium text-foreground/80">
          {getActionLabel()}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground mb-4">
        {actionDescription}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onConfirm}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          <Check className="w-4 h-4 mr-1" />
          {isRTL ? 'כן' : 'Yes'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          <X className="w-4 h-4 mr-1" />
          {isRTL ? 'לא' : 'No'}
        </Button>

        {onAlwaysAllow && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAlwaysOption(!showAlwaysOption)}
            className="px-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Always Allow Option */}
      <AnimatePresence>
        {showAlwaysOption && onAlwaysAllow && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-border"
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onAlwaysAllow();
                onConfirm();
              }}
              className="w-full text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              {isRTL ? 'תמיד אשר פעולות מסוג זה' : 'Always allow this action type'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AuroraActionConfirmation;

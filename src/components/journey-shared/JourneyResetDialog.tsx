/**
 * Shared Reset Dialog for All Journey Flows
 * Replaces duplicate AlertDialog markup in LaunchpadFlow, BusinessJourneyFlow, etc.
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { JourneyResetDialogProps } from './types';

const journeyTypeLabels = {
  launchpad: { he: 'הטרנספורמציה', en: 'transformation' },
  business: { he: 'העסקי', en: 'business' },
  health: { he: 'הבריאות', en: 'health' },
  relationships: { he: 'הקשרים', en: 'relationships' },
  finances: { he: 'הפיננסי', en: 'financial' },
  learning: { he: 'הלמידה', en: 'learning' },
};

export function JourneyResetDialog({
  open,
  onOpenChange,
  onConfirm,
  isResetting,
  journeyType = 'launchpad',
}: JourneyResetDialogProps) {
  const { language, isRTL } = useTranslation();
  
  const typeLabel = journeyTypeLabels[journeyType];
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {language === 'he' ? 'התחל מסע מחדש?' : 'Start Journey Over?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === 'he' 
              ? `פעולה זו תמחק את כל התשובות שלך ותתחיל את המסע ${typeLabel.he} מההתחלה. פעולה זו לא ניתנת לביטול.`
              : `This will delete all your answers and start the ${typeLabel.en} journey from the beginning. This action cannot be undone.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={cn(isRTL && "flex-row-reverse")}>
          <AlertDialogCancel>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isResetting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isResetting 
              ? (language === 'he' ? 'מאפס...' : 'Resetting...')
              : (language === 'he' ? 'התחל מחדש' : 'Start Over')
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default JourneyResetDialog;

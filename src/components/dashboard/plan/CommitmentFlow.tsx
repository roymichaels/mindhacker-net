/**
 * CommitmentFlow — "Commit to Schedule" button with 7-day lock explanation.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCommitSchedule } from '@/hooks/useCommandSchedule';
import { Button } from '@/components/ui/button';
import { Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CommitmentFlowProps {
  planId: string;
}

export function CommitmentFlow({ planId }: CommitmentFlowProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const commitMutation = useCommitSchedule();

  const handleCommit = async () => {
    try {
      await commitMutation.mutateAsync(planId);
      toast.success(isHe ? 'לו״ז ננעל ל־7 ימים. בהצלחה.' : 'Schedule locked for 7 days. Execute.');
    } catch {
      toast.error(isHe ? 'שגיאה בנעילת הלו״ז' : 'Error locking schedule');
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full gap-2" variant="default">
          <Lock className="w-4 h-4" />
          {isHe ? 'התחייב ללו״ז' : 'Commit to Schedule'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {isHe ? 'נעילת לו״ז ל־7 ימים' : 'Lock Schedule for 7 Days'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-start space-y-2">
            <p>
              {isHe
                ? 'ברגע שתאשר, הלו״ז ייסגר לשינויים למשך 7 ימים. המערכת תסמן את הביצוע שלך ותעקוב אחרי compliance.'
                : 'Once you confirm, the schedule will be locked for 7 days. The system will track your execution and compliance.'}
            </p>
            <p className="font-semibold">
              {isHe ? 'אין משא ומתן. אתה מתעורר ומבצע.' : 'No negotiation. You wake up and execute.'}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {isHe ? 'עוד לא' : 'Not yet'}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleCommit} disabled={commitMutation.isPending}>
            <Lock className="w-4 h-4 me-1" />
            {commitMutation.isPending
              ? (isHe ? 'נועל...' : 'Locking...')
              : (isHe ? 'אני מתחייב' : 'I Commit')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

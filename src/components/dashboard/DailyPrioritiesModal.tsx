/**
 * @module DailyPrioritiesModal
 * Unclosable modal that asks the user for 5 most important tasks for today.
 * Cannot be dismissed — only submitted with all 5 filled.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useDailyPriorities } from '@/hooks/useDailyPriorities';
import { ListOrdered, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DailyPrioritiesModal() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { filledToday, isLoading, submitPriorities, isSubmitting } = useDailyPriorities();

  const [items, setItems] = useState<string[]>(['', '', '', '', '']);

  if (isLoading || filledToday) return null;

  const allFilled = items.every(i => i.trim().length > 0);

  const handleChange = (idx: number, value: string) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!allFilled) return;
    try {
      await submitPriorities(items.map(i => i.trim()));
      toast.success(isHe ? 'העדיפויות נשמרו — בואו נתחיל!' : 'Priorities saved — let\'s go!');
    } catch {
      toast.error(isHe ? 'שגיאה בשמירה' : 'Failed to save');
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => { /* cannot close */ }}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ListOrdered className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {isHe ? '5 הדברים הכי חשובים להיום' : 'Your 5 Most Important Things Today'}
          </DialogTitle>
          <DialogDescription>
            {isHe
              ? 'לפני שנתחיל — מה חייב לקרות היום? סדר לפי עדיפות.'
              : 'Before we begin — what must get done today? Rank by priority.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {items.map((val, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </span>
              <Input
                value={val}
                onChange={(e) => handleChange(idx, e.target.value)}
                placeholder={isHe ? `עדיפות ${idx + 1}` : `Priority ${idx + 1}`}
                maxLength={120}
                className="flex-1"
                autoFocus={idx === 0}
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allFilled || isSubmitting}
          className="w-full mt-4"
          size="lg"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin me-2" />
          ) : null}
          {isHe ? 'שמור והתחל את היום' : 'Save & Start Your Day'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

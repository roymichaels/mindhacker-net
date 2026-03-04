import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  suggestion: string;
  onAction?: () => void;
  onSkip?: () => void;
}

export function FMAuroraCard({ suggestion, onAction, onSkip }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-medium text-primary">{isHe ? 'אורורה מציעה:' : 'Aurora suggests:'}</p>
          <p className="text-sm text-foreground/90">{suggestion}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onAction}>{isHe ? 'בוא נעשה את זה' : 'Do it →'}</Button>
        <Button size="sm" variant="ghost" onClick={onSkip}>{isHe ? 'דלג' : 'Skip'}</Button>
      </div>
    </div>
  );
}

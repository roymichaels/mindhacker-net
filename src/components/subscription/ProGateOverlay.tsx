import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { useSubscriptionsModal } from '@/contexts/SubscriptionsModalContext';

interface ProGateOverlayProps {
  feature: string;
  className?: string;
}

const ProGateOverlay = ({ feature, className }: ProGateOverlayProps) => {
  const { openSubscriptions } = useSubscriptionsModal();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const messages: Record<string, { he: string; en: string }> = {
    plan: {
      he: 'מנוע התכנון ל-90 יום זמין למנויי Pro',
      en: 'The 90-day plan engine is available for Pro subscribers',
    },
    hypnosis: {
      he: 'ספריית ההיפנוזה זמינה למנויי Pro',
      en: 'The hypnosis library is available for Pro subscribers',
    },
    default: {
      he: 'פיצ׳ר זה זמין למנויי Pro',
      en: 'This feature is available for Pro subscribers',
    },
  };

  const msg = messages[feature] || messages.default;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-8 text-center rounded-2xl',
        'bg-muted/50 backdrop-blur border border-border',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="rounded-full bg-primary/10 p-4">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">
        {isHe ? 'שדרג ל-Pro' : 'Upgrade to Pro'}
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        {isHe ? msg.he : msg.en}
      </p>
      <Button onClick={openSubscriptions} size="lg">
        <Zap className="h-4 w-4 me-2" />
        {isHe ? 'שדרג עכשיו' : 'Upgrade Now'}
      </Button>
    </div>
  );
};

export default ProGateOverlay;

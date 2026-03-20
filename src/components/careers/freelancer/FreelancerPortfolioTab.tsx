import { useTranslation } from '@/hooks/useTranslation';
import { Image } from 'lucide-react';

export default function FreelancerPortfolioTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'תיק עבודות' : 'Portfolio'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isHe ? 'הוסף פרויקטים לתיק העבודות שלך כדי למשוך לקוחות.' : 'Add projects to your portfolio to attract clients.'}
        </p>
      </div>
    </div>
  );
}

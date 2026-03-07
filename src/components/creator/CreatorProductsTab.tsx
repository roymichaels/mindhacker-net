import { useTranslation } from '@/hooks/useTranslation';
import { Package } from 'lucide-react';

export default function CreatorProductsTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'המוצרים שלך' : 'Your Products'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isHe ? 'אין מוצרים עדיין. צור את המוצר הדיגיטלי הראשון שלך!' : 'No products yet. Create your first digital product!'}
        </p>
      </div>
    </div>
  );
}

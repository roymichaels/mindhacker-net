/**
 * @tab Coaches
 * @purpose Mini item card for offers/services in coach detail view
 * @data offers, practitioner_services (via parent)
 */
import { ExternalLink, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export interface MiniItemCardData {
  id: string;
  title: string;
  subtitle?: string;
  price?: number;
  isFree?: boolean;
  accentColor?: string;
  type: 'offer' | 'service';
}

interface CoachMiniItemCardProps {
  item: MiniItemCardData;
  onClick?: () => void;
}

const CoachMiniItemCard = ({ item, onClick }: CoachMiniItemCardProps) => {
  const { isRTL } = useTranslation();

  const accentColor = item.accentColor || 'hsl(var(--primary))';
  const Icon = item.type === 'service' ? Calendar : ExternalLink;

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-[220px] flex-shrink-0 rounded-xl cursor-pointer transition-all duration-200",
        "bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm",
        "border border-border/50 hover:border-primary/40 hover:shadow-md",
        "overflow-hidden group"
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-full">
        <div
          className="w-1 flex-shrink-0 rounded-s"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex-1 p-3 flex flex-col justify-between min-h-[80px]">
          <div>
            <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            {item.subtitle && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.subtitle}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold" style={{ color: accentColor }}>
              {item.isFree
                ? (isRTL ? 'חינם' : 'Free')
                : item.price
                  ? `₪${item.price}`
                  : ''}
            </span>
            <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachMiniItemCard;
/** @deprecated Use CoachMiniItemCard */
export { CoachMiniItemCard as PractitionerMiniItemCard };

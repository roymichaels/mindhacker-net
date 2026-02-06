import { Star, MapPin, CheckCircle, Languages } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/useTranslation';
import type { Practitioner } from '@/hooks/usePractitioners';

interface PractitionerCardProps {
  practitioner: Practitioner;
  onSelect?: (practitioner: Practitioner) => void;
}

const PractitionerCard = ({ practitioner, onSelect }: PractitionerCardProps) => {
  const { t, isRTL, language } = useTranslation();

  const displayName = language === 'en' && practitioner.display_name_en 
    ? practitioner.display_name_en 
    : practitioner.display_name;
    
  const title = language === 'en' && practitioner.title_en 
    ? practitioner.title_en 
    : practitioner.title;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div onClick={() => onSelect?.(practitioner)} className="cursor-pointer">
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={practitioner.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                  {displayName}
                </h3>
                {practitioner.is_verified && (
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{title}</p>

              {practitioner.reviews_count > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{practitioner.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({practitioner.reviews_count} {t('practitioners.reviews')})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {practitioner.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{practitioner.country}</span>
                  </div>
                )}
                {practitioner.languages && practitioner.languages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Languages className="h-3 w-3" />
                    <span>
                      {practitioner.languages.map(l => l === 'he' ? 'עברית' : l === 'en' ? 'English' : l).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {practitioner.is_featured && (
            <Badge variant="secondary" className="absolute top-4 right-4">
              {t('practitioners.featured')}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PractitionerCard;

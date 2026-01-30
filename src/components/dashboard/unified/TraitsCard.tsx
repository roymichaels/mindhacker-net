import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { 
  CHARACTER_TRAITS, 
  TRAIT_CATEGORIES, 
  type CharacterTrait 
} from '@/lib/characterTraits';

interface TraitsCardProps {
  traitIds: string[];
  className?: string;
}

export function TraitsCard({ traitIds, className }: TraitsCardProps) {
  const { t, isRTL, language } = useTranslation();

  if (!traitIds || traitIds.length === 0) return null;

  // Get full trait objects
  const traits = traitIds
    .map((id) => CHARACTER_TRAITS.find((t) => t.id === id))
    .filter(Boolean) as CharacterTrait[];

  if (traits.length === 0) return null;

  // Group by category for display
  const traitsByCategory = traits.reduce((acc, trait) => {
    if (!acc[trait.category]) {
      acc[trait.category] = [];
    }
    acc[trait.category].push(trait);
    return acc;
  }, {} as Record<string, CharacterTrait[]>);

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-violet-500" />
          {language === 'he' ? 'התכונות שאני בונה' : 'Traits I\'m Building'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main traits display */}
        <div className="flex flex-wrap gap-2">
          {traits.slice(0, 6).map((trait) => {
            const categoryInfo = TRAIT_CATEGORIES[trait.category];
            
            return (
              <Badge
                key={trait.id}
                className={cn(
                  "text-xs py-1 px-2",
                  categoryInfo.bgClass,
                  categoryInfo.textClass
                )}
              >
                <span className="mr-1">{trait.icon}</span>
                {language === 'he' ? trait.nameHe : trait.name}
              </Badge>
            );
          })}
          {traits.length > 6 && (
            <Badge variant="outline" className="text-xs">
              +{traits.length - 6}
            </Badge>
          )}
        </div>

        {/* Category summary */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t">
          {Object.entries(traitsByCategory).map(([category, categoryTraits]) => {
            const categoryInfo = TRAIT_CATEGORIES[category as keyof typeof TRAIT_CATEGORIES];
            
            return (
              <div
                key={category}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <span>{categoryInfo.icon}</span>
                <span>{categoryTraits.length}</span>
              </div>
            );
          })}
        </div>

        {/* Encouragement text */}
        <p className="text-xs text-muted-foreground italic">
          {language === 'he' 
            ? `מתמקד ב-${traits.length} תכונות מפתח`
            : `Focusing on ${traits.length} key traits`}
        </p>
      </CardContent>
    </Card>
  );
}

export default TraitsCard;

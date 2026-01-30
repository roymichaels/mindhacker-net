import { Sparkles, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { 
  CHARACTER_TRAITS, 
  TRAIT_CATEGORIES, 
  type CharacterTrait 
} from '@/lib/characterTraits';

interface TraitWithPriority {
  trait: CharacterTrait;
  priority: number;
  isCore: boolean;
}

interface TraitsCardProps {
  traitIds: string[];
  traitMetadata?: Record<string, { priority?: number; isCore?: boolean }>;
  roleModels?: string;
  className?: string;
}

export function TraitsCard({ traitIds, traitMetadata, roleModels, className }: TraitsCardProps) {
  const { t, isRTL, language } = useTranslation();

  if (!traitIds || traitIds.length === 0) return null;

  // Get full trait objects with priority info
  const traitsWithPriority: TraitWithPriority[] = traitIds
    .map((id) => {
      const trait = CHARACTER_TRAITS.find((t) => t.id === id);
      if (!trait) return null;
      
      const metadata = traitMetadata?.[id];
      return {
        trait,
        priority: metadata?.priority ?? 999,
        isCore: metadata?.isCore ?? false,
      };
    })
    .filter(Boolean) as TraitWithPriority[];

  if (traitsWithPriority.length === 0) return null;

  // Sort by priority
  const sortedTraits = [...traitsWithPriority].sort((a, b) => a.priority - b.priority);
  const coreTraits = sortedTraits.filter(t => t.isCore || t.priority <= 3);
  const secondaryTraits = sortedTraits.filter(t => !t.isCore && t.priority > 3);

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-violet-500" />
          {language === 'he' ? 'הזהות שאני בונה' : 'Identity I\'m Building'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Core Traits - Prominent */}
        {coreTraits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {language === 'he' ? 'תכונות ליבה' : 'Core Traits'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {coreTraits.map(({ trait, priority }) => {
                const categoryInfo = TRAIT_CATEGORIES[trait.category];
                
                return (
                  <Badge
                    key={trait.id}
                    className={cn(
                      "text-sm py-1.5 px-3 shadow-sm",
                      `bg-gradient-to-r ${trait.gradient}`,
                      "text-white border-0"
                    )}
                  >
                    <span className={isRTL ? "ml-1.5" : "mr-1.5"}>{trait.icon}</span>
                    {language === 'he' ? trait.nameHe : trait.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Secondary Traits - Smaller */}
        {secondaryTraits.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">
              {language === 'he' ? 'תכונות נוספות' : 'Additional Traits'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {secondaryTraits.map(({ trait }) => {
                const categoryInfo = TRAIT_CATEGORIES[trait.category];
                
                return (
                  <Badge
                    key={trait.id}
                    variant="outline"
                    className={cn(
                      "text-xs py-0.5 px-2",
                      categoryInfo.textClass
                    )}
                  >
                    <span className={isRTL ? "ml-1" : "mr-1"}>{trait.icon}</span>
                    {language === 'he' ? trait.nameHe : trait.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Role Models Quote */}
        {roleModels && roleModels.trim() && (
          <div className="pt-2 border-t space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              {language === 'he' ? '💫 דמויות השראה' : '💫 Role Models'}
            </span>
            <p className="text-sm text-foreground/80 italic line-clamp-3 whitespace-pre-line">
              "{roleModels.trim()}"
            </p>
          </div>
        )}

        {/* Category Summary */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t">
          {Object.entries(
            sortedTraits.reduce((acc, { trait }) => {
              if (!acc[trait.category]) acc[trait.category] = 0;
              acc[trait.category]++;
              return acc;
            }, {} as Record<string, number>)
          ).map(([category, count]) => {
            const categoryInfo = TRAIT_CATEGORIES[category as keyof typeof TRAIT_CATEGORIES];
            
            return (
              <div
                key={category}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <span>{categoryInfo.icon}</span>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default TraitsCard;

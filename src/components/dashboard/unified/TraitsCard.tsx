import { Sparkles, Star, TrendingUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface ArchetypeData {
  archetype: {
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
  };
  coreTraits: Array<{
    name: string;
    nameEn: string;
    icon: string;
    reason: string;
    reasonEn: string;
  }>;
  growthEdges: Array<{
    area: string;
    areaEn: string;
  }>;
  uniqueStrength: string;
  uniqueStrengthEn: string;
}

interface TraitsCardProps {
  archetypeData?: ArchetypeData | null;
  roleModels?: string;
  className?: string;
  traitIds?: string[];
  traitMetadata?: Record<string, { priority?: number; isCore?: boolean }>;
}

export function TraitsCard({ archetypeData, roleModels, className, traitIds, traitMetadata }: TraitsCardProps) {
  const { t, isRTL, language } = useTranslation();
  const isHebrew = language === 'he';

  if (!archetypeData && (!traitIds || traitIds.length === 0)) {
    return (
      <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-violet-500" />
            {t('traitsCard.characterTraits')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            {t('traitsCard.noTraitsYet')}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t('traitsCard.completeLaunchpad')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (archetypeData) {
    return (
      <Card className={cn("overflow-hidden", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-3 bg-gradient-to-br from-violet-500/10 to-purple-600/10">
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">{archetypeData.archetype.icon}</span>
            <div>
              <p className="text-xs text-muted-foreground font-normal mb-0.5">
                {t('traitsCard.yourArchetype')}
              </p>
              <span className="text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {isHebrew ? archetypeData.archetype.name : archetypeData.archetype.nameEn}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isHebrew ? archetypeData.archetype.description : archetypeData.archetype.descriptionEn}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('traitsCard.coreTraits')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {archetypeData.coreTraits.map((trait, index) => (
                <Badge
                  key={index}
                  className="text-sm py-1.5 px-3 bg-gradient-to-r from-violet-500/20 to-purple-600/20 text-foreground border-violet-500/30 hover:from-violet-500/30 hover:to-purple-600/30"
                >
                  <span className={isRTL ? "ml-1.5" : "mr-1.5"}>{trait.icon}</span>
                  {isHebrew ? trait.name : trait.nameEn}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('traitsCard.uniqueStrength')}
              </span>
            </div>
            <p className="text-sm text-foreground font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3 rounded-lg border border-amber-500/20">
              {isHebrew ? archetypeData.uniqueStrength : archetypeData.uniqueStrengthEn}
            </p>
          </div>

          {archetypeData.growthEdges && archetypeData.growthEdges.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('traitsCard.growthAreas')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {archetypeData.growthEdges.map((edge, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs py-0.5 px-2 text-emerald-600 border-emerald-500/30"
                  >
                    🌱 {isHebrew ? edge.area : edge.areaEn}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {roleModels && roleModels.trim() && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {t('traitsCard.roleModels')}
                </span>
              </div>
              <p className="text-sm text-foreground/80 italic line-clamp-3 whitespace-pre-line">
                "{roleModels.trim()}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-violet-500" />
          {t('traitsCard.identityBuilding')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {t('traitsCard.completeIdentity')}
        </p>
      </CardContent>
    </Card>
  );
}

export default TraitsCard;

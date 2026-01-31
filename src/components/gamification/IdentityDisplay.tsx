import React from 'react';
import { cn } from '@/lib/utils';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useLanguage } from '@/contexts/LanguageContext';
import { getArchetypeName, getArchetypeIcon } from '@/lib/orbProfileGenerator';
import { getAvatarDNASummary } from '@/lib/avatarDNA';
import { getAllArchetypes, type ArchetypeId } from '@/lib/archetypes';
import { Sparkles, Zap, Heart, Compass, Brain, Palette } from 'lucide-react';

interface IdentityDisplayProps {
  className?: string;
  showBreakdown?: boolean;
  compact?: boolean;
}

const ARCHETYPE_ICONS: Record<ArchetypeId, React.ReactNode> = {
  warrior: <Zap className="w-4 h-4" />,
  mystic: <Sparkles className="w-4 h-4" />,
  creator: <Palette className="w-4 h-4" />,
  sage: <Brain className="w-4 h-4" />,
  healer: <Heart className="w-4 h-4" />,
  explorer: <Compass className="w-4 h-4" />,
};

export function IdentityDisplay({ 
  className, 
  showBreakdown = false,
  compact = false 
}: IdentityDisplayProps) {
  const { profile, isPersonalized } = useOrbProfile();
  const { language } = useLanguage();
  const isHebrew = language === 'he';

  const dominantArchetype = profile.computedFrom.dominantArchetype || 'explorer';
  const secondaryArchetype = profile.computedFrom.secondaryArchetype;
  const archetypeWeights = profile.computedFrom.archetypeWeights || [];
  const dominantHobbies = profile.computedFrom.dominantHobbies || [];

  // Get archetype display info
  const primaryName = getArchetypeName(dominantArchetype, isHebrew);
  const primaryIcon = getArchetypeIcon(dominantArchetype);
  const secondaryName = secondaryArchetype ? getArchetypeName(secondaryArchetype, isHebrew) : null;

  // Create identity summary
  const identitySummary = secondaryName 
    ? `${primaryName}-${secondaryName}`
    : primaryName;

  if (compact) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-gradient-to-r from-primary/20 to-accent/20',
        'border border-primary/30',
        className
      )}>
        <span className="text-lg">{primaryIcon}</span>
        <span className="text-sm font-medium">{identitySummary}</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Identity Badge */}
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{
            background: `linear-gradient(135deg, hsl(${profile.primaryColor}), hsl(${profile.accentColor}))`,
          }}
        >
          {primaryIcon}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{identitySummary}</h3>
          <p className="text-sm text-muted-foreground">
            {isHebrew ? 'הזהות הדיגיטלית שלך' : 'Your Digital Identity'}
          </p>
        </div>
      </div>

      {/* Personalization Status */}
      {!isPersonalized && (
        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          {isHebrew 
            ? '💡 השלם את הפרופיל האישי כדי לראות את הזהות הייחודית שלך'
            : '💡 Complete your personal profile to see your unique identity'
          }
        </div>
      )}

      {/* Dominant Hobbies */}
      {dominantHobbies.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            {isHebrew ? 'מה משפיע על הזהות שלך' : 'What shapes your identity'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {dominantHobbies.map((hobby) => (
              <span 
                key={hobby}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Archetype Breakdown */}
      {showBreakdown && archetypeWeights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            {isHebrew ? 'הרכב הזהות' : 'Identity Composition'}
          </h4>
          <div className="space-y-2">
            {archetypeWeights.slice(0, 4).map(({ id, weight }) => (
              <div key={id} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted">
                  {ARCHETYPE_ICONS[id]}
                </div>
                <span className="text-sm flex-1">{getArchetypeName(id, isHebrew)}</span>
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(weight * 100)}%`,
                      background: `linear-gradient(90deg, hsl(${profile.primaryColor}), hsl(${profile.accentColor}))`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {Math.round(weight * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
        <div className="text-center">
          <div className="text-lg font-bold text-primary">
            {profile.computedFrom.level}
          </div>
          <div className="text-xs text-muted-foreground">
            {isHebrew ? 'רמה' : 'Level'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">
            {profile.computedFrom.streak}
          </div>
          <div className="text-xs text-muted-foreground">
            {isHebrew ? 'רצף' : 'Streak'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">
            {profile.computedFrom.clarityScore || 0}%
          </div>
          <div className="text-xs text-muted-foreground">
            {isHebrew ? 'בהירות' : 'Clarity'}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mini version for header/sidebar display
 */
export function IdentityBadge({ className }: { className?: string }) {
  const { profile } = useOrbProfile();
  const dominantArchetype = profile.computedFrom.dominantArchetype || 'explorer';
  const icon = getArchetypeIcon(dominantArchetype);

  return (
    <div 
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm',
        'shadow-lg transition-all duration-300 hover:scale-110',
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${profile.primaryColor}), hsl(${profile.accentColor}))`,
      }}
    >
      {icon}
    </div>
  );
}

/**
 * Archetype selector for manual override (optional feature)
 */
export function ArchetypeGrid({ 
  className,
  onSelect 
}: { 
  className?: string;
  onSelect?: (id: ArchetypeId) => void;
}) {
  const { language } = useLanguage();
  const isHebrew = language === 'he';
  const archetypes = getAllArchetypes();

  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-6', className)}>
      {archetypes.map((archetype) => (
        <button
          key={archetype.id}
          onClick={() => onSelect?.(archetype.id)}
          className={cn(
            'flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200',
            'glass-card hover:scale-105 hover:shadow-lg',
            'opacity-70 hover:opacity-100'
          )}
        >
          <span className="text-2xl">{archetype.icon}</span>
          <span className="text-xs font-medium truncate max-w-full">
            {isHebrew ? archetype.nameHe : archetype.name}
          </span>
        </button>
      ))}
    </div>
  );
}

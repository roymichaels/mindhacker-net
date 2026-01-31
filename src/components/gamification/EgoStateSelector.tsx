/**
 * @deprecated Use IdentityDisplay instead
 * This component is kept for backwards compatibility but now displays 
 * the new archetype-based identity system.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { IdentityDisplay, ArchetypeGrid } from './IdentityDisplay';
import { getAllArchetypes, type ArchetypeId } from '@/lib/archetypes';

interface EgoStateSelectorProps {
  className?: string;
  onSelect?: (egoState: { id: string; name: string; nameHe: string; icon: string }) => void;
  showUsage?: boolean;
}

/**
 * @deprecated Use IdentityDisplay or ArchetypeGrid instead
 */
export function EgoStateSelector({ className, onSelect, showUsage = false }: EgoStateSelectorProps) {
  const { language } = useLanguage();
  const isHebrew = language === 'he';

  const archetypes = getAllArchetypes();

  const handleSelect = (archetypeId: ArchetypeId) => {
    const archetype = archetypes.find(a => a.id === archetypeId);
    if (archetype && onSelect) {
      onSelect({
        id: archetype.id,
        name: archetype.name,
        nameHe: archetype.nameHe,
        icon: archetype.icon,
      });
    }
  };

  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-6', className)}>
      {archetypes.map((archetype) => (
        <button
          key={archetype.id}
          onClick={() => handleSelect(archetype.id)}
          className={cn(
            'relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200',
            'hover:scale-105 hover:shadow-lg',
            'glass-card opacity-70 hover:opacity-100'
          )}
        >
          <span className="text-2xl">{archetype.icon}</span>
          <span className={cn(
            'text-xs font-medium truncate max-w-full',
            'text-muted-foreground'
          )}>
            {isHebrew ? archetype.nameHe : archetype.name}
          </span>
        </button>
      ))}
    </div>
  );
}

import type { CognitiveWorldId } from '../types';

export interface EvolutionRule {
  decay: number;
  signature: string;
}

export const WORLD_EVOLUTION: Record<CognitiveWorldId, EvolutionRule> = {
  self:          { decay: 0.995, signature: 'identity-coherence' },
  habits:        { decay: 0.985, signature: 'momentum-and-decay' },
  emotions:      { decay: 0.97,  signature: 'climate-history' },
  beliefs:       { decay: 0.998, signature: 'contradiction-detection' },
  memory:        { decay: 0.999, signature: 'era-clustering' },
  relationships: { decay: 0.99,  signature: 'attachment-evolution' },
  archetypes:    { decay: 0.992, signature: 'shadow-emergence' },
  creative:      { decay: 0.988, signature: 'idea-lineage' },
  higher:        { decay: 0.999, signature: 'alignment-drift' },
};
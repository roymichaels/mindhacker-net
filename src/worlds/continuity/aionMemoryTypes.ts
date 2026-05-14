import type { CognitiveWorldId } from '../types';
import type { Climate } from '../state/worldStateTypes';

export interface ContinuitySignals {
  recurringThemes: Array<{ label: string; count: number; worlds: CognitiveWorldId[] }>;
  dominantClimate: Climate;
  unresolvedLoops: Array<{ worldId: CognitiveWorldId; count: number }>;
  avoidedWorlds: CognitiveWorldId[];
  highEnergyNodes: Array<{ id: string; label: string; weight: number; worldId: CognitiveWorldId }>;
  identityDrift: number;
}

export const emptyContinuity = (): ContinuitySignals => ({
  recurringThemes: [],
  dominantClimate: 'still',
  unresolvedLoops: [],
  avoidedWorlds: [],
  highEnergyNodes: [],
  identityDrift: 0,
});
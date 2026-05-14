/**
 * Directed influence graph between cognitive worlds.
 * `RESONANCE_GRAPH[from][to] = { weight, delayMs, axes }`.
 * Sparse + asymmetric — encodes psychological priors.
 */
import type { CognitiveWorldId } from '../types';

export type ClimateAxis =
  | 'luminosity'
  | 'atmosphericDensity'
  | 'motionIntensity'
  | 'harmonicStability'
  | 'particleActivity'
  | 'resonance'
  | 'emotionalTemperature'
  | 'temporalCoherence';

export interface InfluenceEdge {
  weight: number;
  delayMs: number;
  axes: ClimateAxis[];
}

type Row = Partial<Record<CognitiveWorldId, InfluenceEdge>>;

export const RESONANCE_GRAPH: Record<CognitiveWorldId, Row> = {
  emotions: {
    habits:        { weight: 0.55, delayMs: 9000,  axes: ['harmonicStability', 'motionIntensity'] },
    memory:        { weight: 0.45, delayMs: 6000,  axes: ['emotionalTemperature', 'atmosphericDensity'] },
    relationships: { weight: 0.40, delayMs: 5000,  axes: ['emotionalTemperature', 'resonance'] },
    creative:      { weight: 0.30, delayMs: 8000,  axes: ['motionIntensity', 'particleActivity'] },
    self:          { weight: 0.35, delayMs: 12000, axes: ['emotionalTemperature', 'harmonicStability'] },
  },
  habits: {
    emotions:      { weight: 0.50, delayMs: 11000, axes: ['harmonicStability', 'motionIntensity'] },
    higher:        { weight: 0.30, delayMs: 14000, axes: ['temporalCoherence', 'harmonicStability'] },
    self:          { weight: 0.40, delayMs: 10000, axes: ['harmonicStability', 'luminosity'] },
  },
  memory: {
    emotions:      { weight: 0.45, delayMs: 7000,  axes: ['emotionalTemperature', 'atmosphericDensity'] },
    self:          { weight: 0.40, delayMs: 9000,  axes: ['temporalCoherence', 'particleActivity'] },
    creative:      { weight: 0.35, delayMs: 8000,  axes: ['particleActivity', 'resonance'] },
    archetypes:    { weight: 0.25, delayMs: 10000, axes: ['resonance'] },
  },
  relationships: {
    creative:      { weight: 0.50, delayMs: 6000,  axes: ['particleActivity', 'resonance'] },
    emotions:      { weight: 0.40, delayMs: 5000,  axes: ['emotionalTemperature', 'motionIntensity'] },
    self:          { weight: 0.35, delayMs: 9000,  axes: ['resonance', 'luminosity'] },
  },
  creative: {
    emotions:      { weight: 0.30, delayMs: 7000,  axes: ['emotionalTemperature'] },
    archetypes:    { weight: 0.40, delayMs: 8000,  axes: ['resonance', 'particleActivity'] },
    self:          { weight: 0.30, delayMs: 10000, axes: ['luminosity', 'resonance'] },
  },
  beliefs: {
    archetypes:    { weight: 0.45, delayMs: 9000,  axes: ['harmonicStability', 'resonance'] },
    higher:        { weight: 0.35, delayMs: 12000, axes: ['temporalCoherence'] },
    self:          { weight: 0.30, delayMs: 11000, axes: ['harmonicStability'] },
  },
  archetypes: {
    creative:      { weight: 0.40, delayMs: 7000,  axes: ['particleActivity', 'motionIntensity'] },
    beliefs:       { weight: 0.30, delayMs: 10000, axes: ['harmonicStability'] },
    self:          { weight: 0.30, delayMs: 11000, axes: ['resonance'] },
  },
  higher: {
    self:          { weight: 0.55, delayMs: 8000,  axes: ['harmonicStability', 'temporalCoherence', 'luminosity'] },
    emotions:      { weight: 0.45, delayMs: 10000, axes: ['harmonicStability', 'motionIntensity', 'atmosphericDensity'] },
    habits:        { weight: 0.40, delayMs: 11000, axes: ['harmonicStability', 'temporalCoherence'] },
    memory:        { weight: 0.35, delayMs: 12000, axes: ['temporalCoherence', 'harmonicStability'] },
    relationships: { weight: 0.30, delayMs: 11000, axes: ['harmonicStability', 'luminosity'] },
    creative:      { weight: 0.30, delayMs: 12000, axes: ['harmonicStability'] },
    beliefs:       { weight: 0.30, delayMs: 13000, axes: ['harmonicStability'] },
    archetypes:    { weight: 0.30, delayMs: 13000, axes: ['harmonicStability'] },
  },
  self: {
    emotions:      { weight: 0.30, delayMs: 11000, axes: ['emotionalTemperature', 'harmonicStability'] },
    habits:        { weight: 0.25, delayMs: 12000, axes: ['harmonicStability'] },
    higher:        { weight: 0.30, delayMs: 13000, axes: ['temporalCoherence'] },
  },
};
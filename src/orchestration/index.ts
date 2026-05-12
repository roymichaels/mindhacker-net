export { EnvironmentProvider, useEnvironment, setAolEnabled } from './EnvironmentProvider';
export { ChromeGate } from './ChromeGate';
export { MotionLayer } from './MotionLayer';
export { evaluateFastTier } from './rules/fastTier';
export { buildSignalSnapshot } from './SignalAggregator';
export type {
  EnvironmentState,
  EnvironmentMode,
  EnvironmentIntensity,
  EmotionalTone,
  CognitiveBudget,
  SurfaceId,
  ChromeId,
  OrbState,
  SignalSnapshot,
} from './types';
export { DEFAULT_ENVIRONMENT } from './types';
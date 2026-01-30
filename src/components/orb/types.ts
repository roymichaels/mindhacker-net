export type OrbState = 
  | 'idle'
  | 'listening'
  | 'speaking'
  | 'thinking'
  | 'session'
  | 'breathing';

export interface OrbRef {
  setSpeaking: (speaking: boolean) => void;
  setListening: (listening: boolean) => void;
  setThinking: (thinking: boolean) => void;
  updateState: (state: OrbState) => void;
  setAudioLevel: (level: number) => void;
  setTunnelMode: (enabled: boolean) => void;
}

export interface OrbProfile {
  primaryColor: string;
  secondaryColors: string[];
  accentColor: string;
  morphIntensity: number;
  morphSpeed: number;
  fractalOctaves: number;
  coreIntensity: number;
  coreSize: number;
  layerCount: number;
  geometryDetail: number;
  particleEnabled: boolean;
  particleCount: number;
  particleColor: string;
  computedFrom: {
    egoState: string;
    level: number;
    streak: number;
    topTraitCategories: string[];
    clarityScore: number;
  };
}

export interface OrbProps {
  size?: number;
  state?: OrbState;
  audioLevel?: number;
  tunnelMode?: boolean;
  egoState?: string;
  className?: string;
  showGlow?: boolean;
  onReady?: () => void;
  /** Personalized orb profile */
  profile?: OrbProfile;
}

export interface OrbContextValue {
  orbRef: React.RefObject<OrbRef | null>;
  state: OrbState;
  setState: (state: OrbState) => void;
  audioLevel: number;
  setAudioLevel: (level: number) => void;
  tunnelMode: boolean;
  setTunnelMode: (enabled: boolean) => void;
}

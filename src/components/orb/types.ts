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

export interface OrbProps {
  size?: number;
  state?: OrbState;
  audioLevel?: number;
  tunnelMode?: boolean;
  egoState?: string;
  className?: string;
  onReady?: () => void;
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

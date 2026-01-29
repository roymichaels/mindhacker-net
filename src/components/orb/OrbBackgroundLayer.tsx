import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import type { OrbRef, OrbState, OrbContextValue } from './types';

const OrbContext = createContext<OrbContextValue | null>(null);

export function useOrbContext() {
  const context = useContext(OrbContext);
  if (!context) {
    throw new Error('useOrbContext must be used within OrbBackgroundLayer');
  }
  return context;
}

interface OrbBackgroundLayerProps {
  children: React.ReactNode;
}

export function OrbBackgroundLayer({ children }: OrbBackgroundLayerProps) {
  const orbRef = useRef<OrbRef | null>(null);
  const [state, setStateInternal] = useState<OrbState>('idle');
  const [audioLevel, setAudioLevelInternal] = useState(0);
  const [tunnelMode, setTunnelModeInternal] = useState(false);

  const setState = useCallback((newState: OrbState) => {
    setStateInternal(newState);
    orbRef.current?.updateState(newState);
  }, []);

  const setAudioLevel = useCallback((level: number) => {
    setAudioLevelInternal(level);
    orbRef.current?.setAudioLevel(level);
  }, []);

  const setTunnelMode = useCallback((enabled: boolean) => {
    setTunnelModeInternal(enabled);
    orbRef.current?.setTunnelMode(enabled);
  }, []);

  const value: OrbContextValue = {
    orbRef,
    state,
    setState,
    audioLevel,
    setAudioLevel,
    tunnelMode,
    setTunnelMode,
  };

  return (
    <OrbContext.Provider value={value}>
      {children}
    </OrbContext.Provider>
  );
}

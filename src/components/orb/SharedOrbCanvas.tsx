/**
 * SharedOrbCanvas — Single WebGL context for ALL homepage orbs.
 * Uses drei's <View> to render each orb into its tracked DOM position.
 * Only 1 Canvas = 1 WebGL context, no matter how many orbs.
 */
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';

interface OrbEntry {
  id: string;
  ref: React.RefObject<HTMLDivElement>;
  content: React.ReactNode;
  visible: boolean;
}

interface SharedOrbContextValue {
  register: (id: string, ref: React.RefObject<HTMLDivElement>, content: React.ReactNode) => void;
  unregister: (id: string) => void;
  setVisible: (id: string, visible: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const SharedOrbContext = createContext<SharedOrbContextValue | null>(null);

export function useSharedOrb() {
  return useContext(SharedOrbContext);
}

interface SharedOrbCanvasProps {
  children: React.ReactNode;
}

export function SharedOrbCanvas({ children }: SharedOrbCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const [entries, setEntries] = useState<Map<string, OrbEntry>>(new Map());

  const register = useCallback((id: string, ref: React.RefObject<HTMLDivElement>, content: React.ReactNode) => {
    setEntries(prev => {
      const next = new Map(prev);
      next.set(id, { id, ref, content, visible: false });
      return next;
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setEntries(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const setVisible = useCallback((id: string, visible: boolean) => {
    setEntries(prev => {
      const entry = prev.get(id);
      if (!entry || entry.visible === visible) return prev;
      const next = new Map(prev);
      next.set(id, { ...entry, visible });
      return next;
    });
  }, []);

  const visibleEntries = Array.from(entries.values()).filter(e => e.visible);

  return (
    <SharedOrbContext.Provider value={{ register, unregister, setVisible, containerRef }}>
      <div ref={containerRef} style={{ position: 'relative' }}>
        {children}

        {/* Single WebGL Canvas overlay — renders ALL orbs with shared context */}
        {visibleEntries.length > 0 && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            <Canvas
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
                stencil: false,
                depth: true,
              }}
              style={{ width: '100%', height: '100%' }}
              eventSource={containerRef}
              eventPrefix="client"
            >
              {visibleEntries.map(entry => (
                <View key={entry.id} track={entry.ref as React.RefObject<HTMLElement>}>
                  {entry.content}
                </View>
              ))}
            </Canvas>
          </div>
        )}
      </div>
    </SharedOrbContext.Provider>
  );
}

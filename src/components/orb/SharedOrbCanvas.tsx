/**
 * SharedOrbCanvas — Single WebGL context for ALL orbs on a page.
 * Stores orb DATA (not React nodes) to avoid infinite re-render loops.
 * Renders OrbScene centrally inside the single Canvas.
 */
import React, { createContext, useContext, useRef, useCallback, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import { View, PerspectiveCamera, Environment } from '@react-three/drei';
import { MorphOrbMesh } from './GalleryMorphOrb';
import type { OrbProfile } from './types';

// ─── Entry data (plain objects, no React nodes) ───

interface OrbEntryData {
  id: string;
  ref: React.RefObject<HTMLDivElement>;
  profile: OrbProfile;
  geometryFamily: string;
  level: number;
  randomShapeCount: boolean;
  visible: boolean;
  /** Serialized profile key for change detection */
  profileKey: string;
}

// ─── External store to avoid useState loops ───

type Listener = () => void;

class OrbStore {
  private entries = new Map<string, OrbEntryData>();
  private listeners = new Set<Listener>();
  private snapshot = new Map<string, OrbEntryData>();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  private emit() {
    this.snapshot = new Map(this.entries);
    this.listeners.forEach(l => l());
  }

  register(data: OrbEntryData) {
    const existing = this.entries.get(data.id);
    // Only update if profile actually changed
    if (existing && existing.profileKey === data.profileKey && existing.visible === data.visible) return;
    this.entries.set(data.id, data);
    this.emit();
  }

  unregister(id: string) {
    if (!this.entries.has(id)) return;
    this.entries.delete(id);
    this.emit();
  }

  setVisible(id: string, visible: boolean) {
    const entry = this.entries.get(id);
    if (!entry || entry.visible === visible) return;
    this.entries.set(id, { ...entry, visible });
    this.emit();
  }
}

// ─── Context ───

interface SharedOrbContextValue {
  store: OrbStore;
  containerRef: React.RefObject<HTMLDivElement>;
}

const SharedOrbContext = createContext<SharedOrbContextValue | null>(null);

export function useSharedOrb() {
  return useContext(SharedOrbContext);
}

// ─── Scene rendered per-orb inside the shared Canvas ───

function OrbScene({ entry }: { entry: OrbEntryData }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 2.8]} fov={40} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 8]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 2, -4]} intensity={0.4} color="#8888ff" />
      <directionalLight position={[0, -3, 2]} intensity={0.2} color="#ff88cc" />
      <pointLight position={[2, 3, 4]} intensity={0.5} color="#ffffff" distance={15} />
      <Environment preset="city" background={false} />
      <MorphOrbMesh
        profile={entry.profile}
        geometryFamily={entry.geometryFamily}
        level={entry.level}
        randomShapeCount={entry.randomShapeCount}
      />
    </>
  );
}

// ─── Provider + single Canvas ───

interface SharedOrbCanvasProps {
  children: React.ReactNode;
}

export function SharedOrbCanvas({ children }: SharedOrbCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null!);
  const storeRef = useRef<OrbStore>(null!);
  if (!storeRef.current) storeRef.current = new OrbStore();

  const entries = useSyncExternalStore(storeRef.current.subscribe, storeRef.current.getSnapshot);
  const visibleEntries = Array.from(entries.values()).filter(e => e.visible);

  const ctxValue = useRef<SharedOrbContextValue>({ store: storeRef.current, containerRef });

  return (
    <SharedOrbContext.Provider value={ctxValue.current}>
      <div ref={containerRef} style={{ position: 'relative' }}>
        {children}

        {/* Single WebGL Canvas overlay — renders ALL visible orbs */}
        {visibleEntries.length > 0 && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              zIndex: 50,
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
                  <OrbScene entry={entry} />
                </View>
              ))}
            </Canvas>
          </div>
        )}
      </div>
    </SharedOrbContext.Provider>
  );
}

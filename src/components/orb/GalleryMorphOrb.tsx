/**
 * GalleryMorphOrb – R3F-based morphing orb for the gallery.
 * Uses drei View to share a single WebGL context across all orbs.
 * Each orb smoothly morphs between geometric shapes.
 * Shape count is determined by level: Lv1=1, Lv25=2, Lv50=3, Lv75=4, Lv100=5.
 */
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { View } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbProfile } from './types';

// ─── Shape projection: project icosahedron vertices onto target shapes ───

function projectVertex(nx: number, ny: number, nz: number, shape: string): [number, number, number] {
  switch (shape) {
    case 'cube': {
      const m = Math.max(Math.abs(nx), Math.abs(ny), Math.abs(nz), 0.001);
      return [nx / m, ny / m, nz / m];
    }
    case 'octahedron': {
      const s = Math.abs(nx) + Math.abs(ny) + Math.abs(nz) || 1;
      return [nx / s, ny / s, nz / s];
    }
    case 'cylinder': {
      const xz = Math.sqrt(nx * nx + nz * nz) || 0.001;
      const scale = Math.min(0.85 / xz, 1.5);
      const y = Math.sign(ny) * Math.min(Math.abs(ny * 1.2), 1);
      return [nx * scale, y, nz * scale];
    }
    case 'star': {
      const angle = Math.atan2(nz, nx);
      const elev = Math.abs(ny);
      const spike = 0.5 + 0.5 * Math.pow(Math.abs(Math.cos(angle * 5)), 0.6) * (1 - elev * 0.5);
      return [nx * spike, ny * spike * 0.8, nz * spike];
    }
    case 'diamond': {
      const ay = Math.abs(ny);
      const waist = 1.2 * (1 - ay * 0.8);
      return [nx * waist, ny * 1.1, nz * waist];
    }
    case 'tetra': {
      // Tetrahedron-like: 4-sided pyramid shape
      const ty = ny * 1.2;
      const tscale = 1.0 - Math.max(0, ny) * 0.6;
      return [nx * tscale, ty, nz * tscale];
    }
    default: // sphere
      return [nx, ny, nz];
  }
}

function computeShapePositions(basePos: Float32Array, shape: string, radius: number): Float32Array {
  const out = new Float32Array(basePos.length);
  for (let i = 0; i < basePos.length; i += 3) {
    const x = basePos[i], y = basePos[i + 1], z = basePos[i + 2];
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    const [px, py, pz] = projectVertex(x / len, y / len, z / len, shape);
    out[i] = px * radius;
    out[i + 1] = py * radius;
    out[i + 2] = pz * radius;
  }
  return out;
}

// ─── Full shape pool per geometry family (5 shapes each) ───

const ALL_SHAPES: Record<string, string[]> = {
  sphere:   ['sphere', 'cube', 'diamond', 'star', 'octahedron'],
  cube:     ['cube', 'octahedron', 'sphere', 'diamond', 'star'],
  dodeca:   ['sphere', 'octahedron', 'star', 'diamond', 'cube'],
  icosa:    ['sphere', 'star', 'diamond', 'octahedron', 'cube'],
  octa:     ['octahedron', 'cube', 'diamond', 'sphere', 'star'],
  spiky:    ['star', 'octahedron', 'sphere', 'diamond', 'cube'],
  tetra:    ['diamond', 'octahedron', 'sphere', 'tetra', 'star'],
  torus:    ['sphere', 'cylinder', 'star', 'diamond', 'octahedron'],
  cone:     ['diamond', 'sphere', 'octahedron', 'star', 'cube'],
  cylinder: ['cylinder', 'cube', 'sphere', 'diamond', 'star'],
  capsule:  ['sphere', 'cylinder', 'diamond', 'star', 'octahedron'],
  knot:     ['star', 'sphere', 'octahedron', 'diamond', 'cube'],
};

/**
 * Get the number of morph shapes based on user level.
 * Lv 1-24: 1 shape (static), Lv 25-49: 2, Lv 50-74: 3, Lv 75-99: 4, Lv 100+: 5
 */
export function getShapeCountForLevel(level: number): number {
  if (level >= 100) return 5;
  if (level >= 75) return 4;
  if (level >= 50) return 3;
  if (level >= 25) return 2;
  return 1;
}

/**
 * Get the shapes array for a given geometry family and level.
 */
export function getShapesForLevel(geometryFamily: string, level: number): string[] {
  const all = ALL_SHAPES[geometryFamily] || ALL_SHAPES.sphere;
  const count = getShapeCountForLevel(level);
  return all.slice(0, count);
}

// ─── HSL parser ───

function hslToColor(hsl: string): THREE.Color {
  const p = hsl.trim().split(/[\s,%]+/);
  const h = (parseFloat(p[0]) || 0) / 360;
  const s = (parseFloat(p[1]) || 50) / 100;
  const l = (parseFloat(p[2]) || 50) / 100;
  return new THREE.Color().setHSL(h, s, l);
}

// ─── Morphing Mesh (used inside View or standalone Canvas) ───

interface MorphOrbMeshProps {
  profile: OrbProfile;
  geometryFamily?: string;
  /** Level determines how many shapes the orb morphs between */
  level?: number;
}

export function MorphOrbMesh({ profile, geometryFamily = 'sphere', level = 100 }: MorphOrbMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shapes = useMemo(
    () => getShapesForLevel(geometryFamily, level),
    [geometryFamily, level]
  );

  const { geometry, shapeArrays } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 3);
    const base = (geo.attributes.position.array as Float32Array).slice();
    const arrays = shapes.map(s => computeShapePositions(base, s, 1));
    return { geometry: geo, shapeArrays: arrays };
  }, [shapes]);

  const matProps = useMemo(() => ({
    color: hslToColor(profile.primaryColor || '200 50% 50%'),
    emissive: hslToColor(profile.accentColor || profile.primaryColor || '200 50% 60%'),
    metalness: profile.materialParams?.metalness ?? 0.3,
    roughness: profile.materialParams?.roughness ?? 0.4,
    emissiveIntensity: profile.materialParams?.emissiveIntensity ?? 0.15,
  }), [profile]);

  const stateRef = useRef({ timer: Math.random() * 8 });

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const st = stateRef.current;
    st.timer += delta;

    const positions = meshRef.current.geometry.attributes.position;
    const arr = positions.array as Float32Array;

    if (shapes.length <= 1) {
      // Single shape — no morphing, just apply the shape statically
      const from = shapeArrays[0];
      for (let i = 0; i < arr.length; i++) arr[i] = from[i];
    } else {
      const HOLD = 2.5, MORPH = 1.2;
      const CYCLE = HOLD + MORPH;
      const t = st.timer % CYCLE;
      const idx = Math.floor(st.timer / CYCLE) % shapes.length;
      const next = (idx + 1) % shapes.length;

      const from = shapeArrays[idx], to = shapeArrays[next];

      if (t < HOLD) {
        for (let i = 0; i < arr.length; i++) arr[i] = from[i];
      } else {
        const p = (t - HOLD) / MORPH;
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        for (let i = 0; i < arr.length; i++) arr[i] = from[i] + (to[i] - from[i]) * e;
      }
    }

    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    meshRef.current.rotation.y += delta * 0.35;
    meshRef.current.rotation.x = Math.sin(st.timer * 0.15) * 0.12;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color={matProps.color}
        metalness={matProps.metalness}
        roughness={matProps.roughness}
        emissive={matProps.emissive}
        emissiveIntensity={matProps.emissiveIntensity}
      />
    </mesh>
  );
}

// ─── Public: GalleryOrbView (place in DOM, renders via shared Canvas) ───

interface GalleryOrbViewProps {
  profile: OrbProfile;
  geometryFamily: string;
  size: number;
  level?: number;
  className?: string;
}

export function GalleryOrbView({ profile, geometryFamily, size, level = 100, className }: GalleryOrbViewProps) {
  return (
    <View className={className} style={{ width: size, height: size, margin: '0 auto' }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 5]} intensity={1.2} />
      <directionalLight position={[-2, -1, -3]} intensity={0.3} color="#8888ff" />
      <perspectiveCamera position={[0, 0, 3.2]} fov={40} />
      <MorphOrbMesh profile={profile} geometryFamily={geometryFamily} level={level} />
    </View>
  );
}

// ─── Public: Standalone morphing orb in its own Canvas (for single-orb use) ───

interface StandaloneMorphOrbProps {
  profile: OrbProfile;
  geometryFamily: string;
  size: number;
  level?: number;
}

export function StandaloneMorphOrb({ profile, geometryFamily, size, level = 100 }: StandaloneMorphOrbProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 3.2], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 5]} intensity={1.2} />
        <directionalLight position={[-2, -1, -3]} intensity={0.3} color="#8888ff" />
        <MorphOrbMesh profile={profile} geometryFamily={geometryFamily} level={level} />
      </Canvas>
    </div>
  );
}

// ─── Public: GalleryCanvas (one per page, renders all Views) ───

interface GalleryCanvasProps {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function GalleryCanvas({ children, containerRef }: GalleryCanvasProps) {
  return (
    <>
      {children}
      <Canvas
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        eventSource={containerRef}
        eventPrefix="client"
      >
        <View.Port />
      </Canvas>
    </>
  );
}

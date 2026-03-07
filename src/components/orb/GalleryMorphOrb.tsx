/**
 * GalleryMorphOrb – R3F-based morphing orb for the gallery.
 * Uses drei View to share a single WebGL context across all orbs.
 * Each orb smoothly morphs between geometric shapes in a continuous,
 * organic, alien-liquid way with proper 3D lighting and materials.
 */
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { View, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbProfile } from './types';

// ─── Shape projection ───

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
      const ty = ny * 1.2;
      const tscale = 1.0 - Math.max(0, ny) * 0.6;
      return [nx * tscale, ty, nz * tscale];
    }
    default:
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

export function getShapeCountForLevel(level: number): number {
  if (level >= 100) return 5;
  if (level >= 75) return 4;
  if (level >= 50) return 3;
  if (level >= 25) return 2;
  return 1;
}

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

// ─── Organic noise displacement ───

function noise3D(x: number, y: number, z: number): number {
  // Simple pseudo-noise using sin combinations for organic feel
  return (
    Math.sin(x * 1.7 + y * 2.3) * 0.3 +
    Math.sin(y * 3.1 + z * 1.4) * 0.25 +
    Math.sin(z * 2.8 + x * 1.9) * 0.2 +
    Math.sin(x * 4.3 + z * 3.7) * 0.15 +
    Math.sin(y * 5.1 + x * 2.6 + z * 1.8) * 0.1
  );
}

// ─── Elemental material presets ───
// Maps materialType to visually dramatic, distinct elemental looks

function getElementalMaterial(profile: OrbProfile) {
  const primary = hslToColor(profile.primaryColor || '200 50% 50%');
  const accent = hslToColor(profile.accentColor || profile.primaryColor || '200 50% 60%');
  const mat = profile.materialType || 'glass';

  // Each material type maps to a completely different elemental feel
  const presets: Record<string, any> = {
    // METAL → Earth/Rock: heavy, opaque, rough stone with metallic veins
    metal: {
      color: primary, emissive: new THREE.Color().setHSL(0.08, 0.6, 0.15),
      metalness: 0.95, roughness: 0.25,
      clearcoat: 0.1, clearcoatRoughness: 0.3,
      emissiveIntensity: 0.05, envMapIntensity: 3.5,
      transmission: 0, ior: 1.5, thickness: 0,
      sheen: 0, sheenRoughness: 0, sheenColor: undefined,
      iridescence: 0, iridescenceIOR: 1.3,
      opacity: 1, transparent: false,
      flatShading: true,
    },
    // GLASS → Water/Ice: transparent, refractive, cool shimmer
    glass: {
      color: primary, emissive: accent.clone().multiplyScalar(0.3),
      metalness: 0.0, roughness: 0.0,
      clearcoat: 1.0, clearcoatRoughness: 0.0,
      emissiveIntensity: 0.03, envMapIntensity: 2.5,
      transmission: 0.85, ior: 1.33, thickness: 0.8,
      sheen: 0, sheenRoughness: 0, sheenColor: undefined,
      iridescence: 0, iridescenceIOR: 1.3,
      opacity: 1, transparent: true,
      flatShading: false,
    },
    // PLASMA → Fire/Lava: glowing, emissive, hot colors
    plasma: {
      color: new THREE.Color().setHSL(0.05, 0.9, 0.3),
      emissive: primary,
      metalness: 0.0, roughness: 0.3,
      clearcoat: 0.4, clearcoatRoughness: 0.1,
      emissiveIntensity: 1.2, envMapIntensity: 0.5,
      transmission: 0, ior: 1.5, thickness: 0,
      sheen: 0, sheenRoughness: 0, sheenColor: undefined,
      iridescence: 0.2, iridescenceIOR: 1.5,
      opacity: 1, transparent: false,
      flatShading: true,
    },
    // IRIDESCENT → Ether/Spirit: rainbow shifting, otherworldly
    iridescent: {
      color: primary, emissive: accent,
      metalness: 0.3, roughness: 0.0,
      clearcoat: 1.0, clearcoatRoughness: 0.0,
      emissiveIntensity: 0.15, envMapIntensity: 2.0,
      transmission: 0.2, ior: 2.2, thickness: 0.3,
      sheen: 1.0, sheenRoughness: 0.1, sheenColor: accent,
      iridescence: 1.0, iridescenceIOR: 2.3,
      opacity: 0.88, transparent: true,
      flatShading: false,
    },
    // WIRE → Air/Wind: ghostly, semi-transparent, diffuse glow
    wire: {
      color: primary.clone().multiplyScalar(1.5),
      emissive: accent,
      metalness: 0.0, roughness: 0.9,
      clearcoat: 0.0, clearcoatRoughness: 0.8,
      emissiveIntensity: 0.3, envMapIntensity: 0.3,
      transmission: 0, ior: 1.0, thickness: 0,
      sheen: 0.8, sheenRoughness: 0.4, sheenColor: primary,
      iridescence: 0, iridescenceIOR: 1.3,
      opacity: 0.55, transparent: true,
      flatShading: true,
    },
  };

  return presets[mat] || presets.glass;
}

// ─── Morphing Mesh ───

interface MorphOrbMeshProps {
  profile: OrbProfile;
  geometryFamily?: string;
  level?: number;
  /** For gallery: override shape count with random 1-5 */
  randomShapeCount?: boolean;
}

export function MorphOrbMesh({ profile, geometryFamily = 'sphere', level = 100, randomShapeCount = false }: MorphOrbMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Stable random seed per instance for consistent randomness
  const instanceSeed = useRef(Math.random());

  const shapes = useMemo(() => {
    if (randomShapeCount) {
      // Random 1-5 shapes per gallery orb
      const all = ALL_SHAPES[geometryFamily] || ALL_SHAPES.sphere;
      const count = Math.floor(instanceSeed.current * 5) + 1; // 1-5
      // Shuffle based on seed
      const shuffled = [...all].sort((a, b) => {
        const ha = a.charCodeAt(0) * instanceSeed.current;
        const hb = b.charCodeAt(0) * instanceSeed.current;
        return ha - hb;
      });
      return shuffled.slice(0, count);
    }
    return getShapesForLevel(geometryFamily, level);
  }, [geometryFamily, level, randomShapeCount]);

  const { geometry, shapeArrays } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 4);
    const base = (geo.attributes.position.array as Float32Array).slice();
    const arrays = shapes.map(s => computeShapePositions(base, s, 1));
    return { geometry: geo, shapeArrays: arrays, basePositions: base };
  }, [shapes]);

  const matProps = useMemo(() => getElementalMaterial(profile), [profile]);

  // Multiple random seeds for chaotic organic variation
  const stateRef = useRef({
    timer: Math.random() * 200,
    seed1: Math.random() * 100,
    seed2: Math.random() * 100,
    seed3: Math.random() * 100,
    seed4: Math.random() * 100,
    seed5: Math.random() * 100,
  });

  const mat = profile.materialType || 'glass';

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const st = stateRef.current;
    st.timer += delta;
    const t = st.timer;

    const positions = meshRef.current.geometry.attributes.position;
    const arr = positions.array as Float32Array;
    const vertCount = arr.length / 3;

    if (shapes.length <= 1) {
      // Single shape with organic breathing
      const from = shapeArrays[0];
      for (let vi = 0; vi < vertCount; vi++) {
        const i3 = vi * 3;
        const bx = from[i3], by = from[i3 + 1], bz = from[i3 + 2];
        const n = noise3D(bx * 2 + t * 0.3 + st.seed1, by * 2 + t * 0.25, bz * 2 + t * 0.2);
        const disp = 0.05 + 0.04 * Math.sin(t * 0.5 + vi * 0.03);
        const s = 0.82;
        arr[i3]     = (bx + bx * n * disp) * s;
        arr[i3 + 1] = (by + by * n * disp) * s;
        arr[i3 + 2] = (bz + bz * n * disp) * s;
      }
    } else {
      // Fast morph, chaotic multi-shape blending
      const morphSpeed = 2.2; // faster morph
      const totalShapes = shapes.length;

      for (let vi = 0; vi < vertCount; vi++) {
        const i3 = vi * 3;
        let bx = 0, by = 0, bz = 0;
        let totalWeight = 0;

        for (let si = 0; si < totalShapes; si++) {
          // Multiple overlapping waves with different frequencies for chaos
          const phase = st.seed1 + si * 2.39996;
          const w = Math.max(0,
            Math.sin(t * morphSpeed + phase) * 0.4 +
            Math.sin(t * morphSpeed * 1.3 + phase * 0.7 + st.seed2) * 0.25 +
            Math.sin(t * morphSpeed * 0.5 + phase * 2.1 + st.seed3) * 0.15 +
            Math.cos(t * morphSpeed * 0.8 + si * st.seed4 * 0.3) * 0.2
          );
          bx += shapeArrays[si][i3] * w;
          by += shapeArrays[si][i3 + 1] * w;
          bz += shapeArrays[si][i3 + 2] * w;
          totalWeight += w;
        }

        if (totalWeight > 0) {
          bx /= totalWeight;
          by /= totalWeight;
          bz /= totalWeight;
        }

        // More aggressive organic displacement
        const n = noise3D(
          bx * 3 + t * 0.5 + st.seed1,
          by * 3 + t * 0.4 + st.seed2,
          bz * 3 + t * 0.35 + st.seed3
        );
        const disp = 0.035 + 0.025 * Math.sin(t * 0.8 + vi * 0.03 + st.seed4);

        const s = 0.82;
        arr[i3]     = (bx + bx * n * disp) * s;
        arr[i3 + 1] = (by + by * n * disp) * s;
        arr[i3 + 2] = (bz + bz * n * disp) * s;
      }
    }

    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();

    // Slower, more random rotation
    meshRef.current.rotation.y += delta * 0.12;
    meshRef.current.rotation.x = Math.sin(t * 0.13 + st.seed1) * 0.2 + Math.sin(t * 0.07 + st.seed3) * 0.1;
    meshRef.current.rotation.z = Math.cos(t * 0.09 + st.seed2) * 0.12 + Math.sin(t * 0.17 + st.seed5) * 0.08;

    // Animate emissive for fire/plasma types
    if (mat === 'plasma' && matRef.current) {
      const flicker = 0.8 + Math.sin(t * 3 + st.seed1) * 0.3 + Math.sin(t * 7 + st.seed2) * 0.15;
      matRef.current.emissiveIntensity = flicker;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhysicalMaterial
        ref={matRef}
        color={matProps.color}
        metalness={matProps.metalness}
        roughness={matProps.roughness}
        clearcoat={matProps.clearcoat}
        clearcoatRoughness={matProps.clearcoatRoughness}
        emissive={matProps.emissive}
        emissiveIntensity={matProps.emissiveIntensity}
        envMapIntensity={matProps.envMapIntensity}
        transmission={matProps.transmission}
        ior={matProps.ior}
        thickness={matProps.thickness}
        sheen={matProps.sheen}
        sheenRoughness={matProps.sheenRoughness}
        sheenColor={matProps.sheenColor}
        iridescence={matProps.iridescence}
        iridescenceIOR={matProps.iridescenceIOR}
        opacity={matProps.opacity}
        transparent={matProps.transparent}
        flatShading={matProps.flatShading}
      />
    </mesh>
  );
}

// ─── Shared lighting rig for rich 3D look ───

function OrbLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 8]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-3, 2, -4]} intensity={0.6} color="#aaaaff" />
      <directionalLight position={[0, -3, 2]} intensity={0.3} color="#ffaadd" />
      <pointLight position={[2, 3, 4]} intensity={0.8} color="#ffffff" distance={15} />
      <Environment preset="studio" />
    </>
  );
}

// ─── Public: GalleryOrbView ───

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
      <OrbLighting />
      <perspectiveCamera position={[0, 0, 3]} fov={40} />
      <MorphOrbMesh profile={profile} geometryFamily={geometryFamily} level={level} />
    </View>
  );
}

// ─── Public: Standalone morphing orb ───

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
        camera={{ position: [0, 0, 3], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbLighting />
        <MorphOrbMesh profile={profile} geometryFamily={geometryFamily} level={level} />
      </Canvas>
    </div>
  );
}

// ─── Public: GalleryCanvas ───

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

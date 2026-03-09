/**
 * GalleryMorphOrb – R3F-based morphing orb for the gallery.
 * Uses distinct base geometries per family and dramatically different
 * material presets so every orb is visually unique in WebGL.
 */
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
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
      const capScale = Math.min(0.7 / xz, 1.5);
      const y = Math.sign(ny) * Math.min(Math.abs(ny * 1.4), 1);
      return [nx * capScale, y, nz * capScale];
    }
    case 'star': {
      const angle = Math.atan2(nz, nx);
      const elev = Math.abs(ny);
      const spike = 0.4 + 0.6 * Math.pow(Math.abs(Math.cos(angle * 5)), 0.4) * (1 - elev * 0.5);
      return [nx * spike, ny * spike * 0.7, nz * spike];
    }
    case 'diamond': {
      const ay = Math.abs(ny);
      const waist = 1.3 * (1 - ay * 0.85);
      return [nx * waist, ny * 1.2, nz * waist];
    }
    case 'tetra': {
      const ty = ny * 1.3;
      const tscale = 1.0 - Math.max(0, ny) * 0.7;
      return [nx * tscale, ty, nz * tscale];
    }
    case 'torus': {
      // Project sphere onto a donut (torus) shape
      const theta = Math.atan2(nz, nx); // angle around major axis
      const R = 0.7; // major radius
      const r = 0.35; // minor radius
      // Map ny to angle around the tube
      const phi = ny * Math.PI;
      const cx = Math.cos(theta) * R;
      const cz = Math.sin(theta) * R;
      const tubeX = Math.cos(theta) * (R + r * Math.cos(phi));
      const tubeZ = Math.sin(theta) * (R + r * Math.cos(phi));
      const tubeY = r * Math.sin(phi);
      return [tubeX, tubeY, tubeZ];
    }
    case 'knot': {
      // Trefoil knot-like projection
      const t2 = Math.atan2(nz, nx) * 1.5;
      const kR = 0.55 + 0.25 * Math.cos(3 * t2);
      const kY = 0.35 * Math.sin(3 * t2);
      const kr = 0.22;
      const kphi = ny * Math.PI;
      return [
        Math.cos(t2) * (kR + kr * Math.cos(kphi)),
        kY + kr * Math.sin(kphi),
        Math.sin(t2) * (kR + kr * Math.cos(kphi)),
      ];
    }
    case 'capsule': {
      const xzLen = Math.sqrt(nx * nx + nz * nz) || 0.001;
      const capsR = 0.55;
      const capH = 0.5;
      const capScale = capsR / xzLen;
      if (Math.abs(ny) > capH) {
        // Hemisphere caps
        const capNy = Math.sign(ny);
        const sphereScale = capsR / Math.sqrt(nx * nx + (ny - capNy * capH) * (ny - capNy * capH) + nz * nz || 0.001);
        return [nx * sphereScale, (ny - capNy * capH) * sphereScale + capNy * capH, nz * sphereScale];
      }
      return [nx * Math.min(capScale, 1.5), ny * 1.2, nz * Math.min(capScale, 1.5)];
    }
    case 'cone': {
      const coneY = ny * 1.1;
      const coneScale = Math.max(0.05, 1.0 - (ny + 1) * 0.45);
      return [nx * coneScale, coneY, nz * coneScale];
    }
    case 'spike': {
      // Extreme spiky projection
      const spikeAngle = Math.atan2(nz, nx);
      const spikeElev = Math.acos(ny);
      const spikeN = 6;
      const spikeStr = Math.pow(Math.abs(Math.cos(spikeAngle * spikeN)), 2.0) * Math.pow(Math.abs(Math.sin(spikeElev * spikeN)), 2.0);
      const spikeR = 0.5 + spikeStr * 0.7;
      return [nx * spikeR, ny * spikeR, nz * spikeR];
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
// Each family morphs between shapes that showcase its unique identity

const ALL_SHAPES: Record<string, string[]> = {
  sphere:   ['sphere', 'cube', 'diamond', 'star', 'octahedron'],
  cube:     ['cube', 'octahedron', 'sphere', 'diamond', 'cylinder'],
  dodeca:   ['sphere', 'octahedron', 'star', 'diamond', 'cube'],
  icosa:    ['sphere', 'star', 'diamond', 'octahedron', 'cube'],
  octa:     ['octahedron', 'cube', 'diamond', 'sphere', 'star'],
  spiky:    ['spike', 'star', 'octahedron', 'sphere', 'diamond'],
  tetra:    ['tetra', 'diamond', 'octahedron', 'cone', 'star'],
  torus:    ['torus', 'sphere', 'cylinder', 'torus', 'star'],
  cone:     ['cone', 'diamond', 'tetra', 'sphere', 'octahedron'],
  cylinder: ['cylinder', 'cube', 'capsule', 'sphere', 'diamond'],
  capsule:  ['capsule', 'sphere', 'cylinder', 'diamond', 'star'],
  knot:     ['knot', 'torus', 'sphere', 'star', 'knot'],
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
  return (
    Math.sin(x * 1.7 + y * 2.3) * 0.3 +
    Math.sin(y * 3.1 + z * 1.4) * 0.25 +
    Math.sin(z * 2.8 + x * 1.9) * 0.2 +
    Math.sin(x * 4.3 + z * 3.7) * 0.15 +
    Math.sin(y * 5.1 + x * 2.6 + z * 1.8) * 0.1
  );
}

// ─── Elemental material presets ───
// DRAMATICALLY DISTINCT materials - each must be recognizable at 90px

function getElementalMaterial(profile: OrbProfile) {
  const primary = hslToColor(profile.primaryColor || '200 50% 50%');
  const mat = profile.materialType || 'glass';

  const hsl = { h: 0, s: 0, l: 0 };
  primary.getHSL(hsl);

  // ── NORMALIZE brightness: keep lightness in a moderate range for 3D depth ──
  // Too bright kills shadows/highlights → looks flat 2D
  hsl.l = Math.max(0.35, Math.min(hsl.l, 0.55)); // keep in 3D-friendly range
  hsl.s = Math.max(hsl.s, 0.35); // ensure minimum saturation

  const base = {
    sheen: 0, sheenRoughness: 0, sheenColor: undefined as THREE.Color | undefined,
    iridescence: 0, iridescenceIOR: 1.3,
    transmission: 0, ior: 1.5, thickness: 0,
  };

  switch (mat) {
    // ── METAL: Bright polished chrome, strong reflections ──
    case 'metal': {
      const brightMetal = new THREE.Color().setHSL(hsl.h, Math.min(hsl.s * 0.7, 0.5), 0.4);
      const highlight = new THREE.Color().setHSL(hsl.h, 0.3, 0.2);
      return { ...base, color: brightMetal, emissive: highlight,
        metalness: 1.0, roughness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.05,
        emissiveIntensity: 0.15, envMapIntensity: 2.5,
        opacity: 1, transparent: false, flatShading: true, wireframe: false,
      };
    }
    // ── GLASS: Translucent, bright, smooth, refractive ──
    case 'glass': {
      const paleGlass = new THREE.Color().setHSL(hsl.h, Math.max(hsl.s, 0.5), 0.55);
      const innerGlow = new THREE.Color().setHSL(hsl.h, 0.6, 0.3);
      return { ...base, color: paleGlass, emissive: innerGlow,
        metalness: 0.0, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.0,
        emissiveIntensity: 0.15, envMapIntensity: 1.5,
        transmission: 0.4, ior: 1.8, thickness: 1.5,
        opacity: 0.6, transparent: true, flatShading: false, wireframe: false,
      };
    }
    // ── PLASMA: Self-illuminating, pulsing ──
    case 'plasma': {
      const hotCore = new THREE.Color().setHSL(hsl.h, 1.0, 0.45);
      const glow = new THREE.Color().setHSL((hsl.h + 0.05) % 1, 1.0, 0.4);
      return { ...base, color: hotCore, emissive: glow,
        metalness: 0.0, roughness: 0.4, clearcoat: 0.0, clearcoatRoughness: 0.5,
        emissiveIntensity: 0.6, envMapIntensity: 0.3,
        opacity: 1, transparent: false, flatShading: false, wireframe: false,
      };
    }
    // ── IRIDESCENT: Rainbow sheen, pearlescent, color-shifting ──
    case 'iridescent': {
      const pearl = new THREE.Color().setHSL(hsl.h, 0.6, 0.5);
      const shift = new THREE.Color().setHSL((hsl.h + 0.3) % 1, 0.7, 0.3);
      return { ...base, color: pearl, emissive: shift,
        metalness: 0.4, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.0,
        emissiveIntensity: 0.15, envMapIntensity: 1.8,
        sheen: 1.0, sheenRoughness: 0.05, sheenColor: shift,
        iridescence: 1.0, iridescenceIOR: 2.5,
        opacity: 0.9, transparent: true, flatShading: false, wireframe: false,
      };
    }
    // ── WIRE: Redirect to crystal (wire/mesh removed) ──
    case 'wire': {
      const crystalC2 = new THREE.Color().setHSL(hsl.h, 0.7, 0.65);
      const refract2 = new THREE.Color().setHSL((hsl.h + 0.1) % 1, 0.8, 0.55);
      return { ...base, color: crystalC2, emissive: refract2,
        metalness: 0.1, roughness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.0,
        emissiveIntensity: 0.5, envMapIntensity: 2.5,
        transmission: 0.3, ior: 2.4, thickness: 1.0,
        opacity: 0.75, transparent: true, flatShading: true, wireframe: false,
      };
    }
    // ── LAVA: Dark crust with molten glow ──
    case 'lava': {
      const crust = new THREE.Color().setHSL(hsl.h, 0.6, 0.15);
      const magma = new THREE.Color().setHSL(hsl.h, 1.0, 0.45);
      return { ...base, color: crust, emissive: magma,
        metalness: 0.0, roughness: 0.85, clearcoat: 0.0, clearcoatRoughness: 1.0,
        emissiveIntensity: 0.7, envMapIntensity: 0.2,
        opacity: 1, transparent: false, flatShading: true, wireframe: false,
      };
    }
    // ── CRYSTAL: Sharp facets, semi-transparent, sparkle ──
    case 'crystal': {
      const crystalC = new THREE.Color().setHSL(hsl.h, 0.65, 0.5);
      const refract = new THREE.Color().setHSL((hsl.h + 0.1) % 1, 0.6, 0.3);
      return { ...base, color: crystalC, emissive: refract,
        metalness: 0.1, roughness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.0,
        emissiveIntensity: 0.15, envMapIntensity: 2.0,
        transmission: 0.3, ior: 2.4, thickness: 1.0,
        opacity: 0.75, transparent: true, flatShading: true, wireframe: false,
      };
    }
    // ── MATTE: Flat, chalky, uniform ──
    case 'matte': {
      const flat = new THREE.Color().setHSL(hsl.h, Math.min(hsl.s, 0.45), 0.6);
      const matteGlow = new THREE.Color().setHSL(hsl.h, 0.35, 0.4);
      return { ...base, color: flat, emissive: matteGlow,
        metalness: 0.0, roughness: 1.0, clearcoat: 0.0, clearcoatRoughness: 1.0,
        emissiveIntensity: 0.3, envMapIntensity: 0.3,
        opacity: 1, transparent: false, flatShading: false, wireframe: false,
      };
    }
    // ── NEBULA: Cosmic colors, inner glow ──
    case 'nebula': {
      const deepSpace = new THREE.Color().setHSL((hsl.h + 0.7) % 1, 0.65, 0.25);
      const starGlow = new THREE.Color().setHSL((hsl.h + 0.5) % 1, 0.7, 0.35);
      return { ...base, color: deepSpace, emissive: starGlow,
        metalness: 0.0, roughness: 0.5, clearcoat: 0.2, clearcoatRoughness: 0.3,
        emissiveIntensity: 0.4, envMapIntensity: 0.5,
        opacity: 0.85, transparent: true, flatShading: false, wireframe: false,
      };
    }
    // ── OBSIDIAN: Dark with reflections and edge glow ──
    case 'obsidian': {
      const obsBlack = new THREE.Color().setHSL(hsl.h, 0.15, 0.12);
      const edgeGlow = new THREE.Color().setHSL(hsl.h, 0.4, 0.2);
      return { ...base, color: obsBlack, emissive: edgeGlow,
        metalness: 0.9, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.0,
        emissiveIntensity: 0.15, envMapIntensity: 2.5,
        opacity: 1, transparent: false, flatShading: true, wireframe: false,
      };
    }
    // ── TIGER: Warm, vibrant, organic ──
    case 'tiger': {
      const warmBase = new THREE.Color().setHSL(hsl.h, 0.75, 0.4);
      const warmGlow = new THREE.Color().setHSL(hsl.h, 0.6, 0.2);
      return { ...base, color: warmBase, emissive: warmGlow,
        metalness: 0.0, roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.3,
        emissiveIntensity: 0.15, envMapIntensity: 0.6,
        opacity: 1, transparent: false, flatShading: false, wireframe: false,
      };
    }
    // ── THORNY: Aggressive, textured ──
    case 'thorny': {
      const thornC = new THREE.Color().setHSL(hsl.h, 0.5, 0.35);
      const thornE = new THREE.Color().setHSL(hsl.h, 0.4, 0.2);
      return { ...base, color: thornC, emissive: thornE,
        metalness: 0.2, roughness: 0.85, clearcoat: 0.0, clearcoatRoughness: 0.8,
        emissiveIntensity: 0.12, envMapIntensity: 0.5,
        opacity: 1, transparent: false, flatShading: true, wireframe: false,
      };
    }
    // ── BONE: Off-white, organic ──
    case 'bone': {
      const boneC = new THREE.Color().setHSL(hsl.h, 0.08, 0.7);
      const marrow = new THREE.Color().setHSL(hsl.h, 0.08, 0.25);
      return { ...base, color: boneC, emissive: marrow,
        metalness: 0.0, roughness: 0.85, clearcoat: 0.15, clearcoatRoughness: 0.5,
        emissiveIntensity: 0.08, envMapIntensity: 0.35,
        opacity: 1, transparent: false, flatShading: false, wireframe: false,
      };
    }
    // ── EMBER: Smoldering with hot spots ──
    case 'ember': {
      const ashC = new THREE.Color().setHSL(hsl.h, 0.45, 0.15);
      const hotSpot = new THREE.Color().setHSL(hsl.h, 0.9, 0.4);
      return { ...base, color: ashC, emissive: hotSpot,
        metalness: 0.0, roughness: 0.75, clearcoat: 0.0, clearcoatRoughness: 0.5,
        emissiveIntensity: 0.5, envMapIntensity: 0.2,
        opacity: 1, transparent: false, flatShading: true, wireframe: false,
      };
    }
    // ── ICE: Pale, frosted, faceted ──
    case 'ice': {
      const iceC = new THREE.Color().setHSL(hsl.h, 0.3, 0.65);
      const frostGlow = new THREE.Color().setHSL(hsl.h, 0.35, 0.35);
      return { ...base, color: iceC, emissive: frostGlow,
        metalness: 0.0, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.1,
        emissiveIntensity: 0.1, envMapIntensity: 1.5,
        transmission: 0.25, ior: 1.31, thickness: 2.0,
        opacity: 0.75, transparent: true, flatShading: true, wireframe: false,
      };
    }
    // ── VOID: Dark with rim glow ──
    case 'void': {
      const voidC = new THREE.Color(0.05, 0.05, 0.05);
      const rimPulse = new THREE.Color().setHSL((hsl.h + 0.5) % 1, 0.7, 0.25);
      return { ...base, color: voidC, emissive: rimPulse,
        metalness: 0.95, roughness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.0,
        emissiveIntensity: 0.2, envMapIntensity: 2.0,
        opacity: 0.92, transparent: true, flatShading: false, wireframe: false,
      };
    }
    // ── HOLOGRAPHIC: Rainbow, high sheen, shifting ──
    case 'holographic': {
      const holoC = new THREE.Color().setHSL(hsl.h, 0.9, 0.6);
      const holoGlow = new THREE.Color().setHSL((hsl.h + 0.4) % 1, 0.9, 0.55);
      return { ...base, color: holoC, emissive: holoGlow,
        metalness: 0.7, roughness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.0,
        emissiveIntensity: 0.6, envMapIntensity: 2.5,
        sheen: 1.0, sheenRoughness: 0.02, sheenColor: holoGlow,
        iridescence: 1.0, iridescenceIOR: 3.0,
        opacity: 0.9, transparent: true, flatShading: false, wireframe: false,
      };
    }
    default:
      return getElementalMaterial({ ...profile, materialType: 'glass' });
  }
}

// ─── Geometry detail per material ───
function getGeometryDetail(mat: string): number {
  // Low detail = visible facets, high = smooth
  switch (mat) {
    case 'crystal': case 'obsidian': case 'ice': return 1;
    case 'lava': case 'ember': case 'thorny': return 2;
    case 'metal': return 2;
    case 'wire': return 1;
    case 'matte': case 'bone': case 'tiger': return 4;
    case 'glass': case 'iridescent': case 'holographic': case 'plasma': case 'nebula': case 'void': return 3;
    default: return 3;
  }
}

// ─── Morphing Mesh ───

interface MorphOrbMeshProps {
  profile: OrbProfile;
  geometryFamily?: string;
  level?: number;
  randomShapeCount?: boolean;
}

export function MorphOrbMesh({ profile, geometryFamily = 'sphere', level = 100, randomShapeCount = false }: MorphOrbMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const instanceSeed = useRef(Math.random());
  const mat = profile.materialType || 'glass';

  const shapes = useMemo(() => {
    if (profile.morphIntensity === 0 || profile.morphSpeed === 0) {
      const all = ALL_SHAPES[geometryFamily] || ALL_SHAPES.sphere;
      return [all[0]];
    }
    if (randomShapeCount) {
      const all = ALL_SHAPES[geometryFamily] || ALL_SHAPES.sphere;
      const count = Math.floor(instanceSeed.current * 5) + 1;
      const shuffled = [...all].sort((a, b) => {
        const ha = a.charCodeAt(0) * instanceSeed.current;
        const hb = b.charCodeAt(0) * instanceSeed.current;
        return ha - hb;
      });
      return shuffled.slice(0, count);
    }
    return getShapesForLevel(geometryFamily, level);
  }, [geometryFamily, level, randomShapeCount, profile.morphIntensity, profile.morphSpeed]);

  const { geometry, shapeArrays } = useMemo(() => {
    const detail = getGeometryDetail(mat);
    const geo = new THREE.IcosahedronGeometry(1, detail);
    const baseArr = (geo.attributes.position.array as Float32Array).slice();
    const arrays = shapes.map(s => computeShapePositions(baseArr, s, 1));
    return { geometry: geo, shapeArrays: arrays };
  }, [shapes, mat]);

  const matProps = useMemo(() => getElementalMaterial(profile), [profile]);

  const stateRef = useRef({
    timer: Math.random() * 200,
    seed1: Math.random() * 100,
    seed2: Math.random() * 100,
    seed3: Math.random() * 100,
    seed4: Math.random() * 100,
    seed5: Math.random() * 100,
  });

  // Per-material animation behavior
  const matBehavior = useMemo(() => {
    switch (mat) {
      case 'lava':        return { dispScale: 0.20, dispFreq: 4, noiseSpeed: 1.2, pulseAmp: 0.07, rotSpeed: 0.04, emissiveFlicker: true, flickerSpeed: 2.5, flickerRange: 0.5 };
      case 'ember':       return { dispScale: 0.16, dispFreq: 5, noiseSpeed: 1.0, pulseAmp: 0.06, rotSpeed: 0.05, emissiveFlicker: true, flickerSpeed: 3.5, flickerRange: 0.4 };
      case 'plasma':      return { dispScale: 0.14, dispFreq: 3.5, noiseSpeed: 1.8, pulseAmp: 0.08, rotSpeed: 0.15, emissiveFlicker: true, flickerSpeed: 6, flickerRange: 0.4 };
      case 'thorny':      return { dispScale: 0.30, dispFreq: 8, noiseSpeed: 0.25, pulseAmp: 0.02, rotSpeed: 0.02, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
      case 'crystal':     return { dispScale: 0.01, dispFreq: 1, noiseSpeed: 0.1, pulseAmp: 0.01, rotSpeed: 0.05, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
      case 'ice':         return { dispScale: 0.02, dispFreq: 1.5, noiseSpeed: 0.08, pulseAmp: 0.008, rotSpeed: 0.03, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
      case 'matte':       return { dispScale: 0.015, dispFreq: 2, noiseSpeed: 0.15, pulseAmp: 0.008, rotSpeed: 0.015, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
      case 'bone':        return { dispScale: 0.03, dispFreq: 2.5, noiseSpeed: 0.12, pulseAmp: 0.008, rotSpeed: 0.015, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
      case 'metal':       return { dispScale: 0.015, dispFreq: 2, noiseSpeed: 0.1, pulseAmp: 0.01, rotSpeed: 0.02, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
      case 'obsidian':    return { dispScale: 0.01, dispFreq: 1.5, noiseSpeed: 0.08, pulseAmp: 0.01, rotSpeed: 0.025, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
      case 'wire':        return { dispScale: 0.08, dispFreq: 3, noiseSpeed: 0.5, pulseAmp: 0.04, rotSpeed: 0.08, emissiveFlicker: true, flickerSpeed: 1.5, flickerRange: 0.3 };
      case 'void':        return { dispScale: 0.03, dispFreq: 1.5, noiseSpeed: 0.06, pulseAmp: 0.015, rotSpeed: 0.01, emissiveFlicker: true, flickerSpeed: 0.6, flickerRange: 0.5 };
      case 'nebula':      return { dispScale: 0.12, dispFreq: 2, noiseSpeed: 0.3, pulseAmp: 0.05, rotSpeed: 0.02, emissiveFlicker: true, flickerSpeed: 1.0, flickerRange: 0.3 };
      case 'tiger':       return { dispScale: 0.05, dispFreq: 3, noiseSpeed: 0.3, pulseAmp: 0.02, rotSpeed: 0.04, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
      case 'holographic':  return { dispScale: 0.04, dispFreq: 2.5, noiseSpeed: 0.5, pulseAmp: 0.03, rotSpeed: 0.1, emissiveFlicker: true, flickerSpeed: 2, flickerRange: 0.3 };
      case 'iridescent':  return { dispScale: 0.05, dispFreq: 2, noiseSpeed: 0.35, pulseAmp: 0.025, rotSpeed: 0.05, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
      case 'glass': default: return { dispScale: 0.06, dispFreq: 3, noiseSpeed: 0.4, pulseAmp: 0.03, rotSpeed: 0.06, emissiveFlicker: false, flickerSpeed: 0, flickerRange: 0 };
    }
  }, [mat]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const st = stateRef.current;
    st.timer += delta;
    const t = st.timer;
    const mb = matBehavior;

    const positions = meshRef.current.geometry.attributes.position;
    const arr = positions.array as Float32Array;
    const vertCount = arr.length / 3;

    // Global pulsation
    const pulse = 1.0
      + Math.sin(t * 1.2 + st.seed1) * mb.pulseAmp
      + Math.sin(t * 0.7 + st.seed3) * mb.pulseAmp * 0.7
      + Math.sin(t * 2.1 + st.seed5) * mb.pulseAmp * 0.4;

    if (shapes.length <= 1) {
      const from = shapeArrays[0];
      for (let vi = 0; vi < vertCount; vi++) {
        const i3 = vi * 3;
        const bx = from[i3], by = from[i3 + 1], bz = from[i3 + 2];
        const n1 = noise3D(bx * mb.dispFreq + t * mb.noiseSpeed + st.seed1, by * mb.dispFreq + t * mb.noiseSpeed * 0.8, bz * mb.dispFreq + t * mb.noiseSpeed * 0.6);
        const n2 = noise3D(bx * mb.dispFreq * 2 + t * mb.noiseSpeed * 1.5 + st.seed2, by * mb.dispFreq * 2 - t * mb.noiseSpeed * 1.1, bz * mb.dispFreq * 2 + t * mb.noiseSpeed * 1.3 + st.seed4);
        const n = n1 * 0.7 + n2 * 0.3;
        const s = 0.82 * pulse;
        arr[i3]     = (bx + bx * n * mb.dispScale) * s;
        arr[i3 + 1] = (by + by * n * mb.dispScale) * s;
        arr[i3 + 2] = (bz + bz * n * mb.dispScale) * s;
      }
    } else {
      const morphSpeed = 0.6;
      const totalShapes = shapes.length;

      for (let vi = 0; vi < vertCount; vi++) {
        const i3 = vi * 3;
        let bx = 0, by = 0, bz = 0;
        let totalWeight = 0;

        for (let si = 0; si < totalShapes; si++) {
          const phase = st.seed1 + si * 2.39996;
          const w = Math.max(0.01,
            Math.sin(t * morphSpeed * 0.8 + phase) * 0.3 +
            Math.sin(t * morphSpeed * 0.5 + phase * 0.7 + st.seed2) * 0.25 +
            Math.sin(t * morphSpeed * 0.3 + phase * 1.3 + st.seed3) * 0.2 +
            Math.cos(t * morphSpeed * 0.4 + si * st.seed4 * 0.3) * 0.15 +
            0.2
          );
          bx += shapeArrays[si][i3] * w;
          by += shapeArrays[si][i3 + 1] * w;
          bz += shapeArrays[si][i3 + 2] * w;
          totalWeight += w;
        }

        if (totalWeight > 0) { bx /= totalWeight; by /= totalWeight; bz /= totalWeight; }

        const n1 = noise3D(bx * mb.dispFreq + t * mb.noiseSpeed + st.seed1, by * mb.dispFreq + t * mb.noiseSpeed * 0.8 + st.seed2, bz * mb.dispFreq + t * mb.noiseSpeed * 0.6 + st.seed3);
        const n2 = noise3D(bx * mb.dispFreq * 2 + t * mb.noiseSpeed * 1.5 + st.seed4, by * mb.dispFreq * 2 - t * mb.noiseSpeed * 1.1 + st.seed5, bz * mb.dispFreq * 2 + t * mb.noiseSpeed * 1.3 + st.seed1);
        const n = n1 * 0.65 + n2 * 0.35;

        const s = 0.82 * pulse;
        arr[i3]     = (bx + bx * n * mb.dispScale) * s;
        arr[i3 + 1] = (by + by * n * mb.dispScale) * s;
        arr[i3 + 2] = (bz + bz * n * mb.dispScale) * s;
      }
    }

    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();

    // Rotation
    meshRef.current.rotation.y += delta * mb.rotSpeed;
    meshRef.current.rotation.x = Math.sin(t * 0.09 + st.seed1) * 0.18 + Math.sin(t * 0.05 + st.seed3) * 0.1;
    meshRef.current.rotation.z = Math.cos(t * 0.07 + st.seed2) * 0.12 + Math.sin(t * 0.11 + st.seed5) * 0.06;

    // Emissive flicker
    if (mb.emissiveFlicker && matRef.current) {
      const flicker = (1 - mb.flickerRange) + Math.sin(t * mb.flickerSpeed + st.seed1) * mb.flickerRange * 0.6 + Math.sin(t * mb.flickerSpeed * 2.3 + st.seed2) * mb.flickerRange * 0.4;
      matRef.current.emissiveIntensity = matProps.emissiveIntensity * flicker;
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
        wireframe={matProps.wireframe}
      />
    </mesh>
  );
}

// ─── Shared lighting rig ───

function OrbLighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 8]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-3, 2, -4]} intensity={0.9} color="#aaaaff" />
      <directionalLight position={[0, -3, 2]} intensity={0.6} color="#ffaadd" />
      <directionalLight position={[0, 5, 0]} intensity={0.7} color="#ffffff" />
      <pointLight position={[2, 3, 4]} intensity={1.0} color="#ffffff" distance={15} />
      <Environment preset="city" background={false} />
    </>
  );
}

// ─── Public: GalleryOrbView ───

interface GalleryOrbViewProps {
  profile: OrbProfile;
  geometryFamily: string;
  size: number;
  level?: number;
  randomShapeCount?: boolean;
  className?: string;
}

export function GalleryOrbView({ profile, geometryFamily, size, level = 100, randomShapeCount = false, className }: GalleryOrbViewProps) {
  return (
    <div className={className} style={{ width: size, height: size, margin: '0 auto' }}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 2.8], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbLighting />
        <MorphOrbMesh profile={profile} geometryFamily={geometryFamily} level={level} randomShapeCount={randomShapeCount} />
      </Canvas>
    </div>
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
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        style={{ width: size, height: size }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      >
        <OrbLighting />
        <MorphOrbMesh profile={profile} geometryFamily={geometryFamily} level={level} />
      </Canvas>
    </div>
  );
}

// ─── Public: GalleryCanvas ───

import { SharedOrbCanvas } from './SharedOrbCanvas';

interface GalleryCanvasProps {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function GalleryCanvas({ children }: GalleryCanvasProps) {
  return <SharedOrbCanvas>{children}</SharedOrbCanvas>;
}

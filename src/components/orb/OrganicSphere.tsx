/**
 * @deprecated Phase 1.2 — orb unification.
 * The canonical AION orb renderer is `@/components/orb/v2/OrbView`, which
 * tunnels into the single global `SharedOrbStage` Canvas mounted at the App
 * root. Do NOT use this legacy renderer in new code: it instantiates its own
 * WebGL Canvas, fragments the orb identity, and bypasses the shared
 * post-processing / DPR pipeline. Existing call sites are scheduled for
 * migration. See mem://architecture/orb-pure-renderer-standard.
 */
/**
 * OrganicSphere — R3F component ported from Bruno Simon's organic-sphere.
 * Accepts OrbProfile for DNA-driven colors and audioLevel for voice reactivity.
 * Uses custom GLSL shaders with perlin noise displacement.
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { organicVertexShader, organicFragmentShader } from './shaders/organicVertex';
import type { OrbProfile } from './types';

/** Parse an HSL string like "260 70% 55%" into a THREE.Color */
function hslToColor(hsl: string): THREE.Color {
  try {
    const parts = hsl.replace(/%/g, '').split(/\s+/).map(Number);
    if (parts.length >= 3) {
      return new THREE.Color().setHSL(parts[0] / 360, parts[1] / 100, parts[2] / 100);
    }
  } catch {}
  // Try direct CSS color
  try { return new THREE.Color(hsl); } catch {}
  return new THREE.Color('#ff3e00');
}

interface OrganicSphereProps {
  profile: OrbProfile;
  audioLevel?: number;
  size?: number;
  /** Geometry segments (lat=lon). Defaults to 128 (was 200-512). */
  segments?: number;
  /** State-driven scalar multipliers applied on top of base params. */
  stateMultipliers?: {
    volume: number;
    distortion: number;
    fresnel: number;
    timeFreq: number;
    intensityBoost: number;
  };
}

const NEUTRAL_MUL = { volume: 1, distortion: 1, fresnel: 1, timeFreq: 1, intensityBoost: 1 };

export function OrganicSphere({
  profile,
  audioLevel = 0,
  size = 1,
  segments,
  stateMultipliers = NEUTRAL_MUL,
}: OrganicSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsedTimeRef = useRef(0);
  const offsetRef = useRef(new THREE.Vector3(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI,
    Math.random() * Math.PI * 2
  ));

  // Smooth variations (like Bruno's easing system)
  // Use profile seed to create unique base parameters per orb
  const baseParams = useMemo(() => {
    const s = profile.seed || 42;
    const hash = (n: number) => ((Math.sin(n * 127.1 + s * 311.7) * 43758.5453) % 1 + 1) % 1;
    return {
      volume: 0.10 + hash(1) * 0.10,        // 0.10–0.20 (smoother surface)
      distortion: 0.6 + hash(2) * 0.8,       // 0.6–1.4 (less harsh)
      fresnel: 3.8 + hash(3) * 2.0,          // 3.8–5.8
      timeFreq: 0.0003 + hash(4) * 0.0005,   // varied animation speed
    };
  }, [profile.seed]);

  const variations = useRef({
    volume: { current: baseParams.volume, target: baseParams.volume },
    distortion: { current: baseParams.distortion, target: baseParams.distortion },
    fresnel: { current: baseParams.fresnel, target: baseParams.fresnel },
    timeFreq: { current: baseParams.timeFreq, target: baseParams.timeFreq },
  });

  // Derive colors from OrbProfile
  const lightAColor = useMemo(() => hslToColor(profile.primaryColor), [profile.primaryColor]);
  const lightBColor = useMemo(() => {
    const secondary = profile.secondaryColors?.[0] || profile.accentColor;
    return hslToColor(secondary);
  }, [profile.secondaryColors, profile.accentColor]);

  // Light spherical positions based on profile seed
  const lightPositions = useMemo(() => {
    const seed = profile.seed || 42;
    const phiA = 0.5 + (seed % 100) * 0.015;
    const thetaA = 1.8 + (seed % 50) * 0.03;
    const phiB = 2.2 - (seed % 80) * 0.008;
    const thetaB = -1.5 + (seed % 60) * 0.02;
    return {
      a: new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, phiA, thetaA)),
      b: new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, phiB, thetaB)),
    };
  }, [profile.seed]);

  // Geometry with tangents (required for bi-tangent normal computation)
  const geometry = useMemo(() => {
    const seg = segments ?? Math.min(192, Math.max(96, profile.geometryDetail * 32));
    const geo = new THREE.SphereGeometry(1, seg, seg);
    geo.computeTangents();
    return geo;
  }, [profile.geometryDetail, segments]);

  // ShaderMaterial
  const material = useMemo(() => {
    const segments = geometry.parameters.widthSegments;
    return new THREE.ShaderMaterial({
      uniforms: {
        uLightAColor: { value: lightAColor },
        uLightAPosition: { value: lightPositions.a },
        uLightAIntensity: { value: 3.5 },
        uLightBColor: { value: lightBColor },
        uLightBPosition: { value: lightPositions.b },
        uLightBIntensity: { value: 2.8 },
        uSubdivision: { value: new THREE.Vector2(segments, segments) },
        uOffset: { value: new THREE.Vector3() },
        uDistortionFrequency: { value: 1.2 + (profile.morphIntensity || 0.5) * 0.5 },
        uDistortionStrength: { value: baseParams.distortion },
        uDisplacementFrequency: { value: 1.6 },
        uDisplacementStrength: { value: baseParams.volume },
        uFresnelOffset: { value: -0.8 },
        uFresnelMultiplier: { value: baseParams.fresnel },
        uFresnelPower: { value: 1.1 },
        uTime: { value: 0 },
      },
      defines: { USE_TANGENT: '' },
      vertexShader: organicVertexShader,
      fragmentShader: organicFragmentShader,
    });
  }, [geometry]);

  // Update colors when profile changes
  useEffect(() => {
    material.uniforms.uLightAColor.value = lightAColor;
    material.uniforms.uLightBColor.value = lightBColor;
    material.uniforms.uLightAPosition.value = lightPositions.a;
    material.uniforms.uLightBPosition.value = lightPositions.b;
  }, [lightAColor, lightBColor, lightPositions, material]);

  // Animation loop — voice reactivity + organic motion
  useFrame((_, delta) => {
    const v = variations.current;
    const clampedDelta = Math.min(delta, 0.05) * 1000; // ms like Bruno's time.delta
    const sm = stateMultipliers;

    // Voice-reactive targets
    const hasAudio = audioLevel > 0.01;
    v.volume.target = (hasAudio ? baseParams.volume + audioLevel * 0.3 : baseParams.volume) * sm.volume;
    v.distortion.target = (hasAudio ? baseParams.distortion + audioLevel * 5 : baseParams.distortion) * sm.distortion;
    v.fresnel.target = (hasAudio ? baseParams.fresnel + audioLevel * 2 : baseParams.fresnel) * sm.fresnel;
    v.timeFreq.target = (hasAudio ? baseParams.timeFreq + audioLevel * 0.003 : baseParams.timeFreq) * sm.timeFreq;

    // Easing
    const ease = (v: { current: number; target: number }, up: number, down: number) => {
      const e = v.target > v.current ? up : down;
      v.current += (v.target - v.current) * e * clampedDelta;
    };
    ease(v.volume, 0.03, 0.002);
    ease(v.distortion, 0.02, 0.001);
    ease(v.fresnel, 0.008, 0.004);
    ease(v.timeFreq, 0.005, 0.002);

    // Time
    const timeFreq = v.timeFreq.current;
    elapsedTimeRef.current += delta * 1000 * timeFreq;

    // Update uniforms
    material.uniforms.uDisplacementStrength.value = v.volume.current;
    material.uniforms.uDistortionStrength.value = v.distortion.current;
    material.uniforms.uFresnelMultiplier.value = v.fresnel.current;
    material.uniforms.uLightAIntensity.value = 3.5 * sm.intensityBoost;
    material.uniforms.uLightBIntensity.value = 2.8 * sm.intensityBoost;

    // Offset drift
    const t = elapsedTimeRef.current * 0.3;
    const phi = ((Math.sin(t * 0.001) * Math.sin(t * 0.00321)) * 0.5 + 0.5) * Math.PI;
    const theta = ((Math.sin(t * 0.0001) * Math.sin(t * 0.000321)) * 0.5 + 0.5) * Math.PI * 2;
    const dir = new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, phi, theta));
    dir.multiplyScalar(timeFreq * 2);
    material.uniforms.uOffset.value.add(dir);

    // Time uniform
    material.uniforms.uTime.value += delta * 1000 * timeFreq;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} scale={size} />
  );
}

export default OrganicSphere;
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
}

export function OrganicSphere({ profile, audioLevel = 0, size = 1 }: OrganicSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsedTimeRef = useRef(0);
  const offsetRef = useRef(new THREE.Vector3(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI,
    Math.random() * Math.PI * 2
  ));

  // Smooth variations (like Bruno's easing system)
  const variations = useRef({
    volume: { current: 0.152, target: 0.152 },
    distortion: { current: 0.65, target: 0.65 },
    fresnel: { current: 3.587, target: 3.587 },
    timeFreq: { current: 0.0003, target: 0.0003 },
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
    const phiA = 0.615 + (seed % 100) * 0.01;
    const thetaA = 2.049 + (seed % 50) * 0.02;
    const phiB = 2.561 - (seed % 80) * 0.005;
    const thetaB = -1.844 + (seed % 60) * 0.015;
    return {
      a: new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, phiA, thetaA)),
      b: new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, phiB, thetaB)),
    };
  }, [profile.seed]);

  // Geometry with tangents (required for bi-tangent normal computation)
  const geometry = useMemo(() => {
    const segments = Math.min(512, Math.max(128, profile.geometryDetail * 40));
    const geo = new THREE.SphereGeometry(1, segments, segments);
    geo.computeTangents();
    return geo;
  }, [profile.geometryDetail]);

  // ShaderMaterial
  const material = useMemo(() => {
    const segments = geometry.parameters.widthSegments;
    return new THREE.ShaderMaterial({
      uniforms: {
        uLightAColor: { value: lightAColor },
        uLightAPosition: { value: lightPositions.a },
        uLightAIntensity: { value: 1.85 },
        uLightBColor: { value: lightBColor },
        uLightBPosition: { value: lightPositions.b },
        uLightBIntensity: { value: 1.4 },
        uSubdivision: { value: new THREE.Vector2(segments, segments) },
        uOffset: { value: new THREE.Vector3() },
        uDistortionFrequency: { value: 1.5 },
        uDistortionStrength: { value: 0.65 },
        uDisplacementFrequency: { value: 2.120 },
        uDisplacementStrength: { value: 0.152 },
        uFresnelOffset: { value: -1.609 },
        uFresnelMultiplier: { value: 3.587 },
        uFresnelPower: { value: 1.793 },
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

    // Voice-reactive targets
    const hasAudio = audioLevel > 0.01;
    v.volume.target = hasAudio ? 0.152 + audioLevel * 0.3 : 0.152;
    v.distortion.target = hasAudio ? 0.65 + audioLevel * 5 : 0.65;
    v.fresnel.target = hasAudio ? 3.587 + audioLevel * 2 : 3.587;
    v.timeFreq.target = hasAudio ? 0.0003 + audioLevel * 0.003 : 0.0003;

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
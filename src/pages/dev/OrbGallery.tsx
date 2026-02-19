/**
 * Dev-only page: Renders 12 orbs with fake profiles to visually verify uniqueness.
 * Route: /dev/orb-gallery
 */

import React from 'react';
import { WebGLOrb } from '@/components/orb/WebGLOrb';
import type { OrbProfile } from '@/components/orb/types';
import { VISUAL_DEFAULTS } from '@/components/orb/types';

// 12 distinct fake profiles covering all material/pattern/behavior combos
const FAKE_PROFILES: Array<{ label: string; profile: Partial<OrbProfile> }> = [
  {
    label: 'Metal + Voronoi + Orbit',
    profile: {
      primaryColor: '0 85% 50%', secondaryColors: ['30 80% 55%'], accentColor: '60 90% 50%',
      gradientStops: ['0 85% 50%', '20 80% 55%', '45 90% 50%', '60 85% 45%'],
      gradientMode: 'vertical', materialType: 'metal',
      materialParams: { metalness: 0.9, roughness: 0.15, clearcoat: 0.8, transmission: 0, ior: 1.5, emissiveIntensity: 0.2 },
      patternType: 'voronoi', patternIntensity: 0.6, chromaShift: 0.05,
      rimLightColor: '40 90% 70%', bloomStrength: 0.3, geometryFamily: 'icosa', geometryDetail: 4,
      morphIntensity: 0.3, morphSpeed: 0.8, fractalOctaves: 4, seed: 1001,
      particlePalette: ['0 80% 60%', '30 70% 55%', '60 90% 50%'],
      particleBehavior: 'orbit', particleMode: 'cycle',
      computedFrom: { level: 5, streak: 10, clarityScore: 70 },
    },
  },
  {
    label: 'Glass + Cellular + Spiral',
    profile: {
      primaryColor: '200 80% 50%', secondaryColors: ['220 70% 55%'], accentColor: '180 85% 50%',
      gradientStops: ['190 80% 50%', '210 75% 55%', '230 70% 50%', '180 85% 45%', '200 90% 55%'],
      gradientMode: 'radial', materialType: 'glass',
      materialParams: { metalness: 0.05, roughness: 0.2, clearcoat: 0.6, transmission: 0.5, ior: 1.45, emissiveIntensity: 0.3 },
      patternType: 'cellular', patternIntensity: 0.5, chromaShift: 0.1,
      rimLightColor: '180 80% 70%', bloomStrength: 0.5, geometryFamily: 'sphere', geometryDetail: 5,
      morphIntensity: 0.4, morphSpeed: 1.0, fractalOctaves: 4, seed: 2002,
      particlePalette: ['200 80% 60%', '220 70% 55%', '180 85% 60%'],
      particleBehavior: 'spiral', particleMode: 'byRadius',
      computedFrom: { level: 8, streak: 25, clarityScore: 85 },
    },
  },
  {
    label: 'Plasma + Fractal + Burst',
    profile: {
      primaryColor: '280 90% 55%', secondaryColors: ['310 85% 60%'], accentColor: '340 80% 55%',
      gradientStops: ['270 90% 50%', '290 85% 55%', '310 80% 55%', '330 85% 50%', '350 90% 55%', '10 80% 50%'],
      gradientMode: 'noise', materialType: 'plasma',
      materialParams: { metalness: 0.1, roughness: 0.3, clearcoat: 0.2, transmission: 0.1, ior: 1.5, emissiveIntensity: 0.7 },
      patternType: 'fractal', patternIntensity: 0.7, chromaShift: 0.3,
      rimLightColor: '320 90% 75%', bloomStrength: 0.8, geometryFamily: 'dodeca', geometryDetail: 4,
      morphIntensity: 0.6, morphSpeed: 1.3, fractalOctaves: 5, seed: 3003,
      particlePalette: ['280 90% 65%', '320 80% 60%', '350 85% 55%', '30 80% 55%'],
      particleBehavior: 'burst', particleMode: 'byVelocity',
      computedFrom: { level: 12, streak: 40, clarityScore: 60 },
    },
  },
  {
    label: 'Iridescent + Shards + Halo',
    profile: {
      primaryColor: '160 70% 45%', secondaryColors: ['190 75% 50%'], accentColor: '130 80% 50%',
      gradientStops: ['140 70% 45%', '160 75% 50%', '180 70% 45%', '200 75% 50%', '220 70% 45%', '160 80% 55%', '130 75% 50%'],
      gradientMode: 'rim', materialType: 'iridescent',
      materialParams: { metalness: 0.3, roughness: 0.25, clearcoat: 0.7, transmission: 0.3, ior: 1.6, emissiveIntensity: 0.4 },
      patternType: 'shards', patternIntensity: 0.5, chromaShift: 0.6,
      rimLightColor: '50 85% 70%', bloomStrength: 0.6, geometryFamily: 'octa', geometryDetail: 3,
      morphIntensity: 0.35, morphSpeed: 0.9, fractalOctaves: 3, seed: 4004,
      particlePalette: ['160 70% 60%', '190 75% 55%', '130 80% 60%'],
      particleBehavior: 'halo', particleMode: 'cycle',
      computedFrom: { level: 3, streak: 5, clarityScore: 45 },
    },
  },
  {
    label: 'Wire + Swirl + Drift',
    profile: {
      primaryColor: '50 90% 50%', secondaryColors: ['70 85% 55%'], accentColor: '30 80% 50%',
      gradientStops: ['40 90% 50%', '60 85% 55%', '80 80% 50%'],
      gradientMode: 'vertical', materialType: 'wire',
      materialParams: { metalness: 0, roughness: 0.5, clearcoat: 0, transmission: 0, ior: 1.5, emissiveIntensity: 0.2 },
      patternType: 'swirl', patternIntensity: 0.4, chromaShift: 0,
      rimLightColor: '50 80% 65%', bloomStrength: 0.2, geometryFamily: 'spiky', geometryDetail: 2,
      morphIntensity: 0.25, morphSpeed: 0.7, fractalOctaves: 3, seed: 5005,
      particlePalette: ['50 90% 60%', '30 80% 55%'],
      particleBehavior: 'drift', particleMode: 'random',
      computedFrom: { level: 1, streak: 0, clarityScore: 30 },
    },
  },
  {
    label: 'Metal + Strata + Spiral',
    profile: {
      primaryColor: '220 75% 45%', secondaryColors: ['240 70% 50%'], accentColor: '200 80% 55%',
      gradientStops: ['210 75% 45%', '230 70% 50%', '250 65% 45%', '200 80% 55%'],
      gradientMode: 'radial', materialType: 'metal',
      materialParams: { metalness: 0.8, roughness: 0.2, clearcoat: 0.5, transmission: 0, ior: 1.5, emissiveIntensity: 0.15 },
      patternType: 'strata', patternIntensity: 0.5, chromaShift: 0.1,
      rimLightColor: '190 70% 60%', bloomStrength: 0.35, geometryFamily: 'torus', geometryDetail: 4,
      morphIntensity: 0.5, morphSpeed: 1.1, fractalOctaves: 4, seed: 6006,
      particlePalette: ['220 75% 60%', '240 70% 55%', '200 80% 60%'],
      particleBehavior: 'spiral', particleMode: 'single',
      computedFrom: { level: 7, streak: 15, clarityScore: 75 },
    },
  },
  {
    label: 'Plasma + Voronoi + Orbit',
    profile: {
      primaryColor: '350 85% 50%', secondaryColors: ['10 80% 55%'], accentColor: '330 90% 50%',
      gradientStops: ['340 85% 50%', '0 80% 55%', '20 75% 50%', '350 90% 45%', '330 85% 50%'],
      gradientMode: 'noise', materialType: 'plasma',
      materialParams: { metalness: 0.15, roughness: 0.35, clearcoat: 0.15, transmission: 0.05, ior: 1.5, emissiveIntensity: 0.6 },
      patternType: 'voronoi', patternIntensity: 0.55, chromaShift: 0.2,
      rimLightColor: '10 90% 70%', bloomStrength: 0.7, geometryFamily: 'icosa', geometryDetail: 5,
      morphIntensity: 0.55, morphSpeed: 1.2, fractalOctaves: 5, seed: 7007,
      particlePalette: ['350 85% 60%', '10 80% 55%', '330 90% 60%', '0 85% 55%'],
      particleBehavior: 'orbit', particleMode: 'cycle',
      computedFrom: { level: 10, streak: 30, clarityScore: 55 },
    },
  },
  {
    label: 'Glass + Swirl + Halo',
    profile: {
      primaryColor: '120 70% 40%', secondaryColors: ['140 75% 45%'], accentColor: '100 80% 50%',
      gradientStops: ['110 70% 40%', '130 75% 45%', '150 70% 40%', '100 80% 50%'],
      gradientMode: 'rim', materialType: 'glass',
      materialParams: { metalness: 0.05, roughness: 0.15, clearcoat: 0.7, transmission: 0.6, ior: 1.5, emissiveIntensity: 0.25 },
      patternType: 'swirl', patternIntensity: 0.45, chromaShift: 0.15,
      rimLightColor: '80 75% 65%', bloomStrength: 0.45, geometryFamily: 'sphere', geometryDetail: 5,
      morphIntensity: 0.35, morphSpeed: 0.9, fractalOctaves: 4, seed: 8008,
      particlePalette: ['120 70% 55%', '140 75% 50%', '100 80% 55%'],
      particleBehavior: 'halo', particleMode: 'byRadius',
      computedFrom: { level: 6, streak: 18, clarityScore: 80 },
    },
  },
  {
    label: 'Iridescent + Cellular + Burst',
    profile: {
      primaryColor: '260 80% 55%', secondaryColors: ['290 75% 60%'], accentColor: '230 85% 50%',
      gradientStops: ['250 80% 55%', '270 75% 55%', '290 80% 55%', '310 75% 50%', '230 85% 50%'],
      gradientMode: 'noise', materialType: 'iridescent',
      materialParams: { metalness: 0.25, roughness: 0.2, clearcoat: 0.6, transmission: 0.25, ior: 1.55, emissiveIntensity: 0.45 },
      patternType: 'cellular', patternIntensity: 0.6, chromaShift: 0.7,
      rimLightColor: '270 80% 70%', bloomStrength: 0.65, geometryFamily: 'dodeca', geometryDetail: 4,
      morphIntensity: 0.45, morphSpeed: 1.0, fractalOctaves: 4, seed: 9009,
      particlePalette: ['260 80% 65%', '290 75% 60%', '230 85% 60%', '310 75% 55%'],
      particleBehavior: 'burst', particleMode: 'byVelocity',
      computedFrom: { level: 15, streak: 50, clarityScore: 90 },
    },
  },
  {
    label: 'Metal + Fractal + Drift',
    profile: {
      primaryColor: '30 80% 45%', secondaryColors: ['50 75% 50%'], accentColor: '10 85% 50%',
      gradientStops: ['20 80% 45%', '40 75% 50%', '60 70% 45%'],
      gradientMode: 'vertical', materialType: 'metal',
      materialParams: { metalness: 0.85, roughness: 0.1, clearcoat: 0.9, transmission: 0, ior: 1.5, emissiveIntensity: 0.1 },
      patternType: 'fractal', patternIntensity: 0.35, chromaShift: 0.05,
      rimLightColor: '40 85% 65%', bloomStrength: 0.25, geometryFamily: 'octa', geometryDetail: 3,
      morphIntensity: 0.3, morphSpeed: 0.85, fractalOctaves: 3, seed: 1010,
      particlePalette: ['30 80% 55%', '50 75% 55%'],
      particleBehavior: 'drift', particleMode: 'random',
      computedFrom: { level: 4, streak: 8, clarityScore: 50 },
    },
  },
  {
    label: 'Plasma + Shards + Spiral',
    profile: {
      primaryColor: '180 85% 45%', secondaryColors: ['200 80% 50%'], accentColor: '160 90% 50%',
      gradientStops: ['170 85% 45%', '190 80% 50%', '210 75% 45%', '160 90% 50%', '180 85% 55%', '200 80% 50%'],
      gradientMode: 'radial', materialType: 'plasma',
      materialParams: { metalness: 0.1, roughness: 0.3, clearcoat: 0.2, transmission: 0.1, ior: 1.5, emissiveIntensity: 0.65 },
      patternType: 'shards', patternIntensity: 0.55, chromaShift: 0.25,
      rimLightColor: '160 85% 70%', bloomStrength: 0.75, geometryFamily: 'spiky', geometryDetail: 3,
      morphIntensity: 0.7, morphSpeed: 1.4, fractalOctaves: 5, seed: 1111,
      particlePalette: ['180 85% 60%', '200 80% 55%', '160 90% 60%', '140 85% 55%'],
      particleBehavior: 'spiral', particleMode: 'cycle',
      computedFrom: { level: 20, streak: 60, clarityScore: 95 },
    },
  },
  {
    label: 'Glass + Strata + Orbit',
    profile: {
      primaryColor: '300 75% 50%', secondaryColors: ['320 70% 55%'], accentColor: '280 80% 50%',
      gradientStops: ['290 75% 50%', '310 70% 55%', '330 65% 50%', '280 80% 50%'],
      gradientMode: 'rim', materialType: 'glass',
      materialParams: { metalness: 0.05, roughness: 0.2, clearcoat: 0.5, transmission: 0.45, ior: 1.5, emissiveIntensity: 0.3 },
      patternType: 'strata', patternIntensity: 0.4, chromaShift: 0.1,
      rimLightColor: '310 80% 70%', bloomStrength: 0.4, geometryFamily: 'torus', geometryDetail: 4,
      morphIntensity: 0.4, morphSpeed: 1.0, fractalOctaves: 4, seed: 1212,
      particlePalette: ['300 75% 60%', '320 70% 55%', '280 80% 60%'],
      particleBehavior: 'orbit', particleMode: 'single',
      computedFrom: { level: 9, streak: 22, clarityScore: 65 },
    },
  },
];

function buildFullProfile(partial: Partial<OrbProfile>): OrbProfile {
  return {
    primaryColor: partial.primaryColor || '200 80% 50%',
    secondaryColors: partial.secondaryColors || ['220 70% 55%'],
    accentColor: partial.accentColor || '180 75% 60%',
    morphIntensity: partial.morphIntensity ?? 0.4,
    morphSpeed: partial.morphSpeed ?? 1.0,
    fractalOctaves: partial.fractalOctaves ?? 4,
    coreIntensity: 0.8,
    coreSize: 0.3,
    layerCount: 2,
    geometryDetail: partial.geometryDetail ?? 4,
    particleEnabled: true,
    particleCount: 60,
    particleColor: partial.primaryColor || '200 80% 50%',
    motionSpeed: 1.0,
    pulseRate: 1.0,
    smoothness: 0.6,
    textureType: 'flowing',
    textureIntensity: 0.5,
    seed: partial.seed,
    geometryFamily: partial.geometryFamily,
    gradientStops: partial.gradientStops || ['200 80% 50%', '220 70% 55%', '180 75% 60%'],
    gradientMode: partial.gradientMode || 'vertical',
    coreGradient: partial.coreGradient || ['200 80% 50%', '180 75% 60%'],
    rimLightColor: partial.rimLightColor || '40 80% 65%',
    materialType: partial.materialType || 'glass',
    materialParams: partial.materialParams || { metalness: 0.1, roughness: 0.4, clearcoat: 0.3, transmission: 0.2, ior: 1.5, emissiveIntensity: 0.3 },
    patternType: partial.patternType || 'fractal',
    patternIntensity: partial.patternIntensity ?? 0.4,
    particlePalette: partial.particlePalette || ['200 80% 60%', '260 70% 55%', '320 75% 60%'],
    particleMode: partial.particleMode || 'cycle',
    particleBehavior: partial.particleBehavior || 'orbit',
    bloomStrength: partial.bloomStrength ?? 0.4,
    chromaShift: partial.chromaShift ?? 0.1,
    dayNightBias: partial.dayNightBias ?? 0.5,
    computedFrom: {
      level: (partial.computedFrom as any)?.level ?? 1,
      streak: (partial.computedFrom as any)?.streak ?? 0,
      clarityScore: (partial.computedFrom as any)?.clarityScore ?? 50,
    },
  };
}

export default function OrbGallery() {
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold text-foreground mb-2">Orb Visual Uniqueness Gallery</h1>
      <p className="text-muted-foreground mb-6 text-sm">12 fake profiles demonstrating visual diversity. Each orb uses different material, pattern, gradient, and particle settings.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {FAKE_PROFILES.map(({ label, profile }, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card/50">
            <div className="relative">
              <WebGLOrb
                size={150}
                state="breathing"
                profile={buildFullProfile(profile)}
              />
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-foreground">{label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {profile.geometryFamily} · seed:{profile.seed}
              </div>
              <div className="flex justify-center gap-0.5 mt-1">
                {(profile.gradientStops || []).slice(0, 5).map((stop, j) => (
                  <div key={j} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `hsl(${stop})` }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

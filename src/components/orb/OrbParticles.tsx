/**
 * Particle system for personalized orb
 * Creates floating particles around the orb based on user's streak and traits
 */

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface OrbParticlesProps {
  count: number;
  color: string;
  orbRadius: number;
  audioLevel?: number;
  time: number;
}

/**
 * Parse HSL color string to components
 */
function parseHslColor(hsl: string): { h: number; s: number; l: number } {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    return {
      h: parseInt(match[1]) / 360,
      s: parseInt(match[2]) / 100,
      l: parseInt(match[3]) / 100,
    };
  }
  return { h: 0.6, s: 1, l: 0.5 }; // Default blue
}

/**
 * Generate particle positions - some inside, some outside for energy being effect
 */
export function generateParticlePositions(
  count: number,
  innerRadius: number,
  outerRadius: number
): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    // Random point on sphere shell - mix of inner and outer particles
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    
    // Some particles start inside the orb (30%), some outside (70%)
    const isInner = Math.random() < 0.3;
    const baseRadius = isInner 
      ? innerRadius * 0.3 + Math.random() * innerRadius * 0.5
      : innerRadius + Math.random() * (outerRadius - innerRadius);
    
    positions[i * 3] = baseRadius * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = baseRadius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = baseRadius * Math.cos(theta);
  }
  
  return positions;
}

/**
 * Update particle positions - ENERGY BEING pulsating in/out effect
 * Particles flow from the orb outward and merge back in
 */
export function updateParticlePositions(
  positions: Float32Array,
  basePositions: Float32Array,
  time: number,
  audioLevel: number
): void {
  const count = positions.length / 3;
  
  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const baseX = basePositions[idx];
    const baseY = basePositions[idx + 1];
    const baseZ = basePositions[idx + 2];
    
    // Distance from center
    const dist = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
    const nx = baseX / dist;
    const ny = baseY / dist;
    const nz = baseZ / dist;
    
    // Each particle has its own phase offset for varied timing
    const particlePhase = i * 0.15;
    
    // PULSATING IN/OUT - main breathing effect
    // Creates waves of particles moving outward then returning
    const breathCycle = time * 0.8 + particlePhase;
    const breathWave = Math.sin(breathCycle) * 0.5 + Math.sin(breathCycle * 2.3) * 0.2;
    
    // Energy burst waves - periodic ejection of particles
    const burstPhase = time * 0.4 + particlePhase * 0.5;
    const burst = Math.pow(Math.max(0, Math.sin(burstPhase)), 3) * 0.6;
    
    // Spiral motion around the orb
    const spiralAngle = time * 0.5 + particlePhase + dist * 2;
    const spiralRadius = 0.08 + Math.sin(time * 0.7 + i) * 0.04;
    
    // Vertical oscillation
    const verticalWave = Math.sin(time * 0.6 + particlePhase * 1.5) * 0.12;
    
    // Combined radial pulsation - in and out of the orb
    const radialPulse = breathWave * 0.35 + burst * 0.4;
    
    // Some particles should occasionally dive deep into the orb core
    const diveFactor = Math.sin(time * 0.3 + i * 0.7);
    const diveInward = diveFactor > 0.7 ? (diveFactor - 0.7) * 1.5 : 0;
    
    // Audio reactivity - more dramatic expansion
    const audioExpansion = 1 + audioLevel * 0.8;
    
    // Calculate final position
    // Base distance + pulsation - dive creates merging effect
    const finalDist = (dist + radialPulse - diveInward * 0.4) * audioExpansion;
    
    // Apply spiral motion perpendicular to radial direction
    const perpX = Math.cos(spiralAngle) * spiralRadius;
    const perpY = verticalWave;
    const perpZ = Math.sin(spiralAngle) * spiralRadius;
    
    positions[idx] = nx * finalDist + perpX;
    positions[idx + 1] = ny * finalDist + perpY;
    positions[idx + 2] = nz * finalDist + perpZ;
  }
}

/**
 * Create particle material - ENERGY BEING glow effect
 */
export function createParticleMaterial(color: string): THREE.PointsMaterial {
  const hsl = parseHslColor(color);
  const threeColor = new THREE.Color();
  // Bright, saturated colors for energy effect
  threeColor.setHSL(hsl.h, Math.min(1, hsl.s * 1.3), Math.min(0.9, hsl.l * 1.4));
  
  return new THREE.PointsMaterial({
    color: threeColor,
    size: 0.08,          // Larger particles
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,   // Better blending with orb
  });
}

/**
 * Particle system component for Three.js scene
 */
export class ParticleSystem {
  private points: THREE.Points;
  private basePositions: Float32Array;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private count: number;
  
  constructor(
    count: number,
    color: string,
    innerRadius: number = 0.5,  // Start closer to orb
    outerRadius: number = 2.2   // Extend further out
  ) {
    this.count = Math.max(120, count); // Minimum 120 particles for energy effect
    this.geometry = new THREE.BufferGeometry();
    this.material = createParticleMaterial(color);
    
    // Generate initial positions - mix of inner and outer
    this.basePositions = generateParticlePositions(this.count, innerRadius, outerRadius);
    const positions = new Float32Array(this.basePositions);
    
    // Add size variation for each particle - creates depth
    const sizes = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      sizes[i] = 0.3 + Math.random() * 1.0; // Wide size variation
    }
    
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute(
      'size',
      new THREE.BufferAttribute(sizes, 1)
    );
    
    this.points = new THREE.Points(this.geometry, this.material);
  }
  
  get mesh(): THREE.Points {
    return this.points;
  }
  
  update(time: number, audioLevel: number = 0): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    updateParticlePositions(positions, this.basePositions, time, audioLevel);
    this.geometry.attributes.position.needsUpdate = true;
    
    // Gentle rotation of entire particle system
    this.points.rotation.y = time * 0.08;
    this.points.rotation.x = Math.sin(time * 0.15) * 0.08;
    
    // Pulsating opacity for energy breathing
    this.material.opacity = 0.7 + Math.sin(time * 1.2) * 0.25;
  }
  
  setColor(color: string): void {
    const hsl = parseHslColor(color);
    this.material.color.setHSL(hsl.h, hsl.s, hsl.l);
  }
  
  setCount(newCount: number): void {
    if (newCount === this.count) return;
    
    this.count = newCount;
    this.basePositions = generateParticlePositions(newCount, 0.9, 1.3);
    const positions = new Float32Array(this.basePositions);
    
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }
  
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

/**
 * React component wrapper for particle system
 * Note: This is a utility export, actual particles are managed in WebGLOrb
 */
export const OrbParticles: React.FC<OrbParticlesProps> = ({
  count,
  color,
  orbRadius,
  audioLevel = 0,
  time,
}) => {
  // This component is primarily for type exports
  // Actual rendering is done in WebGLOrb via ParticleSystem class
  return null;
};

export default OrbParticles;

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
 * Update particle positions - DRAMATIC ENERGY BEING pulsating in/out effect
 * Particles actively merge with and eject from the orb
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
    const baseDist = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
    const nx = baseX / baseDist;
    const ny = baseY / baseDist;
    const nz = baseZ / baseDist;
    
    // Each particle has unique timing
    const particleId = i / count;
    const particlePhase = i * 0.25 + particleId * Math.PI * 2;
    
    // === DRAMATIC PULSATION - Main in/out breathing ===
    // Fast breathing cycle - particles rush in and out
    const fastBreath = Math.sin(time * 1.5 + particlePhase) * 0.6;
    const slowBreath = Math.sin(time * 0.4 + particlePhase * 0.5) * 0.3;
    
    // === ENERGY BURSTS - Periodic ejection waves ===
    const burstPhase = time * 0.8 + particlePhase * 0.3;
    const burst = Math.pow(Math.max(0, Math.sin(burstPhase)), 2) * 0.8;
    
    // === MERGING EFFECT - Particles dive deep into orb ===
    // Some particles periodically merge completely into the orb
    const mergeCycle = Math.sin(time * 0.5 + i * 0.4);
    const mergeDepth = mergeCycle > 0.6 ? (mergeCycle - 0.6) * 2.5 : 0; // Deep dive
    
    // === SPIRAL ORBIT around orb ===
    const spiralSpeed = 0.8 + particleId * 0.4;
    const spiralAngle = time * spiralSpeed + particlePhase + baseDist * 3;
    const spiralRadius = 0.15 + Math.sin(time * 0.9 + i) * 0.1;
    
    // === WAVE MOTION ===
    const waveX = Math.sin(time * 1.2 + particlePhase) * 0.12;
    const waveY = Math.cos(time * 0.8 + particlePhase * 1.3) * 0.15;
    const waveZ = Math.sin(time * 1.0 + particlePhase * 0.7) * 0.12;
    
    // === RANDOM JITTER for organic feel ===
    const jitterX = Math.sin(time * 3 + i * 7.3) * 0.03;
    const jitterY = Math.cos(time * 2.7 + i * 5.1) * 0.03;
    const jitterZ = Math.sin(time * 2.3 + i * 6.7) * 0.03;
    
    // === COMBINE ALL EFFECTS ===
    // Radial movement: breathe + burst - merge
    const radialOffset = fastBreath + slowBreath + burst - mergeDepth * 0.6;
    
    // Audio makes particles expand dramatically
    const audioExpansion = 1 + audioLevel * 1.2;
    
    // Final radial distance - can go inside the orb!
    const minDist = 0.2; // Allow particles to get very close to center
    const finalDist = Math.max(minDist, (baseDist * 0.7 + radialOffset * 0.5)) * audioExpansion;
    
    // Orbital position
    const orbitalX = Math.cos(spiralAngle) * spiralRadius;
    const orbitalY = Math.sin(spiralAngle * 0.7) * spiralRadius * 0.8;
    const orbitalZ = Math.sin(spiralAngle) * spiralRadius;
    
    // Final position
    positions[idx] = nx * finalDist + orbitalX + waveX + jitterX;
    positions[idx + 1] = ny * finalDist + orbitalY + waveY + jitterY;
    positions[idx + 2] = nz * finalDist + orbitalZ + waveZ + jitterZ;
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
    
    // Rotate entire particle cloud for added dynamism
    this.points.rotation.y = time * 0.12;
    this.points.rotation.x = Math.sin(time * 0.2) * 0.15;
    this.points.rotation.z = Math.cos(time * 0.15) * 0.08;
    
    // Pulsating size for energy effect
    this.material.size = 0.06 + Math.sin(time * 2) * 0.025;
    
    // Pulsating opacity - breathing glow
    this.material.opacity = 0.75 + Math.sin(time * 1.5) * 0.2;
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

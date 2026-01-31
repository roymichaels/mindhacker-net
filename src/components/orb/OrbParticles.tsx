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
 * Generate particle positions in a sphere around the orb
 */
export function generateParticlePositions(
  count: number,
  innerRadius: number,
  outerRadius: number
): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    // Random point on sphere shell
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    
    positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = radius * Math.cos(theta);
  }
  
  return positions;
}

/**
 * Update particle positions with ALIEN organic swirling movement
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
    
    // Multi-axis orbital swirling - alien effect
    const swirl1 = time * 0.4 + i * 0.15 + dist * 2;
    const swirl2 = time * 0.25 + i * 0.08;
    const swirl3 = time * 0.6 + i * 0.2;
    
    // Orbital movement - more complex
    const orbitRadius = 0.12 + Math.sin(swirl2) * 0.06 + Math.cos(swirl3) * 0.04;
    
    // Vertical/horizontal waves - more dynamic
    const waveY = Math.sin(swirl1) * 0.15 + Math.cos(time * 0.3 + i) * 0.08;
    const waveX = Math.cos(swirl2) * 0.1;
    const waveZ = Math.sin(swirl3) * 0.1;
    
    // Pulsing expansion - breathing effect
    const pulseExpansion = 1 + Math.sin(time * 0.8 + dist * 3) * 0.15;
    
    // Audio reactivity - particles expand outward more dramatically
    const audioExpansion = 1 + audioLevel * 0.5;
    
    const totalExpansion = pulseExpansion * audioExpansion;
    
    positions[idx] = (baseX + Math.cos(swirl1) * orbitRadius + waveX) * totalExpansion;
    positions[idx + 1] = (baseY + waveY) * totalExpansion;
    positions[idx + 2] = (baseZ + Math.sin(swirl1) * orbitRadius + waveZ) * totalExpansion;
  }
}

/**
 * Create particle material with custom color - ENHANCED for alien glow effect
 */
export function createParticleMaterial(color: string): THREE.PointsMaterial {
  const hsl = parseHslColor(color);
  const threeColor = new THREE.Color();
  // Boost saturation and lightness for more vibrant particles
  threeColor.setHSL(hsl.h, Math.min(1, hsl.s * 1.2), Math.min(0.85, hsl.l * 1.3));
  
  return new THREE.PointsMaterial({
    color: threeColor,
    size: 0.06, // Bigger particles
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
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
    innerRadius: number = 0.8,
    outerRadius: number = 1.8
  ) {
    this.count = Math.max(80, count); // Minimum 80 particles for alien effect
    this.geometry = new THREE.BufferGeometry();
    this.material = createParticleMaterial(color);
    
    // Generate initial positions - wider spread for alien effect
    this.basePositions = generateParticlePositions(this.count, innerRadius, outerRadius);
    const positions = new Float32Array(this.basePositions);
    
    // Add size variation for each particle
    const sizes = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      sizes[i] = 0.4 + Math.random() * 0.8; // Size variation
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
    
    // Subtle rotation
    this.points.rotation.y = time * 0.1;
    this.points.rotation.x = Math.sin(time * 0.2) * 0.1;
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

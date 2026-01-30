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
 * Update particle positions with organic movement
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
    
    // Orbital movement
    const angle = time * 0.3 + i * 0.1;
    const orbitRadius = 0.05 + Math.sin(time * 0.5 + i) * 0.02;
    
    // Vertical wave
    const waveY = Math.sin(time * 0.7 + i * 0.2) * 0.08;
    
    // Audio reactivity - particles expand outward
    const audioExpansion = 1 + audioLevel * 0.3;
    
    positions[idx] = (baseX + Math.cos(angle) * orbitRadius) * audioExpansion;
    positions[idx + 1] = (baseY + waveY) * audioExpansion;
    positions[idx + 2] = (baseZ + Math.sin(angle) * orbitRadius) * audioExpansion;
  }
}

/**
 * Create particle material with custom color
 */
export function createParticleMaterial(color: string): THREE.PointsMaterial {
  const hsl = parseHslColor(color);
  const threeColor = new THREE.Color();
  threeColor.setHSL(hsl.h, hsl.s, hsl.l);
  
  return new THREE.PointsMaterial({
    color: threeColor,
    size: 0.03,
    transparent: true,
    opacity: 0.8,
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
    innerRadius: number = 0.9,
    outerRadius: number = 1.3
  ) {
    this.count = count;
    this.geometry = new THREE.BufferGeometry();
    this.material = createParticleMaterial(color);
    
    // Generate initial positions
    this.basePositions = generateParticlePositions(count, innerRadius, outerRadius);
    const positions = new Float32Array(this.basePositions);
    
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
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

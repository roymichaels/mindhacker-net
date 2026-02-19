/**
 * Multi-behavior particle system for personalized orb
 * Supports 5 behaviors: orbit, spiral, halo, burst, drift
 * Supports multi-color palettes with different modes
 */

import * as THREE from 'three';
import type { ParticleBehavior, ParticleMode } from './types';

// ===== HSL Parsing =====
function parseHslToColor(hsl: string): THREE.Color {
  const m = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (m) {
    const color = new THREE.Color();
    color.setHSL(parseInt(m[1]) / 360, parseInt(m[2]) / 100, parseInt(m[3]) / 100);
    return color;
  }
  return new THREE.Color(0.5, 0.5, 0.7);
}

/**
 * Multi-behavior particle system
 */
export class ParticleSystem {
  private points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private count: number;
  private behavior: ParticleBehavior;
  private paletteColors: THREE.Color[];
  private particleMode: ParticleMode;
  private baseAngles: Float32Array;   // per-particle random angle
  private baseRadii: Float32Array;    // per-particle random radius
  private baseSpeeds: Float32Array;   // per-particle speed factor
  private basePhases: Float32Array;   // per-particle phase offset

  constructor(
    count: number,
    palette: string[],
    behavior: ParticleBehavior = 'orbit',
    mode: ParticleMode = 'cycle',
    orbRadius: number = 0.5
  ) {
    this.count = Math.max(40, Math.min(120, count));
    this.behavior = behavior;
    this.particleMode = mode;
    this.paletteColors = palette.map(parseHslToColor);
    if (this.paletteColors.length === 0) this.paletteColors = [new THREE.Color(0.5, 0.5, 0.7)];

    this.geometry = new THREE.BufferGeometry();
    
    // Use first palette color for material (will animate via vertex colors)
    this.material = new THREE.PointsMaterial({
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Generate per-particle parameters (deterministic from index)
    this.baseAngles = new Float32Array(this.count);
    this.baseRadii = new Float32Array(this.count);
    this.baseSpeeds = new Float32Array(this.count);
    this.basePhases = new Float32Array(this.count);

    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      const t = i / this.count;
      this.baseAngles[i] = t * Math.PI * 2;
      this.baseRadii[i] = orbRadius * (1.2 + this.pseudoRandom(i, 0) * 1.0);
      this.baseSpeeds[i] = 0.5 + this.pseudoRandom(i, 1) * 1.0;
      this.basePhases[i] = this.pseudoRandom(i, 2) * Math.PI * 2;

      // Initial positions
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Assign colors based on mode
      const color = this.getParticleColor(i, 0);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.points = new THREE.Points(this.geometry, this.material);
  }

  private pseudoRandom(i: number, offset: number): number {
    const x = Math.sin((i + 1) * 127.1 + offset * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  private getParticleColor(index: number, time: number): THREE.Color {
    const p = this.paletteColors;
    if (p.length === 1) return p[0];
    
    switch (this.particleMode) {
      case 'single': return p[0];
      case 'cycle': {
        const t = (time * 0.3 + index * 0.1) % p.length;
        const idx = Math.floor(t);
        const frac = t - idx;
        return p[idx].clone().lerp(p[(idx + 1) % p.length], frac);
      }
      case 'random': return p[Math.floor(this.pseudoRandom(index, 3) * p.length) % p.length];
      case 'byRadius': {
        const t = (this.baseRadii[index] - 0.5) / 1.2;
        const idx = Math.min(Math.floor(t * (p.length - 1)), p.length - 2);
        return p[idx].clone().lerp(p[idx + 1], t * (p.length - 1) - idx);
      }
      case 'byVelocity': {
        const t = (this.baseSpeeds[index] - 0.5) / 1.0;
        const idx = Math.min(Math.floor(t * (p.length - 1)), p.length - 2);
        return p[idx].clone().lerp(p[idx + 1], t * (p.length - 1) - idx);
      }
      default: return p[0];
    }
  }

  get mesh(): THREE.Points { return this.points; }

  update(time: number, audioLevel: number = 0, pulseRate: number = 1): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const colors = this.geometry.attributes.color.array as Float32Array;

    for (let i = 0; i < this.count; i++) {
      const angle = this.baseAngles[i];
      const radius = this.baseRadii[i] * (1 + audioLevel * 0.3);
      const speed = this.baseSpeeds[i];
      const phase = this.basePhases[i];

      let x = 0, y = 0, z = 0;

      switch (this.behavior) {
        case 'orbit': {
          const a = time * speed * 0.5 + angle;
          const tilt = phase * 0.3;
          x = Math.cos(a) * radius;
          y = Math.sin(a + tilt) * radius * 0.3;
          z = Math.sin(a) * radius;
          break;
        }
        case 'spiral': {
          const a = time * speed * 0.4 + angle;
          const heightT = ((time * speed * 0.2 + phase) % 2) - 1; // -1 to 1
          x = Math.cos(a) * radius * 0.8;
          y = heightT * radius;
          z = Math.sin(a) * radius * 0.8;
          break;
        }
        case 'halo': {
          const a = time * speed * 0.3 + angle;
          const wobble = Math.sin(time * 1.5 + phase) * 0.05;
          x = Math.cos(a) * radius;
          y = wobble * radius;
          z = Math.sin(a) * radius;
          break;
        }
        case 'burst': {
          const burstCycle = (time * pulseRate * 0.5 + phase) % (Math.PI * 2);
          const burstFactor = Math.pow(Math.max(0, Math.sin(burstCycle)), 3);
          const effectiveRadius = radius * (0.3 + burstFactor * 1.5);
          const phi = angle;
          const theta = Math.acos(2 * this.pseudoRandom(i, 4) - 1);
          x = effectiveRadius * Math.sin(theta) * Math.cos(phi);
          y = effectiveRadius * Math.sin(theta) * Math.sin(phi);
          z = effectiveRadius * Math.cos(theta);
          break;
        }
        case 'drift': {
          const driftX = Math.sin(time * 0.3 * speed + phase) * radius;
          const driftY = Math.cos(time * 0.2 * speed + phase * 1.3) * radius * 0.5;
          const driftZ = Math.sin(time * 0.25 * speed + phase * 0.7) * radius;
          x = driftX;
          y = driftY;
          z = driftZ;
          break;
        }
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Update colors for cycle mode
      if (this.particleMode === 'cycle') {
        const color = this.getParticleColor(i, time);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    if (this.particleMode === 'cycle') this.geometry.attributes.color.needsUpdate = true;

    // Subtle overall rotation
    this.points.rotation.y = time * 0.08;

    // Pulsating opacity
    this.material.opacity = 0.6 + Math.sin(time * 1.5) * 0.2;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// React component wrapper (rendering done via ParticleSystem class in WebGLOrb)
export default function OrbParticles() { return null; }

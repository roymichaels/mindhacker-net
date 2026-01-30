import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import type { OrbRef, OrbProps, OrbState } from './types';
import { getEgoStateColors } from '@/lib/egoStates';

// Check WebGL support
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// Simplex-like noise function for organic movement
function noise3D(x: number, y: number, z: number): number {
  const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  const perm = [...p, ...p];
  
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  
  const u = fade(x), v = fade(y), w = fade(z);
  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
  const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
  
  return lerp(w, 
    lerp(v, lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z)),
            lerp(u, grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z))),
    lerp(v, lerp(u, grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1)),
            lerp(u, grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1)))
  );
}

// Fractal Brownian Motion for complex organic patterns
function fbm(x: number, y: number, z: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  return value;
}

export const WebGLOrb = forwardRef<OrbRef, OrbProps>(function WebGLOrb(
  { size = 300, state: externalState, audioLevel: externalAudioLevel, tunnelMode, egoState = 'guardian', className, showGlow = true, onReady },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const innerMeshRef = useRef<THREE.Mesh | null>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const innerBasePositionsRef = useRef<Float32Array | null>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const morphPhaseRef = useRef(0);

  const [internalState, setInternalState] = useState<OrbState>('idle');
  const [internalAudioLevel, setInternalAudioLevel] = useState(0);
  const [internalTunnelMode, setInternalTunnelMode] = useState(false);

  const state = externalState ?? internalState;
  const audioLevel = externalAudioLevel ?? internalAudioLevel;
  const isTunnel = tunnelMode ?? internalTunnelMode;

  const colors = getEgoStateColors(egoState);

  useImperativeHandle(ref, () => ({
    setSpeaking: (speaking: boolean) => setInternalState(speaking ? 'speaking' : 'idle'),
    setListening: (listening: boolean) => setInternalState(listening ? 'listening' : 'idle'),
    setThinking: (thinking: boolean) => setInternalState(thinking ? 'thinking' : 'idle'),
    updateState: setInternalState,
    setAudioLevel: setInternalAudioLevel,
    setTunnelMode: setInternalTunnelMode,
  }), []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera - moved further back to prevent clipping
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Outer Geometry - High-detail Icosahedron for organic alien shape
    const geometry = new THREE.IcosahedronGeometry(0.75, 5);
    basePositionsRef.current = (geometry.attributes.position.array as Float32Array).slice();
    
    // Material - Wireframe with semi-transparency
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colors.primary),
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Inner fractal layer - slightly smaller, different subdivision
    const innerGeometry = new THREE.IcosahedronGeometry(0.5, 3);
    innerBasePositionsRef.current = (innerGeometry.attributes.position.array as Float32Array).slice();
    
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colors.glow),
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });

    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);
    innerMeshRef.current = innerMesh;

    // Core glow sphere - only add if showGlow is true
    if (showGlow) {
      const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors.glow),
        transparent: true,
        opacity: 0.5,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      scene.add(glowMesh);
    }

    onReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, colors.primary, colors.glow, showGlow, onReady]);

  // Update colors when egoState changes
  useEffect(() => {
    if (!meshRef.current || !innerMeshRef.current) return;
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    const innerMaterial = innerMeshRef.current.material as THREE.MeshBasicMaterial;
    material.color.set(colors.primary);
    innerMaterial.color.set(colors.glow);
  }, [colors.primary, colors.glow]);

  // Animation loop with organic alien pulsation
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !meshRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mesh = meshRef.current;
    const innerMesh = innerMeshRef.current;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.008;
      morphPhaseRef.current += 0.003;

      const time = timeRef.current;
      const morphPhase = morphPhaseRef.current;

      // State-based animation parameters
      const stateConfig = {
        idle: { rotSpeed: 0.002, morphIntensity: 0.12, pulseSpeed: 0.8, fractalOctaves: 3 },
        listening: { rotSpeed: 0.004, morphIntensity: 0.18, pulseSpeed: 1.2, fractalOctaves: 4 },
        speaking: { rotSpeed: 0.006, morphIntensity: 0.25, pulseSpeed: 1.8, fractalOctaves: 5 },
        thinking: { rotSpeed: 0.008, morphIntensity: 0.22, pulseSpeed: 1.5, fractalOctaves: 4 },
        session: { rotSpeed: 0.003, morphIntensity: 0.15, pulseSpeed: 1.0, fractalOctaves: 3 },
        breathing: { rotSpeed: 0.002, morphIntensity: 0.2, pulseSpeed: 0.5, fractalOctaves: 3 },
      }[state];

      const { rotSpeed, morphIntensity, pulseSpeed, fractalOctaves } = stateConfig;

      // Organic rotation with wobble
      const wobble = Math.sin(time * 0.7) * 0.001;
      mesh.rotation.x += rotSpeed + wobble;
      mesh.rotation.y += rotSpeed * 1.3 + Math.cos(time * 0.5) * 0.001;
      mesh.rotation.z += Math.sin(time * 0.3) * 0.0005;

      // Counter-rotate inner mesh for alien effect
      if (innerMesh) {
        innerMesh.rotation.x -= rotSpeed * 0.7;
        innerMesh.rotation.y -= rotSpeed * 0.5;
        innerMesh.rotation.z += rotSpeed * 0.3;
      }

      // Organic pulsating scale with multiple frequencies
      const basePulse = Math.sin(time * pulseSpeed) * 0.08;
      const secondaryPulse = Math.sin(time * pulseSpeed * 2.3) * 0.03;
      const tertiaryPulse = Math.sin(time * pulseSpeed * 0.7) * 0.05;
      const audioBoost = audioLevel * 0.3;
      const breathEffect = state === 'breathing' ? Math.sin(time * 0.5) * 0.1 : 0;
      
      const targetScale = 1 + basePulse + secondaryPulse + tertiaryPulse + audioBoost + breathEffect;
      mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      // Inner mesh pulsates inversely for organic alien feel
      if (innerMesh) {
        const innerPulse = 1 - basePulse * 0.5 + secondaryPulse * 0.8;
        innerMesh.scale.lerp(new THREE.Vector3(innerPulse, innerPulse, innerPulse), 0.1);
      }

      // Organic vertex morphing with fractal noise - OUTER MESH
      const positions = mesh.geometry.attributes.position;
      const basePositions = basePositionsRef.current;
      if (basePositions) {
        for (let i = 0; i < positions.count; i++) {
          const idx = i * 3;
          const x = basePositions[idx];
          const y = basePositions[idx + 1];
          const z = basePositions[idx + 2];
          
          // Calculate vertex distance from center for radial effects
          const dist = Math.sqrt(x * x + y * y + z * z);
          
          // Multi-layer fractal deformation
          const fractalNoise = fbm(
            x * 2 + morphPhase,
            y * 2 + morphPhase * 0.7,
            z * 2 + morphPhase * 1.3,
            fractalOctaves
          );
          
          // Traveling wave across surface
          const wavePhase = Math.sin(x * 3 + y * 2 + z * 4 + time * 2) * 0.03;
          
          // Radial pulse from center
          const radialPulse = Math.sin(dist * 8 - time * 3) * 0.02;
          
          // Combine all deformations
          const totalDeform = (fractalNoise * morphIntensity + wavePhase + radialPulse) * (1 + audioLevel * 0.5);
          
          // Normalize direction for displacement
          const nx = x / dist;
          const ny = y / dist;
          const nz = z / dist;
          
          positions.setXYZ(
            i,
            x + nx * totalDeform,
            y + ny * totalDeform,
            z + nz * totalDeform
          );
        }
        positions.needsUpdate = true;
      }

      // Inner mesh morphing - different pattern for depth
      if (innerMesh) {
        const innerPositions = innerMesh.geometry.attributes.position;
        const innerBasePositions = innerBasePositionsRef.current;
        if (innerBasePositions) {
          for (let i = 0; i < innerPositions.count; i++) {
            const idx = i * 3;
            const x = innerBasePositions[idx];
            const y = innerBasePositions[idx + 1];
            const z = innerBasePositions[idx + 2];
            
            const dist = Math.sqrt(x * x + y * y + z * z);
            
            // Offset phase for inner layer
            const innerNoise = fbm(
              x * 3 - morphPhase * 1.5,
              y * 3 + morphPhase,
              z * 3 - morphPhase * 0.8,
              fractalOctaves - 1
            );
            
            const innerDeform = innerNoise * morphIntensity * 0.8 * (1 + audioLevel * 0.3);
            
            const nx = x / dist;
            const ny = y / dist;
            const nz = z / dist;
            
            innerPositions.setXYZ(
              i,
              x + nx * innerDeform,
              y + ny * innerDeform,
              z + nz * innerDeform
            );
          }
          innerPositions.needsUpdate = true;
        }
      }

      // Dynamic opacity based on state
      const material = mesh.material as THREE.MeshBasicMaterial;
      const opacityPulse = 0.6 + Math.sin(time * 1.5) * 0.15 + audioLevel * 0.2;
      material.opacity = Math.min(opacityPulse, 0.9);

      if (innerMesh) {
        const innerMaterial = innerMesh.material as THREE.MeshBasicMaterial;
        innerMaterial.opacity = 0.3 + Math.sin(time * 2) * 0.1;
      }

      // Tunnel mode - camera moves forward with rotation
      if (isTunnel) {
        camera.position.z = 2.5 + Math.sin(time * 0.5) * 0.4;
        mesh.rotation.z += 0.015;
      } else {
        camera.position.z = 3;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [state, audioLevel, isTunnel]);

  // Resize handling
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;
    rendererRef.current.setSize(size, size);
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ 
        width: size, 
        height: size, 
        background: 'transparent',
        overflow: 'visible'
      }}
    />
  );
});

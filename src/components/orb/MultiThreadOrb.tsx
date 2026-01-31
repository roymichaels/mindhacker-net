/**
 * MultiThreadOrb - Alien Slimy Pulsating Orb
 * 
 * A mesmerizing alien orb with:
 * - Iridescent/slimy material
 * - Pulsating geometric fractures
 * - DNA-driven visual properties (texture, color, shape, glow, aura)
 */

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import type { OrbRef, OrbState } from './types';
import type { MultiThreadOrbProfile } from '@/lib/orbDNAThreads';
import { DEFAULT_MULTI_THREAD_PROFILE } from '@/lib/orbDNAThreads';

interface MultiThreadOrbProps {
  size?: number;
  state?: OrbState;
  audioLevel?: number;
  tunnelMode?: boolean;
  className?: string;
  showGlow?: boolean;
  onReady?: () => void;
  profile: MultiThreadOrbProfile;
}

// Parse HSL color string to THREE.Color
function parseHslToThreeColor(colorStr: string): THREE.Color {
  const match = colorStr.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (match) {
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;
    const color = new THREE.Color();
    color.setHSL(h, s, l);
    return color;
  }
  return new THREE.Color(0x00ff88);
}

// Simplex-like noise for organic deformation
function noise3D(x: number, y: number, z: number, seed: number = 0): number {
  const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142];
  const perm = [...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p];
  
  x += seed * 0.1;
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  
  const u = fade(x), v = fade(y), w = fade(z);
  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
  const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
  
  return lerp(w, lerp(v, lerp(u, perm[AA], perm[BA]), lerp(u, perm[AB], perm[BB])),
    lerp(v, lerp(u, perm[AA + 1], perm[BA + 1]), lerp(u, perm[AB + 1], perm[BB + 1]))) / 255;
}

// Fractal Brownian Motion for organic surface
function fbm(x: number, y: number, z: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise3D(x * frequency, y * frequency, z * frequency, i * 100);
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  return value;
}

export const MultiThreadOrb = forwardRef<OrbRef, MultiThreadOrbProps>(function MultiThreadOrb(
  {
    size = 300,
    state: externalState,
    audioLevel: externalAudioLevel = 0,
    tunnelMode = false,
    className,
    showGlow = true,
    onReady,
    profile,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mainOrbRef = useRef<THREE.Mesh | null>(null);
  const innerGlowRef = useRef<THREE.Mesh | null>(null);
  const outerAuraRef = useRef<THREE.Mesh | null>(null);
  const geometricLayerRef = useRef<THREE.Mesh | null>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const geoBasePositionsRef = useRef<Float32Array | null>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const [internalState, setInternalState] = useState<OrbState>('idle');
  const [internalAudioLevel, setInternalAudioLevel] = useState(0);
  const [internalTunnelMode, setInternalTunnelMode] = useState(false);

  const state = externalState ?? internalState;
  const audioLevel = externalAudioLevel ?? internalAudioLevel;
  const isTunnel = tunnelMode ?? internalTunnelMode;

  const activeProfile = profile || DEFAULT_MULTI_THREAD_PROFILE;

  useImperativeHandle(ref, () => ({
    setSpeaking: (speaking: boolean) => setInternalState(speaking ? 'speaking' : 'idle'),
    setListening: (listening: boolean) => setInternalState(listening ? 'listening' : 'idle'),
    setThinking: (thinking: boolean) => setInternalState(thinking ? 'thinking' : 'idle'),
    updateState: setInternalState,
    setAudioLevel: setInternalAudioLevel,
    setTunnelMode: setInternalTunnelMode,
  }), []);

  // Extract visual properties from profile
  const getVisualProperties = () => {
    const threads = activeProfile.threads;
    const shape = activeProfile.shape;
    const motion = activeProfile.motionProfile;
    
    // Primary color from first trait
    const primaryColor = threads[0] ? parseHslToThreeColor(threads[0].color) : new THREE.Color(0x8844ff);
    
    // Secondary color from hobbies or second trait
    const hobbyThread = threads.find(t => t.source === 'hobby');
    const secondaryColor = hobbyThread 
      ? parseHslToThreeColor(hobbyThread.color) 
      : threads[1] ? parseHslToThreeColor(threads[1].color) : new THREE.Color(0x00ffaa);
    
    // Accent/glow color from strengths
    const strengthThread = threads.find(t => t.source === 'strength');
    const accentColor = strengthThread 
      ? parseHslToThreeColor(strengthThread.color)
      : new THREE.Color(0xff44aa);
    
    // Aura color from growth edges (aspirational, lighter)
    const growthThread = threads.find(t => t.source === 'growth_edge');
    const auraColor = growthThread
      ? parseHslToThreeColor(growthThread.color)
      : new THREE.Color(0x44aaff);
    
    // Pattern thread affects texture intensity
    const patternThread = threads.find(t => t.source === 'pattern');
    const textureIntensity = patternThread ? 1 - patternThread.intensity : 0.7;
    
    return {
      primaryColor,
      secondaryColor,
      accentColor,
      auraColor,
      textureIntensity,
      organicFlow: shape.organicFlow,
      edgeSharpness: shape.edgeSharpness,
      complexity: shape.complexity,
      speed: motion.speed,
      pulseRate: motion.pulseRate,
      reactivity: motion.reactivity,
      smoothness: motion.smoothness,
      consciousnessLevel: activeProfile.consciousnessLevel,
    };
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const vis = getVisualProperties();

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer with better quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Dramatic lighting for alien feel
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Main key light - from above front
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(1, 2, 3);
    scene.add(keyLight);

    // Fill light - opposite side, colored
    const fillLight = new THREE.DirectionalLight(vis.secondaryColor.getHex(), 0.6);
    fillLight.position.set(-2, 0, 1);
    scene.add(fillLight);

    // Rim light - from behind for alien glow edge
    const rimLight = new THREE.PointLight(vis.accentColor.getHex(), 1.0, 8);
    rimLight.position.set(0, 0, -2);
    scene.add(rimLight);

    // Top accent light
    const topLight = new THREE.PointLight(vis.auraColor.getHex(), 0.8, 6);
    topLight.position.set(0, 3, 1);
    scene.add(topLight);

    // === LAYER 1: Outer Aura (subtle glow) ===
    if (showGlow) {
      const auraGeometry = new THREE.SphereGeometry(1.15, 32, 32);
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: vis.auraColor,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      });
      const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial);
      scene.add(auraMesh);
      outerAuraRef.current = auraMesh;
    }

    // === LAYER 2: Main Alien Orb (slimy, iridescent) ===
    const mainGeometry = new THREE.IcosahedronGeometry(0.85, 5);
    const positions = mainGeometry.attributes.position.array as Float32Array;
    basePositionsRef.current = positions.slice();

    // Create slimy/iridescent material
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: vis.primaryColor,
      emissive: vis.primaryColor.clone().multiplyScalar(0.25),
      emissiveIntensity: 0.8,
      roughness: 0.15, // Slimy = low roughness
      metalness: 0.7, // Metallic iridescence
      side: THREE.DoubleSide,
      envMapIntensity: 1.5,
    });

    const mainOrb = new THREE.Mesh(mainGeometry, mainMaterial);
    scene.add(mainOrb);
    mainOrbRef.current = mainOrb;

    // === LAYER 3: Inner Glow Core ===
    const innerGeometry = new THREE.SphereGeometry(0.55, 32, 32);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: vis.accentColor,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);
    innerGlowRef.current = innerMesh;

    // === LAYER 4: Geometric Fracture Layer ===
    const geoGeometry = new THREE.IcosahedronGeometry(0.92, 2);
    const geoPositions = geoGeometry.attributes.position.array as Float32Array;
    geoBasePositionsRef.current = geoPositions.slice();

    const geoMaterial = new THREE.MeshBasicMaterial({
      color: vis.secondaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const geoMesh = new THREE.Mesh(geoGeometry, geoMaterial);
    scene.add(geoMesh);
    geometricLayerRef.current = geoMesh;

    onReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      [mainOrbRef, innerGlowRef, outerAuraRef, geometricLayerRef].forEach(ref => {
        if (ref.current) {
          ref.current.geometry.dispose();
          (ref.current.material as THREE.Material).dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  // Update colors when profile changes
  useEffect(() => {
    const vis = getVisualProperties();

    if (mainOrbRef.current) {
      const material = mainOrbRef.current.material as THREE.MeshStandardMaterial;
      material.color = vis.primaryColor;
      material.emissive = vis.primaryColor.clone().multiplyScalar(0.25);
    }

    if (innerGlowRef.current) {
      const material = innerGlowRef.current.material as THREE.MeshBasicMaterial;
      material.color = vis.accentColor;
    }

    if (outerAuraRef.current) {
      const material = outerAuraRef.current.material as THREE.MeshBasicMaterial;
      material.color = vis.auraColor;
    }

    if (geometricLayerRef.current) {
      const material = geometricLayerRef.current.material as THREE.MeshBasicMaterial;
      material.color = vis.secondaryColor;
    }
  }, [activeProfile.threads, activeProfile.coreGlow]);

  // Animation loop
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !mainOrbRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mainOrb = mainOrbRef.current;
    const basePositions = basePositionsRef.current;
    const geoBasePositions = geoBasePositionsRef.current;
    
    const vis = getVisualProperties();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.012 * vis.speed;

      const time = timeRef.current;

      // State-based modifiers
      const stateModifier = {
        idle: { rotMod: 1, morphMod: 1, pulseMod: 1 },
        listening: { rotMod: 1.5, morphMod: 1.3, pulseMod: 1.6 },
        speaking: { rotMod: 2.0, morphMod: 1.5, pulseMod: 2.0 },
        thinking: { rotMod: 2.5, morphMod: 1.4, pulseMod: 1.8 },
        session: { rotMod: 1.3, morphMod: 1.2, pulseMod: 1.3 },
        breathing: { rotMod: 0.6, morphMod: 1.3, pulseMod: 0.6 },
      }[state];

      const { rotMod, morphMod, pulseMod } = stateModifier;

      // === MAIN ORB ANIMATION ===
      // Smooth rotation
      mainOrb.rotation.y += 0.004 * rotMod;
      mainOrb.rotation.x += 0.002 * rotMod;
      mainOrb.rotation.z = Math.sin(time * 0.3) * 0.1;

      // Pulsating scale
      const basePulse = 1 + Math.sin(time * vis.pulseRate * 1.5 * pulseMod) * 0.06;
      const secondPulse = Math.sin(time * vis.pulseRate * 2.3 * pulseMod) * 0.03;
      const audioBoost = audioLevel * vis.reactivity * 0.2;
      const targetScale = basePulse + secondPulse + audioBoost;
      mainOrb.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);

      // Organic slimy vertex morphing
      if (basePositions) {
        const positions = mainOrb.geometry.attributes.position;
        const morphIntensity = vis.organicFlow * 0.15 * morphMod;
        const octaves = Math.max(2, Math.min(5, Math.floor(vis.complexity)));

        for (let i = 0; i < positions.count; i++) {
          const idx = i * 3;
          const x = basePositions[idx];
          const y = basePositions[idx + 1];
          const z = basePositions[idx + 2];
          
          const dist = Math.sqrt(x * x + y * y + z * z);
          if (!Number.isFinite(dist) || dist === 0) {
            positions.setXYZ(i, x, y, z);
            continue;
          }
          
          // Multi-octave fractal noise for organic slimy feel
          const noiseVal = fbm(
            x * 2.5 + time * 0.3,
            y * 2.5 + time * 0.25,
            z * 2.5 + time * 0.35,
            octaves
          );
          
          // Secondary wobble for alien feel
          const wobble = Math.sin(x * 5 + time * 2) * Math.cos(y * 4 + time * 1.5) * 0.015;
          
          const deform = (noiseVal - 0.5) * morphIntensity * (1 + audioLevel * 0.5) + wobble;
          
          const nx = x / dist;
          const ny = y / dist;
          const nz = z / dist;
          
          positions.setXYZ(
            i,
            x + nx * deform,
            y + ny * deform,
            z + nz * deform
          );
        }
        positions.needsUpdate = true;
        mainOrb.geometry.computeVertexNormals();
      }

      // Pulsating emissive for alien glow
      const material = mainOrb.material as THREE.MeshStandardMaterial;
      const emissivePulse = 0.2 + Math.sin(time * 2.5) * 0.15 + audioLevel * 0.2;
      material.emissiveIntensity = emissivePulse;

      // === INNER GLOW ANIMATION ===
      if (innerGlowRef.current) {
        const innerPulse = 1 + Math.sin(time * vis.pulseRate * 2.5) * 0.15 + audioLevel * 0.2;
        innerGlowRef.current.scale.set(innerPulse, innerPulse, innerPulse);
        
        const innerMaterial = innerGlowRef.current.material as THREE.MeshBasicMaterial;
        innerMaterial.opacity = 0.35 + Math.sin(time * 1.8) * 0.15;
        
        // Counter-rotate for ethereal effect
        innerGlowRef.current.rotation.y -= 0.002;
        innerGlowRef.current.rotation.x -= 0.001;
      }

      // === OUTER AURA ANIMATION ===
      if (outerAuraRef.current) {
        const auraPulse = 1 + Math.sin(time * 0.8) * 0.08;
        outerAuraRef.current.scale.set(auraPulse, auraPulse, auraPulse);
        
        const auraMaterial = outerAuraRef.current.material as THREE.MeshBasicMaterial;
        auraMaterial.opacity = 0.08 + Math.sin(time * 1.2) * 0.04;
      }

      // === GEOMETRIC FRACTURE LAYER ANIMATION ===
      if (geometricLayerRef.current && geoBasePositions) {
        const geoMesh = geometricLayerRef.current;
        
        // Rotate opposite to main orb
        geoMesh.rotation.y -= 0.003 * rotMod;
        geoMesh.rotation.x -= 0.002 * rotMod;
        geoMesh.rotation.z = Math.cos(time * 0.4) * 0.15;

        // Pulsating scale with phase shift
        const geoPulse = 1 + Math.sin(time * vis.pulseRate * 1.2 + Math.PI) * 0.08;
        geoMesh.scale.set(geoPulse, geoPulse, geoPulse);

        // Morph the geometric wireframe
        const geoPositions = geoMesh.geometry.attributes.position;
        const geoMorphIntensity = 0.12 * morphMod;

        for (let i = 0; i < geoPositions.count; i++) {
          const idx = i * 3;
          const x = geoBasePositions[idx];
          const y = geoBasePositions[idx + 1];
          const z = geoBasePositions[idx + 2];
          
          const dist = Math.sqrt(x * x + y * y + z * z);
          if (!Number.isFinite(dist) || dist === 0) continue;
          
          // Sharp fracture-like noise
          const fractureNoise = noise3D(x * 4 + time * 0.5, y * 4 + time * 0.4, z * 4 + time * 0.6);
          const sharpDeform = (fractureNoise - 0.5) * geoMorphIntensity * (1 + Math.sin(time * 3) * 0.3);
          
          const nx = x / dist;
          const ny = y / dist;
          const nz = z / dist;
          
          geoPositions.setXYZ(
            i,
            x + nx * sharpDeform,
            y + ny * sharpDeform,
            z + nz * sharpDeform
          );
        }
        geoPositions.needsUpdate = true;

        // Pulsating opacity
        const geoMaterial = geoMesh.material as THREE.MeshBasicMaterial;
        geoMaterial.opacity = 0.25 + Math.sin(time * 2) * 0.1 + audioLevel * 0.1;
      }

      // Tunnel mode - zoom effect
      if (isTunnel) {
        camera.position.z = 2.5 + Math.sin(time * 0.5) * 0.4;
        mainOrb.rotation.z += 0.005;
      } else {
        camera.position.z = 3;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [state, audioLevel, isTunnel, activeProfile]);

  // Resize handling
  useEffect(() => {
    if (!rendererRef.current) return;
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
        overflow: 'visible',
      }}
    />
  );
});

export default MultiThreadOrb;

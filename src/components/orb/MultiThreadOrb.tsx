/**
 * MultiThreadOrb - Unified Liquid Mercury Alien Orb
 * 
 * A single unified solid 3D orb with:
 * - Liquid mercury iridescent material
 * - Beautiful organic flowing motion
 * - DNA-driven visual properties
 * - NO separate wireframe - all unified into one stunning orb
 */

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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
  return new THREE.Color(0x8844ff);
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
  const innerCoreRef = useRef<THREE.Mesh | null>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
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
    
    // Accent color from strengths
    const strengthThread = threads.find(t => t.source === 'strength');
    const accentColor = strengthThread 
      ? parseHslToThreeColor(strengthThread.color)
      : new THREE.Color(0xff44aa);
    
    return {
      primaryColor,
      secondaryColor,
      accentColor,
      organicFlow: shape.organicFlow,
      edgeSharpness: shape.edgeSharpness,
      complexity: shape.complexity,
      speed: motion.speed,
      pulseRate: motion.pulseRate,
      reactivity: motion.reactivity,
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

    // Camera - closer for more impact
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 2.8;
    cameraRef.current = camera;

    // Renderer with high quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.9;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === ENVIRONMENT (critical for metallic/mercury look) ===
    // Without an environment map, metal surfaces look flat and "moon-like".
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    // Keep background transparent (we only set environment, not scene.background)

    // === LIGHTING - Rich and dramatic ===
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Hemisphere light for natural gradient
    const hemiLight = new THREE.HemisphereLight(0xffffff, vis.primaryColor.getHex(), 1.0);
    scene.add(hemiLight);

    // Main key light - strong front
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(2, 3, 5);
    scene.add(keyLight);

    // Fill light - colored, soft
    const fillLight = new THREE.DirectionalLight(vis.secondaryColor.getHex(), 1.5);
    fillLight.position.set(-4, 0, 2);
    scene.add(fillLight);

    // Rim light - dramatic back glow
    const rimLight = new THREE.PointLight(vis.accentColor.getHex(), 3.0, 12);
    rimLight.position.set(0, 0, -4);
    scene.add(rimLight);

    // Top highlight
    const topLight = new THREE.PointLight(0xffffff, 2.0, 10);
    topLight.position.set(0, 5, 3);
    scene.add(topLight);

    // Bottom accent
    const bottomLight = new THREE.PointLight(vis.primaryColor.getHex(), 1.5, 8);
    bottomLight.position.set(0, -4, 2);
    scene.add(bottomLight);

    // === UNIFIED MAIN ORB - Single solid liquid mercury sphere ===
    const mainGeometry = new THREE.SphereGeometry(0.85, 128, 128); // High detail sphere
    const positions = mainGeometry.attributes.position.array as Float32Array;
    basePositionsRef.current = positions.slice();

    // Liquid mercury material - solid, reflective, iridescent
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: vis.primaryColor,
      emissive: vis.primaryColor.clone().multiplyScalar(0.4),
      emissiveIntensity: 1.0,
      roughness: 0.02, // Super smooth like liquid mercury
      metalness: 1.0, // Fully metallic
      clearcoat: 1.0, // Glass-like layer on top
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
      sheen: 1.0,
      sheenColor: vis.secondaryColor,
      sheenRoughness: 0.2,
      envMapIntensity: 2.2,
      specularIntensity: 1.0,
      specularColor: vis.secondaryColor,
      side: THREE.FrontSide,
    });

    const mainOrb = new THREE.Mesh(mainGeometry, mainMaterial);
    scene.add(mainOrb);
    mainOrbRef.current = mainOrb;

    // === INNER GLOWING CORE - Adds depth and life ===
    const coreGeometry = new THREE.SphereGeometry(0.5, 64, 64);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: vis.primaryColor.clone().multiplyScalar(2.0),
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreOrb = new THREE.Mesh(coreGeometry, coreMaterial);
    mainOrb.add(coreOrb); // Child of main orb
    innerCoreRef.current = coreOrb;

    onReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      mainGeometry.dispose();
      mainMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  // Update colors when profile changes
  useEffect(() => {
    const vis = getVisualProperties();

    if (mainOrbRef.current) {
      const material = mainOrbRef.current.material as THREE.MeshPhysicalMaterial;
      material.color = vis.primaryColor;
      material.emissive = vis.primaryColor.clone().multiplyScalar(0.4);
      material.sheenColor = vis.secondaryColor;
    }

    if (innerCoreRef.current) {
      const material = innerCoreRef.current.material as THREE.MeshBasicMaterial;
      material.color = vis.primaryColor.clone().multiplyScalar(2.0);
    }
  }, [activeProfile.threads, activeProfile.coreGlow]);

  // Animation loop - smooth, organic, mesmerizing
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !mainOrbRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mainOrb = mainOrbRef.current;
    const basePositions = basePositionsRef.current;
    
    const vis = getVisualProperties();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.01 * vis.speed;

      const time = timeRef.current;

      // State modifiers for different behaviors
      const stateModifier = {
        idle: { rotMod: 1, morphMod: 1, pulseMod: 1, breathMod: 1 },
        listening: { rotMod: 1.3, morphMod: 1.4, pulseMod: 1.5, breathMod: 1.2 },
        speaking: { rotMod: 1.8, morphMod: 1.6, pulseMod: 2.0, breathMod: 1.5 },
        thinking: { rotMod: 2.2, morphMod: 1.5, pulseMod: 1.6, breathMod: 1.3 },
        session: { rotMod: 1.2, morphMod: 1.3, pulseMod: 1.2, breathMod: 1.1 },
        breathing: { rotMod: 0.5, morphMod: 1.5, pulseMod: 0.5, breathMod: 2.0 },
      }[state];

      const { rotMod, morphMod, pulseMod, breathMod } = stateModifier;

      // === SMOOTH ROTATION - Elegant slow tumble ===
      mainOrb.rotation.y += 0.003 * rotMod;
      mainOrb.rotation.x += 0.0015 * rotMod;
      mainOrb.rotation.z = Math.sin(time * 0.2) * 0.05;

      // === BREATHING SCALE - Natural pulsation ===
      const breathe = Math.sin(time * vis.pulseRate * pulseMod) * 0.03 * breathMod;
      const breathe2 = Math.sin(time * vis.pulseRate * 1.7 * pulseMod) * 0.015;
      const breathe3 = Math.sin(time * vis.pulseRate * 2.5 * pulseMod) * 0.008;
      const audioBoost = audioLevel * vis.reactivity * 0.12;
      const targetScale = 1 + breathe + breathe2 + breathe3 + audioBoost;
      mainOrb.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      // === ORGANIC VERTEX MORPHING - Liquid mercury flow ===
      if (basePositions) {
        const positions = mainOrb.geometry.attributes.position;
        const morphIntensity = vis.organicFlow * 0.08 * morphMod;
        const octaves = Math.max(2, Math.min(4, Math.floor(vis.complexity)));

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
          
          // Multi-layer organic noise for flowing liquid effect
          const noise1 = fbm(x * 2 + time * 0.2, y * 2 + time * 0.15, z * 2 + time * 0.25, octaves);
          const noise2 = fbm(x * 4 - time * 0.1, y * 4 + time * 0.08, z * 4 - time * 0.12, 2) * 0.3;
          
          // Gentle wave patterns
          const wave = Math.sin(x * 3 + time * 1.5) * Math.cos(y * 2.5 + time) * 0.008;
          const wave2 = Math.sin(z * 4 + time * 2) * Math.sin(x * 3 - time * 1.2) * 0.005;
          
          const totalNoise = (noise1 - 0.5 + noise2) * morphIntensity + wave + wave2;
          const audioMorph = audioLevel * 0.03 * Math.sin(x * 8 + time * 4);
          const deform = totalNoise + audioMorph;
          
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

      // === MATERIAL ANIMATION - Iridescent color shifting ===
      const material = mainOrb.material as THREE.MeshPhysicalMaterial;
      
      // Pulsing emissive intensity
      const emissivePulse = 0.8 + Math.sin(time * 2) * 0.3 + audioLevel * 0.3;
      material.emissiveIntensity = emissivePulse;
      
      // Subtle hue shift for iridescence
      const baseHSL = { h: 0, s: 0, l: 0 };
      material.color.getHSL(baseHSL);
      const hueShift = Math.sin(time * 0.3) * 0.03;
      material.emissive.setHSL((baseHSL.h + hueShift + 1) % 1, 0.9, 0.35);
      
      // Animate clearcoat for living surface
      material.clearcoatRoughness = 0.03 + Math.sin(time * 1.5) * 0.02;
      
      // Animate sheen
      material.sheenRoughness = 0.15 + Math.sin(time * 0.8) * 0.1;

      // === INNER CORE ANIMATION ===
      if (innerCoreRef.current) {
        const core = innerCoreRef.current;
        const coreMat = core.material as THREE.MeshBasicMaterial;
        
        // Pulsing glow
        const corePulse = 0.5 + Math.sin(time * 3) * 0.2 + audioLevel * 0.15;
        coreMat.opacity = Math.min(0.8, corePulse);
        
        // Subtle scale pulse
        const coreScale = 1 + Math.sin(time * 2.5) * 0.1;
        core.scale.set(coreScale, coreScale, coreScale);
        
        // Counter-rotate for depth effect
        core.rotation.y -= 0.005 * rotMod;
        core.rotation.x += 0.003 * rotMod;
      }

      // === CAMERA MOVEMENT ===
      if (isTunnel) {
        camera.position.z = 2.5 + Math.sin(time * 0.4) * 0.4;
        mainOrb.rotation.z += 0.006;
      } else {
        // Subtle camera breathing
        camera.position.z = 2.8 + Math.sin(time * 0.15) * 0.05;
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

/**
 * MultiThreadOrb - Solid alien-style orb visualization
 * 
 * Renders a single solid orb with dynamic color and morphing effects
 * based on user's identity DNA profile
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

// Perlin-like noise for organic movement
function noise3D(x: number, y: number, z: number): number {
  const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142];
  const perm = [...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p, ...p];
  
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
  const glowMeshRef = useRef<THREE.Mesh | null>(null);
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

  // Get primary color from threads (blend them together for a unified look)
  const getPrimaryColor = (): THREE.Color => {
    const threads = activeProfile.threads;
    if (threads.length === 0) {
      return new THREE.Color(0x00ff88);
    }
    
    // Use first thread as primary, mix with second if available
    const primary = parseHslToThreeColor(threads[0].color);
    
    if (threads.length > 1) {
      const secondary = parseHslToThreeColor(threads[1].color);
      primary.lerp(secondary, 0.3);
    }
    
    return primary;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene with subtle fog for depth
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
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

    // Lighting for solid look
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(2, 2, 3);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0x8844ff, 0.5);
    backLight.position.set(-2, -1, -2);
    scene.add(backLight);

    const rimLight = new THREE.PointLight(0x00ffaa, 0.6, 10);
    rimLight.position.set(0, 3, 0);
    scene.add(rimLight);

    // Main solid orb - Icosahedron with higher detail for organic morphing
    const geometry = new THREE.IcosahedronGeometry(0.85, 4);
    const positions = geometry.attributes.position.array as Float32Array;
    basePositionsRef.current = positions.slice();

    // Create gradient-like material using MeshPhongMaterial for solid look
    const primaryColor = getPrimaryColor();
    const material = new THREE.MeshPhongMaterial({
      color: primaryColor,
      emissive: primaryColor.clone().multiplyScalar(0.15),
      specular: new THREE.Color(0xffffff),
      shininess: 100,
      flatShading: false, // Smooth surface
      side: THREE.FrontSide,
    });

    const mainOrb = new THREE.Mesh(geometry, material);
    scene.add(mainOrb);
    mainOrbRef.current = mainOrb;

    // Inner glow sphere (slightly smaller, emissive)
    if (showGlow) {
      const glowGeometry = new THREE.SphereGeometry(0.75, 32, 32);
      const coreColor = parseHslToThreeColor(activeProfile.coreGlow.color);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: coreColor,
        transparent: true,
        opacity: 0.3,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      scene.add(glowMesh);
      glowMeshRef.current = glowMesh;
    }

    onReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mainOrbRef.current) {
        mainOrbRef.current.geometry.dispose();
        (mainOrbRef.current.material as THREE.Material).dispose();
      }
      if (glowMeshRef.current) {
        glowMeshRef.current.geometry.dispose();
        (glowMeshRef.current.material as THREE.Material).dispose();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, activeProfile.shape.baseGeometry]);

  // Update colors when profile changes
  useEffect(() => {
    if (mainOrbRef.current) {
      const material = mainOrbRef.current.material as THREE.MeshPhongMaterial;
      const primaryColor = getPrimaryColor();
      material.color = primaryColor;
      material.emissive = primaryColor.clone().multiplyScalar(0.15);
    }

    if (glowMeshRef.current) {
      const glowMaterial = glowMeshRef.current.material as THREE.MeshBasicMaterial;
      glowMaterial.color = parseHslToThreeColor(activeProfile.coreGlow.color);
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
    const { motionProfile, shape } = activeProfile;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.008 * motionProfile.speed;

      const time = timeRef.current;

      // State-based modifiers
      const stateModifier = {
        idle: { rotMod: 1, morphMod: 1, pulseMod: 1 },
        listening: { rotMod: 1.5, morphMod: 1.2, pulseMod: 1.5 },
        speaking: { rotMod: 2, morphMod: 1.4, pulseMod: 2 },
        thinking: { rotMod: 2.5, morphMod: 1.3, pulseMod: 1.8 },
        session: { rotMod: 1.3, morphMod: 1.1, pulseMod: 1.2 },
        breathing: { rotMod: 0.7, morphMod: 1.2, pulseMod: 0.5 },
      }[state];

      const { rotMod, morphMod, pulseMod } = stateModifier;

      // Smooth rotation
      mainOrb.rotation.y += 0.003 * rotMod;
      mainOrb.rotation.x += 0.001 * rotMod;
      mainOrb.rotation.z += Math.sin(time * 0.5) * 0.0005;

      // Scale pulsation
      const scalePulse = 1 + Math.sin(time * 1.5 * pulseMod) * 0.05;
      const audioBoost = audioLevel * motionProfile.reactivity * 0.15;
      const targetScale = scalePulse + audioBoost;
      mainOrb.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      // Organic vertex morphing for alien feel
      if (basePositions) {
        const positions = mainOrb.geometry.attributes.position;
        const morphIntensity = (1 - shape.edgeSharpness) * 0.12 * morphMod;

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
          
          // Multi-frequency noise for organic surface
          const noiseVal = noise3D(
            x * 3 + time * 0.4,
            y * 3 + time * 0.3,
            z * 3 + time * 0.5
          );
          
          const noiseVal2 = noise3D(
            x * 1.5 + time * 0.2,
            y * 1.5 + time * 0.15,
            z * 1.5 + time * 0.25
          );
          
          const combinedNoise = noiseVal * 0.7 + noiseVal2 * 0.3;
          const deform = (combinedNoise - 0.5) * morphIntensity * (1 + audioLevel * 0.4);
          
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

      // Update material emissive based on state
      const material = mainOrb.material as THREE.MeshPhongMaterial;
      const emissivePulse = 0.1 + Math.sin(time * 2) * 0.05 + audioLevel * 0.1;
      const primaryColor = getPrimaryColor();
      material.emissive = primaryColor.clone().multiplyScalar(emissivePulse);

      // Glow animation
      if (glowMeshRef.current) {
        const glowPulse = 1 + Math.sin(time * activeProfile.coreGlow.pulseRate * 2) * 0.1 + audioLevel * 0.15;
        glowMeshRef.current.scale.set(glowPulse, glowPulse, glowPulse);
        
        const glowMaterial = glowMeshRef.current.material as THREE.MeshBasicMaterial;
        glowMaterial.opacity = 0.2 + Math.sin(time * 1.5) * 0.08 + audioLevel * 0.05;
      }

      // Tunnel mode
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
  }, [state, audioLevel, isTunnel, activeProfile.motionProfile, activeProfile.shape, activeProfile.coreGlow]);

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

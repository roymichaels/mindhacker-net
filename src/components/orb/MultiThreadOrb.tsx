/**
 * MultiThreadOrb - DNA-based multi-threaded orb visualization
 * 
 * Renders multiple wireframe layers, each representing a unique
 * aspect of the user's identity (traits, hobbies, patterns, etc.)
 */

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbRef, OrbState } from './types';
import type { MultiThreadOrbProfile, OrbDNAThread, BaseGeometry } from '@/lib/orbDNAThreads';
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

// Create geometry based on type
function createGeometry(type: BaseGeometry, radius: number, detail: number): THREE.BufferGeometry {
  switch (type) {
    case 'sphere':
      return new THREE.SphereGeometry(radius, 32, 32);
    case 'octahedron':
      return new THREE.OctahedronGeometry(radius, detail);
    case 'dodecahedron':
      return new THREE.DodecahedronGeometry(radius, detail);
    case 'torus':
      return new THREE.TorusGeometry(radius * 0.8, radius * 0.3, 16, 32);
    case 'icosahedron':
    default:
      return new THREE.IcosahedronGeometry(radius, detail);
  }
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

interface ThreadMesh {
  mesh: THREE.Mesh;
  thread: OrbDNAThread;
  basePositions: Float32Array;
  rotationAxis: THREE.Vector3;
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
  const threadMeshesRef = useRef<ThreadMesh[]>([]);
  const coreRef = useRef<THREE.Mesh | null>(null);
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

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene
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

    // Create thread meshes
    const newThreadMeshes: ThreadMesh[] = [];
    const { threads, shape } = activeProfile;

    threads.forEach((thread, index) => {
      // Calculate radius based on layer (inner layers smaller)
      const baseRadius = 0.85 - thread.layer * 0.12;
      const detail = Math.max(3, shape.complexity - thread.layer);
      
      const geometry = createGeometry(shape.baseGeometry, baseRadius, detail);
      const positions = geometry.attributes.position.array as Float32Array;
      
      const material = new THREE.MeshBasicMaterial({
        color: parseHslToThreeColor(thread.color),
        wireframe: true,
        transparent: true,
        opacity: 0.25 + thread.intensity * 0.45,
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      // Set initial rotation based on thread index for variety
      mesh.rotation.x = index * 0.3;
      mesh.rotation.y = index * 0.5;
      mesh.rotation.z = index * 0.2;
      
      scene.add(mesh);
      
      const axis = new THREE.Vector3(
        thread.rotationAxis.x,
        thread.rotationAxis.y,
        thread.rotationAxis.z
      ).normalize();
      
      newThreadMeshes.push({
        mesh,
        thread,
        basePositions: positions.slice(),
        rotationAxis: axis,
      });
    });

    threadMeshesRef.current = newThreadMeshes;

    // Core glow
    if (showGlow) {
      const coreGeometry = new THREE.SphereGeometry(0.25, 16, 16);
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: parseHslToThreeColor(activeProfile.coreGlow.color),
        transparent: true,
        opacity: activeProfile.coreGlow.intensity,
      });
      const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
      scene.add(coreMesh);
      coreRef.current = coreMesh;
    }

    onReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      newThreadMeshes.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      if (coreRef.current) {
        coreRef.current.geometry.dispose();
        (coreRef.current.material as THREE.Material).dispose();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, activeProfile.threads.length, activeProfile.shape.baseGeometry]);

  // Update colors when profile changes
  useEffect(() => {
    threadMeshesRef.current.forEach(({ mesh, thread }) => {
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.color = parseHslToThreeColor(thread.color);
      material.opacity = 0.25 + thread.intensity * 0.45;
    });

    if (coreRef.current) {
      const coreMaterial = coreRef.current.material as THREE.MeshBasicMaterial;
      coreMaterial.color = parseHslToThreeColor(activeProfile.coreGlow.color);
      coreMaterial.opacity = activeProfile.coreGlow.intensity;
    }
  }, [activeProfile.threads, activeProfile.coreGlow]);

  // Animation loop
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
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

      // Animate each thread
      threadMeshesRef.current.forEach(({ mesh, thread, basePositions, rotationAxis }) => {
        // Animation-specific behavior
        const animSpeed = thread.animation === 'pulse' ? 1.5 :
                          thread.animation === 'wave' ? 1.0 :
                          thread.animation === 'spiral' ? 1.8 :
                          thread.animation === 'orbit' ? 1.2 :
                          0.6; // breathe

        // Rotation around unique axis
        const rotSpeed = thread.rotationSpeed * rotMod * animSpeed;
        mesh.rotateOnAxis(rotationAxis, rotSpeed);

        // Additional subtle wobble
        mesh.rotation.x += Math.sin(time * 0.5 + thread.layer) * 0.001;
        mesh.rotation.z += Math.cos(time * 0.3 + thread.layer * 0.5) * 0.0005;

        // Scale pulsation based on animation type
        let scalePulse = 1;
        if (thread.animation === 'pulse') {
          scalePulse = 1 + Math.sin(time * 2 * pulseMod) * 0.08;
        } else if (thread.animation === 'breathe') {
          scalePulse = 1 + Math.sin(time * 0.8 * pulseMod) * 0.12;
        } else if (thread.animation === 'wave') {
          scalePulse = 1 + Math.sin(time * 1.5 * pulseMod) * 0.05;
        } else if (thread.animation === 'spiral') {
          scalePulse = 1 + Math.sin(time * 2.5 * pulseMod) * 0.06;
        } else {
          scalePulse = 1 + Math.sin(time * pulseMod) * 0.04;
        }

        const audioBoost = audioLevel * motionProfile.reactivity * 0.25;
        const targetScale = scalePulse + audioBoost;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // Vertex morphing for organic look
        const positions = mesh.geometry.attributes.position;
        const morphIntensity = (1 - shape.edgeSharpness) * 0.15 * morphMod;

        for (let i = 0; i < positions.count; i++) {
          const idx = i * 3;
          const x = basePositions[idx];
          const y = basePositions[idx + 1];
          const z = basePositions[idx + 2];
          
          const dist = Math.sqrt(x * x + y * y + z * z);
          // Guard against division by zero / invalid geometry values (prevents NaN boundingSphere)
          if (!Number.isFinite(dist) || dist === 0) {
            positions.setXYZ(i, x, y, z);
            continue;
          }
          
          // Noise-based deformation
          const noiseVal = noise3D(
            x * 2 + time * 0.5 + thread.layer,
            y * 2 + time * 0.3,
            z * 2 + time * 0.7
          );
          
          const deform = (noiseVal - 0.5) * morphIntensity * (1 + audioLevel * 0.3);
          
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

        // Dynamic opacity
        const material = mesh.material as THREE.MeshBasicMaterial;
        const baseOpacity = 0.25 + thread.intensity * 0.45;
        const opacityPulse = baseOpacity + Math.sin(time * 1.2 + thread.layer * 0.5) * 0.08;
        material.opacity = Math.min(opacityPulse + audioLevel * 0.1, 0.9);
      });

      // Core animation
      if (coreRef.current) {
        const corePulse = 1 + Math.sin(time * activeProfile.coreGlow.pulseRate * 2) * 0.15 + audioLevel * 0.2;
        coreRef.current.scale.set(corePulse, corePulse, corePulse);
        
        const coreMaterial = coreRef.current.material as THREE.MeshBasicMaterial;
        coreMaterial.opacity = activeProfile.coreGlow.intensity + Math.sin(time * 1.5) * 0.1;
      }

      // Tunnel mode
      if (isTunnel) {
        camera.position.z = 2.5 + Math.sin(time * 0.5) * 0.4;
        threadMeshesRef.current.forEach(({ mesh }) => {
          mesh.rotation.z += 0.01;
        });
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

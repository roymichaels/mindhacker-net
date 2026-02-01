/**
 * MultiThreadOrb - Wireframe Cyber Orb
 * 
 * A retro-cyber wireframe 3D orb with:
 * - Line-based rendering (no solid surfaces)
 * - Organic morphing deformation
 * - Inner geometric structures
 * - DNA-driven color properties
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

// Parse HSL color string to THREE.Color with brightness adjustment
function parseHslToThreeColor(colorStr: string): THREE.Color {
  let h = 0, s = 0, l = 0;
  let matched = false;
  
  // Pattern 1: Space-separated (e.g., "292 95% 73%")
  const hslSpaceMatch = colorStr.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (hslSpaceMatch) {
    h = parseInt(hslSpaceMatch[1]) / 360;
    s = parseInt(hslSpaceMatch[2]) / 100;
    l = parseInt(hslSpaceMatch[3]) / 100;
    matched = true;
  }
  
  // Pattern 2: CSS hsl function with commas (e.g., "hsl(292, 95%, 73%)")
  if (!matched) {
    const hslFuncMatch = colorStr.match(/hsl\((\d+),?\s*(\d+)%,?\s*(\d+)%\)/);
    if (hslFuncMatch) {
      h = parseInt(hslFuncMatch[1]) / 360;
      s = parseInt(hslFuncMatch[2]) / 100;
      l = parseInt(hslFuncMatch[3]) / 100;
      matched = true;
    }
  }
  
  // Pattern 3: CSS hsl function with spaces (e.g., "hsl(292 95% 73%)")
  if (!matched) {
    const hslSpaceFuncMatch = colorStr.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
    if (hslSpaceFuncMatch) {
      h = parseInt(hslSpaceFuncMatch[1]) / 360;
      s = parseInt(hslSpaceFuncMatch[2]) / 100;
      l = parseInt(hslSpaceFuncMatch[3]) / 100;
      matched = true;
    }
  }
  
  if (matched) {
    const color = new THREE.Color();
    
    // CRITICAL: Reduce lightness if too bright (prevents white orb)
    // Map L > 60% down to 40-60% range for richer colors
    let adjustedL = l;
    if (l > 0.6) {
      adjustedL = 0.4 + (l - 0.6) * 0.5;
    }
    
    color.setHSL(h, s, adjustedL);
    return color;
  }
  
  return new THREE.Color(0x8844ff);
}

// Fractal Brownian Motion for organic morphing
function fbm(x: number, y: number, z: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  
  for (let i = 0; i < octaves; i++) {
    const noise = Math.sin(x * frequency + i) * Math.cos(y * frequency + i * 0.7) * Math.sin(z * frequency + i * 1.3);
    value += amplitude * noise;
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
  const mainWireframeRef = useRef<THREE.LineSegments | null>(null);
  const innerStructuresRef = useRef<THREE.LineSegments[]>([]);
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
    const motion = activeProfile.motionProfile;
    
    const primaryColor = threads[0] ? parseHslToThreeColor(threads[0].color) : new THREE.Color(0x8844ff);
    const secondaryColor = threads[1] ? parseHslToThreeColor(threads[1].color) : new THREE.Color(0x00ffaa);
    
    return {
      primaryColor,
      secondaryColor,
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

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 3.5);
    camera.lookAt(0, 0, 0);
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

    // Minimal lighting for wireframe
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // ===== WIREFRAME LINE MATERIAL =====
    const lineMaterial = new THREE.LineBasicMaterial({
      color: vis.primaryColor,
      transparent: true,
      opacity: 0.75,
    });

    // ===== MAIN WIREFRAME SPHERE =====
    const sphereGeo = new THREE.IcosahedronGeometry(0.85, 4);
    const sphereEdges = new THREE.WireframeGeometry(sphereGeo);
    const mainWireframe = new THREE.LineSegments(sphereEdges, lineMaterial.clone());
    scene.add(mainWireframe);
    mainWireframeRef.current = mainWireframe;

    // Store base positions for morphing FROM THE WIREFRAME GEOMETRY (not sphereGeo)
    // The WireframeGeometry has different vertex layout
    basePositionsRef.current = mainWireframe.geometry.attributes.position.array.slice() as Float32Array;

    // ===== INNER GEOMETRIC STRUCTURES =====
    const innerStructures: THREE.LineSegments[] = [];

    // Icosahedron
    const icosaGeo = new THREE.IcosahedronGeometry(0.4, 1);
    const icosaEdges = new THREE.WireframeGeometry(icosaGeo);
    const icosaWireframe = new THREE.LineSegments(icosaEdges, lineMaterial.clone());
    scene.add(icosaWireframe);
    innerStructures.push(icosaWireframe);

    // Octahedron
    const octaGeo = new THREE.OctahedronGeometry(0.25, 0);
    const octaEdges = new THREE.WireframeGeometry(octaGeo);
    const octaWireframe = new THREE.LineSegments(octaEdges, lineMaterial.clone());
    scene.add(octaWireframe);
    innerStructures.push(octaWireframe);

    innerStructuresRef.current = innerStructures;

    // Cleanup geometries
    sphereGeo.dispose();
    icosaGeo.dispose();
    octaGeo.dispose();

    onReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      mainWireframe.geometry.dispose();
      (mainWireframe.material as THREE.Material).dispose();
      innerStructures.forEach(s => {
        s.geometry.dispose();
        (s.material as THREE.Material).dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  // Update colors when profile changes
  useEffect(() => {
    const vis = getVisualProperties();

    if (mainWireframeRef.current) {
      (mainWireframeRef.current.material as THREE.LineBasicMaterial).color = vis.primaryColor;
    }

    innerStructuresRef.current.forEach(structure => {
      (structure.material as THREE.LineBasicMaterial).color = vis.primaryColor;
    });
  }, [activeProfile.threads]);

  // Animation loop
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !mainWireframeRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mainWireframe = mainWireframeRef.current;
    const innerStructures = innerStructuresRef.current;
    const basePositions = basePositionsRef.current;
    
    const vis = getVisualProperties();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.01 * vis.speed;

      const time = timeRef.current;

      // State modifiers
      const stateModifier = {
        idle: { rotMod: 1, morphMod: 1, pulseMod: 1 },
        listening: { rotMod: 1.5, morphMod: 1.5, pulseMod: 1.5 },
        speaking: { rotMod: 2.0, morphMod: 2.0, pulseMod: 2.0 },
        thinking: { rotMod: 2.5, morphMod: 1.8, pulseMod: 1.8 },
        session: { rotMod: 1.3, morphMod: 1.4, pulseMod: 1.3 },
        breathing: { rotMod: 0.5, morphMod: 1.5, pulseMod: 0.6 },
      }[state];

      const { rotMod, morphMod, pulseMod } = stateModifier;

      // Rotate main wireframe
      mainWireframe.rotation.y += 0.003 * rotMod;
      mainWireframe.rotation.x += 0.001 * rotMod;

      // Morph main wireframe vertices
      if (basePositions) {
        const positions = mainWireframe.geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
          const idx = i * 3;
          const baseX = basePositions[idx];
          const baseY = basePositions[idx + 1];
          const baseZ = basePositions[idx + 2];
          
          const dist = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
          if (dist === 0) continue;
          
          const nx = baseX / dist;
          const ny = baseY / dist;
          const nz = baseZ / dist;
          
          // Organic deformation
          const noiseVal = fbm(nx * 2 + time * 0.5, ny * 2 + time * 0.3, nz * 2 + time * 0.7, 3);
          const waveDistort = Math.sin(ny * 4 + time * 2) * Math.cos(nx * 3 + time * 1.5) * 0.06;
          const pulse = Math.sin(time * pulseMod + dist * 3) * 0.03;
          const audioBoost = audioLevel * 0.15;
          
          const deform = (noiseVal * 0.12 * morphMod + waveDistort + pulse + audioBoost) * 0.8;
          
          positions.setXYZ(
            i,
            baseX + nx * deform,
            baseY + ny * deform,
            baseZ + nz * deform
          );
        }
        
        positions.needsUpdate = true;
      }

      // Animate inner structures
      if (innerStructures[0]) {
        innerStructures[0].rotation.y += 0.005 * rotMod;
        innerStructures[0].rotation.x -= 0.003 * rotMod;
        const scale = 1 + Math.sin(time * 1.5) * 0.08 + audioLevel * 0.1;
        innerStructures[0].scale.setScalar(scale);
      }
      
      if (innerStructures[1]) {
        innerStructures[1].rotation.y -= 0.006 * rotMod;
        innerStructures[1].rotation.z += 0.004 * rotMod;
        const scale = 1 + Math.sin(time * 2 + 1) * 0.1 + audioLevel * 0.1;
        innerStructures[1].scale.setScalar(scale);
      }

      // Camera
      if (isTunnel) {
        camera.position.z = 3.0 + Math.sin(time * 0.5) * 0.3;
        mainWireframe.rotation.z += 0.01;
      } else {
        camera.position.z = 3.5;
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
        minWidth: size,
        minHeight: size,
        background: 'transparent',
        overflow: 'visible',
      }}
    />
  );
});

export default MultiThreadOrb;

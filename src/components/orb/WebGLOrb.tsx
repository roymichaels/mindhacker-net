import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import type { OrbRef, OrbProps, OrbState, OrbProfile } from './types';
import { getEgoStateColors } from '@/lib/egoStates';
import { ParticleSystem } from './OrbParticles';

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

// Parse HSL color string to THREE.Color
// Supports formats: "hsl(200, 80%, 50%)", "200 80% 50%", "#ff0000", "red"
function parseHslToThreeColor(colorStr: string): THREE.Color {
  // Check for "h s% l%" format (without hsl wrapper)
  const hslSpaceMatch = colorStr.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (hslSpaceMatch) {
    const h = parseInt(hslSpaceMatch[1]) / 360;
    const s = parseInt(hslSpaceMatch[2]) / 100;
    const l = parseInt(hslSpaceMatch[3]) / 100;
    const color = new THREE.Color();
    color.setHSL(h, s, l);
    return color;
  }
  
  // Check for "hsl(h, s%, l%)" format
  const hslFuncMatch = colorStr.match(/hsl\((\d+),?\s*(\d+)%,?\s*(\d+)%\)/);
  if (hslFuncMatch) {
    const h = parseInt(hslFuncMatch[1]) / 360;
    const s = parseInt(hslFuncMatch[2]) / 100;
    const l = parseInt(hslFuncMatch[3]) / 100;
    const color = new THREE.Color();
    color.setHSL(h, s, l);
    return color;
  }
  
  // Fallback to THREE.Color parser (handles hex, named colors)
  return new THREE.Color(colorStr);
}

// Layer configuration for multi-layer orb
interface LayerConfig {
  radius: number;
  detail: number;
  opacity: number;
  color: string;
  rotationSpeed: number;
  morphOffset: number;
}

export const WebGLOrb = forwardRef<OrbRef, OrbProps>(function WebGLOrb(
  { 
    size = 300, 
    state: externalState, 
    audioLevel: externalAudioLevel, 
    tunnelMode, 
    egoState = 'guardian', 
    className, 
    showGlow = true, 
    onReady,
    profile,
    themeColors
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const layersRef = useRef<THREE.Mesh[]>([]);
  const basePositionsRef = useRef<Map<THREE.Mesh, Float32Array>>(new Map());
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const morphPhaseRef = useRef(0);

  const [internalState, setInternalState] = useState<OrbState>('idle');
  const [internalAudioLevel, setInternalAudioLevel] = useState(0);
  const [internalTunnelMode, setInternalTunnelMode] = useState(false);

  const state = externalState ?? internalState;
  const audioLevel = externalAudioLevel ?? internalAudioLevel;
  const isTunnel = tunnelMode ?? internalTunnelMode;

  // Get colors from profile, theme colors, or ego state (in priority order)
  const egoStateColors = getEgoStateColors(egoState);
  const colors = profile ? {
    primary: profile.primaryColor,
    secondary: profile.secondaryColors[0] || profile.primaryColor,
    accent: profile.accentColor,
    glow: profile.accentColor,
  } : themeColors ? {
    primary: themeColors.primary,
    secondary: themeColors.secondary,
    accent: themeColors.accent,
    glow: themeColors.glow,
  } : egoStateColors;

  // Get profile-based parameters or defaults - enhanced defaults for beautiful orb
  const layerCount = profile?.layerCount ?? 3; // More layers by default
  const geometryDetail = profile?.geometryDetail ?? 5; // Higher detail
  const morphIntensity = profile?.morphIntensity ?? 0.18;
  const morphSpeed = profile?.morphSpeed ?? 1.0;
  const fractalOctaves = profile?.fractalOctaves ?? 4;
  const coreIntensity = profile?.coreIntensity ?? 0.6;
  const coreSize = profile?.coreSize ?? 0.35;
  const particleEnabled = profile?.particleEnabled ?? true; // Enable particles by default
  const particleCount = profile?.particleCount ?? 30;
  const particleColor = profile?.particleColor ?? colors.glow;

  useImperativeHandle(ref, () => ({
    setSpeaking: (speaking: boolean) => setInternalState(speaking ? 'speaking' : 'idle'),
    setListening: (listening: boolean) => setInternalState(listening ? 'listening' : 'idle'),
    setThinking: (thinking: boolean) => setInternalState(thinking ? 'thinking' : 'idle'),
    updateState: setInternalState,
    setAudioLevel: setInternalAudioLevel,
    setTunnelMode: setInternalTunnelMode,
  }), []);

  // Generate layer configurations based on profile - enhanced for 3D depth
  const getLayerConfigs = (): LayerConfig[] => {
    const configs: LayerConfig[] = [];
    const secondaryColors = profile?.secondaryColors || [colors.secondary, colors.accent];
    
    for (let i = 0; i < layerCount; i++) {
      const t = i / Math.max(layerCount - 1, 1);
      configs.push({
        radius: 0.72 - i * 0.12, // Slightly larger base, tighter spacing
        detail: Math.max(geometryDetail - i, 3),
        opacity: 0.75 - i * 0.12, // Higher base opacity
        color: i === 0 ? colors.primary : (secondaryColors[i - 1] || colors.secondary),
        rotationSpeed: 0.003 * (1 + i * 0.4) * (i % 2 === 0 ? 1 : -1), // Faster rotation
        morphOffset: i * 0.6,
      });
    }
    
    return configs;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera - adjusted for better full-sphere visibility
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 3.5;
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

    // Create outer glow sphere first (behind everything)
    const outerGlowGeometry = new THREE.SphereGeometry(1.1, 32, 32);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: parseHslToThreeColor(colors.primary),
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    scene.add(outerGlow);

    // Create ambient atmosphere layer
    const atmosphereGeometry = new THREE.SphereGeometry(0.95, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: parseHslToThreeColor(colors.accent),
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Create layers
    const layerConfigs = getLayerConfigs();
    const newLayers: THREE.Mesh[] = [];
    const newBasePositions = new Map<THREE.Mesh, Float32Array>();

    layerConfigs.forEach((config, index) => {
      const geometry = new THREE.IcosahedronGeometry(config.radius, config.detail);
      const positions = geometry.attributes.position.array as Float32Array;
      
      const material = new THREE.MeshBasicMaterial({
        color: parseHslToThreeColor(config.color),
        wireframe: true,
        transparent: true,
        opacity: config.opacity,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      newLayers.push(mesh);
      newBasePositions.set(mesh, positions.slice());
    });

    layersRef.current = newLayers;
    basePositionsRef.current = newBasePositions;

    // Inner core glow sphere - brighter and more defined
    if (showGlow) {
      const glowGeometry = new THREE.SphereGeometry(coreSize * 1.2, 24, 24);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: parseHslToThreeColor(colors.glow || colors.accent),
        transparent: true,
        opacity: coreIntensity * 0.7,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      scene.add(glowMesh);
      coreRef.current = glowMesh;

      // Add a secondary inner core for depth
      const innerCoreGeometry = new THREE.SphereGeometry(coreSize * 0.6, 16, 16);
      const innerCoreMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffffff),
        transparent: true,
        opacity: 0.4,
      });
      const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial);
      scene.add(innerCore);
    }

    // Enhanced particle system
    if (particleEnabled && particleCount > 0) {
      const ps = new ParticleSystem(particleCount, particleColor, 0.85, 1.5);
      scene.add(ps.mesh);
      particleSystemRef.current = ps;
    }

    onReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      newLayers.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      if (coreRef.current) {
        coreRef.current.geometry.dispose();
        (coreRef.current.material as THREE.Material).dispose();
      }
      if (particleSystemRef.current) {
        particleSystemRef.current.dispose();
      }
      // Dispose glow meshes
      outerGlow.geometry.dispose();
      outerGlowMaterial.dispose();
      atmosphere.geometry.dispose();
      atmosphereMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, layerCount, geometryDetail, coreSize, particleEnabled, particleCount]);

  // Update colors when profile or egoState changes
  useEffect(() => {
    const layers = layersRef.current;
    const layerConfigs = getLayerConfigs();
    
    layers.forEach((mesh, index) => {
      if (index < layerConfigs.length) {
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.color = parseHslToThreeColor(layerConfigs[index].color);
        material.opacity = layerConfigs[index].opacity;
      }
    });

    if (coreRef.current) {
      const coreMaterial = coreRef.current.material as THREE.MeshBasicMaterial;
      coreMaterial.color = parseHslToThreeColor(colors.glow || colors.accent);
      coreMaterial.opacity = coreIntensity;
    }

    if (particleSystemRef.current) {
      particleSystemRef.current.setColor(particleColor);
    }
  }, [colors.primary, colors.secondary, colors.glow, colors.accent, coreIntensity, particleColor]);

  // Animation loop with organic alien pulsation
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const layers = layersRef.current;
    const layerConfigs = getLayerConfigs();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.008 * morphSpeed;
      morphPhaseRef.current += 0.003 * morphSpeed;

      const time = timeRef.current;
      const morphPhase = morphPhaseRef.current;

      // State-based animation modifiers
      const stateModifier = {
        idle: { rotMod: 1, morphMod: 1, pulseMod: 1 },
        listening: { rotMod: 2, morphMod: 1.2, pulseMod: 1.5 },
        speaking: { rotMod: 3, morphMod: 1.5, pulseMod: 2 },
        thinking: { rotMod: 4, morphMod: 1.3, pulseMod: 1.8 },
        session: { rotMod: 1.5, morphMod: 1.1, pulseMod: 1.2 },
        breathing: { rotMod: 1, morphMod: 1.3, pulseMod: 0.6 },
      }[state];

      const { rotMod, morphMod, pulseMod } = stateModifier;

      // Animate each layer
      layers.forEach((mesh, index) => {
        const config = layerConfigs[index];
        if (!config) return;

        // Organic rotation with wobble
        const wobble = Math.sin(time * 0.7 + index) * 0.001;
        mesh.rotation.x += config.rotationSpeed * rotMod + wobble;
        mesh.rotation.y += config.rotationSpeed * 1.3 * rotMod + Math.cos(time * 0.5) * 0.001;
        mesh.rotation.z += Math.sin(time * 0.3 + index * 0.5) * 0.0005;

        // Organic pulsating scale
        const basePulse = Math.sin(time * pulseMod + index * 0.5) * 0.08;
        const secondaryPulse = Math.sin(time * pulseMod * 2.3 + index) * 0.03;
        const tertiaryPulse = Math.sin(time * pulseMod * 0.7) * 0.05;
        const audioBoost = audioLevel * 0.3;
        const breathEffect = state === 'breathing' ? Math.sin(time * 0.5) * 0.1 : 0;
        
        const targetScale = 1 + basePulse + secondaryPulse + tertiaryPulse + audioBoost + breathEffect;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

        // Vertex morphing with fractal noise
        const positions = mesh.geometry.attributes.position;
        const basePositions = basePositionsRef.current.get(mesh);
        
        if (basePositions) {
          for (let i = 0; i < positions.count; i++) {
            const idx = i * 3;
            const x = basePositions[idx];
            const y = basePositions[idx + 1];
            const z = basePositions[idx + 2];
            
            const dist = Math.sqrt(x * x + y * y + z * z);
            
            // Multi-layer fractal deformation with layer offset
            const fractalNoise = fbm(
              x * 2 + morphPhase + config.morphOffset,
              y * 2 + morphPhase * 0.7 + config.morphOffset,
              z * 2 + morphPhase * 1.3,
              fractalOctaves
            );
            
            // Traveling wave across surface
            const wavePhase = Math.sin(x * 3 + y * 2 + z * 4 + time * 2) * 0.03;
            
            // Radial pulse from center
            const radialPulse = Math.sin(dist * 8 - time * 3) * 0.02;
            
            // Combine all deformations
            const adjustedMorphIntensity = morphIntensity * morphMod;
            const totalDeform = (fractalNoise * adjustedMorphIntensity + wavePhase + radialPulse) * (1 + audioLevel * 0.5);
            
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

        // Dynamic opacity based on state
        const material = mesh.material as THREE.MeshBasicMaterial;
        const opacityPulse = (layerConfigs[index]?.opacity || 0.6) + Math.sin(time * 1.5 + index) * 0.1 + audioLevel * 0.15;
        material.opacity = Math.min(opacityPulse, 0.9);
      });

      // Animate core
      if (coreRef.current) {
        const corePulse = 1 + Math.sin(time * 2) * 0.1 + audioLevel * 0.2;
        coreRef.current.scale.set(corePulse, corePulse, corePulse);
        
        const coreMaterial = coreRef.current.material as THREE.MeshBasicMaterial;
        coreMaterial.opacity = coreIntensity + Math.sin(time * 1.5) * 0.1;
      }

      // Update particles
      if (particleSystemRef.current) {
        particleSystemRef.current.update(time, audioLevel);
      }

      // Tunnel mode - camera moves forward with rotation
      if (isTunnel) {
        camera.position.z = 2.5 + Math.sin(time * 0.5) * 0.4;
        layers.forEach(mesh => {
          mesh.rotation.z += 0.015;
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
  }, [state, audioLevel, isTunnel, morphIntensity, morphSpeed, fractalOctaves, coreIntensity]);

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

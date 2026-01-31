import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbRef, OrbProps, OrbState, OrbProfile } from './types';
import { getEgoStateColors } from '@/lib/egoStates';
import { ParticleSystem } from './OrbParticles';
import { 
  COLOR_PALETTES, 
  MORPHOLOGY_PROFILES,
  getMorphology,
  hslToRgb, 
  GRADIENT_VERTEX_SHADER, 
  GRADIENT_FRAGMENT_SHADER,
  type ColorPalette,
  type MorphologyProfile 
} from '@/lib/orbVisualSystem';

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
function parseHslToThreeColor(colorStr: string): THREE.Color {
  const hslSpaceMatch = colorStr.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (hslSpaceMatch) {
    const h = parseInt(hslSpaceMatch[1]) / 360;
    const s = parseInt(hslSpaceMatch[2]) / 100;
    const l = parseInt(hslSpaceMatch[3]) / 100;
    const color = new THREE.Color();
    color.setHSL(h, s, l);
    return color;
  }
  
  const hslFuncMatch = colorStr.match(/hsl\((\d+),?\s*(\d+)%,?\s*(\d+)%\)/);
  if (hslFuncMatch) {
    const h = parseInt(hslFuncMatch[1]) / 360;
    const s = parseInt(hslFuncMatch[2]) / 100;
    const l = parseInt(hslFuncMatch[3]) / 100;
    const color = new THREE.Color();
    color.setHSL(h, s, l);
    return color;
  }
  
  return new THREE.Color(colorStr);
}

// Layer configuration for multi-layer orb
interface LayerConfig {
  radius: number;
  detail: number;
  opacity: number;
  colorIndex: number; // 0=primary, 1=secondary, 2=accent
  rotationSpeed: number;
  morphOffset: number;
  useShader: boolean;
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
  const coreLayersRef = useRef<THREE.Mesh[]>([]);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const morphPhaseRef = useRef(0);
  const shaderUniformsRef = useRef<{ 
    colorA: { value: THREE.Vector3 }; 
    colorB: { value: THREE.Vector3 }; 
    colorC: { value: THREE.Vector3 }; 
    time: { value: number }; 
    intensity: { value: number }; 
  } | null>(null);

  const [internalState, setInternalState] = useState<OrbState>('idle');
  const [internalAudioLevel, setInternalAudioLevel] = useState(0);
  const [internalTunnelMode, setInternalTunnelMode] = useState(false);

  const state = externalState ?? internalState;
  const audioLevel = externalAudioLevel ?? internalAudioLevel;
  const isTunnel = tunnelMode ?? internalTunnelMode;

  // Determine the active color palette
  const activePalette = useMemo((): ColorPalette => {
    // Priority: profile colors > theme colors > default palette
    if (profile?.primaryColor) {
      // Try to find matching palette or create custom one
      const paletteValues = Object.values(COLOR_PALETTES);
      const matchingPalette = paletteValues.find(p => p.primary === profile.primaryColor);
      if (matchingPalette) return matchingPalette;
      
      // Create custom palette from profile
      return {
        id: 'custom',
        name: 'Custom',
        primary: profile.primaryColor,
        secondary: profile.secondaryColors?.[0] || profile.primaryColor,
        accent: profile.accentColor || profile.primaryColor,
        glow: profile.accentColor || profile.primaryColor,
        gradient: [profile.primaryColor, profile.secondaryColors?.[0] || profile.primaryColor, profile.accentColor || profile.primaryColor],
      };
    }
    
    if (themeColors) {
      return {
        id: 'theme',
        name: 'Theme',
        primary: themeColors.primary.replace('hsl(', '').replace(')', '').replace(/,/g, ' ').replace(/%/g, '%'),
        secondary: themeColors.secondary.replace('hsl(', '').replace(')', '').replace(/,/g, ' ').replace(/%/g, '%'),
        accent: themeColors.accent.replace('hsl(', '').replace(')', '').replace(/,/g, ' ').replace(/%/g, '%'),
        glow: themeColors.glow.replace('hsl(', '').replace(')', '').replace(/,/g, ' ').replace(/%/g, '%'),
        gradient: [themeColors.primary, themeColors.secondary, themeColors.accent],
      };
    }
    
    // Default: explorer palette
    return COLOR_PALETTES.explorer;
  }, [profile, themeColors]);

  // Get morphology profile based on palette
  const activeMorphology = useMemo((): MorphologyProfile => {
    return getMorphology(activePalette.id);
  }, [activePalette.id]);

  // Get profile-based parameters or defaults - ENHANCED with more particles
  const layerCount = profile?.layerCount ?? 3;
  const geometryDetail = profile?.geometryDetail ?? 5;
  const morphIntensity = profile?.morphIntensity ?? 0.18;
  const morphSpeed = profile?.morphSpeed ?? 1.0;
  const fractalOctaves = profile?.fractalOctaves ?? 4;
  const coreIntensity = profile?.coreIntensity ?? 0.7;
  const coreSize = profile?.coreSize ?? 0.35;
  const particleEnabled = true; // Always enable particles
  const particleCount = Math.max(50, profile?.particleCount ?? 50); // Minimum 50 particles

  useImperativeHandle(ref, () => ({
    setSpeaking: (speaking: boolean) => setInternalState(speaking ? 'speaking' : 'idle'),
    setListening: (listening: boolean) => setInternalState(listening ? 'listening' : 'idle'),
    setThinking: (thinking: boolean) => setInternalState(thinking ? 'thinking' : 'idle'),
    updateState: setInternalState,
    setAudioLevel: setInternalAudioLevel,
    setTunnelMode: setInternalTunnelMode,
  }), []);

  // Generate layer configurations - SEPARATED colors, no blending!
  const getLayerConfigs = (): LayerConfig[] => {
    const configs: LayerConfig[] = [];
    
    for (let i = 0; i < layerCount; i++) {
      configs.push({
        radius: 0.75 - i * 0.1,
        detail: Math.max(geometryDetail - i, 3),
        opacity: 0.85 - i * 0.15,
        colorIndex: i % 3, // Cycle through primary(0), secondary(1), accent(2)
        rotationSpeed: 0.003 * (1 + i * 0.5) * (i % 2 === 0 ? 1 : -1),
        morphOffset: i * 0.6,
        useShader: i === 0, // Only first layer uses gradient shader
      });
    }
    
    return configs;
  };

  // Get color from palette by index
  const getPaletteColor = (index: number): string => {
    switch (index) {
      case 0: return activePalette.primary;
      case 1: return activePalette.secondary;
      case 2: return activePalette.accent;
      default: return activePalette.primary;
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 3.5;
    cameraRef.current = camera;

    // Renderer with tone mapping for better glow
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    (renderer as any).physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3; // Boosted exposure
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ===== MINIMAL LIGHTING FOR WIREFRAME =====
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // Get wireframe color from palette
    const wireColor = parseHslToThreeColor(activePalette.primary);
    
    // ===== WIREFRAME LINE MATERIAL =====
    const lineMaterial = new THREE.LineBasicMaterial({
      color: wireColor,
      transparent: true,
      opacity: 0.9,
      linewidth: 1,
    });

    // ===== MAIN WIREFRAME SPHERE - High detail for smooth appearance =====
    const sphereDetail = geometryDetail + 2; // More detail for smoother wireframe
    const sphereGeo = new THREE.IcosahedronGeometry(0.85, sphereDetail);
    const sphereEdges = new THREE.WireframeGeometry(sphereGeo);
    const mainWireframe = new THREE.LineSegments(sphereEdges, lineMaterial.clone());
    scene.add(mainWireframe);

    // Store base positions for morphing
    const basePositions = sphereGeo.attributes.position.array.slice() as Float32Array;

    // ===== INNER GEOMETRIC STRUCTURE =====
    // Icosahedron core
    const icosaGeo = new THREE.IcosahedronGeometry(0.4, 1);
    const icosaEdges = new THREE.WireframeGeometry(icosaGeo);
    const icosaWireframe = new THREE.LineSegments(icosaEdges, lineMaterial.clone());
    scene.add(icosaWireframe);

    // Octahedron inside
    const octaGeo = new THREE.OctahedronGeometry(0.25, 0);
    const octaEdges = new THREE.WireframeGeometry(octaGeo);
    const octaWireframe = new THREE.LineSegments(octaEdges, lineMaterial.clone());
    scene.add(octaWireframe);

    // Store references for animation
    const wireframes = [mainWireframe, icosaWireframe, octaWireframe];
    layersRef.current = wireframes as unknown as THREE.Mesh[];
    basePositionsRef.current.set(mainWireframe as unknown as THREE.Mesh, basePositions);
    
    // Store inner structures separately for different animation
    coreLayersRef.current = [icosaWireframe, octaWireframe] as unknown as THREE.Mesh[];

    // ===== PARTICLES - Same color as wireframe =====
    if (particleEnabled) {
      const actualParticleCount = Math.max(30, particleCount);
      const ps = new ParticleSystem(actualParticleCount, activePalette.primary, 0.5, 2.0);
      scene.add(ps.mesh);
      particleSystemRef.current = ps;
    }

    onReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      wireframes.forEach(wf => {
        wf.geometry.dispose();
        (wf.material as THREE.Material).dispose();
      });
      sphereGeo.dispose();
      icosaGeo.dispose();
      octaGeo.dispose();
      if (particleSystemRef.current) {
        particleSystemRef.current.dispose();
      }
      ambient.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, layerCount, geometryDetail, coreSize, particleEnabled, particleCount, activePalette.id]);

  // Update colors when palette changes
  useEffect(() => {
    const wireColor = parseHslToThreeColor(activePalette.primary);
    
    // Update all wireframe colors
    layersRef.current.forEach((layer) => {
      if ((layer as any).material instanceof THREE.LineBasicMaterial) {
        ((layer as any).material as THREE.LineBasicMaterial).color = wireColor;
      }
    });

    coreLayersRef.current.forEach((layer) => {
      if ((layer as any).material instanceof THREE.LineBasicMaterial) {
        ((layer as any).material as THREE.LineBasicMaterial).color = wireColor;
      }
    });

    if (particleSystemRef.current) {
      particleSystemRef.current.setColor(activePalette.primary);
    }
  }, [activePalette]);

  // Animation loop with wireframe morphing
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const layers = layersRef.current;
    const coreLayers = coreLayersRef.current;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.008 * morphSpeed;
      morphPhaseRef.current += 0.003 * morphSpeed;

      const time = timeRef.current;
      const morphPhase = morphPhaseRef.current;

      // State-based animation modifiers
      const stateModifier = {
        idle: { rotMod: 1, morphMod: 1, pulseMod: 1 },
        listening: { rotMod: 2, morphMod: 1.5, pulseMod: 1.5 },
        speaking: { rotMod: 3, morphMod: 2.0, pulseMod: 2 },
        thinking: { rotMod: 4, morphMod: 1.8, pulseMod: 1.8 },
        session: { rotMod: 1.5, morphMod: 1.2, pulseMod: 1.2 },
        breathing: { rotMod: 0.5, morphMod: 1.5, pulseMod: 0.6 },
      }[state];

      const { rotMod, morphMod, pulseMod } = stateModifier;

      // ===== MAIN WIREFRAME SPHERE MORPHING =====
      const mainWireframe = layers[0];
      if (mainWireframe) {
        const geometry = (mainWireframe as any).geometry;
        const basePositions = basePositionsRef.current.get(mainWireframe);
        
        if (basePositions && geometry.attributes.position) {
          const positions = geometry.attributes.position.array as Float32Array;
          
          for (let i = 0; i < positions.length; i += 3) {
            const baseX = basePositions[i];
            const baseY = basePositions[i + 1];
            const baseZ = basePositions[i + 2];
            
            const dist = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
            if (dist === 0) continue;
            
            const nx = baseX / dist;
            const ny = baseY / dist;
            const nz = baseZ / dist;
            
            // Organic noise-based deformation
            const noiseVal = fbm(
              nx * 2 + morphPhase * 0.5,
              ny * 2 + morphPhase * 0.3,
              nz * 2 + morphPhase * 0.7,
              fractalOctaves
            );
            
            // Wave distortion
            const waveDistort = Math.sin(ny * 4 + time * 2) * Math.cos(nx * 3 + time * 1.5) * 0.08;
            
            // Radial pulse
            const pulse = Math.sin(time * pulseMod + dist * 3) * 0.03;
            
            // Audio reactivity
            const audioBoost = audioLevel * 0.2;
            
            // Combined deformation
            const deform = (noiseVal * morphIntensity * morphMod + waveDistort + pulse + audioBoost) * 0.8;
            
            positions[i] = baseX + nx * deform;
            positions[i + 1] = baseY + ny * deform;
            positions[i + 2] = baseZ + nz * deform;
          }
          
          geometry.attributes.position.needsUpdate = true;
        }
        
        // Rotate main wireframe
        mainWireframe.rotation.y += 0.002 * rotMod;
        mainWireframe.rotation.x += 0.001 * rotMod;
      }

      // ===== INNER STRUCTURES ANIMATION =====
      // Icosahedron
      if (coreLayers[0]) {
        coreLayers[0].rotation.y += 0.004 * rotMod;
        coreLayers[0].rotation.x -= 0.002 * rotMod;
        const scale = 1 + Math.sin(time * 1.5) * 0.05 + audioLevel * 0.1;
        coreLayers[0].scale.setScalar(scale);
      }
      
      // Octahedron
      if (coreLayers[1]) {
        coreLayers[1].rotation.y -= 0.005 * rotMod;
        coreLayers[1].rotation.z += 0.003 * rotMod;
        const scale = 1 + Math.sin(time * 2 + 1) * 0.08 + audioLevel * 0.1;
        coreLayers[1].scale.setScalar(scale);
      }

      // Update particles
      if (particleSystemRef.current) {
        particleSystemRef.current.update(time, audioLevel);
      }

      // Tunnel mode
      if (isTunnel) {
        camera.position.z = 2.5 + Math.sin(time * 0.5) * 0.4;
        layers.forEach(mesh => {
          mesh.rotation.z += 0.015;
        });
      } else {
        camera.position.z = 3.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [state, audioLevel, isTunnel, morphIntensity, morphSpeed, fractalOctaves]);

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

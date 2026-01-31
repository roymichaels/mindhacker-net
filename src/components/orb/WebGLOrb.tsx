import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbRef, OrbProps, OrbState, OrbProfile } from './types';
import { getEgoStateColors } from '@/lib/egoStates';
import { ParticleSystem } from './OrbParticles';
import { 
  COLOR_PALETTES, 
  hslToRgb, 
  GRADIENT_VERTEX_SHADER, 
  GRADIENT_FRAGMENT_SHADER,
  type ColorPalette 
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

  // Get profile-based parameters or defaults
  const layerCount = profile?.layerCount ?? 3;
  const geometryDetail = profile?.geometryDetail ?? 5;
  const morphIntensity = profile?.morphIntensity ?? 0.18;
  const morphSpeed = profile?.morphSpeed ?? 1.0;
  const fractalOctaves = profile?.fractalOctaves ?? 4;
  const coreIntensity = profile?.coreIntensity ?? 0.7;
  const coreSize = profile?.coreSize ?? 0.35;
  const particleEnabled = profile?.particleEnabled ?? true;
  const particleCount = profile?.particleCount ?? 30;

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

    // ===== LIGHTING SETUP - MAXIMUM RADIANCE =====
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    // Key light - strong directional
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(2.5, 2.0, 4);
    scene.add(keyLight);

    // Rim light - accent color for edge glow
    const rimLight = new THREE.DirectionalLight(parseHslToThreeColor(activePalette.accent), 2.2);
    rimLight.position.set(-3.0, -1.5, -2.5);
    scene.add(rimLight);

    // Center glow point light
    const glowLight = new THREE.PointLight(parseHslToThreeColor(activePalette.glow), 3.5, 20);
    glowLight.position.set(0, 0, 3.0);
    scene.add(glowLight);

    // Secondary color point light
    const secondaryLight = new THREE.PointLight(parseHslToThreeColor(activePalette.secondary), 2.5, 15);
    secondaryLight.position.set(-2.0, 1.5, 2.0);
    scene.add(secondaryLight);

    // Bottom rim for depth
    const bottomRim = new THREE.DirectionalLight(parseHslToThreeColor(activePalette.primary), 1.5);
    bottomRim.position.set(0, -3.0, 1.0);
    scene.add(bottomRim);

    // Front accent
    const frontAccent = new THREE.PointLight(parseHslToThreeColor(activePalette.accent), 2.0, 12);
    frontAccent.position.set(0, 0.5, 5);
    scene.add(frontAccent);

    // ===== CORE GRADIENT LAYERS - 5 LAYER GLOW =====
    const coreLayers: THREE.Mesh[] = [];
    
    if (showGlow) {
      // Layer 1: Hot white center
      const core1Geo = new THREE.SphereGeometry(coreSize * 1.0, 32, 32);
      const core1Mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.98,
      });
      const core1 = new THREE.Mesh(core1Geo, core1Mat);
      scene.add(core1);
      coreLayers.push(core1);

      // Layer 2: Accent glow
      const core2Geo = new THREE.SphereGeometry(coreSize * 1.4, 32, 32);
      const core2Mat = new THREE.MeshBasicMaterial({
        color: parseHslToThreeColor(activePalette.accent),
        transparent: true,
        opacity: 0.9,
      });
      const core2 = new THREE.Mesh(core2Geo, core2Mat);
      scene.add(core2);
      coreLayers.push(core2);

      // Layer 3: Secondary color
      const core3Geo = new THREE.SphereGeometry(coreSize * 1.8, 32, 32);
      const core3Mat = new THREE.MeshBasicMaterial({
        color: parseHslToThreeColor(activePalette.secondary),
        transparent: true,
        opacity: 0.75,
      });
      const core3 = new THREE.Mesh(core3Geo, core3Mat);
      scene.add(core3);
      coreLayers.push(core3);

      // Layer 4: Primary color
      const core4Geo = new THREE.SphereGeometry(coreSize * 2.3, 32, 32);
      const core4Mat = new THREE.MeshBasicMaterial({
        color: parseHslToThreeColor(activePalette.primary),
        transparent: true,
        opacity: 0.6,
      });
      const core4 = new THREE.Mesh(core4Geo, core4Mat);
      scene.add(core4);
      coreLayers.push(core4);

      // Layer 5: Outer glow aura
      const core5Geo = new THREE.SphereGeometry(coreSize * 2.8, 32, 32);
      const core5Mat = new THREE.MeshBasicMaterial({
        color: parseHslToThreeColor(activePalette.glow),
        transparent: true,
        opacity: 0.45,
      });
      const core5 = new THREE.Mesh(core5Geo, core5Mat);
      scene.add(core5);
      coreLayers.push(core5);
    }
    coreLayersRef.current = coreLayers;

    // ===== GRADIENT INNER SHELL =====
    const innerShellGeometry = new THREE.SphereGeometry(0.58, 48, 48);
    const [r1, g1, b1] = hslToRgb(activePalette.primary);
    const [r2, g2, b2] = hslToRgb(activePalette.secondary);
    const [r3, g3, b3] = hslToRgb(activePalette.accent);
    
    const shaderUniforms = {
      colorA: { value: new THREE.Vector3(r1, g1, b1) },
      colorB: { value: new THREE.Vector3(r2, g2, b2) },
      colorC: { value: new THREE.Vector3(r3, g3, b3) },
      time: { value: 0 },
      intensity: { value: coreIntensity + 0.3 },
    };
    shaderUniformsRef.current = shaderUniforms;

    const gradientMaterial = new THREE.ShaderMaterial({
      vertexShader: GRADIENT_VERTEX_SHADER,
      fragmentShader: GRADIENT_FRAGMENT_SHADER,
      uniforms: shaderUniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const innerShell = new THREE.Mesh(innerShellGeometry, gradientMaterial);
    scene.add(innerShell);

    // ===== OUTER LAYERS - SEPARATED COLORS =====
    const layerConfigs = getLayerConfigs();
    const newLayers: THREE.Mesh[] = [];
    const newBasePositions = new Map<THREE.Mesh, Float32Array>();

    layerConfigs.forEach((config, index) => {
      const geometry = new THREE.IcosahedronGeometry(config.radius, config.detail);
      const positions = geometry.attributes.position.array as Float32Array;
      
      const layerColor = parseHslToThreeColor(getPaletteColor(config.colorIndex));
      
      // Ultra-bright physical material with maximum glow
      const material = new THREE.MeshPhysicalMaterial({
        color: layerColor,
        emissive: layerColor.clone().multiplyScalar(0.6),
        emissiveIntensity: 2.0,
        metalness: 0.8,
        roughness: 0.03,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        transmission: 0.1,
        thickness: 1.2,
        ior: 1.6,
        iridescence: 1.0,
        iridescenceIOR: 1.8,
        sheen: 1.0,
        sheenRoughness: 0.1,
        sheenColor: parseHslToThreeColor(activePalette.glow),
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

    // ===== PARTICLES =====
    if (particleEnabled && particleCount > 0) {
      const ps = new ParticleSystem(particleCount, activePalette.glow, 0.9, 1.6);
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
      coreLayers.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      innerShell.geometry.dispose();
      gradientMaterial.dispose();
      if (particleSystemRef.current) {
        particleSystemRef.current.dispose();
      }
      ambient.dispose();
      keyLight.dispose();
      rimLight.dispose();
      glowLight.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, layerCount, geometryDetail, coreSize, particleEnabled, particleCount, activePalette.id]);

  // Update colors when palette changes
  useEffect(() => {
    const layers = layersRef.current;
    const layerConfigs = getLayerConfigs();
    
    layers.forEach((mesh, index) => {
      if (index < layerConfigs.length) {
        const material = mesh.material as THREE.MeshPhysicalMaterial;
        const c = parseHslToThreeColor(getPaletteColor(layerConfigs[index].colorIndex));
        material.color = c;
        material.emissive = c.clone().multiplyScalar(0.6);
        material.sheenColor = parseHslToThreeColor(activePalette.glow);
      }
    });

    // Update core layers
    const coreLayers = coreLayersRef.current;
    if (coreLayers.length >= 5) {
      (coreLayers[1].material as THREE.MeshBasicMaterial).color = parseHslToThreeColor(activePalette.accent);
      (coreLayers[2].material as THREE.MeshBasicMaterial).color = parseHslToThreeColor(activePalette.secondary);
      (coreLayers[3].material as THREE.MeshBasicMaterial).color = parseHslToThreeColor(activePalette.primary);
      (coreLayers[4].material as THREE.MeshBasicMaterial).color = parseHslToThreeColor(activePalette.glow);
    }

    // Update shader uniforms
    if (shaderUniformsRef.current) {
      const [r1, g1, b1] = hslToRgb(activePalette.primary);
      const [r2, g2, b2] = hslToRgb(activePalette.secondary);
      const [r3, g3, b3] = hslToRgb(activePalette.accent);
      shaderUniformsRef.current.colorA.value.set(r1, g1, b1);
      shaderUniformsRef.current.colorB.value.set(r2, g2, b2);
      shaderUniformsRef.current.colorC.value.set(r3, g3, b3);
    }

    if (particleSystemRef.current) {
      particleSystemRef.current.setColor(activePalette.glow);
    }
  }, [activePalette]);

  // Animation loop
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const layers = layersRef.current;
    const coreLayers = coreLayersRef.current;
    const layerConfigs = getLayerConfigs();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.008 * morphSpeed;
      morphPhaseRef.current += 0.003 * morphSpeed;

      const time = timeRef.current;
      const morphPhase = morphPhaseRef.current;

      // Update shader time
      if (shaderUniformsRef.current) {
        shaderUniformsRef.current.time.value = time;
      }

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

      // Animate outer layers
      layers.forEach((mesh, index) => {
        const config = layerConfigs[index];
        if (!config) return;

        // Organic rotation
        const wobble = Math.sin(time * 0.7 + index) * 0.001;
        mesh.rotation.x += config.rotationSpeed * rotMod + wobble;
        mesh.rotation.y += config.rotationSpeed * 1.3 * rotMod + Math.cos(time * 0.5) * 0.001;
        mesh.rotation.z += Math.sin(time * 0.3 + index * 0.5) * 0.0005;

        // Pulsating scale
        const basePulse = Math.sin(time * pulseMod + index * 0.5) * 0.08;
        const secondaryPulse = Math.sin(time * pulseMod * 2.3 + index) * 0.03;
        const audioBoost = audioLevel * 0.35;
        const breathEffect = state === 'breathing' ? Math.sin(time * 0.5) * 0.1 : 0;
        
        const targetScale = 1 + basePulse + secondaryPulse + audioBoost + breathEffect;
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
            
            const fractalNoise = fbm(
              x * 2 + morphPhase + config.morphOffset,
              y * 2 + morphPhase * 0.7 + config.morphOffset,
              z * 2 + morphPhase * 1.3,
              fractalOctaves
            );
            
            const wavePhase = Math.sin(x * 3 + y * 2 + z * 4 + time * 2) * 0.03;
            const radialPulse = Math.sin(dist * 8 - time * 3) * 0.02;
            
            const adjustedMorphIntensity = morphIntensity * morphMod;
            const totalDeform = (fractalNoise * adjustedMorphIntensity + wavePhase + radialPulse) * (1 + audioLevel * 0.5);
            
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

        // Dynamic opacity
        const material = mesh.material as THREE.MeshPhysicalMaterial;
        const opacityPulse = (layerConfigs[index]?.opacity || 0.7) + Math.sin(time * 1.5 + index) * 0.1 + audioLevel * 0.15;
        material.opacity = Math.min(opacityPulse, 0.95);
      });

      // Animate core layers with cascading pulse
      coreLayers.forEach((core, index) => {
        const delay = index * 0.15;
        const pulse = 1 + Math.sin(time * 2 - delay) * 0.12 + audioLevel * 0.2;
        core.scale.set(pulse, pulse, pulse);
        
        const mat = core.material as THREE.MeshBasicMaterial;
        const baseOpacity = [0.98, 0.9, 0.75, 0.6, 0.45][index] || 0.5;
        mat.opacity = baseOpacity + Math.sin(time * 1.5 - delay) * 0.1;
      });

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

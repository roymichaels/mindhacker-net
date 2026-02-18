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
    
    // CRITICAL: Reduce lightness for vibrant orb colors (prevents washed-out/white orb)
    // Map L >= 55% down to 35-50% range for richer, deeper colors
    let adjustedL = l;
    if (l >= 0.55) {
      // Strong reduction: 55% → 35%, 70% → 42.5%, 100% → 57.5%
      adjustedL = 0.35 + (l - 0.55) * 0.5;
    } else if (l >= 0.4) {
      // Light reduction for mid-range: keep 40-55% relatively intact but slightly darken
      adjustedL = 0.35 + (l - 0.4) * 0.67;
    }
    // L < 40% stays unchanged
    
    color.setHSL(h, s, adjustedL);
    return color;
  }
  
  return new THREE.Color(colorStr);
}

// ===== DNA-BASED GEOMETRY SELECTION =====
type GeometryType = 'icosahedron' | 'dodecahedron' | 'octahedron' | 'tetrahedron' | 'sphere' | 'torusKnot';

function getGeometryForPalette(paletteId: string): { outer: GeometryType; inner1: GeometryType; inner2: GeometryType } {
  switch (paletteId) {
    case 'tech':
      return { outer: 'icosahedron', inner1: 'octahedron', inner2: 'tetrahedron' };
    case 'creative':
      return { outer: 'dodecahedron', inner1: 'icosahedron', inner2: 'torusKnot' };
    case 'action':
      return { outer: 'octahedron', inner1: 'tetrahedron', inner2: 'icosahedron' };
    case 'mystic':
      return { outer: 'dodecahedron', inner1: 'torusKnot', inner2: 'octahedron' };
    case 'healing':
      return { outer: 'sphere', inner1: 'icosahedron', inner2: 'dodecahedron' };
    case 'explorer':
    default:
      return { outer: 'tetrahedron', inner1: 'dodecahedron', inner2: 'octahedron' };
  }
}

function createGeometry(type: GeometryType, radius: number, detail: number): THREE.BufferGeometry {
  switch (type) {
    case 'icosahedron':
      return new THREE.IcosahedronGeometry(radius, detail);
    case 'dodecahedron':
      return new THREE.DodecahedronGeometry(radius, detail);
    case 'octahedron':
      return new THREE.OctahedronGeometry(radius, Math.min(detail, 2));
    case 'tetrahedron':
      return new THREE.TetrahedronGeometry(radius, Math.min(detail, 2));
    case 'sphere':
      return new THREE.SphereGeometry(radius, 16 + detail * 4, 12 + detail * 3);
    case 'torusKnot':
      return new THREE.TorusKnotGeometry(radius * 0.6, radius * 0.2, 64, 8, 2, 3);
    default:
      return new THREE.IcosahedronGeometry(radius, detail);
  }
}

// ===== GRADIENT SHADER FOR WIREFRAME =====
const GRADIENT_VERTEX_SHADER = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GRADIENT_FRAGMENT_SHADER = `
  uniform vec3 colorA;
  uniform vec3 colorB;
  uniform vec3 colorC;
  uniform float time;
  uniform float intensity;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    // Position-based gradient with animation
    float heightGradient = (vPosition.y + 1.0) * 0.5;
    float angleGradient = (atan(vPosition.x, vPosition.z) + 3.14159) / 6.28318;
    
    // Animate the gradient
    float animatedAngle = mod(angleGradient + time * 0.1, 1.0);
    
    // Three-color gradient blend
    vec3 color;
    if (animatedAngle < 0.33) {
      color = mix(colorA, colorB, animatedAngle * 3.0);
    } else if (animatedAngle < 0.66) {
      color = mix(colorB, colorC, (animatedAngle - 0.33) * 3.0);
    } else {
      color = mix(colorC, colorA, (animatedAngle - 0.66) * 3.0);
    }
    
    // Add height influence
    color = mix(color, colorA, heightGradient * 0.3);
    
    // Fresnel-like edge glow
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    color += fresnel * colorC * 0.5 * intensity;
    
    gl_FragColor = vec4(color, 0.9);
  }
`;

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
  const mainWireframeRef = useRef<THREE.LineSegments | null>(null);
  const innerStructuresRef = useRef<THREE.LineSegments[]>([]);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const baseColorsRef = useRef<Float32Array | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const morphPhaseRef = useRef(0);
  // Safety margin to keep morphing/particles inside the canvas (prevents clipping)
  const fitScaleRef = useRef<number>(1);

  const [internalState, setInternalState] = useState<OrbState>('idle');
  const [internalAudioLevel, setInternalAudioLevel] = useState(0);
  const [internalTunnelMode, setInternalTunnelMode] = useState(false);

  const state = externalState ?? internalState;
  const audioLevel = externalAudioLevel ?? internalAudioLevel;
  const isTunnel = tunnelMode ?? internalTunnelMode;

  // Determine the active color palette
  const activePalette = useMemo((): ColorPalette => {
    if (profile?.primaryColor) {
      const paletteValues = Object.values(COLOR_PALETTES);
      const matchingPalette = paletteValues.find(p => p.primary === profile.primaryColor);
      if (matchingPalette) return matchingPalette;
      
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
    
    return COLOR_PALETTES.explorer;
  }, [profile, themeColors]);

  // Get morphology profile based on palette
  const activeMorphology = useMemo((): MorphologyProfile => {
    return getMorphology(activePalette.id);
  }, [activePalette.id]);

  // Get DNA-based geometry types
  const geometryTypes = useMemo(() => {
    return getGeometryForPalette(activePalette.id);
  }, [activePalette.id]);

  // Get profile-based parameters - ENHANCED for dramatic morphing
  const geometryDetail = Math.max(3, profile?.geometryDetail ?? 4);
  const morphIntensity = Math.max(0.25, (profile?.morphIntensity ?? 0.2) * 1.5); // 50% stronger
  const morphSpeed = profile?.morphSpeed ?? 1.2;
  const fractalOctaves = Math.max(4, profile?.fractalOctaves ?? 5);
  const particleCount = Math.max(60, profile?.particleCount ?? 80);

  useImperativeHandle(ref, () => ({
    setSpeaking: (speaking: boolean) => setInternalState(speaking ? 'speaking' : 'idle'),
    setListening: (listening: boolean) => setInternalState(listening ? 'listening' : 'idle'),
    setThinking: (thinking: boolean) => setInternalState(thinking ? 'thinking' : 'idle'),
    updateState: setInternalState,
    setAudioLevel: setInternalAudioLevel,
    setTunnelMode: setInternalTunnelMode,
  }), []);

  // Initialize Three.js scene with DNA-based geometry
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

    // Minimal lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // Get colors from palette for gradient
    const primaryColor = parseHslToThreeColor(activePalette.primary);
    const secondaryColor = parseHslToThreeColor(activePalette.secondary);
    const accentColor = parseHslToThreeColor(activePalette.accent);

    // ===== SHADER UNIFORMS FOR GRADIENT =====
    const shaderUniforms = {
      colorA: { value: new THREE.Vector3(primaryColor.r, primaryColor.g, primaryColor.b) },
      colorB: { value: new THREE.Vector3(secondaryColor.r, secondaryColor.g, secondaryColor.b) },
      colorC: { value: new THREE.Vector3(accentColor.r, accentColor.g, accentColor.b) },
      time: { value: 0 },
      intensity: { value: 1.0 },
    };

    // ===== MAIN OUTER WIREFRAME - DNA-based geometry =====
    const outerGeo = createGeometry(geometryTypes.outer, 0.85, geometryDetail);
    const outerEdges = new THREE.WireframeGeometry(outerGeo);
    
    // Create gradient line material using vertex colors
    const positions = outerEdges.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const normalizedY = (y + 1) / 2; // 0-1
      
      // Blend between three colors based on position
      let r, g, b;
      if (normalizedY < 0.5) {
        const t = normalizedY * 2;
        r = primaryColor.r + (secondaryColor.r - primaryColor.r) * t;
        g = primaryColor.g + (secondaryColor.g - primaryColor.g) * t;
        b = primaryColor.b + (secondaryColor.b - primaryColor.b) * t;
      } else {
        const t = (normalizedY - 0.5) * 2;
        r = secondaryColor.r + (accentColor.r - secondaryColor.r) * t;
        g = secondaryColor.g + (accentColor.g - secondaryColor.g) * t;
        b = secondaryColor.b + (accentColor.b - secondaryColor.b) * t;
      }
      
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    
    outerEdges.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    
    const mainWireframe = new THREE.LineSegments(outerEdges, lineMaterial);

    // Fit-to-canvas safety margin (prevents visual clipping on small sizes)
    const fitScale = size <= 120 ? 0.78 : size <= 200 ? 0.86 : 0.92;
    fitScaleRef.current = fitScale;
    mainWireframe.scale.setScalar(fitScale);

    scene.add(mainWireframe);
    mainWireframeRef.current = mainWireframe;

    // Store base positions for morphing
    basePositionsRef.current = outerEdges.attributes.position.array.slice() as Float32Array;
    // Store base colors so we can animate without accumulating brightness over time
    baseColorsRef.current = (outerEdges.getAttribute('color').array as Float32Array).slice() as Float32Array;

    // ===== INNER GEOMETRIC STRUCTURES - DNA-based =====
    const innerStructures: THREE.LineSegments[] = [];

    // First inner structure
    const inner1Geo = createGeometry(geometryTypes.inner1, 0.45, Math.max(1, geometryDetail - 1));
    const inner1Edges = new THREE.WireframeGeometry(inner1Geo);
    
    // Add gradient colors to inner structure
    const inner1Positions = inner1Edges.attributes.position;
    const inner1Colors = new Float32Array(inner1Positions.count * 3);
    for (let i = 0; i < inner1Positions.count; i++) {
      const y = inner1Positions.getY(i);
      const t = (y + 0.5) / 1;
      inner1Colors[i * 3] = secondaryColor.r + (accentColor.r - secondaryColor.r) * t;
      inner1Colors[i * 3 + 1] = secondaryColor.g + (accentColor.g - secondaryColor.g) * t;
      inner1Colors[i * 3 + 2] = secondaryColor.b + (accentColor.b - secondaryColor.b) * t;
    }
    inner1Edges.setAttribute('color', new THREE.BufferAttribute(inner1Colors, 3));
    
    const inner1Wireframe = new THREE.LineSegments(inner1Edges, lineMaterial.clone());
    inner1Wireframe.scale.setScalar(fitScale);
    scene.add(inner1Wireframe);
    innerStructures.push(inner1Wireframe);

    // Second inner structure
    const inner2Geo = createGeometry(geometryTypes.inner2, 0.25, Math.max(0, geometryDetail - 2));
    const inner2Edges = new THREE.WireframeGeometry(inner2Geo);
    
    // Add gradient colors
    const inner2Positions = inner2Edges.attributes.position;
    const inner2Colors = new Float32Array(inner2Positions.count * 3);
    for (let i = 0; i < inner2Positions.count; i++) {
      const y = inner2Positions.getY(i);
      const t = (y + 0.3) / 0.6;
      inner2Colors[i * 3] = accentColor.r + (primaryColor.r - accentColor.r) * t;
      inner2Colors[i * 3 + 1] = accentColor.g + (primaryColor.g - accentColor.g) * t;
      inner2Colors[i * 3 + 2] = accentColor.b + (primaryColor.b - accentColor.b) * t;
    }
    inner2Edges.setAttribute('color', new THREE.BufferAttribute(inner2Colors, 3));
    
    const inner2Wireframe = new THREE.LineSegments(inner2Edges, lineMaterial.clone());
    inner2Wireframe.scale.setScalar(fitScale);
    scene.add(inner2Wireframe);
    innerStructures.push(inner2Wireframe);

    innerStructuresRef.current = innerStructures;

    // Cleanup geometries
    outerGeo.dispose();
    inner1Geo.dispose();
    inner2Geo.dispose();

    // ===== PARTICLES - Gradient colored =====
    // Keep particle cloud slightly tighter so it doesn't get cut off by the canvas.
    const ps = new ParticleSystem(particleCount, activePalette.primary, 0.45, 1.6);
    ps.mesh.scale.setScalar(fitScale * 0.85);
    scene.add(ps.mesh);
    particleSystemRef.current = ps;

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
      if (particleSystemRef.current) {
        particleSystemRef.current.dispose();
      }
      ambient.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, geometryDetail, particleCount, activePalette.id, geometryTypes]);

  // Update colors when palette changes
  useEffect(() => {
    const primaryColor = parseHslToThreeColor(activePalette.primary);
    const secondaryColor = parseHslToThreeColor(activePalette.secondary);
    const accentColor = parseHslToThreeColor(activePalette.accent);

    // Update main wireframe vertex colors
    if (mainWireframeRef.current) {
      const geometry = mainWireframeRef.current.geometry;
      const positions = geometry.attributes.position;
      const colors = geometry.attributes.color;
      
      if (colors) {
        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i);
          const normalizedY = (y + 1) / 2;
          
          let r, g, b;
          if (normalizedY < 0.5) {
            const t = normalizedY * 2;
            r = primaryColor.r + (secondaryColor.r - primaryColor.r) * t;
            g = primaryColor.g + (secondaryColor.g - primaryColor.g) * t;
            b = primaryColor.b + (secondaryColor.b - primaryColor.b) * t;
          } else {
            const t = (normalizedY - 0.5) * 2;
            r = secondaryColor.r + (accentColor.r - secondaryColor.r) * t;
            g = secondaryColor.g + (accentColor.g - secondaryColor.g) * t;
            b = secondaryColor.b + (accentColor.b - secondaryColor.b) * t;
          }
          
          colors.setXYZ(i, r, g, b);
        }
        colors.needsUpdate = true;

        // Keep an immutable base snapshot for per-frame animation (prevents drift to white)
        baseColorsRef.current = (colors.array as Float32Array).slice() as Float32Array;
      }
    }

    // Update inner structures
    innerStructuresRef.current.forEach((structure, idx) => {
      const geometry = structure.geometry;
      const colors = geometry.attributes.color;
      
      if (colors) {
        const c1 = idx === 0 ? secondaryColor : accentColor;
        const c2 = idx === 0 ? accentColor : primaryColor;
        
        for (let i = 0; i < colors.count; i++) {
          const t = i / colors.count;
          colors.setXYZ(
            i,
            c1.r + (c2.r - c1.r) * t,
            c1.g + (c2.g - c1.g) * t,
            c1.b + (c2.b - c1.b) * t
          );
        }
        colors.needsUpdate = true;
      }
    });

    // Update particles
    if (particleSystemRef.current) {
      particleSystemRef.current.setColor(activePalette.primary);
    }
  }, [activePalette]);

  // Animation loop with ENHANCED morphing
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !mainWireframeRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mainWireframe = mainWireframeRef.current;
    const innerStructures = innerStructuresRef.current;
    const basePositions = basePositionsRef.current;
    const baseColors = baseColorsRef.current;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.012 * morphSpeed;
      morphPhaseRef.current += 0.005 * morphSpeed;

      const time = timeRef.current;
      const morphPhase = morphPhaseRef.current;

      // State-based animation modifiers - ENHANCED
      const stateModifier = {
        idle: { rotMod: 1, morphMod: 1.2, pulseMod: 1 },
        listening: { rotMod: 2, morphMod: 1.8, pulseMod: 1.5 },
        speaking: { rotMod: 3.5, morphMod: 2.5, pulseMod: 2.2 },
        thinking: { rotMod: 4, morphMod: 2.2, pulseMod: 2.0 },
        session: { rotMod: 1.8, morphMod: 1.5, pulseMod: 1.4 },
        breathing: { rotMod: 0.6, morphMod: 2.0, pulseMod: 0.7 },
      }[state];

      const { rotMod, morphMod, pulseMod } = stateModifier;

      // ===== MAIN WIREFRAME MORPHING - DRAMATICALLY ENHANCED =====
      if (basePositions) {
        const positions = mainWireframe.geometry.attributes.position;
        const colors = mainWireframe.geometry.attributes.color;
        
        for (let i = 0; i < positions.count; i++) {
          const baseX = basePositions[i * 3];
          const baseY = basePositions[i * 3 + 1];
          const baseZ = basePositions[i * 3 + 2];
          
          const dist = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
          if (dist === 0) continue;
          
          const nx = baseX / dist;
          const ny = baseY / dist;
          const nz = baseZ / dist;
          
          // ENHANCED organic noise-based deformation
          const noiseVal = fbm(
            nx * 2.5 + morphPhase * 0.6,
            ny * 2.5 + morphPhase * 0.4,
            nz * 2.5 + morphPhase * 0.8,
            fractalOctaves
          );
          
          // Multiple wave layers for complex movement
          const wave1 = Math.sin(ny * 5 + time * 2.5) * Math.cos(nx * 4 + time * 2) * 0.12;
          const wave2 = Math.sin(nz * 3 + time * 1.8) * Math.cos(ny * 2.5 + time * 1.2) * 0.08;
          const wave3 = Math.sin((nx + ny) * 4 + time * 3) * 0.06;
          
          // Radial pulse with multiple frequencies
          const pulse1 = Math.sin(time * pulseMod + dist * 4) * 0.05;
          const pulse2 = Math.sin(time * pulseMod * 0.7 + dist * 2) * 0.03;
          
          // Audio reactivity
          const audioBoost = audioLevel * 0.35;
          
          // Combined DRAMATIC deformation
          const deform = (
            noiseVal * morphIntensity * morphMod * 1.5 + 
            wave1 + wave2 + wave3 + 
            pulse1 + pulse2 + 
            audioBoost
          );
          
          positions.setXYZ(
            i,
            baseX + nx * deform,
            baseY + ny * deform,
            baseZ + nz * deform
          );
          
          // Animate vertex colors based on deformation.
          // IMPORTANT: Use the original base colors each frame (no accumulation), otherwise it drifts to white.
          if (colors && baseColors) {
            const deformIntensity = Math.abs(deform) * 3;
            const baseR = baseColors[i * 3];
            const baseG = baseColors[i * 3 + 1];
            const baseB = baseColors[i * 3 + 2];
            colors.setXYZ(
              i,
              Math.min(1, baseR + deformIntensity * 0.1),
              Math.min(1, baseG + deformIntensity * 0.1),
              Math.min(1, baseB + deformIntensity * 0.1)
            );
          }
        }
        
        positions.needsUpdate = true;
        if (colors) colors.needsUpdate = true;
      }

      // Rotate main wireframe with morphology-based pattern
      const rotAxis = activeMorphology.rotationAxis;
      mainWireframe.rotation.y += 0.003 * rotMod;
      if (rotAxis === 'x' || rotAxis === 'diagonal') {
        mainWireframe.rotation.x += 0.002 * rotMod;
      }
      if (rotAxis === 'z' || rotAxis === 'diagonal') {
        mainWireframe.rotation.z += 0.001 * rotMod;
      }
      if (rotAxis === 'wobble') {
        mainWireframe.rotation.x = Math.sin(time * 0.5) * 0.15;
        mainWireframe.rotation.z = Math.cos(time * 0.4) * 0.12;
      }

      // ===== INNER STRUCTURES ANIMATION - ENHANCED =====
      // IMPORTANT: Always multiply by fitScaleRef, otherwise dynamic scaling can exceed the canvas and clip.
      const fitScale = fitScaleRef.current;

      if (innerStructures[0]) {
        innerStructures[0].rotation.y += 0.006 * rotMod;
        innerStructures[0].rotation.x -= 0.004 * rotMod;
        innerStructures[0].rotation.z += Math.sin(time * 0.8) * 0.002;
        const scale = 1 + Math.sin(time * 1.8) * 0.12 + audioLevel * 0.15;
        innerStructures[0].scale.setScalar(fitScale * scale);
      }
      
      if (innerStructures[1]) {
        innerStructures[1].rotation.y -= 0.008 * rotMod;
        innerStructures[1].rotation.z += 0.005 * rotMod;
        innerStructures[1].rotation.x += Math.cos(time * 0.6) * 0.003;
        const scale = 1 + Math.sin(time * 2.2 + 1.5) * 0.15 + audioLevel * 0.12;
        innerStructures[1].scale.setScalar(fitScale * scale);
      }

      // Update particles
      if (particleSystemRef.current) {
        particleSystemRef.current.update(time, audioLevel);
      }

      // Camera movement
      if (isTunnel) {
        camera.position.z = 3.0 + Math.sin(time * 0.5) * 0.4;
        mainWireframe.rotation.z += 0.015;
      } else {
        camera.position.z = 3.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [state, audioLevel, isTunnel, morphIntensity, morphSpeed, fractalOctaves, activeMorphology, activePalette]);

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

export default WebGLOrb;

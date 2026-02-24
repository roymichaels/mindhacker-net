import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// Disable THREE.js color management to prevent sRGB→linear conversion
// which darkens colors when passed to custom ShaderMaterial uniforms
THREE.ColorManagement.enabled = false;
import type { OrbRef, OrbProps, OrbState, OrbProfile } from './types';
import { VISUAL_DEFAULTS } from './types';
import { 
  COLOR_PALETTES, 
  MORPHOLOGY_PROFILES,
  getMorphology,
  hslToRgb, 
  type ColorPalette,
  type MorphologyProfile 
} from '@/lib/orbVisualSystem';

// ===== WEBGL SUPPORT CHECK =====
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch { return false; }
}

// ===== NOISE FUNCTIONS (kept from original) =====
function noise3D(x: number, y: number, z: number): number {
  const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  const perm = [...p, ...p];
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15; const u = h < 8 ? x : y; const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
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

function fbm(x: number, y: number, z: number, octaves: number = 4): number {
  let value = 0, amplitude = 0.5, frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
    amplitude *= 0.5; frequency *= 2;
  }
  return value;
}

// ===== HSL PARSING (robust, bypasses THREE.js color management) =====
/** Normalize any HSL string format to "H S% L%" */
function normalizeHsl(input: string): string {
  // Guard against NaN in input
  if (!input || input.includes('NaN')) return '200 80% 50%';
  // "H S% L%" format
  const m1 = input.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?$/);
  if (m1) return `${parseFloat(m1[1])} ${parseFloat(m1[2])}% ${parseFloat(m1[3])}%`;
  // "hsl(H, S%, L%)" or "hsl(H S% L%)" format
  const m2 = input.match(/hsl\(?\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)%?[,\s]+(\d+(?:\.\d+)?)%?\s*\)?/i);
  if (m2) return `${parseFloat(m2[1])} ${parseFloat(m2[2])}% ${parseFloat(m2[3])}%`;
  return '200 80% 50%';
}

/** Manual HSL→RGB (sRGB, no THREE.js color management which can darken via linearization) */
function hslToRgbDirect(h: number, s: number, l: number): [number, number, number] {
  // h in 0-360, s in 0-100, l in 0-100 → returns [r,g,b] each 0-1
  const hNorm = ((h % 360) + 360) % 360 / 360;
  const sNorm = Math.max(0, Math.min(1, s / 100));
  const lNorm = Math.max(0, Math.min(1, l / 100));

  if (sNorm === 0) return [lNorm, lNorm, lNorm];

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
    return p;
  };

  const q2 = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p2 = 2 * lNorm - q2;
  return [
    hue2rgb(p2, q2, hNorm + 1 / 3),
    hue2rgb(p2, q2, hNorm),
    hue2rgb(p2, q2, hNorm - 1 / 3),
  ];
}

// Known-good fallback blue
const FALLBACK_RGB: [number, number, number] = hslToRgbDirect(200, 80, 50);

function parseHslToThreeColor(colorStr: string): THREE.Color {
  const normalized = normalizeHsl(colorStr);
  const m = normalized.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (m) {
    const [r, g, b] = hslToRgbDirect(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
    // Set RGB directly, bypassing THREE.js color management entirely
    const color = new THREE.Color(r, g, b);
    return color;
  }
  // No valid HSL match — return fallback directly (never use THREE.Color constructor with raw strings)
  return new THREE.Color(...FALLBACK_RGB);
}

function parseHslToVec3(colorStr: string): THREE.Vector3 {
  // Bypass THREE.Color entirely to avoid sRGB→linear darkening
  const normalized = normalizeHsl(colorStr);
  const m = normalized.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (m) {
    const [r, g, b] = hslToRgbDirect(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
    if (r + g + b < 0.1) return new THREE.Vector3(...FALLBACK_RGB);
    return new THREE.Vector3(r, g, b);
  }
  return new THREE.Vector3(...FALLBACK_RGB);
}

// ===== GEOMETRY =====
type GeometryType = 'icosahedron' | 'dodecahedron' | 'octahedron' | 'tetrahedron' | 'sphere' | 'torusKnot';

function getGeometryFromProfile(profile?: OrbProfile | null): { outer: GeometryType; inner1: GeometryType } {
  switch (profile?.geometryFamily) {
    case 'sphere': return { outer: 'sphere', inner1: 'icosahedron' };
    case 'torus': return { outer: 'torusKnot', inner1: 'dodecahedron' };
    case 'dodeca': return { outer: 'dodecahedron', inner1: 'icosahedron' };
    case 'icosa': return { outer: 'icosahedron', inner1: 'octahedron' };
    case 'octa': return { outer: 'octahedron', inner1: 'tetrahedron' };
    case 'spiky': return { outer: 'tetrahedron', inner1: 'octahedron' };
    default: return { outer: 'icosahedron', inner1: 'dodecahedron' };
  }
}

function createGeometry(type: GeometryType, radius: number, detail: number): THREE.BufferGeometry {
  switch (type) {
    case 'icosahedron': return new THREE.IcosahedronGeometry(radius, detail);
    case 'dodecahedron': return new THREE.DodecahedronGeometry(radius, detail);
    case 'octahedron': return new THREE.OctahedronGeometry(radius, Math.min(detail, 2));
    case 'tetrahedron': return new THREE.TetrahedronGeometry(radius, Math.min(detail, 2));
    case 'sphere': return new THREE.SphereGeometry(radius, 16 + detail * 4, 12 + detail * 3);
    case 'torusKnot': return new THREE.TorusKnotGeometry(radius * 0.6, radius * 0.2, 64, 8, 2, 3);
    default: return new THREE.IcosahedronGeometry(radius, detail);
  }
}

// ===== GLSL SHADERS =====
const ORB_VERTEX_SHADER = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vDistFromCenter;

  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    vDistFromCenter = length(position);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ORB_FRAGMENT_SHADER = `
  uniform vec3 u_colors[7];
  uniform int u_colorCount;
  uniform int u_gradientMode; // 0=vertical, 1=radial, 2=noise, 3=rim
  uniform int u_materialType; // 0=wire, 1=metal, 2=glass, 3=plasma, 4=iridescent
  uniform int u_patternType;  // 0=voronoi, 1=cellular, 2=fractal, 3=shards, 4=swirl, 5=strata
  uniform float u_patternIntensity;
  uniform float u_chromaShift;
  uniform float u_time;
  uniform vec3 u_rimLightColor;
  uniform float u_emissiveIntensity;
  uniform float u_metalness;
  uniform float u_roughness;
  uniform float u_transmission;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vDistFromCenter;

  // Hash functions for patterns
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Simple noise for shader
  float snoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = dot(i, vec3(1.0, 57.0, 113.0));
    return mix(
      mix(mix(fract(sin(n) * 43758.5453), fract(sin(n + 1.0) * 43758.5453), f.x),
          mix(fract(sin(n + 57.0) * 43758.5453), fract(sin(n + 58.0) * 43758.5453), f.x), f.y),
      mix(mix(fract(sin(n + 113.0) * 43758.5453), fract(sin(n + 114.0) * 43758.5453), f.x),
          mix(fract(sin(n + 170.0) * 43758.5453), fract(sin(n + 171.0) * 43758.5453), f.x), f.y),
      f.z
    );
  }

  float fbmShader(vec3 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * snoise(p);
      p *= 2.0; a *= 0.5;
    }
    return v;
  }

  // Voronoi pattern
  float voronoi(vec3 p) {
    vec2 uv = p.xy * 3.0 + p.z * 0.5;
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float minDist = 1.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 point = hash2(i + neighbor);
        point = 0.5 + 0.5 * sin(u_time * 0.3 + 6.2831 * point);
        float d = length(neighbor + point - f);
        minDist = min(minDist, d);
      }
    }
    return minDist;
  }

  // Cellular pattern
  float cellular(vec3 p) {
    vec2 uv = p.xz * 4.0;
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float d1 = 1.0, d2 = 1.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 point = hash2(i + neighbor);
        point = 0.5 + 0.5 * sin(u_time * 0.2 + 6.2831 * point);
        float d = length(neighbor + point - f);
        if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
      }
    }
    return d2 - d1;
  }

  // Shards pattern
  float shards(vec3 p) {
    vec2 uv = p.xy * 5.0;
    float angle = atan(fract(uv.y) - 0.5, fract(uv.x) - 0.5);
    float sector = floor(angle / 0.7854 + 0.5);
    return abs(sin(sector * 3.0 + u_time * 0.5)) * 0.5 + voronoi(p) * 0.5;
  }

  // Swirl pattern
  float swirl(vec3 p) {
    float angle = atan(p.z, p.x);
    float dist = length(p.xz);
    return sin(angle * 3.0 + dist * 8.0 - u_time * 0.8) * 0.5 + 0.5;
  }

  // Strata pattern
  float strata(vec3 p) {
    float bands = sin(p.y * 12.0 + fbmShader(p * 2.0) * 3.0 + u_time * 0.2);
    return bands * 0.5 + 0.5;
  }

  // Sample multi-stop gradient
  vec3 sampleGradient(float t) {
    t = clamp(t, 0.0, 1.0);
    if (u_colorCount <= 1) return u_colors[0];
    float scaledT = t * float(u_colorCount - 1);
    int idx = int(floor(scaledT));
    float frac = fract(scaledT);
    if (idx >= u_colorCount - 1) return u_colors[u_colorCount - 1];
    return mix(u_colors[idx], u_colors[idx + 1], frac);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // === 1. Compute gradient blend factor ===
    float blendFactor = 0.0;
    if (u_gradientMode == 0) { // vertical
      blendFactor = (vPosition.y + 0.5) / 1.0;
    } else if (u_gradientMode == 1) { // radial
      blendFactor = vDistFromCenter / 0.5;
    } else if (u_gradientMode == 2) { // noise
      blendFactor = fbmShader(vPosition * 3.0 + u_time * 0.15) * 0.5 + 0.5;
    } else { // rim
      float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
      blendFactor = fresnel;
    }
    blendFactor = clamp(blendFactor, 0.0, 1.0);

    // === 2. Sample multi-stop gradient ===
    vec3 baseColor = sampleGradient(blendFactor);

    // === 3. Apply pattern overlay ===
    float pattern = 0.0;
    if (u_patternType == 0) pattern = voronoi(vPosition);
    else if (u_patternType == 1) pattern = cellular(vPosition);
    else if (u_patternType == 2) pattern = fbmShader(vPosition * 4.0 + u_time * 0.1) * 0.5 + 0.5;
    else if (u_patternType == 3) pattern = shards(vPosition);
    else if (u_patternType == 4) pattern = swirl(vPosition);
    else pattern = strata(vPosition);
    
    baseColor = mix(baseColor, baseColor * (0.5 + pattern), u_patternIntensity);

    // === 4. Material lighting ===
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float NdotL = max(dot(normal, lightDir), 0.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), mix(8.0, 64.0, 1.0 - u_roughness));

    vec3 finalColor = baseColor;

    if (u_materialType == 1) { // metal
      finalColor = baseColor * (0.4 + NdotL * 0.5) + spec * baseColor * u_metalness * 1.5;
      finalColor += fresnel * baseColor * 0.4;
    } else if (u_materialType == 2) { // glass
      float glassRefract = mix(0.8, 1.0, fresnel);
      finalColor = baseColor * glassRefract * (0.6 + NdotL * 0.4);
      finalColor += fresnel * vec3(1.0) * u_transmission * 0.5;
      finalColor += spec * vec3(1.0) * 0.6;
    } else if (u_materialType == 3) { // plasma
      float plasma = sin(vPosition.x * 8.0 + u_time * 2.0) * sin(vPosition.y * 6.0 + u_time * 1.5) * 0.5 + 0.5;
      finalColor = baseColor * (0.7 + plasma * 0.5);
      finalColor += baseColor * u_emissiveIntensity * (0.5 + plasma * 0.5);
    } else if (u_materialType == 4) { // iridescent
      float iriAngle = dot(normal, viewDir);
      float hueShift = u_chromaShift * (1.0 - iriAngle) + u_time * 0.05;
      float cosH = cos(hueShift * 6.2831);
      float sinH = sin(hueShift * 6.2831);
      vec3 iriColor = vec3(
        baseColor.r * (0.667 + cosH * 0.333) + baseColor.g * (0.333 * (1.0 - cosH) - 0.577 * sinH) + baseColor.b * (0.333 * (1.0 - cosH) + 0.577 * sinH),
        baseColor.r * (0.333 * (1.0 - cosH) + 0.577 * sinH) + baseColor.g * (0.667 + cosH * 0.333) + baseColor.b * (0.333 * (1.0 - cosH) - 0.577 * sinH),
        baseColor.r * (0.333 * (1.0 - cosH) - 0.577 * sinH) + baseColor.g * (0.333 * (1.0 - cosH) + 0.577 * sinH) + baseColor.b * (0.667 + cosH * 0.333)
      );
      finalColor = iriColor * (0.5 + NdotL * 0.4) + spec * vec3(1.0) * 0.4;
      finalColor += fresnel * iriColor * 0.5;
    } else { // wire (default)
      finalColor = baseColor * (0.6 + NdotL * 0.3);
    }

    // === 5. Rim light ===
    finalColor += fresnel * u_rimLightColor * 0.6;

    // === 6. Emissive glow (guaranteed minimum) ===
    float effectiveEmissive = max(u_emissiveIntensity, 0.25);
    finalColor += baseColor * effectiveEmissive * 0.4;

    // === 7. Brightness floor — NEVER allow dark orbs ===
    float brightness = dot(finalColor, vec3(0.299, 0.587, 0.114));
    if (brightness < 0.35) {
      // Boost toward base color to maintain hue, not just inject blue
      finalColor = mix(finalColor, baseColor * 1.2, (0.35 - brightness) / 0.35);
      finalColor = max(finalColor, baseColor * 0.5);
    }

    gl_FragColor = vec4(finalColor, 0.92);
  }
`;

// ===== WIREFRAME OVERLAY SHADERS (subtle) =====
const WIRE_OVERLAY_VERTEX = `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const WIRE_OVERLAY_FRAGMENT = `
  uniform vec3 u_wireColor;
  uniform float u_wireOpacity;
  varying vec3 vPos;
  void main() {
    gl_FragColor = vec4(u_wireColor, u_wireOpacity);
  }
`;

// ===== MAIN COMPONENT =====
export const WebGLOrb = forwardRef<OrbRef, OrbProps>(function WebGLOrb(
  { size = 300, state: externalState, audioLevel: externalAudioLevel, tunnelMode, egoState = 'guardian', className, showGlow = true, onReady, profile, themeColors },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const solidMeshRef = useRef<THREE.Mesh | null>(null);
  const wireOverlayRef = useRef<THREE.LineSegments | null>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const morphPhaseRef = useRef(profile?.seed ? (profile.seed % 1000) / 1000 * Math.PI * 2 : 0);
  const fitScaleRef = useRef<number>(1);
  const [sceneVersion, setSceneVersion] = useState(0);

  const [internalState, setInternalState] = useState<OrbState>('idle');
  const [internalAudioLevel, setInternalAudioLevel] = useState(0);
  const [internalTunnelMode, setInternalTunnelMode] = useState(false);

  const state = externalState ?? internalState;
  const audioLevel = externalAudioLevel ?? internalAudioLevel;
  const isTunnel = tunnelMode ?? internalTunnelMode;

  // Get profile visual params with defaults + validation
  const _rawStops = profile?.gradientStops ?? ['200 80% 50%', '220 70% 55%', '180 75% 60%'];
  const gradientStops = _rawStops.length >= 3 ? _rawStops : ['200 80% 50%', '220 70% 55%', '180 75% 60%'];
  const gradientMode = profile?.gradientMode ?? 'vertical';
  const materialType = profile?.materialType ?? 'glass';
  const _rawParams = profile?.materialParams ?? { metalness: 0.1, roughness: 0.4, clearcoat: 0.3, transmission: 0.2, ior: 1.5, emissiveIntensity: 0.3 };
  // Clamp emissiveIntensity — minimum 0.25 so the orb is always visibly bright
  const materialParams = { ..._rawParams, emissiveIntensity: Math.max(0.25, _rawParams.emissiveIntensity ?? 0.3) };
  const patternType = profile?.patternType ?? 'fractal';
  const patternIntensity = Math.max(0, Math.min(1, profile?.patternIntensity ?? 0.4));
  const chromaShift = Math.max(0, Math.min(0.8, profile?.chromaShift ?? 0.1));
  const rimLightColor = normalizeHsl(profile?.rimLightColor ?? '40 80% 65%');
  const bloomStrength = Math.max(0, Math.min(1.5, profile?.bloomStrength ?? 0.4));

  const geometryDetail = Math.round(Math.max(2, Math.min(6, profile?.geometryDetail ?? 4)));
  const morphIntensity = Math.max(0.15, Math.min(0.95, (profile?.morphIntensity ?? 0.4) * 1.3));
  const morphSpeed = profile?.morphSpeed ?? 1.0;
  const fractalOctaves = Math.max(2, Math.min(6, profile?.fractalOctaves ?? 4));
  const textureType = profile?.textureType ?? 'flowing';

  // Store animation params in refs so the animation loop doesn't restart on every profile transition frame
  const morphIntensityRef = useRef(morphIntensity);
  const morphSpeedRef = useRef(morphSpeed);
  const fractalOctavesRef = useRef(fractalOctaves);
  const textureTypeRef = useRef(textureType);
  const stateRef = useRef(state);
  const audioLevelRef = useRef(audioLevel);
  const isTunnelRef = useRef(isTunnel);

  useEffect(() => { morphIntensityRef.current = morphIntensity; }, [morphIntensity]);
  useEffect(() => { morphSpeedRef.current = morphSpeed; }, [morphSpeed]);
  useEffect(() => { fractalOctavesRef.current = fractalOctaves; }, [fractalOctaves]);
  useEffect(() => { textureTypeRef.current = textureType; }, [textureType]);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { audioLevelRef.current = audioLevel; }, [audioLevel]);
  useEffect(() => { isTunnelRef.current = isTunnel; }, [isTunnel]);

  const activePalette = useMemo((): ColorPalette => {
    if (profile?.primaryColor) {
      return {
        id: 'custom', name: 'Custom',
        primary: profile.primaryColor,
        secondary: profile.secondaryColors?.[0] || profile.primaryColor,
        accent: profile.accentColor || profile.primaryColor,
        glow: profile.accentColor || profile.primaryColor,
        gradient: [profile.primaryColor, profile.secondaryColors?.[0] || profile.primaryColor, profile.accentColor || profile.primaryColor],
      };
    }
    if (themeColors) {
      return {
        id: 'theme', name: 'Theme',
        primary: themeColors.primary.replace('hsl(', '').replace(')', '').replace(/,/g, ' ').replace(/%/g, '%'),
        secondary: themeColors.secondary.replace('hsl(', '').replace(')', '').replace(/,/g, ' ').replace(/%/g, '%'),
        accent: themeColors.accent.replace('hsl(', '').replace(')', '').replace(/,/g, ' ').replace(/%/g, '%'),
        glow: themeColors.glow.replace('hsl(', '').replace(')', '').replace(/,/g, ' ').replace(/%/g, '%'),
        gradient: [themeColors.primary, themeColors.secondary, themeColors.accent],
      };
    }
    return COLOR_PALETTES.explorer;
  }, [profile, themeColors]);

  const activeMorphology = useMemo(() => getMorphology(activePalette.id), [activePalette.id]);
  const activeMorphologyRef = useRef(activeMorphology);
  useEffect(() => { activeMorphologyRef.current = activeMorphology; }, [activeMorphology]);
  const geometryTypes = useMemo(() => getGeometryFromProfile(profile), [profile?.geometryFamily]);

  useImperativeHandle(ref, () => ({
    setSpeaking: (speaking: boolean) => setInternalState(speaking ? 'speaking' : 'idle'),
    setListening: (listening: boolean) => setInternalState(listening ? 'listening' : 'idle'),
    setThinking: (thinking: boolean) => setInternalState(thinking ? 'thinking' : 'idle'),
    updateState: setInternalState,
    setAudioLevel: setInternalAudioLevel,
    setTunnelMode: setInternalTunnelMode,
  }), []);

  // Convert gradient mode string to int for shader
  const gradientModeInt = gradientMode === 'vertical' ? 0 : gradientMode === 'radial' ? 1 : gradientMode === 'noise' ? 2 : 3;
  const materialTypeInt = materialType === 'wire' ? 0 : materialType === 'metal' ? 1 : materialType === 'glass' ? 2 : materialType === 'plasma' ? 3 : 4;
  const patternTypeInt = patternType === 'voronoi' ? 0 : patternType === 'cellular' ? 1 : patternType === 'fractal' ? 2 : patternType === 'shards' ? 3 : patternType === 'swirl' ? 4 : 5;

  // Parse gradient stops to vec3 array
  const gradientColorVecs = useMemo(() => {
    const colors: THREE.Vector3[] = [];
    for (let i = 0; i < 7; i++) {
      if (i < gradientStops.length) {
        colors.push(parseHslToVec3(gradientStops[i]));
      } else {
        colors.push(colors.length > 0 ? colors[colors.length - 1].clone() : new THREE.Vector3(0.5, 0.5, 0.5));
      }
    }
    return colors;
  }, [gradientStops]);

  // ===== INIT SCENE =====
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 2.2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // CRITICAL: Use LinearSRGBColorSpace so our shader's sRGB output isn't double-gamma-encoded
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(1, 1, 1);
    scene.add(ambient);
    scene.add(dirLight);

    // === SOLID MESH with ShaderMaterial ===
    const outerGeo = createGeometry(geometryTypes.outer, 0.45, geometryDetail);
    // Ensure normals are computed
    outerGeo.computeVertexNormals();

    const rimVec = parseHslToVec3(rimLightColor);

    const shaderMat = new THREE.ShaderMaterial({
      vertexShader: ORB_VERTEX_SHADER,
      fragmentShader: ORB_FRAGMENT_SHADER,
      uniforms: {
        u_colors: { value: gradientColorVecs },
        u_colorCount: { value: Math.min(gradientStops.length, 7) },
        u_gradientMode: { value: gradientModeInt },
        u_materialType: { value: materialTypeInt },
        u_patternType: { value: patternTypeInt },
        u_patternIntensity: { value: patternIntensity },
        u_chromaShift: { value: chromaShift },
        u_time: { value: 0 },
        u_rimLightColor: { value: rimVec },
        u_emissiveIntensity: { value: materialParams.emissiveIntensity },
        u_metalness: { value: materialParams.metalness },
        u_roughness: { value: materialParams.roughness },
        u_transmission: { value: materialParams.transmission },
      },
      transparent: true,
      side: THREE.FrontSide,
    });
    shaderMatRef.current = shaderMat;

    const solidMesh = new THREE.Mesh(outerGeo, shaderMat);
    const fitScale = size <= 120 ? 0.92 : size <= 200 ? 0.95 : 1.0;
    fitScaleRef.current = fitScale;
    solidMesh.scale.setScalar(fitScale);
    scene.add(solidMesh);
    solidMeshRef.current = solidMesh;

    // Store base positions for morphing
    basePositionsRef.current = outerGeo.attributes.position.array.slice() as Float32Array;

    // === WIREFRAME OVERLAY (subtle, 20% opacity) ===
    const wireGeo = new THREE.WireframeGeometry(outerGeo);
    const wireMat = new THREE.ShaderMaterial({
      vertexShader: WIRE_OVERLAY_VERTEX,
      fragmentShader: WIRE_OVERLAY_FRAGMENT,
      uniforms: {
        u_wireColor: { value: parseHslToVec3(activePalette.accent) },
        u_wireOpacity: { value: 0.15 },
      },
      transparent: true,
      depthWrite: false,
    });
    const wireOverlay = new THREE.LineSegments(wireGeo, wireMat);
    wireOverlay.scale.setScalar(fitScale);
    scene.add(wireOverlay);
    wireOverlayRef.current = wireOverlay;

    // Signal uniform update effect to re-run with current values
    setSceneVersion(v => v + 1);
    onReady?.();

    // Start initial render loop immediately (don't wait for sceneVersion state update)
    const initialFrame = requestAnimationFrame(function initialRender() {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    });

    return () => {
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      solidMesh.geometry.dispose();
      shaderMat.dispose();
      wireOverlay.geometry.dispose();
      wireMat.dispose();
      ambient.dispose();
      dirLight.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [size, geometryDetail, geometryTypes.outer]);

  // Update shader uniforms when profile changes
  useEffect(() => {
    const mat = shaderMatRef.current;
    if (!mat) return;
    mat.uniforms.u_colors.value = gradientColorVecs;
    mat.uniforms.u_colorCount.value = Math.min(gradientStops.length, 7);
    mat.uniforms.u_gradientMode.value = gradientModeInt;
    mat.uniforms.u_materialType.value = materialTypeInt;
    mat.uniforms.u_patternType.value = patternTypeInt;
    mat.uniforms.u_patternIntensity.value = patternIntensity;
    mat.uniforms.u_chromaShift.value = chromaShift;
    mat.uniforms.u_rimLightColor.value = parseHslToVec3(rimLightColor);
    mat.uniforms.u_emissiveIntensity.value = materialParams.emissiveIntensity;
    mat.uniforms.u_metalness.value = materialParams.metalness;
    mat.uniforms.u_roughness.value = materialParams.roughness;
    mat.uniforms.u_transmission.value = materialParams.transmission;

    // Update wire overlay color
    if (wireOverlayRef.current) {
      const wireMat = wireOverlayRef.current.material as THREE.ShaderMaterial;
      wireMat.uniforms.u_wireColor.value = parseHslToVec3(activePalette.accent);
    }
  }, [sceneVersion, gradientColorVecs, gradientModeInt, materialTypeInt, patternTypeInt, patternIntensity, chromaShift, rimLightColor, materialParams, activePalette.accent]);

  // ===== ANIMATION LOOP =====
  // Only depends on sceneVersion — all other params are read from refs to avoid restart-flicker
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !solidMeshRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const solidMesh = solidMeshRef.current;
    const wireOverlay = wireOverlayRef.current;
    const basePositions = basePositionsRef.current;
    const shaderMat = shaderMatRef.current;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      // Read current values from refs (no effect restart needed)
      const curMorphSpeed = morphSpeedRef.current;
      const curMorphIntensity = morphIntensityRef.current;
      const curFractalOctaves = fractalOctavesRef.current;
      const curTextureType = textureTypeRef.current;
      const curState = stateRef.current;
      const curAudioLevel = audioLevelRef.current;
      const curIsTunnel = isTunnelRef.current;
      const curMorphology = activeMorphologyRef.current;
      
      timeRef.current += 0.012 * curMorphSpeed;
      morphPhaseRef.current += 0.005 * curMorphSpeed;

      const time = timeRef.current;
      const morphPhase = morphPhaseRef.current;

      // Update shader time
      if (shaderMat) shaderMat.uniforms.u_time.value = time;

      const stateModifier = {
        idle: { rotMod: 1, morphMod: 1.2, pulseMod: 1 },
        listening: { rotMod: 2, morphMod: 1.8, pulseMod: 1.5 },
        speaking: { rotMod: 3.5, morphMod: 2.5, pulseMod: 2.2 },
        thinking: { rotMod: 4, morphMod: 2.2, pulseMod: 2.0 },
        session: { rotMod: 1.8, morphMod: 1.5, pulseMod: 1.4 },
        breathing: { rotMod: 0.6, morphMod: 2.0, pulseMod: 0.7 },
      }[curState];
      const { rotMod, morphMod, pulseMod } = stateModifier;

      // ===== MORPH DEFORMATION =====
      if (basePositions) {
        const positions = solidMesh.geometry.attributes.position;
        
        let noiseFreq = 2.5, noiseSharp = 1.0, waveScale = 1.0;
        switch (curTextureType) {
          case 'crystalline': noiseFreq = 4.0; noiseSharp = 1.5; break;
          case 'ethereal': noiseFreq = 1.8; noiseSharp = 0.6; waveScale = 1.3; break;
          case 'electric': noiseFreq = 3.5; noiseSharp = 2.0; break;
          case 'plasma': noiseFreq = 2.0; noiseSharp = 0.8; waveScale = 1.5; break;
          case 'nebula': noiseFreq = 1.5; noiseSharp = 0.5; waveScale = 1.2; break;
          default: break;
        }
        
        for (let i = 0; i < positions.count; i++) {
          const baseX = basePositions[i * 3];
          const baseY = basePositions[i * 3 + 1];
          const baseZ = basePositions[i * 3 + 2];
          const dist = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
          if (dist === 0) continue;
          const nx = baseX / dist, ny = baseY / dist, nz = baseZ / dist;

          let noiseVal = fbm(nx * noiseFreq + morphPhase * 0.6, ny * noiseFreq + morphPhase * 0.4, nz * noiseFreq + morphPhase * 0.8, curFractalOctaves);
          if (noiseSharp > 1.2) noiseVal = Math.sign(noiseVal) * Math.pow(Math.abs(noiseVal), 1 / noiseSharp);

          const wave1 = Math.sin(ny * 5 + time * 2.5) * Math.cos(nx * 4 + time * 2) * 0.02 * waveScale;
          const wave2 = Math.sin(nz * 3 + time * 1.8) * Math.cos(ny * 2.5 + time * 1.2) * 0.015 * waveScale;
          const wave3 = Math.sin((nx + ny) * 4 + time * 3) * 0.01 * waveScale;
          const pulse1 = Math.sin(time * pulseMod + dist * 4) * 0.01;
          const pulse2 = Math.sin(time * pulseMod * 0.7 + dist * 2) * 0.005;
          const audioBoost = curAudioLevel * 0.08;

          const deform = noiseVal * curMorphIntensity * morphMod * 0.06 + wave1 + wave2 + wave3 + pulse1 + pulse2 + audioBoost;

          positions.setXYZ(i, baseX + nx * deform, baseY + ny * deform, baseZ + nz * deform);
        }
        positions.needsUpdate = true;
        solidMesh.geometry.computeVertexNormals();

        // Sync wireframe overlay positions
        if (wireOverlay) {
          wireOverlay.rotation.copy(solidMesh.rotation);
          wireOverlay.scale.copy(solidMesh.scale);
        }
      }

      // Rotation
      const rotAxis = curMorphology.rotationAxis;
      solidMesh.rotation.y += 0.003 * rotMod;
      if (rotAxis === 'x' || rotAxis === 'diagonal') solidMesh.rotation.x += 0.002 * rotMod;
      if (rotAxis === 'z' || rotAxis === 'diagonal') solidMesh.rotation.z += 0.001 * rotMod;
      if (rotAxis === 'wobble') {
        solidMesh.rotation.x = Math.sin(time * 0.5) * 0.15;
        solidMesh.rotation.z = Math.cos(time * 0.4) * 0.12;
      }

      // Camera
      if (curIsTunnel) {
        camera.position.z = 1.8 + Math.sin(time * 0.5) * 0.3;
        solidMesh.rotation.z += 0.015;
      } else {
        camera.position.z = 2.2;
      }

      renderer.render(scene, camera);
    };

    animate();
    return () => { cancelAnimationFrame(frameRef.current); };
  }, [sceneVersion]);

  // Resize
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setSize(size, size);
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size, background: 'transparent', overflow: 'visible' }}
    />
  );
});

export default WebGLOrb;

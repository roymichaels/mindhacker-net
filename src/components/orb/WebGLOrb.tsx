import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import type { OrbRef, OrbProps, OrbState } from './types';
import { getEgoStateColors } from '@/lib/egoStates';

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

export const WebGLOrb = forwardRef<OrbRef, OrbProps>(function WebGLOrb(
  { size = 300, state: externalState, audioLevel: externalAudioLevel, tunnelMode, egoState = 'guardian', className, onReady },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const [internalState, setInternalState] = useState<OrbState>('idle');
  const [internalAudioLevel, setInternalAudioLevel] = useState(0);
  const [internalTunnelMode, setInternalTunnelMode] = useState(false);

  const state = externalState ?? internalState;
  const audioLevel = externalAudioLevel ?? internalAudioLevel;
  const isTunnel = tunnelMode ?? internalTunnelMode;

  const colors = getEgoStateColors(egoState);

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
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2;
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

    // Geometry - Icosahedron for organic shape
    const geometry = new THREE.IcosahedronGeometry(1, 4);
    
    // Material - Wireframe with glow
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colors.primary),
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Inner glow sphere
    const glowGeometry = new THREE.SphereGeometry(0.9, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colors.glow),
      transparent: true,
      opacity: 0.3,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);

    onReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, colors.primary, colors.glow, onReady]);

  // Update colors when egoState changes
  useEffect(() => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.color.set(colors.primary);
  }, [colors.primary]);

  // Animation loop
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !meshRef.current) return;

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mesh = meshRef.current;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      const time = timeRef.current;

      // State-based animation speeds
      const rotationSpeed = {
        idle: 0.002,
        listening: 0.004,
        speaking: 0.006,
        thinking: 0.008,
        session: 0.003,
        breathing: 0.002,
      }[state];

      // Rotation
      mesh.rotation.x += rotationSpeed;
      mesh.rotation.y += rotationSpeed * 1.3;

      // Audio-reactive scaling
      const baseScale = 1;
      const audioScale = 1 + audioLevel * 0.2;
      const breathScale = state === 'breathing' ? 1 + Math.sin(time * 2) * 0.05 : 1;
      const targetScale = baseScale * audioScale * breathScale;

      mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      // Morphing vertices for organic feel
      const positions = mesh.geometry.attributes.position;
      const originalPositions = mesh.geometry.attributes.position.clone();
      
      for (let i = 0; i < positions.count; i++) {
        const x = originalPositions.getX(i);
        const y = originalPositions.getY(i);
        const z = originalPositions.getZ(i);
        
        const noise = Math.sin(x * 2 + time) * Math.cos(y * 2 + time) * 0.05 * (1 + audioLevel);
        
        positions.setXYZ(
          i,
          x + x * noise,
          y + y * noise,
          z + z * noise
        );
      }
      positions.needsUpdate = true;

      // Tunnel mode - camera moves forward
      if (isTunnel) {
        camera.position.z = 2 + Math.sin(time * 0.5) * 0.3;
        mesh.rotation.z += 0.01;
      } else {
        camera.position.z = 2;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [state, audioLevel, isTunnel]);

  // Resize handling
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;
    rendererRef.current.setSize(size, size);
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
});

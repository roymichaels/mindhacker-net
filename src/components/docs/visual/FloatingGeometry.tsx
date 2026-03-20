import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  position?: [number, number, number];
  color?: string;
  speed?: number;
  scale?: number;
  shape?: 'icosahedron' | 'torus' | 'octahedron';
}

export function FloatingGeometry({
  position = [0, 0, 0],
  color = '#8b5cf6',
  speed = 0.3,
  scale = 1,
  shape = 'icosahedron',
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = Math.sin(t * speed) * 0.3;
    meshRef.current.rotation.y = t * speed * 0.5;
    meshRef.current.position.y = position[1] + Math.sin(t * speed * 0.7) * 0.3;
  });

  const geometry =
    shape === 'torus' ? (
      <torusGeometry args={[0.8, 0.3, 16, 32]} />
    ) : shape === 'octahedron' ? (
      <octahedronGeometry args={[1, 0]} />
    ) : (
      <icosahedronGeometry args={[1, 1]} />
    );

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {geometry}
      <MeshDistortMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        distort={0.2}
        speed={2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

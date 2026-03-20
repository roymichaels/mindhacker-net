import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  count?: number;
  color?: string;
  scrollProgress?: number;
}

export function ParticleField({ count = 600, color = '#8b5cf6', scrollProgress = 0 }: Props) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      spd[i] = 0.2 + Math.random() * 0.8;
    }
    return [pos, spd];
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * speeds[i] * 0.3;
      arr[i * 3] += Math.sin(Date.now() * 0.0003 + i) * delta * 0.05;
      if (arr[i * 3 + 1] > 15) arr[i * 3 + 1] = -15;
    }
    posAttr.needsUpdate = true;
    meshRef.current.rotation.y += delta * 0.02;
    meshRef.current.rotation.y += scrollProgress * 0.001;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function BrainModel() {
  const { scene } = useGLTF("/brain_hologram.glb");
  const meshRef = useRef<THREE.Group>(null);

  // Apply cyber-glow material effect
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("hsl(186, 100%, 50%)"), // primary color
        emissive: new THREE.Color("hsl(186, 100%, 50%)"),
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
      });
    }
  });

  // Smooth rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return <primitive ref={meshRef} object={scene} scale={2.5} />;
}

interface Brain3DModelProps {
  className?: string;
}

const Brain3DModel = ({ className }: Brain3DModelProps) => {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        className="cursor-pointer w-full h-full"
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        
        {/* Lighting for cyber aesthetic */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00f0ff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00f0ff" />
        <pointLight position={[0, 0, 10]} intensity={1} color="#00f0ff" />

        <Suspense fallback={null}>
          <BrainModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Brain3DModel;

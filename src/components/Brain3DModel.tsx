import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";

function Particles({ count = 100 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Create particles in a spherical distribution around the brain
      // Slightly flattened at top to prevent cutoff
      const radius = 2.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.85; // Reduced from full PI to flatten top
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      // Rotate particles around the brain
      points.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      points.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      
      // Pulse effect
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      points.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00f0ff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function BrainModel({ isMobile }: { isMobile: boolean }) {
  const { scene } = useGLTF("/brain_hologram.glb");
  const meshRef = useRef<THREE.Group>(null);

  // Apply cyber-glow material effect (only once)
  if (!scene.userData.materialsSet) {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("hsl(186, 100%, 50%)"),
          emissive: new THREE.Color("hsl(186, 100%, 50%)"),
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2,
        });
      }
    });
    scene.userData.materialsSet = true;
  }

  // Smooth continuous rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5; // Smooth consistent rotation
      if (!isMobile) {
        meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.15;
      }
    }
  });

  return <primitive ref={meshRef} object={scene} scale={isMobile ? 4.2 : 5.5} />;
}

// Preload the model
useGLTF.preload("/brain_hologram.glb");

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

interface Brain3DModelProps {
  className?: string;
  style?: React.CSSProperties;
}

const Brain3DModel = ({ className, style }: Brain3DModelProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={className} style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          className="cursor-pointer w-full h-full"
          gl={{ 
            alpha: true, 
            antialias: !isMobile, // Disable antialiasing on mobile for performance
            powerPreference: "high-performance"
          }}
          dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower DPR on mobile
          style={{ background: 'transparent' }}
          frameloop="always" // Continuous rendering for smooth animation
        >
          <PerspectiveCamera makeDefault position={[0, -1.5, 5.5]} fov={75} />
          
          {/* Simplified lighting for better performance */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#00f0ff" />
          {!isMobile && <pointLight position={[0, 0, 10]} intensity={0.8} color="#00f0ff" />}

          <BrainModel isMobile={isMobile} />
          {!isMobile && <Particles count={150} />}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Brain3DModel;

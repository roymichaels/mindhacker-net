import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Brain } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

  // Smooth rotation animation with reduced complexity on mobile
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      if (!isMobile) {
        meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
      }
    }
  });

  return <primitive ref={meshRef} object={scene} scale={isMobile ? 1.2 : 1.5} />;
}

// Preload the model
useGLTF.preload("/brain_hologram.glb");

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Brain className="w-full h-full text-primary cyber-glow animate-pulse" />
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
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
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
          frameloop="demand" // Only render when needed
        >
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          {/* Simplified lighting for better performance */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#00f0ff" />
          {!isMobile && <pointLight position={[0, 0, 10]} intensity={0.8} color="#00f0ff" />}

          <BrainModel isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Brain3DModel;

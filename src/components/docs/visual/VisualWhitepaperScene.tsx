import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';
import { FloatingGeometry } from './FloatingGeometry';

const SECTION_COLORS = [
  '#8b5cf6', '#06b6d4', '#3b82f6', '#ec4899',
  '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4',
  '#3b82f6', '#ec4899', '#f59e0b',
];

interface Props {
  currentSection: number;
  scrollProgress: number;
}

export function VisualWhitepaperScene({ currentSection, scrollProgress }: Props) {
  const color = SECTION_COLORS[currentSection % SECTION_COLORS.length];

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={0.4} color={color} />
        <pointLight position={[-5, -3, 3]} intensity={0.2} color="#06b6d4" />

        <ParticleField count={400} color={color} scrollProgress={scrollProgress} />

        <FloatingGeometry
          position={[-4, 2, -3]}
          color={color}
          speed={0.2}
          scale={0.6}
          shape="icosahedron"
        />
        <FloatingGeometry
          position={[4, -1, -4]}
          color="#06b6d4"
          speed={0.15}
          scale={0.4}
          shape="torus"
        />
        <FloatingGeometry
          position={[0, 3, -5]}
          color="#3b82f6"
          speed={0.25}
          scale={0.5}
          shape="octahedron"
        />
      </Canvas>
    </div>
  );
}

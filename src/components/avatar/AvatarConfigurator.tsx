/**
 * AvatarConfigurator — Canvas + postprocessing + UI overlay.
 * Ported from original App.jsx. Leva removed.
 */

import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect } from "react";
import { DEFAULT_CAMERA_POSITION } from "./CameraManager";
import { AvatarExperience } from "./Experience";
import { AvatarConfiguratorUI } from "./AvatarConfiguratorUI";
import { useConfiguratorStore } from "./avatarStore";

interface AvatarConfiguratorProps {
  onSave?: () => void;
  showSaveButton?: boolean;
}

export const AvatarConfigurator = ({ onSave, showSaveButton }: AvatarConfiguratorProps) => {
  const initializeCategories = useConfiguratorStore((state) => state.initializeCategories);
  const loading = useConfiguratorStore((state) => state.loading);

  useEffect(() => {
    if (loading) {
      initializeCategories();
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <AvatarConfiguratorUI onSave={onSave} showSaveButton={showSaveButton} />
      <Canvas
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          fov: 45,
        }}
        gl={{
          preserveDrawingBuffer: true,
        }}
        shadows
      >
        <color attach="background" args={["#130f30"]} />
        <fog attach="fog" args={["#130f30", 10, 40]} />
        <group position-y={-1}>
          <AvatarExperience />
        </group>
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={1.2} intensity={1.2} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

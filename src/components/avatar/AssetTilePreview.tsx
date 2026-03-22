import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import type { AvatarCategory } from "./avatarAssets";

type Vec3 = [number, number, number];

interface AssetTilePreviewProps {
  assetUrl: string;
  category: AvatarCategory;
  assetColor?: string;
  skinColor?: string;
}

const PreviewCamera = ({ target }: { target: Vec3 }) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(target[0], target[1], target[2]);
  }, [camera, target]);

  return null;
};

const AssetPreviewModel = ({
  assetUrl,
  assetColor,
  skinColor,
}: {
  assetUrl: string;
  assetColor?: string;
  skinColor?: string;
}) => {
  const { scene } = useGLTF(assetUrl);
  const previewScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    previewScene.traverse((child: any) => {
      if (!child.isMesh) return;

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material: any) => {
          const cloned = material.clone();
          if (cloned.name?.includes("Color_") && assetColor) {
            cloned.color?.set(assetColor);
          }
          if (cloned.name?.includes("Skin_") && skinColor) {
            cloned.color?.set(skinColor);
          }
          return cloned;
        });
      } else if (child.material) {
        const cloned = child.material.clone();
        if (cloned.name?.includes("Color_") && assetColor) {
          cloned.color?.set(assetColor);
        }
        if (cloned.name?.includes("Skin_") && skinColor) {
          cloned.color?.set(skinColor);
        }
        child.material = cloned;
      }

      child.castShadow = false;
      child.receiveShadow = false;
    });
  }, [previewScene, assetColor, skinColor]);

  return (
    <Center>
      <primitive
        object={previewScene}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
      />
    </Center>
  );
};

export const AssetTilePreview = ({
  assetUrl,
  category,
  assetColor,
  skinColor,
}: AssetTilePreviewProps) => {
  const cameraPosition: Vec3 = category.cameraPlacement?.position || [0, 0.8, 2.3];
  const cameraTarget: Vec3 = category.cameraPlacement?.target || [0, 0.6, 0];

  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas
        dpr={[1, 1]}
        frameloop="demand"
        camera={{
          position: cameraPosition,
          fov: 42,
        }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 5, 4]} intensity={1.2} />
        <directionalLight position={[-3, 3, -2]} intensity={0.4} />
        <PreviewCamera target={cameraTarget} />
        <Suspense fallback={null}>
          <AssetPreviewModel
            assetUrl={assetUrl}
            assetColor={assetColor}
            skinColor={skinColor}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

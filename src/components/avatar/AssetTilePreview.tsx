import { useGLTF } from "@react-three/drei";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Box3, Vector3 } from "three";
import type { AvatarCategory } from "./avatarAssets";

interface AssetTilePreviewProps {
  assetUrl: string;
  category: AvatarCategory;
  assetColor?: string;
  skinColor?: string;
}

const AutoCenterCamera = () => {
  const { camera, scene } = useThree();
  const fitted = useRef(false);

  useFrame(() => {
    if (fitted.current) return;
    const box = new Box3().setFromObject(scene);
    if (box.isEmpty()) return;

    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;

    const fov = (camera as any).fov * (Math.PI / 180);
    const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.4;

    camera.position.set(center.x, center.y, center.z + dist);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    fitted.current = true;
  });

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
        child.material = child.material.map((m: any) => {
          const c = m.clone();
          if (c.name?.includes("Color_") && assetColor) c.color?.set(assetColor);
          if (c.name?.includes("Skin_") && skinColor) c.color?.set(skinColor);
          return c;
        });
      } else if (child.material) {
        const c = child.material.clone();
        if (c.name?.includes("Color_") && assetColor) c.color?.set(assetColor);
        if (c.name?.includes("Skin_") && skinColor) c.color?.set(skinColor);
        child.material = c;
      }
      child.castShadow = false;
      child.receiveShadow = false;
    });
  }, [previewScene, assetColor, skinColor]);

  return (
    <primitive
      object={previewScene}
      rotation={[Math.PI / 2, 0, 0]}
      scale={0.01}
    />
  );
};

export const AssetTilePreview = ({
  assetUrl,
  assetColor,
  skinColor,
}: AssetTilePreviewProps) => {
  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas
        dpr={[1, 1]}
        frameloop="always"
        camera={{ fov: 40, near: 0.01, far: 100, position: [0, 0, 3] }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 5, 4]} intensity={1.2} />
        <directionalLight position={[-3, 3, -2]} intensity={0.4} />
        <AutoCenterCamera />
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

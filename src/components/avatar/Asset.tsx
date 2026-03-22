/**
 * Asset — Individual skinned mesh with color/skin material support.
 * Exact port from original project.
 */

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useConfiguratorStore } from "./avatarStore";
import type { Skeleton } from "three";

interface AssetProps {
  url: string;
  categoryName: string;
  skeleton: Skeleton;
}

export const Asset = ({ url, categoryName, skeleton }: AssetProps) => {
  const { scene } = useGLTF(url);
  const customization = useConfiguratorStore((state) => state.customization);
  const lockedGroups = useConfiguratorStore((state) => state.lockedGroups);
  const assetColor = customization[categoryName]?.color;
  const skin = useConfiguratorStore((state) => state.skin);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.material?.name.includes("Color_")) {
          child.material.color.set(assetColor);
        }
      }
    });
  }, [assetColor, scene]);

  const attachedItems = useMemo(() => {
    const items: any[] = [];
    scene.traverse((child: any) => {
      if (child.isMesh) {
        items.push({
          geometry: child.geometry,
          material: child.material.name.includes("Skin_")
            ? skin
            : child.material,
          morphTargetDictionary: child.morphTargetDictionary,
          morphTargetInfluences: child.morphTargetInfluences,
        });
      }
    });
    return items;
  }, [scene, skin]);

  if (lockedGroups[categoryName]) {
    return null;
  }

  return (
    <>
      {attachedItems.map((item, index) => (
        <skinnedMesh
          key={index}
          geometry={item.geometry}
          material={item.material}
          skeleton={skeleton}
          morphTargetDictionary={item.morphTargetDictionary}
          morphTargetInfluences={item.morphTargetInfluences}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
};

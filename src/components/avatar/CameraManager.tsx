/**
 * CameraManager — Camera controls with category-based placement.
 * Ported from original, leva debug controls removed.
 */

import { CameraControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useConfiguratorStore } from "./avatarStore";

export const START_CAMERA_POSITION: [number, number, number] = [500, 10, 1000];
export const DEFAULT_CAMERA_POSITION: [number, number, number] = [-1, 1, 5];
export const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, 0, 0];

interface CameraManagerProps {
  loading: boolean;
}

export const CameraManager = ({ loading }: CameraManagerProps) => {
  const controls = useRef<any>();
  const currentCategory = useConfiguratorStore((state) => state.currentCategory);
  const initialLoading = useConfiguratorStore((state) => state.loading);

  useEffect(() => {
    if (!controls.current) return;

    if (initialLoading) {
      controls.current.setLookAt(
        ...START_CAMERA_POSITION,
        ...DEFAULT_CAMERA_TARGET
      );
    } else if (!loading && currentCategory?.cameraPlacement) {
      controls.current.setLookAt(
        ...currentCategory.cameraPlacement.position,
        ...currentCategory.cameraPlacement.target,
        true
      );
    } else {
      controls.current.setLookAt(
        ...DEFAULT_CAMERA_POSITION,
        ...DEFAULT_CAMERA_TARGET,
        true
      );
    }
  }, [currentCategory, initialLoading, loading]);

  return (
    <CameraControls
      ref={controls}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2}
      minDistance={2}
      maxDistance={8}
    />
  );
};

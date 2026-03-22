/**
 * AvatarModel — Armature + skinned mesh rendering.
 * Ported from Avatar.jsx, GLB export logic removed.
 */

import { useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import { useConfiguratorStore } from "./avatarStore";
import { Asset } from "./Asset";
import type { Group } from "three";

export const AvatarModel = (props: any) => {
  const group = useRef<Group>(null);
  const { nodes } = useGLTF("/models/Armature.glb") as any;
  const { animations } = useGLTF("/models/Poses.glb") as any;
  const customization = useConfiguratorStore((state) => state.customization);
  const { actions } = useAnimations(animations, group);
  const pose = useConfiguratorStore((state) => state.pose);

  useEffect(() => {
    actions[pose]?.fadeIn(0.2).play();
    return () => {
      actions[pose]?.fadeOut(0.2).stop();
    };
  }, [actions, pose]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          {Object.keys(customization).map(
            (key) =>
              customization[key]?.asset?.url && (
                <Suspense key={customization[key].asset!.id}>
                  <Asset
                    categoryName={key}
                    url={customization[key].asset!.url}
                    skeleton={nodes.Plane.skeleton}
                  />
                </Suspense>
              )
          )}
        </group>
      </group>
    </group>
  );
};

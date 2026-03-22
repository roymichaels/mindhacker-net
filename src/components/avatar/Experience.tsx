/**
 * Experience — 3D scene with lights, shadows, environment.
 * Ported from original, screenshot/wawasensei branding removed.
 */

import { animated, useSpring } from "@react-spring/three";
import {
  Environment,
  Float,
  Gltf,
  SoftShadows,
  useProgress,
} from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useConfiguratorStore } from "./avatarStore";
import { AvatarModel } from "./AvatarModel";
import { CameraManager } from "./CameraManager";
import { LoadingAvatar } from "./LoadingAvatar";

export const AvatarExperience = () => {
  const { active } = useProgress();
  const [loading, setLoading] = useState(active);
  const setLoadingAt = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (active) {
      timeout = setTimeout(() => {
        setLoading(true);
        setLoadingAt.current = Date.now();
      }, 50);
    } else {
      timeout = setTimeout(() => {
        setLoading(false);
      }, Math.max(0, 2000 - (Date.now() - setLoadingAt.current)));
    }
    return () => clearTimeout(timeout);
  }, [active]);

  const { scale, spin, floatHeight } = useSpring({
    scale: loading ? 0.5 : 1,
    spin: loading ? Math.PI * 8 : 0,
    floatHeight: loading ? 0.5 : 0,
  });

  return (
    <>
      <CameraManager loading={loading} />
      <Environment preset="sunset" environmentIntensity={0.3} />

      <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.31}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#333" roughness={0.85} />
      </mesh>

      <SoftShadows size={52} samples={16} focus={0.5} />

      {/* Key Light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      {/* Fill Light */}
      <directionalLight position={[-5, 5, 5]} intensity={0.7} />
      {/* Back Lights */}
      <directionalLight position={[3, 3, -5]} intensity={6} color="#ff3b3b" />
      <directionalLight position={[-3, 3, -5]} intensity={8} color="#3cb1ff" />

      <AvatarWrapper loading={loading}>
        <animated.group
          scale={scale}
          position-y={floatHeight}
          rotation-y={spin}
        >
          <AvatarModel />
        </animated.group>
      </AvatarWrapper>
      <Gltf
        position-y={-0.31}
        src="/models/Teleporter Base.glb"
        castShadow
        receiveShadow
      />
      <LoadingAvatar loading={loading} />
    </>
  );
};

const AvatarWrapper = ({ loading, children }: { loading: boolean; children: React.ReactNode }) => {
  return loading ? (
    <Float floatIntensity={1} speed={6}>
      {children}
    </Float>
  ) : (
    <>{children}</>
  );
};

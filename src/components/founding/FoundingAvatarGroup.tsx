/**
 * FoundingAvatarGroup — Shows 5 pre-generated random avatars with different poses
 * arranged as a group of friends. Uses a single Canvas with multiple avatar instances.
 */
import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, useGLTF, useAnimations } from '@react-three/drei';
import { AVATAR_CATEGORIES, type AvatarAsset } from '@/components/avatar/avatarAssets';
import { PHOTO_POSES } from '@/components/avatar/avatarStore';
import type { AvatarCustomizationData } from '@/hooks/useUserAvatarData';
import type { Group } from 'three';

/* ── Seeded random for deterministic avatars ── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ── Generate a random avatar customization from seed ── */
function generateRandomAvatar(seed: number): AvatarCustomizationData {
  const rng = seededRandom(seed);
  const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const data: AvatarCustomizationData = {};
  const essentialCategories = new Set(['Face', 'Top', 'Shoes', 'Eyes', 'Head', 'Bottom']);

  AVATAR_CATEGORIES.forEach((cat) => {
    if (cat.assets.length === 0) {
      const color = cat.colorPalette?.[randInt(0, (cat.colorPalette?.length || 1) - 1)] || '';
      data[cat.name] = { color };
      return;
    }

    const isEssential = essentialCategories.has(cat.name) || !cat.removable;
    const safeAssets = cat.assets.filter((a) => !a.lockedGroups?.length);
    let asset: AvatarAsset | null = (safeAssets.length ? safeAssets : cat.assets)[randInt(0, (safeAssets.length ? safeAssets : cat.assets).length - 1)];

    if (cat.removable && !isEssential && rng() < 0.3) {
      asset = null;
    }

    const color = cat.colorPalette
      ? cat.colorPalette[randInt(0, cat.colorPalette.length - 1)]
      : '';

    data[cat.name] = { assetId: asset?.id || undefined, color };
  });

  return data;
}

/* ── Lightweight skinned mesh asset ── */
function GroupAsset({ url, skeleton, color }: {
  url: string; skeleton: any; color?: string;
}) {
  const { scene } = useGLTF(url);

  const items = useMemo(() => {
    const result: any[] = [];
    scene.traverse((child: any) => {
      if (!child.isMesh) return;
      const mat = child.material?.clone?.() || child.material;
      if (color && mat?.name?.includes('Color_')) {
        mat.color.set(color);
      }
      result.push({
        geometry: child.geometry,
        material: mat,
        morphTargetDictionary: child.morphTargetDictionary,
        morphTargetInfluences: child.morphTargetInfluences,
      });
    });
    return result;
  }, [scene, color]);

  return (
    <>
      {items.map((item, i) => (
        <skinnedMesh
          key={i}
          geometry={item.geometry}
          material={item.material}
          skeleton={skeleton}
          morphTargetDictionary={item.morphTargetDictionary}
          morphTargetInfluences={item.morphTargetInfluences}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

/* ── Single Avatar in group scene ── */
function GroupAvatar({ avatarData, pose, position, scale = 0.72 }: {
  avatarData: AvatarCustomizationData;
  pose: string;
  position: [number, number, number];
  scale?: number;
}) {
  const group = useRef<Group>(null);
  const { scene: armatureScene } = useGLTF('/models/Armature.glb');
  const { animations } = useGLTF('/models/Poses.glb') as any;
  const { actions } = useAnimations(animations, group);

  // Clone the entire armature so each avatar gets its own skeleton instance
  const { hips, skeleton } = useMemo(() => {
    const cloned = armatureScene.clone(true);
    let skel: any = null;
    let hipsBone: any = null;
    cloned.traverse((child: any) => {
      if (child.name === 'mixamorigHips' && !hipsBone) hipsBone = child;
      if (child.isSkinnedMesh && child.skeleton && !skel) skel = child.skeleton;
    });
    return { hips: hipsBone, skeleton: skel };
  }, [armatureScene]);

  useEffect(() => {
    const action = actions[pose];
    if (action) {
      action.reset().fadeIn(0.3).play();
      return () => { action.fadeOut(0.3).stop(); };
    }
  }, [actions, pose]);

  const resolvedAssets = useMemo(() => {
    const result: { url: string; categoryName: string; color?: string }[] = [];
    AVATAR_CATEGORIES.forEach((cat) => {
      const saved = avatarData[cat.name];
      if (!saved?.assetId) return;
      const asset = cat.assets.find((a) => a.id === saved.assetId);
      if (!asset) return;
      result.push({ url: asset.url, categoryName: cat.name, color: saved.color });
    });
    return result;
  }, [avatarData]);

  if (!hips || !skeleton) return null;

  return (
    <group ref={group} position={position} scale={scale} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={hips} />
          {resolvedAssets.map((asset) => (
            <Suspense key={asset.url}>
              <GroupAsset
                url={asset.url}
                skeleton={skeleton}
                color={asset.color}
              />
            </Suspense>
          ))}
        </group>
      </group>
    </group>
  );
}

type AvatarGroupConfig = {
  seed: number;
  pose: string;
  position: [number, number, number];
  scale: number;
};

/* ── Group Scene with 5 avatars ── */
const AVATAR_CONFIGS: AvatarGroupConfig[] = [
  { seed: 42, pose: PHOTO_POSES.Cool, position: [-3.4, -1.2, 0], scale: 0.86 },
  { seed: 137, pose: PHOTO_POSES.Chill, position: [-1.7, -1.15, 0], scale: 0.9 },
  { seed: 314, pose: PHOTO_POSES.King, position: [0, -1.1, 0], scale: 0.95 },
  { seed: 528, pose: PHOTO_POSES.Ninja, position: [1.7, -1.15, 0], scale: 0.9 },
  { seed: 777, pose: PHOTO_POSES.Punch, position: [3.4, -1.2, 0], scale: 0.86 },
];

function GroupScene() {
  const avatars = useMemo(
    () => AVATAR_CONFIGS.map((cfg) => ({
      ...cfg,
      data: generateRandomAvatar(cfg.seed),
    })),
    []
  );

  return (
    <>
      {avatars.map((avatar, i) => (
        <Suspense key={i} fallback={null}>
          <GroupAvatar
            avatarData={avatar.data}
            pose={avatar.pose}
            position={avatar.position}
            scale={avatar.scale}
          />
        </Suspense>
      ))}
    </>
  );
}

/* ── Public Component ── */
export function FoundingAvatarGroup() {
  return (
    <div className="w-full" style={{ height: 290 }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0.1, 9],
          fov: 30,
          near: 0.1,
          far: 100,
        }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <directionalLight position={[-3, 5, -2]} intensity={0.4} />
        <pointLight position={[0, 3, 3]} intensity={0.5} color="#7c3aed" />
        <Bounds fit clip observe margin={1.22}>
          <Suspense fallback={null}>
            <GroupScene />
          </Suspense>
        </Bounds>
      </Canvas>
    </div>
  );
}

export default FoundingAvatarGroup;

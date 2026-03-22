/**
 * AvatarMiniPreview — renders saved avatar in a small Canvas.
 * Uses the same Armature + Asset pipeline as the full configurator
 * but with a static head-focused camera and no animations.
 * Falls back to a colored circle with initials when no avatar data exists.
 */
import { Suspense, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { cn } from '@/lib/utils';
import { useUserAvatarData, type AvatarCustomizationData } from '@/hooks/useUserAvatarData';
import { AVATAR_CATEGORIES } from '@/components/avatar/avatarAssets';
import type { Skeleton, Group } from 'three';
import { User } from 'lucide-react';

/* ── Lightweight Asset (no store dependency) ── */
function MiniAsset({ url, categoryName, skeleton, color, skinColor }: {
  url: string;
  categoryName: string;
  skeleton: Skeleton;
  color?: string;
  skinColor?: string;
}) {
  const { scene } = useGLTF(url);

  const items = useMemo(() => {
    const result: any[] = [];
    scene.traverse((child: any) => {
      if (!child.isMesh) return;
      // Clone material to avoid mutating the cached original
      const mat = child.material.clone();
      if (color && mat?.name?.includes('Color_')) {
        mat.color.set(color);
      }
      if (skinColor && mat?.name?.includes('Skin_')) {
        mat.color.set(skinColor);
      }
      result.push({
        geometry: child.geometry,
        material: mat,
        morphTargetDictionary: child.morphTargetDictionary,
        morphTargetInfluences: child.morphTargetInfluences,
      });
    });
    return result;
  }, [scene, color, skinColor]);

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
        />
      ))}
    </>
  );
}

/* ── Mini Avatar Scene ── */
function MiniAvatarScene({ avatarData }: { avatarData: AvatarCustomizationData }) {
  const group = useRef<Group>(null);
  const { nodes } = useGLTF('/models/Armature.glb') as any;

  const headSkinColor = avatarData.Head?.color;

  // Resolve assets from saved data
  const resolvedAssets = useMemo(() => {
    const result: { url: string; categoryName: string; color?: string }[] = [];
    AVATAR_CATEGORIES.forEach((cat) => {
      const saved = avatarData[cat.name];
      if (!saved?.assetId) return;
      const asset = cat.assets.find((a) => a.id === saved.assetId);
      if (!asset) return;
      result.push({
        url: asset.url,
        categoryName: cat.name,
        color: saved.color,
      });
    });
    return result;
  }, [avatarData]);

  return (
    <group ref={group} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          {resolvedAssets.map((asset) => (
            <Suspense key={asset.url}>
              <MiniAsset
                url={asset.url}
                categoryName={asset.categoryName}
                skeleton={nodes.Plane.skeleton}
                color={asset.color}
                skinColor={headSkinColor}
              />
            </Suspense>
          ))}
        </group>
      </group>
    </group>
  );
}

/* ── Public Component ── */
interface AvatarMiniPreviewProps {
  size?: number;
  className?: string;
  /** Override: provide data directly instead of loading from DB */
  avatarData?: AvatarCustomizationData | null;
}

export function AvatarMiniPreview({ size = 80, className, avatarData: overrideData }: AvatarMiniPreviewProps) {
  const { avatarData: dbData, hasAvatar, skinColor } = useUserAvatarData();
  const data = overrideData !== undefined ? overrideData : dbData;
  const hasData = overrideData !== undefined ? !!overrideData : hasAvatar;

  if (!hasData || !data) {
    // Fallback: colored circle with user icon
    return (
      <div
        className={cn(
          'rounded-full bg-muted flex items-center justify-center border border-border/50',
          className
        )}
        style={{ width: size, height: size }}
      >
        <User className="text-muted-foreground" style={{ width: size * 0.4, height: size * 0.4 }} />
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-full overflow-hidden', className)}
      style={{ width: size, height: size }}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        onCreated={({ camera }) => {
          camera.lookAt(0, 1.15, 0);
        }}
        camera={{
          position: [0, 1.35, 2.25],
          fov: 30,
          near: 0.1,
          far: 100,
        }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.0} />
        <directionalLight position={[-2, 3, -1]} intensity={0.3} />
        <Suspense fallback={null}>
          <MiniAvatarScene avatarData={data} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default AvatarMiniPreview;

/**
 * AvatarFullBody — Renders the saved avatar as a full-body 3D figure
 * with transparent background (no circular crop).
 * Camera is positioned to show head-to-toe.
 */
import { Suspense, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, useGLTF } from '@react-three/drei';
import { cn } from '@/lib/utils';
import { useUserAvatarData, type AvatarCustomizationData } from '@/hooks/useUserAvatarData';
import { AVATAR_CATEGORIES } from '@/components/avatar/avatarAssets';
import type { Skeleton, Group } from 'three';
import { User } from 'lucide-react';

/* ── Lightweight Asset ── */
function BodyAsset({ url, categoryName, skeleton, color, skinColor }: {
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

/* ── Full Body Scene ── */
function FullBodyScene({ avatarData }: { avatarData: AvatarCustomizationData }) {
  const group = useRef<Group>(null);
  const { nodes } = useGLTF('/models/Armature.glb') as any;
  const headSkinColor = avatarData.Head?.color;

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

  return (
    <group ref={group} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          {resolvedAssets.map((asset) => (
            <Suspense key={asset.url}>
              <BodyAsset
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
interface AvatarFullBodyProps {
  height?: number;
  className?: string;
}

export function AvatarFullBody({ height = 280, className }: AvatarFullBodyProps) {
  const { avatarData, hasAvatar } = useUserAvatarData();

  if (!hasAvatar || !avatarData) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height }}
      >
        <User className="w-16 h-16 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop="always"
        camera={{
          position: [0, 0, 5.2],
          fov: 32,
          near: 0.1,
          far: 100,
        }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <directionalLight position={[-2, 3, -1]} intensity={0.4} />
        <Bounds fit clip observe margin={1.24}>
          <Suspense fallback={null}>
            <FullBodyScene avatarData={avatarData} />
          </Suspense>
        </Bounds>
      </Canvas>
    </div>
  );
}

export default AvatarFullBody;

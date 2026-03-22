/**
 * AssetTilePreview — Renders a GLB asset as a static thumbnail.
 * Uses an offscreen Three.js renderer (shared singleton) to render
 * each asset once and cache the result as a data URL.
 * This avoids creating multiple WebGL contexts.
 */

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// ── Shared offscreen renderer singleton ──
let _renderer: THREE.WebGLRenderer | null = null;
function getOffscreenRenderer() {
  if (!_renderer) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    _renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    _renderer.setSize(128, 128);
    _renderer.setClearColor(0x000000, 0);
    _renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  return _renderer;
}

// ── Cache: url+color → dataURL ──
const thumbnailCache = new Map<string, string>();
const pendingRenders = new Map<string, Promise<string>>();

const gltfLoader = new GLTFLoader();

function renderAssetThumbnail(
  url: string,
  color?: string,
  skinColor?: string
): Promise<string> {
  const cacheKey = `${url}__${color || ""}__${skinColor || ""}`;
  if (thumbnailCache.has(cacheKey)) {
    return Promise.resolve(thumbnailCache.get(cacheKey)!);
  }
  if (pendingRenders.has(cacheKey)) {
    return pendingRenders.get(cacheKey)!;
  }

  const promise = new Promise<string>((resolve) => {
    gltfLoader.load(
      url,
      (gltf) => {
        const renderer = getOffscreenRenderer();
        const scene = new THREE.Scene();

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(2, 3, 4);
        scene.add(dirLight);

        const model = gltf.scene.clone(true);

        // Apply colors to materials
        model.traverse((child: any) => {
          if (!child.isMesh) return;
          if (child.material) {
            child.material = child.material.clone();
            if (color && child.material.name?.includes("Color_")) {
              child.material.color.set(color);
            }
            if (skinColor && child.material.name?.includes("Skin_")) {
              child.material.color.set(skinColor);
            }
          }
          // Convert SkinnedMesh to regular Mesh for static render
          if (child.isSkinnedMesh) {
            child.skeleton = undefined;
            child.bindMatrix = undefined;
            child.bindMatrixInverse = undefined;
          }
        });

        scene.add(model);

        // Auto-fit camera to model bounds
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 1.8;

        const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
        camera.position.set(
          center.x + distance * 0.3,
          center.y + distance * 0.15,
          center.z + distance
        );
        camera.lookAt(center);

        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL("image/png");

        // Cleanup
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.geometry?.dispose();
            child.material?.dispose();
          }
        });

        thumbnailCache.set(cacheKey, dataUrl);
        pendingRenders.delete(cacheKey);
        resolve(dataUrl);
      },
      undefined,
      () => {
        pendingRenders.delete(cacheKey);
        resolve("");
      }
    );
  });

  pendingRenders.set(cacheKey, promise);
  return promise;
}

interface AssetTilePreviewProps {
  assetUrl: string;
  category: { name: string; colorPalette?: string[] };
  assetColor?: string;
  skinColor?: string;
  thumbnail?: string;
}

export const AssetTilePreview = ({
  assetUrl,
  assetColor,
  skinColor,
}: AssetTilePreviewProps) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    renderAssetThumbnail(assetUrl, assetColor, skinColor).then((src) => {
      if (mountedRef.current && src) setImgSrc(src);
    });
    return () => {
      mountedRef.current = false;
    };
  }, [assetUrl, assetColor, skinColor]);

  if (!imgSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-md animate-pulse">
        <div className="w-6 h-6 rounded-full bg-muted/50" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt=""
      className="w-full h-full object-contain rounded-md"
      draggable={false}
    />
  );
};

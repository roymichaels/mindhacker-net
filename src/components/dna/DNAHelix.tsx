/**
 * DNAHelix — 3D double-helix visualization using raw Three.js on canvas.
 * Ported from Framer component, stripped of all Framer dependencies.
 * This is a PURE visual component — no identity logic.
 */
import { useRef, useEffect, useState, useCallback } from 'react';

export interface LabelItem {
  position: number;
  title: string;
  subtitle?: string;
  details?: string[];
  color?: string;
}

interface DNAHelixProps {
  autoRotate?: boolean;
  rotationSpeed?: number;
  helixPitch?: number;
  primaryColor?: string;
  secondaryColor?: string;
  particleColor?: string;
  helixRadius?: number;
  helixHeight?: number;
  tubeRadius?: number;
  particleCount?: number;
  particleSize?: number;
  particleOpacity?: number;
  particleMovement?: boolean;
  particleSpeed?: number;
  glowIntensity?: number;
  labels?: LabelItem[];
  className?: string;
}

export default function DNAHelix({
  autoRotate = true,
  rotationSpeed = 3.5,
  helixPitch = 10,
  primaryColor = '#00D9FF',
  secondaryColor = '#0099FF',
  particleColor = '#00FF88',
  helixRadius = 3,
  helixHeight = 25,
  tubeRadius = 0.4,
  particleCount = 80,
  particleSize = 0.1,
  particleOpacity = 0.8,
  particleMovement = true,
  particleSpeed = 1.0,
  glowIntensity = 1.5,
  labels = [],
  className,
}: DNAHelixProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef(0);
  const sceneDataRef = useRef<any>(null);
  const clickedLabelRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);

  const [threeLoaded, setThreeLoaded] = useState(false);
  const [clickedLabel, setClickedLabel] = useState<number | null>(null);
  const [labelPosition, setLabelPosition] = useState<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 400,
          height: containerRef.current.clientHeight || 400,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { width: W, height: H } = dimensions;

  // Load Three.js
  useEffect(() => {
    const win = window as any;
    if (win.THREE) { setThreeLoaded(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.async = true;
    s.onload = () => setThreeLoaded(true);
    document.head.appendChild(s);
  }, []);

  // Build scene
  useEffect(() => {
    if (!threeLoaded || !canvasRef.current) return;
    const THREE = (window as any).THREE;
    if (!THREE) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, helixHeight * 0.1, helixHeight * 1.8);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dl = new THREE.DirectionalLight(0xffffff, 1);
    dl.position.set(5, 10, 7);
    scene.add(dl);

    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    const makeCurve = (offset: number) => {
      const pts: any[] = [];
      const turns = helixHeight / helixPitch;
      for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        const a = t * turns * Math.PI * 2 + offset;
        pts.push(new THREE.Vector3(helixRadius * Math.cos(a), t * helixHeight - helixHeight / 2, helixRadius * Math.sin(a)));
      }
      return new THREE.CatmullRomCurve3(pts);
    };

    const mat1 = new THREE.MeshStandardMaterial({ color: primaryColor, emissive: primaryColor, emissiveIntensity: glowIntensity, metalness: 0.3, roughness: 0.4 });
    const mat2 = new THREE.MeshStandardMaterial({ color: secondaryColor, emissive: secondaryColor, emissiveIntensity: glowIntensity, metalness: 0.3, roughness: 0.4 });
    const turns = helixHeight / helixPitch;

    helixGroup.add(new THREE.Mesh(new THREE.TubeGeometry(makeCurve(0), 200, tubeRadius, 16, false), mat1));
    helixGroup.add(new THREE.Mesh(new THREE.TubeGeometry(makeCurve(Math.PI), 200, tubeRadius, 16, false), mat2));

    // Rungs
    const rungCount = Math.floor(helixHeight * 1.2);
    for (let i = 0; i < rungCount; i++) {
      const t = (i + 0.5) / rungCount;
      const angle = t * turns * Math.PI * 2;
      const y = t * helixHeight - helixHeight / 2;
      const x1 = helixRadius * Math.cos(angle), z1 = helixRadius * Math.sin(angle);
      const x2 = helixRadius * Math.cos(angle + Math.PI), z2 = helixRadius * Math.sin(angle + Math.PI);
      const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2) / 2;
      const geo = new THREE.CylinderGeometry(tubeRadius * 0.5, tubeRadius * 0.5, len, 8);

      const r1 = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: primaryColor, emissive: primaryColor, emissiveIntensity: glowIntensity * 0.4 }));
      r1.position.set((x1 + (x1 + x2) / 2) / 2, y, (z1 + (z1 + z2) / 2) / 2);
      r1.rotation.set(0, -angle, Math.PI / 2);
      helixGroup.add(r1);

      const r2 = new THREE.Mesh(geo.clone(), new THREE.MeshStandardMaterial({ color: secondaryColor, emissive: secondaryColor, emissiveIntensity: glowIntensity * 0.4 }));
      r2.position.set((x2 + (x1 + x2) / 2) / 2, y, (z2 + (z1 + z2) / 2) / 2);
      r2.rotation.set(0, -angle, Math.PI / 2);
      helixGroup.add(r2);
    }

    // Markers
    const markerHitboxes: any[] = [];
    const markerPositions: any[] = [];

    labels.forEach((label, idx) => {
      const t = Math.max(0, Math.min(1, label.position));
      const angle = t * turns * Math.PI * 2;
      const y = t * helixHeight - helixHeight / 2;
      const x = helixRadius * 1.2 * Math.cos(angle);
      const z = helixRadius * 1.2 * Math.sin(angle);
      const c = label.color || primaryColor;

      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 1 }));
      marker.position.set(x, y, z);

      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.3 }));
      glow.position.set(x, y, z);

      const hitbox = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, visible: false }));
      hitbox.position.set(x, y, z);
      hitbox.userData = { labelIndex: idx };

      helixGroup.add(glow, marker, hitbox);
      markerHitboxes.push(hitbox);
      markerPositions.push({ x, y, z, angle, marker, glow });
    });

    // Particles
    const particleData: any[] = [];
    const dummy = new THREE.Object3D();
    let particles: any = null;
    if (particleCount > 0) {
      const pg = new THREE.SphereGeometry(particleSize, 6, 6);
      const pm = new THREE.MeshBasicMaterial({ color: particleColor, transparent: true, opacity: particleOpacity });
      particles = new THREE.InstancedMesh(pg, pm, particleCount);
      for (let i = 0; i < particleCount; i++) {
        const d = { r: helixRadius * (0.3 + Math.random() * 1.7), h: (Math.random() - 0.5) * helixHeight, p: Math.random() * Math.PI * 2, s: 0.3 + Math.random() * 1.2, a: Math.random() * Math.PI * 2 };
        particleData.push(d);
        dummy.position.set(d.r * Math.cos(d.a), d.h, d.r * Math.sin(d.a));
        dummy.scale.setScalar(0.5 + Math.random());
        dummy.updateMatrix();
        particles.setMatrixAt(i, dummy.matrix);
      }
      particles.instanceMatrix.needsUpdate = true;
      helixGroup.add(particles);
    }

    // Click
    const handleClick = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      helixGroup.updateMatrixWorld(true);
      const rc = new THREE.Raycaster();
      rc.setFromCamera({ x: mx, y: my }, camera);
      const hits = rc.intersectObjects(markerHitboxes);
      if (hits.length > 0) {
        const li = hits[0].object.userData.labelIndex;
        const md = markerPositions[li];
        const wp = new THREE.Vector3();
        md.marker.getWorldPosition(wp);
        wp.project(camera);
        clickedLabelRef.current = li;
        setClickedLabel(li);
        setLabelPosition({ x: (wp.x * 0.5 + 0.5) * W, y: (-wp.y * 0.5 + 0.5) * H });
        e.stopPropagation();
      }
    };
    canvasRef.current.addEventListener('click', handleClick);

    sceneDataRef.current = { scene, camera, renderer, helixGroup, particles, particleData, dummy, markerPositions, markerHitboxes, turns };

    let time = 0;
    lastFrameTimeRef.current = performance.now();

    const animate = (now: number) => {
      if (!sceneDataRef.current) return;
      const dt = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      time += dt;

      if (autoRotate) helixGroup.rotation.y += dt * 0.1 * rotationSpeed;

      if (particleMovement && particles && particleCount > 0) {
        for (let i = 0; i < particleCount; i++) {
          const d = particleData[i];
          const at = time * d.s * particleSpeed + d.p;
          dummy.position.set((d.r + Math.sin(at * 0.6 + d.p) * 0.3) * Math.cos(d.a + at * 0.5), d.h + Math.sin(at * 0.8) * 1.5, (d.r + Math.sin(at * 0.6 + d.p) * 0.3) * Math.sin(d.a + at * 0.5));
          dummy.scale.setScalar(0.7 + 0.3 * Math.sin(at * 1.2 + d.p));
          dummy.updateMatrix();
          particles.setMatrixAt(i, dummy.matrix);
        }
        particles.instanceMatrix.needsUpdate = true;
      }

      markerPositions.forEach((md: any) => {
        if (md.marker && md.glow) {
          md.marker.scale.setScalar(1 + Math.sin(time * 2 + md.angle) * 0.1);
          md.glow.scale.setScalar(1 + Math.sin(time * 1.5 + md.angle) * 0.15);
          md.glow.material.opacity = Math.max(0.2, Math.min(0.4, 0.25 + Math.sin(time * 2 + md.angle) * 0.15));
        }
      });

      const cl = clickedLabelRef.current;
      if (cl !== null && markerPositions[cl]) {
        helixGroup.updateMatrixWorld(true);
        const wp = new THREE.Vector3();
        markerPositions[cl].marker.getWorldPosition(wp);
        wp.project(camera);
        setLabelPosition({ x: (wp.x * 0.5 + 0.5) * W, y: (-wp.y * 0.5 + 0.5) * H });
      }

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate(performance.now());

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvasRef.current?.removeEventListener('click', handleClick);
      renderer.dispose();
      sceneDataRef.current = null;
    };
  }, [threeLoaded, W, H, helixHeight, helixRadius, helixPitch, tubeRadius, primaryColor, secondaryColor, particleColor, particleOpacity, particleSize, particleCount, glowIntensity, autoRotate, rotationSpeed, particleMovement, particleSpeed, labels]);

  // Resize
  useEffect(() => {
    if (sceneDataRef.current && canvasRef.current) {
      const { renderer, camera } = sceneDataRef.current;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }
  }, [W, H]);

  const closeLabel = useCallback(() => {
    clickedLabelRef.current = null;
    setClickedLabel(null);
    setLabelPosition(null);
  }, []);

  const labelData = clickedLabel !== null ? labels[clickedLabel] : null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
      onClick={(e) => { if (clickedLabel !== null && e.target === containerRef.current) closeLabel(); }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {labelData && labelPosition && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(labelPosition.x, W - 220),
            top: Math.min(labelPosition.y + 10, H - 160),
            width: 200,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            padding: 14,
            zIndex: 10,
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLabel(); }}
            style={{
              position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%',
              border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}
          >×</button>

          <div style={{ color: labelData.color || '#fff', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            {labelData.title}
          </div>
          {labelData.subtitle && (
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: labelData.details?.length ? 8 : 0 }}>
              {labelData.subtitle}
            </div>
          )}
          {labelData.details && labelData.details.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 8 }}>
              {labelData.details.map((d, i) => (
                <div key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: i > 0 ? 4 : 0 }}>{d}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {!threeLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          Loading 3D...
        </div>
      )}
    </div>
  );
}

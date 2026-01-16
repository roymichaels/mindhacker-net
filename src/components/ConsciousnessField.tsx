import { useEffect, useRef, memo, useState } from "react";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { hslToRgb } from "@/lib/colorUtils";
import { useTheme } from "next-themes";

// Abstract glyphs for consciousness field effect
const GLYPHS = [
  '∴', '∵', '◌', '○', '◦', '·', '•',  // Dots and circles
  '∞', '∿', '≈', '≋',                  // Wave forms
  '⟨', '⟩', '⌇', '⌈', '⌉',            // Partial brackets
  '╭', '╮', '╯', '╰',                  // Curved corners
  '░', '▒',                            // Gradients
  '◇', '△', '▽', '○',                 // Geometric
];

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  phase: number;
  speed: number;
  glyph: string;
  layer: number;
}

const clamp255 = (n: number) => Math.min(255, Math.max(0, Math.round(n)));

const ConsciousnessField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const scrollRef = useRef(0);
  const breathPhaseRef = useRef(0);
  const { theme: themeSettings, loading } = useThemeSettings();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const shouldRender = true;
  const isLightMode = mounted && resolvedTheme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loading || !mounted || !shouldRender) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use alpha: true so we can have transparent background
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Derive colors from theme HSL values
    const bgH = parseFloat(themeSettings.background_h) || 220;
    const bgS = parseFloat(themeSettings.background_s) || 60;
    const bgL = Math.max((parseFloat(themeSettings.background_l) || 8) - 3, 3);
    const primaryColor = hslToRgb(bgH, bgS, bgL);

    const primaryH = parseFloat(themeSettings.primary_h) || 174;
    const primaryS = parseFloat(themeSettings.primary_s) || 100;
    const primaryL = parseFloat(themeSettings.primary_l) || 42;
    const accentColor = hslToRgb(primaryH, primaryS, primaryL);

    const tsAny = themeSettings as any;
    const particleDensity = parseFloat(tsAny.consciousness_field_particle_density || "0.6");
    const breathingSpeed = parseFloat(tsAny.consciousness_field_breathing_speed || "10");
    const interactionEnabled = tsAny.consciousness_field_interaction !== false;

    // Handle DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(width, height);
    };

    // Initialize particles
    const initParticles = (width: number, height: number) => {
      const isMobile = width < 768;
      const baseCount = isMobile ? 60 : 120;
      const count = Math.floor(baseCount * particleDensity);
      
      particlesRef.current = [];
      
      for (let i = 0; i < count; i++) {
        const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseX: Math.random() * width,
          baseY: Math.random() * height,
          size: layer === 0 ? 10 : layer === 1 ? 14 : 18,
          opacity: layer === 0 ? 0.2 : layer === 1 ? 0.4 : 0.6,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0002 + Math.random() * 0.0003,
          glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          layer
        });
      }
    };

    updateCanvasSize();

    // Mouse/touch tracking
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!interactionEnabled) return;
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      if (clientX !== undefined && clientY !== undefined) {
        mouseRef.current = { x: clientX, y: clientY };
      }
    };

    // Scroll tracking
    const handleScroll = () => {
      if (!interactionEnabled) return;
      scrollRef.current = window.scrollY;
    };

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let lastFrameTime = 0;
    const isMobile = window.innerWidth < 768;
    const frameInterval = isMobile ? 50 : 33;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastFrameTime = 0;
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    const draw = (currentTime: number) => {
      if (!isVisible) return;

      if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = currentTime;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear canvas - use appropriate background
      if (isLightMode) {
        // Light mode: semi-transparent light background
        ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
      } else {
        // Dark mode: deep gradient
        const gradient = ctx.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, Math.max(width, height) * 0.8
        );
        gradient.addColorStop(0, `rgba(${primaryColor.r + 10}, ${primaryColor.g + 15}, ${primaryColor.b + 25}, 1)`);
        gradient.addColorStop(1, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 1)`);
        ctx.fillStyle = gradient;
      }
      ctx.fillRect(0, 0, width, height);

      // Update breathing phase
      if (!prefersReducedMotion) {
        breathPhaseRef.current += (Math.PI * 2) / (breathingSpeed * 60);
      }
      const breathFactor = Math.sin(breathPhaseRef.current) * 0.5 + 0.5;

      // Draw flow lines - much more visible in light mode
      const lineOpacity = isLightMode ? 0.15 + breathFactor * 0.08 : 0.04 + breathFactor * 0.02;
      ctx.strokeStyle = isLightMode
        ? `rgba(${clamp255(accentColor.r - 60)}, ${clamp255(accentColor.g - 60)}, ${clamp255(accentColor.b - 60)}, ${lineOpacity})`
        : `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${lineOpacity})`;
      ctx.lineWidth = isLightMode ? 1.5 : 1;
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const startX = (width * 0.2) + (i * width * 0.15);
        const startY = height * 0.1;
        const waveOffset = breathPhaseRef.current * 0.3 + i * 0.5;
        
        ctx.moveTo(startX, startY);
        for (let y = startY; y < height; y += 20) {
          const x = startX + Math.sin((y * 0.005) + waveOffset) * 50;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw particles
      particlesRef.current.forEach((particle) => {
        if (prefersReducedMotion) {
          particle.x = particle.baseX;
          particle.y = particle.baseY;
        } else {
          // Slow circular drift
          const time = currentTime * particle.speed;
          const driftRadius = 30 + particle.layer * 20;
          particle.x = particle.baseX + Math.sin(time + particle.phase) * driftRadius;
          particle.y = particle.baseY + Math.cos(time + particle.phase * 0.7) * driftRadius;

          // Mouse interaction
          if (interactionEnabled) {
            const dx = mouseRef.current.x - particle.x;
            const dy = mouseRef.current.y - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 200;
            
            if (dist < maxDist && dist > 0) {
              const force = (1 - dist / maxDist) * 0.1;
              particle.x += dx * force * 0.02;
              particle.y += dy * force * 0.02;
            }
          }

          // Wrap around screen
          if (particle.x < -50) particle.baseX += width + 100;
          if (particle.x > width + 50) particle.baseX -= width + 100;
          if (particle.y < -50) particle.baseY += height + 100;
          if (particle.y > height + 50) particle.baseY -= height + 100;
        }

        // Breathing opacity - higher base for light mode
        const baseOpacity = particle.opacity * (0.7 + breathFactor * 0.3) * (isLightMode ? 2.0 : 1);

        // Layer-based coloring
        let color: string;
        if (isLightMode) {
          // Light mode: much darker glyphs for contrast
          const darken = 140;
          const c = {
            r: clamp255(accentColor.r - darken),
            g: clamp255(accentColor.g - darken),
            b: clamp255(accentColor.b - darken),
          };
          
          if (particle.layer === 0) {
            color = `rgba(${c.r}, ${c.g}, ${c.b}, ${baseOpacity * 0.4})`;
          } else if (particle.layer === 1) {
            color = `rgba(${c.r + 20}, ${c.g + 20}, ${c.b + 20}, ${baseOpacity * 0.6})`;
          } else {
            color = `rgba(${c.r + 40}, ${c.g + 40}, ${c.b + 40}, ${baseOpacity * 0.85})`;
          }
        } else {
          // Dark mode: original bright colors
          if (particle.layer === 0) {
            color = `rgba(${primaryColor.r + 30}, ${primaryColor.g + 40}, ${primaryColor.b + 60}, ${baseOpacity * 0.5})`;
          } else if (particle.layer === 1) {
            color = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${baseOpacity * 0.7})`;
          } else {
            color = `rgba(${accentColor.r + 40}, ${accentColor.g + 60}, ${accentColor.b + 80}, ${baseOpacity})`;
          }
        }

        // Draw glyph
        ctx.font = `${particle.size}px "Heebo", sans-serif`;
        ctx.fillStyle = color;

        // Add glow for front layer
        if (particle.layer === 2 && !isMobile) {
          ctx.shadowBlur = isLightMode ? 3 : 8;
          ctx.shadowColor = isLightMode
            ? `rgba(${clamp255(accentColor.r - 80)}, ${clamp255(accentColor.g - 80)}, ${clamp255(accentColor.b - 80)}, 0.3)`
            : `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, 0.4)`;
        }

        ctx.fillText(particle.glyph, particle.x, particle.y);
        ctx.shadowBlur = 0;
      });

      // Draw subtle center vignette
      const centerGlow = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.min(width, height) * 0.5
      );
      const vignetteOpacity = isLightMode ? 0.06 + breathFactor * 0.03 : 0.02 + breathFactor * 0.01;
      centerGlow.addColorStop(0, isLightMode
        ? `rgba(${clamp255(accentColor.r - 60)}, ${clamp255(accentColor.g - 60)}, ${clamp255(accentColor.b - 60)}, ${vignetteOpacity})`
        : `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${vignetteOpacity})`
      );
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    // Event listeners
    window.addEventListener("resize", updateCanvasSize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    loading,
    mounted,
    shouldRender,
    isLightMode,
    themeSettings.background_h,
    themeSettings.background_s,
    themeSettings.background_l,
    themeSettings.primary_h,
    themeSettings.primary_s,
    themeSettings.primary_l,
    (themeSettings as any).consciousness_field_particle_density,
    (themeSettings as any).consciousness_field_breathing_speed,
    (themeSettings as any).consciousness_field_interaction
  ]);

  if (!shouldRender) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        opacity: 0.95,
      }}
      aria-hidden="true"
    />
  );
};

export default memo(ConsciousnessField);

import { useEffect, useRef, memo } from "react";
import { useThemeSettings } from "@/hooks/useThemeSettings";

// Abstract glyphs for consciousness field effect
const GLYPHS = [
  '∴', '∵', '◌', '○', '◦', '·', '•',  // Dots and circles
  '∞', '∿', '≈', '≋',                  // Wave forms
  '⟨', '⟩', '⌇', '⌈', '⌉',            // Partial brackets
  '╭', '╮', '╯', '╰',                  // Curved corners
  '░', '▒',                            // Gradients
  '◇', '△', '▽', '○',                 // Geometric
];

// Convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 10, g: 22, b: 40 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
};

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

const ConsciousnessField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const scrollRef = useRef(0);
  const breathPhaseRef = useRef(0);
  const { theme, loading } = useThemeSettings();

  useEffect(() => {
    if (loading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Get settings from theme
    const primaryColor = hexToRgb(theme.consciousness_field_primary_color || "#0a1628");
    const accentColor = hexToRgb(theme.consciousness_field_accent_color || "#3d7a8c");
    const particleDensity = parseFloat(theme.consciousness_field_particle_density || "0.6");
    const breathingSpeed = parseFloat(theme.consciousness_field_breathing_speed || "10");
    const interactionEnabled = theme.consciousness_field_interaction !== false;

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
          size: layer === 0 ? 8 : layer === 1 ? 12 : 16,
          opacity: layer === 0 ? 0.15 : layer === 1 ? 0.3 : 0.5,
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
    const frameInterval = isMobile ? 50 : 33; // 20fps mobile, 30fps desktop
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

      // Clear with deep blue gradient
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, `rgba(${primaryColor.r + 10}, ${primaryColor.g + 15}, ${primaryColor.b + 25}, 1)`);
      gradient.addColorStop(1, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 1)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update breathing phase (very slow)
      if (!prefersReducedMotion) {
        breathPhaseRef.current += (Math.PI * 2) / (breathingSpeed * 60);
      }
      const breathFactor = Math.sin(breathPhaseRef.current) * 0.5 + 0.5;

      // Draw flow lines (subtle curved paths)
      ctx.strokeStyle = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${0.03 + breathFactor * 0.02})`;
      ctx.lineWidth = 1;
      
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

      // Draw particles with breathing and interaction
      particlesRef.current.forEach((particle, index) => {
        if (prefersReducedMotion) {
          particle.x = particle.baseX;
          particle.y = particle.baseY;
        } else {
          // Slow circular drift
          const time = currentTime * particle.speed;
          const driftRadius = 30 + particle.layer * 20;
          particle.x = particle.baseX + Math.sin(time + particle.phase) * driftRadius;
          particle.y = particle.baseY + Math.cos(time + particle.phase * 0.7) * driftRadius;

          // Mouse interaction (gentle gravitational pull)
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

        // Breathing opacity
        const baseOpacity = particle.opacity * (0.7 + breathFactor * 0.3);
        
        // Layer-based coloring
        let color: string;
        if (particle.layer === 0) {
          // Background layer - darker, blurred
          color = `rgba(${primaryColor.r + 30}, ${primaryColor.g + 40}, ${primaryColor.b + 60}, ${baseOpacity * 0.5})`;
        } else if (particle.layer === 1) {
          // Mid layer - accent color
          color = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${baseOpacity * 0.7})`;
        } else {
          // Front layer - brighter accent with glow
          color = `rgba(${accentColor.r + 40}, ${accentColor.g + 60}, ${accentColor.b + 80}, ${baseOpacity})`;
        }

        // Draw glyph
        ctx.font = `${particle.size}px "Heebo", sans-serif`;
        ctx.fillStyle = color;
        
        // Add subtle glow for front layer
        if (particle.layer === 2 && !isMobile) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, 0.4)`;
        }
        
        ctx.fillText(particle.glyph, particle.x, particle.y);
        
        // Reset shadow
        ctx.shadowBlur = 0;
      });

      // Draw subtle center vignette (lighter in center)
      const centerGlow = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.min(width, height) * 0.5
      );
      centerGlow.addColorStop(0, `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${0.02 + breathFactor * 0.01})`);
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
    theme.consciousness_field_primary_color,
    theme.consciousness_field_accent_color,
    theme.consciousness_field_particle_density,
    theme.consciousness_field_breathing_speed,
    theme.consciousness_field_interaction
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default memo(ConsciousnessField);

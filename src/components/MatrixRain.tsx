import { useEffect, useRef, useState } from "react";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Skip rendering on mobile devices
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const hebrewChars = "אבגדהוזחטיכלמנסעפצקרשת";
    const symbols = "✶◇△⊙✦";
    const chars = hebrewChars + symbols;
    
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Three layers with different properties
    const layers = [
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 0.2,
        opacity: 0.2,
        color: "0, 51, 68", // Deep teal
        fontSize: 14,
        blur: 2,
        chars: hebrewChars
      },
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 0.4,
        opacity: 0.35,
        color: "0, 240, 255", // Cyan
        fontSize: 16,
        blur: 1,
        chars: hebrewChars + symbols.substring(0, 2)
      },
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 0.7,
        opacity: 0.6,
        color: "230, 253, 255", // Cyan-white
        fontSize: 18,
        blur: 0,
        chars: chars
      }
    ];

    // PERFORMANCE: Cache gradients - create once instead of 5000+ times per second
    const cachedGradients = layers.map((layer) => {
      // Skip gradient for background layer (will use flat color)
      if (layer.blur === 2) return null;
      
      const gradient = ctx.createLinearGradient(0, -layer.fontSize * 8, 0, 0);
      gradient.addColorStop(0, `rgba(${layer.color}, 0)`);
      gradient.addColorStop(0.3, `rgba(${layer.color}, ${layer.opacity * 0.3})`);
      gradient.addColorStop(0.7, `rgba(${layer.color}, ${layer.opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(${layer.color}, ${layer.opacity})`);
      return gradient;
    });

    let animationFrameId: number;
    let lastFrameTime = 0;
    const frameInterval = 70; // ~14 FPS for deeper meditative effect
    let isVisible = true;

    // PERFORMANCE: Pause when tab is not visible
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastFrameTime = 0;
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const draw = (currentTime: number) => {
      if (!isVisible || currentTime - lastFrameTime < frameInterval) {
        if (isVisible) {
          animationFrameId = requestAnimationFrame(draw);
        }
        return;
      }
      lastFrameTime = currentTime;

      // Fade effect for trails
      ctx.fillStyle = "rgba(1, 4, 9, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Use additive blending for luminous effect
      ctx.globalCompositeOperation = "lighter";

      // Draw each layer
      layers.forEach((layer, layerIndex) => {
        ctx.font = `${layer.fontSize}px Heebo`;
        ctx.filter = `blur(${layer.blur}px)`;
        
        // PERFORMANCE: Set shadow once per layer instead of per character
        ctx.shadowBlur = layer.blur === 0 ? 10 : 0;
        ctx.shadowColor = `rgba(${layer.color}, ${layer.opacity * 0.5})`;

        // PERFORMANCE: Pre-calculate random density check
        const densityThreshold = Math.random();

        for (let i = 0; i < layer.drops.length; i++) {
          // Random column density - skip some columns
          if (densityThreshold > 0.85) continue;

          const char = layer.chars[Math.floor(Math.random() * layer.chars.length)];
          const x = i * fontSize;
          const y = layer.drops[i] * layer.fontSize;

          // Random white flash (foreground layer only)
          const isFlash = layerIndex === 2 && Math.random() > 0.985;
          
          if (isFlash) {
            ctx.fillStyle = `rgba(255, 255, 255, ${layer.opacity * 1.5})`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          } else {
            // PERFORMANCE: Use cached gradient for mid/foreground, flat color for background
            if (cachedGradients[layerIndex]) {
              ctx.fillStyle = cachedGradients[layerIndex]!;
            } else {
              // Background layer uses simple flat color
              ctx.fillStyle = `rgba(${layer.color}, ${layer.opacity})`;
            }
          }

          ctx.fillText(char, x, y);

          // Reset shadow after flash
          if (isFlash) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${layer.color}, ${layer.opacity * 0.5})`;
          }

          // Move drops with layer-specific speed
          if (y > canvas.height && Math.random() > 0.975) {
            layer.drops[i] = 0;
          }
          layer.drops[i] += layer.speed;
        }
      });

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMobile]);

  // Don't render canvas on mobile
  if (isMobile) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40"
      style={{ zIndex: 1 }}
    />
  );
};

export default MatrixRain;

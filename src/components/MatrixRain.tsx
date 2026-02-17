import { useEffect, useRef, memo, useState } from "react";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { hslToRgb } from "@/lib/colorUtils";
import { useTheme } from "next-themes";

// Convert RGB object to string
const rgbToString = (rgb: { r: number; g: number; b: number }): string => {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
};

// Lighten RGB color string
const lightenRgb = (rgb: string, amount: number): string => {
  const parts = rgb.split(',').map(p => parseInt(p.trim()));
  return parts.map(p => Math.min(255, p + amount)).join(', ');
};

// Darken RGB color string
const darkenRgb = (rgb: string, amount: number): string => {
  const parts = rgb.split(',').map(p => parseInt(p.trim()));
  return parts.map(p => Math.max(0, p - amount)).join(', ');
};

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, loading } = useThemeSettings();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Check if should render
  const shouldRender = theme.matrix_rain_enabled && theme.background_effect === 'matrix_rain';
  const isLightMode = mounted && resolvedTheme === "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loading || !mounted || !shouldRender) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Derive color from theme primary HSL values
    const primaryH = parseFloat(theme.primary_h) || 174;
    const primaryS = parseFloat(theme.primary_s) || 100;
    const primaryL = parseFloat(theme.primary_l) || 42;
    const primaryRgb = hslToRgb(primaryH, primaryS, primaryL);
    const baseColor = rgbToString(primaryRgb);

    // Handle DPI scaling for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Initialize with appropriate background
      if (isLightMode) {
        // Light mode: slightly tinted off-white for better character visibility
        ctx.fillStyle = "rgba(248, 250, 252, 1)";
      } else {
        ctx.fillStyle = "rgb(2, 6, 12)";
      }
      ctx.fillRect(0, 0, width, height);
    };
    updateCanvasSize();

    // Detect mobile for performance optimizations
    const isMobile = window.innerWidth < 768;

    const hebrewChars = "אבגדהוזחטיכלמנסעפצקרשת";
    const symbols = "✶◇△⊙✦";
    const chars = hebrewChars + symbols;
    
    // Mobile optimizations
    const fontSize = isMobile ? 14 : 16;
    const columnDensity = isMobile ? 2 : 1;
    const columns = Math.floor(window.innerWidth / fontSize / columnDensity);
    
    // Dynamic colors based on theme - much darker for light mode visibility
    const lightDim = darkenRgb(baseColor, 200);    // Very dark for background layer
    const lightMid = darkenRgb(baseColor, 150);    // Dark for mid layer
    const lightBright = darkenRgb(baseColor, 80);  // Medium-dark for front layer

    const layers = isMobile
      ? [
          {
            drops: Array(columns)
              .fill(0)
              .map(() => Math.random() * -100),
            speed: 0.4,
            opacity: isLightMode ? 0.5 : 0.8,
            color: isLightMode ? lightMid : baseColor,
            fontSize: 14,
            blur: 0,
            chars: hebrewChars + symbols.substring(0, 2),
          },
          {
            drops: Array(columns)
              .fill(0)
              .map(() => Math.random() * -100),
            speed: 0.7,
            opacity: isLightMode ? 0.75 : 1,
            color: isLightMode ? lightBright : lightenRgb(baseColor, 80),
            fontSize: 16,
            blur: 0,
            chars: chars,
          },
        ]
      : [
          {
            drops: Array(columns)
              .fill(0)
              .map(() => Math.random() * -100),
            speed: 0.2,
            opacity: isLightMode ? 0.3 : 0.5,
            color: isLightMode ? lightDim : darkenRgb(baseColor, 60),
            fontSize: 14,
            blur: 1,
            chars: hebrewChars,
          },
          {
            drops: Array(columns)
              .fill(0)
              .map(() => Math.random() * -100),
            speed: 0.4,
            opacity: isLightMode ? 0.5 : 0.75,
            color: isLightMode ? lightMid : baseColor,
            fontSize: 16,
            blur: 0,
            chars: hebrewChars + symbols.substring(0, 2),
          },
          {
            drops: Array(columns)
              .fill(0)
              .map(() => Math.random() * -100),
            speed: 0.7,
            opacity: isLightMode ? 0.8 : 1,
            color: isLightMode ? lightBright : lightenRgb(baseColor, 100),
            fontSize: 18,
            blur: 0,
            chars: chars,
          },
        ];

    let animationFrameId: number;
    let lastFrameTime = 0;
    const frameInterval = isMobile ? 100 : 50;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastFrameTime = 0;
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const draw = (currentTime: number) => {
      if (!isVisible) return;
      
      if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = currentTime;

      // Fade with appropriate colors - slower fade for more visible trails
      const fadeAlpha = isLightMode ? 0.06 : 0.05;
      const fadeColor = isLightMode 
        ? `rgba(248, 250, 252, ${fadeAlpha})` 
        : `rgba(2, 6, 12, ${fadeAlpha})`;
      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw each layer
      layers.forEach((layer) => {
        ctx.font = `${layer.fontSize}px ${theme.font_family_primary || 'Heebo'}, sans-serif`;
        ctx.filter = layer.blur > 0 ? `blur(${layer.blur}px)` : "none";
        
        // Glow effect - reduced in light mode
        if (!isMobile && layer.blur === 0) {
          ctx.shadowBlur = isLightMode ? 5 : 15;
          ctx.shadowColor = isLightMode 
            ? `rgba(${layer.color}, 0.4)` 
            : `rgba(${layer.color}, 0.8)`;
        }

        for (let i = 0; i < layer.drops.length; i++) {
          // Draw more characters (less skipping) for better density
          if (Math.random() > 0.55) continue;

          const char = layer.chars[Math.floor(Math.random() * layer.chars.length)];
          const x = i * fontSize * columnDensity;
          const y = layer.drops[i] * layer.fontSize;

          // Draw character
          ctx.fillStyle = `rgba(${layer.color}, ${layer.opacity})`;
          ctx.fillText(char, x, y);

          // Move drops
          if (y > window.innerHeight && Math.random() > 0.975) {
            layer.drops[i] = 0;
          }
          layer.drops[i] += layer.speed;
        }
      });

      // Reset
      ctx.shadowBlur = 0;
      ctx.filter = "none";

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, mounted, shouldRender, isLightMode, theme.primary_h, theme.primary_s, theme.primary_l, theme.matrix_rain_opacity, theme.font_family_primary]);

  if (!shouldRender) {
    return null;
  }

  const baseOpacity = parseFloat(theme.matrix_rain_opacity) || 0.4;
  // Ensure minimum visibility in both modes
  const canvasOpacity = isLightMode 
    ? Math.max(0.35, baseOpacity) 
    : Math.max(0.3, baseOpacity);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        opacity: canvasOpacity,
      }}
      aria-hidden="true"
    />
  );
};

export default memo(MatrixRain);

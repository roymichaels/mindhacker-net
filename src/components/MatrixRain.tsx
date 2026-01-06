import { useEffect, useRef, memo, useState } from "react";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [debugStatus, setDebugStatus] = useState<string>("initializing");

  useEffect(() => {
    console.log("[MatrixRain] Component mounted");

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("[MatrixRain] Canvas ref is null");
      setDebugStatus("no canvas");
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      console.error("[MatrixRain] Failed to get 2D context");
      setDebugStatus("no ctx");
      return;
    }

    setDebugStatus("running");
    console.log("[MatrixRain] Canvas and context ready, starting animation");

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
    };
    updateCanvasSize();

    // Detect mobile for performance optimizations
    const isMobile = window.innerWidth < 768;

    const hebrewChars = "אבגדהוזחטיכלמנסעפצקרשת";
    const symbols = "✶◇△⊙✦";
    const chars = hebrewChars + symbols;
    
    // Mobile optimizations - improved visibility
    const fontSize = isMobile ? 14 : 16;
    const columnDensity = isMobile ? 2 : 1;
    const columns = Math.floor(window.innerWidth / fontSize / columnDensity);
    
    // BRIGHTER colors for visibility
    const layers = isMobile ? [
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 0.4,
        opacity: 0.8,
        color: "0, 255, 200", // Bright cyan-green
        fontSize: 14,
        blur: 0,
        chars: hebrewChars + symbols.substring(0, 2)
      },
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 0.7,
        opacity: 1,
        color: "100, 255, 218", // Bright mint
        fontSize: 16,
        blur: 0,
        chars: chars
      }
    ] : [
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 0.2,
        opacity: 0.4,
        color: "0, 180, 150", // Teal
        fontSize: 14,
        blur: 1,
        chars: hebrewChars
      },
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 0.4,
        opacity: 0.7,
        color: "0, 255, 200", // Bright cyan
        fontSize: 16,
        blur: 0,
        chars: hebrewChars + symbols.substring(0, 2)
      },
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 0.7,
        opacity: 1,
        color: "150, 255, 230", // Bright white-cyan
        fontSize: 18,
        blur: 0,
        chars: chars
      }
    ];

    let animationFrameId: number;
    let lastFrameTime = 0;
    const frameInterval = isMobile ? 100 : 50; // Faster: 10 FPS mobile, 20 FPS desktop
    let isVisible = true;
    let frameCount = 0;

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
      frameCount++;

      // Log first few frames to confirm drawing
      if (frameCount <= 3) {
        console.log(`[MatrixRain] Drawing frame ${frameCount}`);
      }

      // Lighter fade for more visible trails
      ctx.fillStyle = "rgba(2, 6, 12, 0.15)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw each layer
      layers.forEach((layer) => {
        ctx.font = `${layer.fontSize}px Heebo, sans-serif`;
        ctx.filter = layer.blur > 0 ? `blur(${layer.blur}px)` : "none";
        
        // Glow effect
        if (!isMobile && layer.blur === 0) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = `rgba(${layer.color}, 0.8)`;
        }

        for (let i = 0; i < layer.drops.length; i++) {
          // Draw more characters (less skipping)
          if (Math.random() > 0.6) continue;

          const char = layer.chars[Math.floor(Math.random() * layer.chars.length)];
          const x = i * fontSize * columnDensity;
          const y = layer.drops[i] * layer.fontSize;

          // Bright color
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
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ 
          zIndex: 1,
          opacity: 1
        }}
      />
      {/* Temporary debug badge - remove after confirming visibility */}
      <div 
        className="fixed top-2 left-2 z-[9999] px-2 py-1 text-xs font-mono rounded"
        style={{ 
          background: debugStatus === "running" ? "rgba(0,255,100,0.9)" : "rgba(255,0,0,0.9)",
          color: "#000"
        }}
      >
        Matrix: {debugStatus}
      </div>
    </>
  );
};

export default memo(MatrixRain);

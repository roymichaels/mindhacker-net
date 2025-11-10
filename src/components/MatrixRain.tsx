import { useEffect, useRef } from "react";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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
        speed: 0.3,
        opacity: 0.2,
        color: "0, 51, 68", // Deep teal
        fontSize: 14,
        blur: 2,
        chars: hebrewChars
      },
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 0.6,
        opacity: 0.35,
        color: "0, 240, 255", // Cyan
        fontSize: 16,
        blur: 1,
        chars: hebrewChars + symbols.substring(0, 2)
      },
      {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        speed: 1,
        opacity: 0.6,
        color: "230, 253, 255", // Cyan-white
        fontSize: 18,
        blur: 0,
        chars: chars
      }
    ];

    let animationFrameId: number;
    let lastFrameTime = 0;
    const frameInterval = 50; // 20 FPS for smooth, meditative effect

    const draw = (currentTime: number) => {
      if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(draw);
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

        for (let i = 0; i < layer.drops.length; i++) {
          // Random column density - skip some columns
          if (Math.random() > 0.85) continue;

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
            // Create gradient trail for each character
            const gradient = ctx.createLinearGradient(
              x, 
              y - layer.fontSize * 8, 
              x, 
              y
            );
            gradient.addColorStop(0, `rgba(${layer.color}, 0)`);
            gradient.addColorStop(0.3, `rgba(${layer.color}, ${layer.opacity * 0.3})`);
            gradient.addColorStop(0.7, `rgba(${layer.color}, ${layer.opacity * 0.8})`);
            gradient.addColorStop(1, `rgba(${layer.color}, ${layer.opacity})`);
            
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${layer.color}, ${layer.opacity * 0.5})`;
          }

          ctx.fillText(char, x, y);

          // Reset shadow after flash
          if (isFlash) {
            ctx.shadowBlur = 0;
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
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40"
      style={{ zIndex: 1, willChange: "transform" }}
    />
  );
};

export default MatrixRain;

import { useState, useEffect, useRef } from "react";
import { Users, Star, CheckCircle } from "lucide-react";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

const AnimatedCounter = ({ end, suffix = "", duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return (
    <span ref={ref} className="font-black text-2xl md:text-3xl text-primary cyber-glow">
      {count}{suffix}
    </span>
  );
};

const SocialProofCounter = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 md:mt-12">
      <div className="glass-panel px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3">
        <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <div className="flex flex-col">
          <AnimatedCounter end={200} suffix="+" />
          <span className="text-xs md:text-sm text-muted-foreground">לקוחות מרוצים</span>
        </div>
      </div>
      
      <div className="glass-panel px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3">
        <Star className="w-5 h-5 md:w-6 md:h-6 text-accent fill-accent" />
        <div className="flex flex-col">
          <AnimatedCounter end={94} suffix="%" />
          <span className="text-xs md:text-sm text-muted-foreground">שינוי מהמפגש הראשון</span>
        </div>
      </div>
      
      <div className="glass-panel px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3">
        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <div className="flex flex-col">
          <AnimatedCounter end={87} suffix="%" />
          <span className="text-xs md:text-sm text-muted-foreground">שברו הרגלים תוך 4 מפגשים</span>
        </div>
      </div>
    </div>
  );
};

export default SocialProofCounter;

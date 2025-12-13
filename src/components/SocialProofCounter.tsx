import { useState, useEffect, useRef } from "react";
import { Star, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

const AnimatedCounter = ({ end, suffix = "", duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
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
      } else {
        setIsComplete(true);
      }
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return (
    <span 
      ref={ref} 
      className={`font-black text-2xl md:text-3xl text-primary md:cyber-glow transition-transform ${isComplete ? 'animate-pop' : ''}`}
    >
      {count}{suffix}
    </span>
  );
};

const SocialProofCounter = () => {
  const [stats, setStats] = useState({
    successRate: 94,
    habitBreak: 87,
  });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["success_rate_percent", "habit_break_percent"]);

      if (data) {
        const statsObj = data.reduce((acc: any, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {});

        setStats({
          successRate: parseInt(statsObj.success_rate_percent) || 94,
          habitBreak: parseInt(statsObj.habit_break_percent) || 87,
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 md:mt-12"
    >
      <div 
        className={`bg-[hsl(var(--glass-bg))]/80 backdrop-blur-xl border border-border/20 rounded-2xl px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 hover-lift hover-glow transition-all duration-300 ${
          isVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`}
        style={{ animationDelay: '0.1s' }}
      >
        <Star className="w-5 h-5 md:w-6 md:h-6 text-accent fill-accent" />
        <div className="flex flex-col">
          <AnimatedCounter end={stats.successRate} suffix="%" />
          <span className="text-xs md:text-sm text-muted-foreground">שינוי מהמפגש הראשון</span>
        </div>
      </div>
      
      <div 
        className={`bg-[hsl(var(--glass-bg))]/80 backdrop-blur-xl border border-border/20 rounded-2xl px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 hover-lift hover-glow transition-all duration-300 ${
          isVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`}
        style={{ animationDelay: '0.2s' }}
      >
        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <div className="flex flex-col">
          <AnimatedCounter end={stats.habitBreak} suffix="%" />
          <span className="text-xs md:text-sm text-muted-foreground">שברו הרגלים תוך 4 מפגשים</span>
        </div>
      </div>
    </div>
  );
};

export default SocialProofCounter;

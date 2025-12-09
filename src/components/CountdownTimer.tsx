import { useState, useEffect } from "react";
import { Clock, Flame } from "lucide-react";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Get or set the end time in localStorage for persistence
    const storageKey = "pricing_countdown_end";
    let endTime = localStorage.getItem(storageKey);
    
    if (!endTime || new Date(endTime) < new Date()) {
      // Set countdown to end of current day at midnight
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(23, 59, 59, 999);
      endTime = midnight.toISOString();
      localStorage.setItem(storageKey, endTime);
    }

    const calculateTimeLeft = () => {
      const difference = new Date(endTime!).getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      // Reset for next day
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      localStorage.setItem(storageKey, tomorrow.toISOString());
      
      return { hours: 23, minutes: 59, seconds: 59 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary/20 border border-primary/40 rounded-lg p-2 md:p-3 min-w-[50px] md:min-w-[60px]">
        <span className="text-2xl md:text-3xl font-black text-primary cyber-glow">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );

  return (
    <div className="glass-panel p-4 md:p-6 mb-8 text-center animate-fade-in" dir="rtl">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-destructive animate-pulse" />
        <h3 className="text-lg md:text-xl font-bold text-foreground">
          🔥 מבצע מוגבל בזמן!
        </h3>
        <Flame className="w-5 h-5 text-destructive animate-pulse" />
      </div>
      
      <p className="text-muted-foreground text-sm mb-4">
        המחירים המיוחדים יסתיימו בעוד:
      </p>
      
      <div className="flex items-center justify-center gap-2 md:gap-4">
        <TimeBox value={timeLeft.hours} label="שעות" />
        <span className="text-2xl md:text-3xl font-bold text-primary cyber-glow">:</span>
        <TimeBox value={timeLeft.minutes} label="דקות" />
        <span className="text-2xl md:text-3xl font-bold text-primary cyber-glow">:</span>
        <TimeBox value={timeLeft.seconds} label="שניות" />
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-accent" />
        <span className="text-accent font-medium">אל תפספס! ההנחה נגמרת היום</span>
      </div>
    </div>
  );
};

export default CountdownTimer;

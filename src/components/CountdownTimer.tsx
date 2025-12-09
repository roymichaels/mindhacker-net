import { useState, useEffect } from "react";
import { Clock, Flame, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetchCountdownSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["countdown_end_date", "countdown_enabled"]);

      if (data) {
        const settings = data.reduce((acc: any, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {});

        const isEnabled = settings.countdown_enabled !== "false";
        setEnabled(isEnabled);

        if (isEnabled && settings.countdown_end_date) {
          const endDate = new Date(settings.countdown_end_date);
          startCountdown(endDate);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const startCountdown = (endDate: Date) => {
      const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const difference = endDate.getTime() - now;

        if (difference <= 0) {
          setIsExpired(true);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      };

      setTimeLeft(calculateTimeLeft());
      setLoading(false);

      const timer = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
            newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    };

    fetchCountdownSettings();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-4 md:p-6 mb-8 text-center animate-fade-in" dir="rtl">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  if (!enabled || isExpired) {
    return null;
  }

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
        {timeLeft.days > 0 && (
          <>
            <TimeBox value={timeLeft.days} label="ימים" />
            <span className="text-2xl md:text-3xl font-bold text-primary cyber-glow">:</span>
          </>
        )}
        <TimeBox value={timeLeft.hours} label="שעות" />
        <span className="text-2xl md:text-3xl font-bold text-primary cyber-glow">:</span>
        <TimeBox value={timeLeft.minutes} label="דקות" />
        <span className="text-2xl md:text-3xl font-bold text-primary cyber-glow">:</span>
        <TimeBox value={timeLeft.seconds} label="שניות" />
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-accent" />
        <span className="text-accent font-medium">אל תפספס! ההנחה נגמרת בקרוב</span>
      </div>
    </div>
  );
};

export default CountdownTimer;

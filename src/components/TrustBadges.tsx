import { useState, useEffect, useRef } from "react";
import { Shield, Lock, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap = [Shield, Lock, Heart];

const TrustBadges = () => {
  const [badges, setBadges] = useState([
    "100% דיסקרטיות",
    "ללא התחייבות",
    "ליווי אישי",
  ]);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["trust_badge_1", "trust_badge_2", "trust_badge_4"]);

      if (data && data.length > 0) {
        const badgesObj = data.reduce((acc: any, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {});

        setBadges([
          badgesObj.trust_badge_1 || "100% דיסקרטיות",
          badgesObj.trust_badge_2 || "ללא התחייבות",
          badgesObj.trust_badge_4 || "ליווי אישי",
        ]);
      }
    };

    fetchBadges();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-wrap justify-center gap-3 md:gap-6 mt-6">
      {badges.map((label, index) => {
        const Icon = iconMap[index];
        return (
          <div
            key={index}
            className={`flex items-center gap-1.5 text-muted-foreground text-xs md:text-sm group transition-all duration-300 hover:text-foreground ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${0.1 + index * 0.1}s` }}
          >
            <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TrustBadges;

import { Shield, Lock, Award, Heart } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    { icon: Shield, label: "100% דיסקרטיות" },
    { icon: Lock, label: "ללא התחייבות" },
    { icon: Award, label: "10+ שנות ניסיון" },
    { icon: Heart, label: "ליווי אישי" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-6">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 text-muted-foreground text-xs md:text-sm"
        >
          <badge.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;

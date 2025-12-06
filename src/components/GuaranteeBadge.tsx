import { ShieldCheck } from "lucide-react";

const GuaranteeBadge = () => {
  return (
    <div className="flex items-center justify-center gap-3 mt-8 p-4 rounded-xl bg-primary/10 border border-primary/30">
      <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-primary" />
      <div className="text-right">
        <p className="font-bold text-foreground text-sm md:text-base">התחייבות שביעות רצון</p>
        <p className="text-xs md:text-sm text-muted-foreground">לא מרוצה מהמפגש הראשון? נחזיר לך את הכסף</p>
      </div>
    </div>
  );
};

export default GuaranteeBadge;

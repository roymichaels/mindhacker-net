import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Gift, Video, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface StartChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StartChangeModal = ({ open, onOpenChange }: StartChangeModalProps) => {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const options = [
    {
      id: "introspection",
      icon: Gift,
      title: t("hero.introspectionForm"),
      description: t("hero.introspectionFormDesc"),
      tag: t("hero.freeGift"),
      route: "/form/866eb5a92355da936aea2b7bcb50726cc3f01badf5ebbeaecfff9b2c4aa7539e",
      color: "amber",
      gradient: "from-amber-500/20 to-yellow-500/10",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/30 hover:border-amber-400/60",
    },
    {
      id: "personal",
      icon: Video,
      title: t("hero.personalHypnosis"),
      description: t("hero.personalHypnosisDesc"),
      tag: t("hero.personalHypnosisTag"),
      route: "/personal-hypnosis",
      color: "accent",
      gradient: "from-accent/20 to-accent/10",
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      borderColor: "border-accent/30 hover:border-accent/60",
    },
    {
      id: "leap",
      icon: Zap,
      title: t("hero.consciousnessLeap"),
      description: t("hero.consciousnessLeapDesc"),
      tag: t("hero.consciousnessLeapTag"),
      route: "/consciousness-leap",
      color: "primary",
      gradient: "from-primary/20 to-primary/10",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      borderColor: "border-primary/30 hover:border-primary/60",
    },
  ];

  const handleSelect = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg md:max-w-2xl bg-background/95 backdrop-blur-xl border-border/50"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {t("header.chooseYourPath")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("dialogs.pathSelectionDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.route)}
                className={`
                  relative flex items-center gap-4 p-4 rounded-xl
                  bg-gradient-to-r ${option.gradient}
                  border ${option.borderColor}
                  transition-all duration-300
                  hover:scale-[1.02] hover:shadow-lg
                  text-${isRTL ? "right" : "left"}
                `}
              >
                <div className={`p-3 rounded-xl ${option.iconBg}`}>
                  <Icon className={`h-6 w-6 ${option.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{option.title}</h3>
                    {option.id === "introspection" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                        {option.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartChangeModal;

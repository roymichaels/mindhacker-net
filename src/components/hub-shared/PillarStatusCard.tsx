import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { PillarColorScheme } from "./pillarColors";

interface PillarStatusCardProps {
  colors: PillarColorScheme;
  icon: LucideIcon;
  title: string;
  description: string;
  journeyPath: string;
  buttonLabel: string;
  children?: ReactNode;
}

const PillarStatusCard = ({
  colors,
  icon: Icon,
  title,
  description,
  journeyPath,
  buttonLabel,
  children,
}: PillarStatusCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className={`p-6 bg-gradient-to-br ${colors.statusGradient} ${colors.statusBorder}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${colors.iconBg}`}>
            <Icon className={`w-8 h-8 ${colors.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${colors.statusTitleColor} mb-2`}>
              {title}
            </h3>
            {children || (
              <>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <Button
                  onClick={() => navigate(journeyPath)}
                  variant="outline"
                  className={colors.statusBtnOutline}
                >
                  {buttonLabel}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PillarStatusCard;

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { PillarColorScheme } from "./pillarColors";

export interface PillarToolItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

interface PillarToolsGridProps {
  tools: PillarToolItem[];
  colors: PillarColorScheme;
  sectionTitle: string;
}

const PillarToolsGrid = ({ tools, colors, sectionTitle }: PillarToolsGridProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h2 className="text-lg font-semibold mb-4">{sectionTitle}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/60 ${colors.toolCardBorder}`}
              onClick={tool.onClick}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-3 rounded-lg ${colors.toolIconBg}`}>
                  <tool.icon className={`w-6 h-6 ${colors.toolIconColor}`} />
                </div>
                <h3 className="font-semibold text-foreground">{tool.title}</h3>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PillarToolsGrid;

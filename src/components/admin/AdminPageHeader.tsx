import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface AdminPageHeaderAction {
  labelKey: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost" | "destructive";
}

interface AdminPageHeaderProps {
  titleKey: string;
  subtitleKey?: string;
  icon?: LucideIcon;
  action?: AdminPageHeaderAction;
  actions?: AdminPageHeaderAction[];
}

const AdminPageHeader = ({ 
  titleKey, 
  subtitleKey, 
  icon: Icon, 
  action,
  actions = []
}: AdminPageHeaderProps) => {
  const { t, isRTL } = useTranslation();

  // Combine single action with actions array
  const allActions = action ? [action, ...actions] : actions;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary hidden sm:flex">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black cyber-glow flex items-center gap-2">
            {Icon && <Icon className="h-6 w-6 sm:hidden text-primary" />}
            {t(titleKey)}
          </h1>
          {subtitleKey && (
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {t(subtitleKey)}
            </p>
          )}
        </div>
      </div>
      
      {allActions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {allActions.map((actionItem, index) => {
            const ActionIcon = actionItem.icon;
            return (
              <Button 
                key={index}
                onClick={actionItem.onClick} 
                variant={actionItem.variant || "default"}
                className="gap-2"
              >
                {ActionIcon && <ActionIcon className="w-4 h-4" />}
                {t(actionItem.labelKey)}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;

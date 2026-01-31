import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { User, Sparkles, Activity, Settings, ShoppingBag, Wand2 } from "lucide-react";
import { ReactNode } from "react";

interface ProfileTabConfig {
  id: string;
  labelKey: string;
  icon: ReactNode;
  content: ReactNode;
  adminOnly?: boolean;
}

interface ProfileTabsProps {
  tabs: ProfileTabConfig[];
  defaultTab?: string;
  isAdmin?: boolean;
}

const ProfileTabs = ({ tabs, defaultTab, isAdmin = false }: ProfileTabsProps) => {
  const { t, isRTL } = useTranslation();

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);
  const defaultValue = defaultTab || visibleTabs[0]?.id || "overview";

  return (
    <Tabs defaultValue={defaultValue} className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted/50 p-1">
        {visibleTabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="gap-2 data-[state=active]:bg-background"
          >
            {tab.icon}
            <span className="hidden sm:inline">{t(tab.labelKey)}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {visibleTabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// Pre-built tab icons for convenience
export const TabIcons = {
  overview: <User className="h-4 w-4" />,
  aurora: <Sparkles className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  purchases: <ShoppingBag className="h-4 w-4" />,
  actions: <Wand2 className="h-4 w-4" />,
};

export default ProfileTabs;

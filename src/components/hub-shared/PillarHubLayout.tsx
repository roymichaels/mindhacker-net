import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { PillarColorScheme } from "./pillarColors";

interface PillarHubLayoutProps {
  colors: PillarColorScheme;
  icon: LucideIcon;
  title: { he: string; en: string };
  description: { he: string; en: string };
  journeyPath: string;
  seoPath: string;
  isLoading?: boolean;
  extraHeaderButtons?: ReactNode;
  journeyLabel?: { he: string; en: string };
  children: ReactNode;
}

const PillarHubLayout = ({
  colors,
  icon: Icon,
  title,
  description,
  journeyPath,
  seoPath,
  isLoading = false,
  extraHeaderButtons,
  journeyLabel,
  children,
}: PillarHubLayoutProps) => {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();

  useSEO({
    title: `${language === 'he' ? title.he : title.en} | MindOS`,
    description: language === 'he' ? description.he : description.en,
    url: `${window.location.origin}${seoPath}`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: language === 'he' ? 'דף הבית' : 'Home', url: window.location.origin },
        { name: language === 'he' ? title.he : title.en, url: `${window.location.origin}${seoPath}` },
      ]),
    ],
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const journeyText = journeyLabel || { he: 'התחל מסע', en: 'Start Journey' };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24 sm:pt-9" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${colors.headerGradient} p-6 shadow-lg border ${colors.headerBorder}`}
        >
          <div className="relative z-10">
            <div className="flex flex-col gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${colors.iconBg} rounded-lg backdrop-blur-sm`}>
                  <Icon className={`h-6 w-6 ${colors.iconColor} ${colors.iconFill || ''}`} />
                </div>
                <h1 className={`text-2xl md:text-3xl font-bold ${colors.titleColor}`}>
                  {language === 'he' ? title.he : title.en}
                </h1>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => navigate(journeyPath)}
                  className={`flex-1 ${colors.primaryBtn}`}
                >
                  <Rocket className="w-4 h-4 me-2" />
                  {language === 'he' ? journeyText.he : journeyText.en}
                </Button>
                {extraHeaderButtons}
              </div>
            </div>
            <p className={`${colors.descColor} text-sm md:text-base`}>
              {language === 'he' ? description.he : description.en}
            </p>
          </div>
          {/* Decorative elements */}
          <div className={`absolute top-0 end-0 w-32 h-32 ${colors.circle1} rounded-full -translate-y-1/2 translate-x-1/2`} />
          <div className={`absolute bottom-0 start-0 w-24 h-24 ${colors.circle2} rounded-full translate-y-1/2 -translate-x-1/2`} />
        </motion.div>

        {children}
      </div>
    </DashboardLayout>
  );
};

export default PillarHubLayout;

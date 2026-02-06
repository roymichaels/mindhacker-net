import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Compass, Heart, Target, Star, Sparkles, Users } from "lucide-react";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";
import { PillarHubLayout, PillarToolsGrid, PillarStatusCard, pillarColors } from "@/components/hub-shared";

const Purpose = () => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const { isLoading } = useLaunchpadData();
  const colors = pillarColors.purpose;

  const tools = [
    { id: 'values', icon: Heart, title: language === 'he' ? 'ערכי ליבה' : 'Core Values', description: language === 'he' ? 'זהה את הערכים המנחים אותך' : 'Identify your guiding values' },
    { id: 'vision', icon: Target, title: language === 'he' ? 'חזון' : 'Vision', description: language === 'he' ? 'צור תמונה ברורה של עתידך' : 'Create a clear picture of your future' },
    { id: 'meaning', icon: Sparkles, title: language === 'he' ? 'משמעות' : 'Meaning', description: language === 'he' ? 'מה נותן לך תחושת משמעות?' : 'What gives you a sense of meaning?' },
    { id: 'mission', icon: Compass, title: language === 'he' ? 'שליחות' : 'Mission', description: language === 'he' ? 'מה השליחות שלך בעולם?' : 'What is your mission in the world?' },
    { id: 'legacy', icon: Star, title: language === 'he' ? 'מורשת' : 'Legacy', description: language === 'he' ? 'מה תשאיר אחריך?' : 'What will you leave behind?' },
    { id: 'alignment', icon: Users, title: language === 'he' ? 'יישור' : 'Alignment', description: language === 'he' ? 'בדוק את היישור בין ערכיך לחייך' : 'Check alignment between values and life' },
  ].map(t => ({ ...t, onClick: () => navigate('/purpose/journey') }));

  return (
    <PillarHubLayout
      colors={colors}
      icon={Compass}
      title={{ he: 'ייעוד', en: 'Purpose' }}
      description={{ he: 'גלה את הייעוד שלך - ההיבט שמחבר את כל תחומי החיים יחדיו', en: 'Discover your purpose - the aspect that connects all life domains together' }}
      journeyPath="/purpose/journey"
      seoPath="/purpose"
      isLoading={isLoading}
    >
      <PillarToolsGrid tools={tools} colors={colors} sectionTitle={language === 'he' ? 'כלי ייעוד' : 'Purpose Tools'} />
      <PillarStatusCard
        colors={colors}
        icon={Compass}
        title={language === 'he' ? 'מדד היישור האישי' : 'Personal Alignment Index'}
        description={language === 'he' ? 'השלם את מסע הייעוד כדי לגלות את מדד היישור שלך' : 'Complete the Purpose Journey to discover your alignment index'}
        journeyPath="/purpose/journey"
        buttonLabel={language === 'he' ? 'התחל את המסע' : 'Start the Journey'}
      />
    </PillarHubLayout>
  );
};

export default Purpose;

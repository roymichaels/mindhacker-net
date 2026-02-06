import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Users, Heart, MessageCircle, Shield, Gift, Home } from "lucide-react";
import { PillarHubLayout, PillarToolsGrid, PillarStatusCard, pillarColors } from "@/components/hub-shared";

const Relationships = () => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const colors = pillarColors.relationships;

  const tools = [
    { id: 'partner', icon: Heart, title: language === 'he' ? 'זוגיות' : 'Partner', description: language === 'he' ? 'ניהול מערכת היחסים הזוגית' : 'Manage your romantic relationship' },
    { id: 'family', icon: Home, title: language === 'he' ? 'משפחה' : 'Family', description: language === 'he' ? 'קשרים משפחתיים' : 'Family connections' },
    { id: 'social', icon: Users, title: language === 'he' ? 'חברתי' : 'Social', description: language === 'he' ? 'חברים וקהילה' : 'Friends and community' },
    { id: 'communication', icon: MessageCircle, title: language === 'he' ? 'תקשורת' : 'Communication', description: language === 'he' ? 'שיפור יכולות תקשורת' : 'Improve communication skills' },
    { id: 'boundaries', icon: Shield, title: language === 'he' ? 'גבולות' : 'Boundaries', description: language === 'he' ? 'הגדרת גבולות בריאים' : 'Set healthy boundaries' },
    { id: 'gratitude', icon: Gift, title: language === 'he' ? 'הכרת תודה' : 'Gratitude', description: language === 'he' ? 'תרגול הכרת תודה' : 'Practice gratitude' },
  ].map(t => ({ ...t, onClick: () => navigate('/relationships/journey') }));

  return (
    <PillarHubLayout
      colors={colors}
      icon={Users}
      title={{ he: 'מרכז הקשרים', en: 'Relationships Hub' }}
      description={{ he: 'בנה קשרים עמוקים ומשמעותיים', en: 'Build deep and meaningful connections' }}
      journeyPath="/relationships/journey"
      seoPath="/relationships"
    >
      <PillarToolsGrid tools={tools} colors={colors} sectionTitle={language === 'he' ? 'כלי קשרים' : 'Relationship Tools'} />
      <PillarStatusCard
        colors={colors}
        icon={Users}
        title={language === 'he' ? 'מדד בריאות הקשרים' : 'Relationship Health Index'}
        description={language === 'he' ? 'השלם את המסע כדי לקבל את המדד שלך' : 'Complete the journey to get your index'}
        journeyPath="/relationships/journey"
        buttonLabel={language === 'he' ? 'התחל את המסע' : 'Start the Journey'}
      />
    </PillarHubLayout>
  );
};

export default Relationships;

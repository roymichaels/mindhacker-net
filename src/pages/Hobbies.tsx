import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Palette, Gamepad2, Music, Dumbbell, TreePine, Users } from "lucide-react";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";
import { PillarHubLayout, PillarToolsGrid, PillarStatusCard, pillarColors } from "@/components/hub-shared";

const Hobbies = () => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const { isLoading } = useLaunchpadData();
  const colors = pillarColors.hobbies;

  const tools = [
    { id: 'creative', icon: Palette, title: language === 'he' ? 'יצירתיות' : 'Creative', description: language === 'he' ? 'פרויקטים יצירתיים ואמנות' : 'Creative projects and art' },
    { id: 'sports', icon: Dumbbell, title: language === 'he' ? 'ספורט' : 'Sports', description: language === 'he' ? 'פעילויות ספורטיביות וכושר' : 'Sports and fitness activities' },
    { id: 'music', icon: Music, title: language === 'he' ? 'מוזיקה ואומנות' : 'Music & Arts', description: language === 'he' ? 'נגינה, ציור ומלאכת יד' : 'Playing, painting and crafts' },
    { id: 'games', icon: Gamepad2, title: language === 'he' ? 'משחקים' : 'Games', description: language === 'he' ? 'משחקי וידאו, לוח ובידור' : 'Video games, board games & entertainment' },
    { id: 'outdoors', icon: TreePine, title: language === 'he' ? 'טבע ופעילויות חוץ' : 'Outdoors', description: language === 'he' ? 'טיולים, קמפינג ופעילויות בטבע' : 'Hiking, camping & outdoor activities' },
    { id: 'social', icon: Users, title: language === 'he' ? 'תחביבים חברתיים' : 'Social Hobbies', description: language === 'he' ? 'קבוצות, מפגשים ופעילויות משותפות' : 'Groups, meetups & shared activities', onClick: () => navigate('/hobbies/journey') },
  ].map(t => ({ ...t, onClick: t.onClick || (() => navigate('/hobbies/journey')) }));

  return (
    <PillarHubLayout
      colors={colors}
      icon={Palette}
      title={{ he: 'תחביבים', en: 'Hobbies' }}
      description={{ he: 'גלה את התחביבים שלך - יצירתיות, פנאי ופעילויות שמביאות לך שמחה ומאזנות את חייך', en: 'Discover your hobbies - creativity, leisure and activities that bring you joy and balance your life' }}
      journeyPath="/hobbies/journey"
      seoPath="/hobbies"
      isLoading={isLoading}
    >
      <PillarToolsGrid tools={tools} colors={colors} sectionTitle={language === 'he' ? 'כלי תחביבים' : 'Hobby Tools'} />
      <PillarStatusCard
        colors={colors}
        icon={Palette}
        title={language === 'he' ? 'מדד איזון הפנאי' : 'Leisure Balance Index'}
        description={language === 'he' ? 'השלם את מסע התחביבים כדי לגלות את מדד איזון הפנאי שלך' : 'Complete the Hobbies Journey to discover your leisure balance index'}
        journeyPath="/hobbies/journey"
        buttonLabel={language === 'he' ? 'התחל את המסע' : 'Start the Journey'}
      />
    </PillarHubLayout>
  );
};

export default Hobbies;

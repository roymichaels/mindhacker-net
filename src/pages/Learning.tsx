import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { GraduationCap, BookOpen, Brain, Lightbulb, Target, Trophy } from "lucide-react";
import { PillarHubLayout, PillarToolsGrid, PillarStatusCard, pillarColors } from "@/components/hub-shared";

const Learning = () => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const colors = pillarColors.learning;

  const tools = [
    { id: 'skills', icon: Brain, title: language === 'he' ? 'כישורים' : 'Skills', description: language === 'he' ? 'עץ כישורים אישי' : 'Personal skill tree' },
    { id: 'reading', icon: BookOpen, title: language === 'he' ? 'קריאה' : 'Reading', description: language === 'he' ? 'מעקב ספרים' : 'Book tracker' },
    { id: 'courses', icon: GraduationCap, title: language === 'he' ? 'קורסים' : 'Courses', description: language === 'he' ? 'קורסים ולימודים' : 'Courses and learning' },
    { id: 'ideas', icon: Lightbulb, title: language === 'he' ? 'רעיונות' : 'Ideas', description: language === 'he' ? 'תיעוד תובנות ורעיונות' : 'Document insights and ideas' },
    { id: 'goals', icon: Target, title: language === 'he' ? 'יעדים' : 'Goals', description: language === 'he' ? 'יעדי למידה' : 'Learning goals' },
    { id: 'achievements', icon: Trophy, title: language === 'he' ? 'הישגים' : 'Achievements', description: language === 'he' ? 'הישגים והתקדמות' : 'Achievements and progress' },
  ].map(t => ({ ...t, onClick: () => navigate('/learning/journey') }));

  return (
    <PillarHubLayout
      colors={colors}
      icon={GraduationCap}
      title={{ he: 'מרכז הלמידה', en: 'Learning Hub' }}
      description={{ he: 'צמח ולמד כל יום', en: 'Grow and learn every day' }}
      journeyPath="/learning/journey"
      seoPath="/learning"
    >
      <PillarToolsGrid tools={tools} colors={colors} sectionTitle={language === 'he' ? 'כלי למידה' : 'Learning Tools'} />
      <PillarStatusCard
        colors={colors}
        icon={GraduationCap}
        title={language === 'he' ? 'מדד הצמיחה האישית' : 'Personal Growth Index'}
        description={language === 'he' ? 'השלם את המסע כדי לקבל את המדד שלך' : 'Complete the journey to get your index'}
        journeyPath="/learning/journey"
        buttonLabel={language === 'he' ? 'התחל את המסע' : 'Start the Journey'}
      />
    </PillarHubLayout>
  );
};

export default Learning;

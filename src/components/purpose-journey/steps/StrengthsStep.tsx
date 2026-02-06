import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Zap, Star, Puzzle } from "lucide-react";

interface StrengthsStepProps {
  data: {
    natural_talents?: string;
    learned_skills?: string;
    unique_combination?: string;
    strength_application?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const StrengthsStep = ({ data, onUpdate, language }: StrengthsStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-600/20 mb-4">
          <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'החוזקות הייחודיות שלך' : 'Your Unique Strengths'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'מה הכוחות והיכולות הייחודיים שלך?' 
            : 'What are your unique powers and abilities?'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה הכישרונות הטבעיים שלך?' : 'What are your natural talents?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הכישרונות שבאים לי בקלות הם...' 
              : 'The talents that come naturally to me are...'}
            value={data.natural_talents || ''}
            onChange={(e) => handleChange('natural_talents', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'אילו מיומנויות רכשת במשך החיים?' : 'What skills have you acquired over time?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המיומנויות שרכשתי כוללות...' 
              : 'The skills I\'ve developed include...'}
            value={data.learned_skills || ''}
            onChange={(e) => handleChange('learned_skills', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Puzzle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה השילוב הייחודי שלך?' : 'What is your unique combination?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'השילוב הייחודי שלי הוא...' 
              : 'My unique combination is...'}
            value={data.unique_combination || ''}
            onChange={(e) => handleChange('unique_combination', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'איך אתה יכול ליישם את החוזקות האלה לטובת הייעוד שלך?' : 'How can you apply these strengths toward your purpose?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני יכול להשתמש בחוזקות שלי כדי...' 
              : 'I can use my strengths to...'}
            value={data.strength_application || ''}
            onChange={(e) => handleChange('strength_application', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default StrengthsStep;

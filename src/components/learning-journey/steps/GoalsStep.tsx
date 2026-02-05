import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Award, TrendingUp } from "lucide-react";

interface GoalsStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const GoalsStep = ({ data, onUpdate, language }: GoalsStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 mb-4">
          <Target className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'מטרות למידה' : 'Learning Goals'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נגדיר את המטרות שלך' 
            : 'Let\'s define your goals'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'כישורים לרכישה' : 'Skills to Acquire'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הכישורים שאני רוצה לרכוש הם...' 
              : 'The skills I want to acquire are...'}
            value={(data.skills_to_acquire as string) || ''}
            onChange={(e) => handleChange('skills_to_acquire', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'יעדי הסמכה' : 'Certification Goals'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'ההסמכות שאני רוצה להשיג...' 
              : 'The certifications I want to achieve...'}
            value={(data.certification_goals as string) || ''}
            onChange={(e) => handleChange('certification_goals', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'השפעה על הקריירה' : 'Career Impact'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הלמידה תשפיע על הקריירה שלי על ידי...' 
              : 'Learning will impact my career by...'}
            value={(data.career_impact as string) || ''}
            onChange={(e) => handleChange('career_impact', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default GoalsStep;

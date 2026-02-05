import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wrench, Star, TrendingUp } from "lucide-react";

interface SkillsStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const SkillsStep = ({ data, onUpdate, language }: SkillsStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 mb-4">
          <Wrench className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'הכישורים שלך' : 'Your Skills'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את הכישורים הנוכחיים שלך' 
            : 'Let\'s understand your current skills'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'כישורים נוכחיים' : 'Current Skills'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הכישורים שאני שולט בהם כוללים...' 
              : 'The skills I\'m proficient in include...'}
            value={(data.current_skills as string) || ''}
            onChange={(e) => handleChange('current_skills', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'כישורים שאני גאה בהם' : 'Skills I\'m Proud Of'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני גאה ביכולות שלי ב...' 
              : 'I\'m proud of my abilities in...'}
            value={(data.proud_skills as string) || ''}
            onChange={(e) => handleChange('proud_skills', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'כישורים לשיפור' : 'Skills to Improve'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רוצה לשפר את הכישורים שלי ב...' 
              : 'I want to improve my skills in...'}
            value={(data.skills_to_improve as string) || ''}
            onChange={(e) => handleChange('skills_to_improve', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default SkillsStep;

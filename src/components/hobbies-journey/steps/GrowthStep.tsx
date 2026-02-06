import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TrendingUp, Star, Target } from "lucide-react";

interface GrowthStepProps {
  data: {
    skills_to_learn?: string[];
    dream_hobby?: string;
    growth_plan?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const GrowthStep = ({ data, onUpdate, language }: GrowthStepProps) => {
  const handleChange = (field: string, value: string | string[]) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(Boolean);
    handleChange('skills_to_learn', skills);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 dark:bg-teal-600/20 mb-4">
          <TrendingUp className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'צמיחה ולמידה' : 'Growth & Learning'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'תחביבים חדשים ומיומנויות שתרצה לפתח' 
            : 'New hobbies and skills you want to develop'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'אילו מיומנויות חדשות אתה רוצה ללמוד? (מופרדים בפסיקים)' : 'What new skills do you want to learn? (separated by commas)'}
          </Label>
          <Input
            placeholder={language === 'he' 
              ? 'נגינה בגיטרה, בישול צרפתי, צילום...' 
              : 'Guitar playing, French cooking, photography...'}
            value={(data.skills_to_learn || []).join(', ')}
            onChange={(e) => handleSkillsChange(e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Star className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מהו תחביב החלומות שלך?' : 'What is your dream hobby?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אם לא היו מגבלות, הייתי עוסק ב...' 
              : 'If there were no limitations, I would...'}
            value={data.dream_hobby || ''}
            onChange={(e) => handleChange('dream_hobby', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מה התוכנית שלך ללמוד ולהתפתח בתחביבים?' : 'What is your plan to learn and grow in hobbies?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מתכנן להתפתח על ידי...' 
              : 'I plan to grow by...'}
            value={data.growth_plan || ''}
            onChange={(e) => handleChange('growth_plan', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default GrowthStep;

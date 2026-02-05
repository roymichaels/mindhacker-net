import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Target, GraduationCap } from "lucide-react";

interface VisionStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const VisionStep = ({ data, onUpdate, language }: VisionStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 mb-4">
          <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'חזון הלמידה שלך' : 'Your Learning Vision'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'תאר את מה שאתה רוצה ללמוד ולשלוט בו' 
            : 'Describe what you want to learn and master'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'החזון שלי ללמידה' : 'My learning vision'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'בעוד שנה אני רוצה לדעת...' 
              : 'In a year I want to know...'}
            value={(data.learning_vision as string) || ''}
            onChange={(e) => handleChange('learning_vision', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'מטרות מיומנות' : 'Mastery goals'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רוצה להתמחות ב...' 
              : 'I want to master...'}
            value={(data.mastery_goals as string) || ''}
            onChange={(e) => handleChange('mastery_goals', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'he' ? 'למה למידה חשובה לי?' : 'Why is learning important to me?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'למידה מתמדת חשובה לי כי...' 
              : 'Continuous learning is important to me because...'}
            value={(data.motivation as string) || ''}
            onChange={(e) => handleChange('motivation', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-indigo-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default VisionStep;

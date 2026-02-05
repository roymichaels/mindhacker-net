import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, TrendingUp, GraduationCap } from "lucide-react";

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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 dark:bg-emerald-600/20 mb-4">
          <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'מטרות כלכליות' : 'Financial Goals'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נגדיר את המטרות הכלכליות שלך' 
            : 'Let\'s define your financial goals'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'מטרות לטווח קצר (שנה)' : 'Short-term goals (1 year)'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המטרות הכלכליות שלי לשנה הקרובה...' 
              : 'My financial goals for the next year...'}
            value={(data.short_term_goals as string) || ''}
            onChange={(e) => handleChange('short_term_goals', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'מטרות לטווח ארוך (5+ שנים)' : 'Long-term goals (5+ years)'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המטרות הכלכליות שלי לטווח הארוך...' 
              : 'My long-term financial goals...'}
            value={(data.long_term_goals as string) || ''}
            onChange={(e) => handleChange('long_term_goals', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {language === 'he' ? 'חינוך פיננסי' : 'Financial Education'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'מה אני רוצה ללמוד על כסף והשקעות...' 
              : 'What I want to learn about money and investments...'}
            value={(data.financial_education as string) || ''}
            onChange={(e) => handleChange('financial_education', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-emerald-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default GoalsStep;

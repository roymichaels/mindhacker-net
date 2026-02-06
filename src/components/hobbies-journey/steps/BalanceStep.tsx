import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Scale, Briefcase, Heart } from "lucide-react";

interface BalanceStepProps {
  data: {
    work_life_hobby?: string;
    integration_strategy?: string;
    priorities?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const BalanceStep = ({ data, onUpdate, language }: BalanceStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 dark:bg-teal-600/20 mb-4">
          <Scale className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'איזון חיים-עבודה-תחביבים' : 'Work-Life-Hobby Balance'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'מצא את האיזון הנכון בין תחומי החיים השונים' 
            : 'Find the right balance between different life domains'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'איך התחביבים שלך משתלבים עם העבודה והחיים?' : 'How do your hobbies integrate with work and life?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'התחביבים שלי משתלבים בחיי על ידי...' 
              : 'My hobbies fit into my life by...'}
            value={data.work_life_hobby || ''}
            onChange={(e) => handleChange('work_life_hobby', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Scale className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מהי האסטרטגיה שלך לשמור על איזון?' : 'What is your strategy for maintaining balance?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'האסטרטגיה שלי לאיזון היא...' 
              : 'My strategy for balance is...'}
            value={data.integration_strategy || ''}
            onChange={(e) => handleChange('integration_strategy', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Heart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מה סדר העדיפויות שלך בחיים?' : 'What are your priorities in life?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'העדיפויות שלי הן...' 
              : 'My priorities are...'}
            value={data.priorities || ''}
            onChange={(e) => handleChange('priorities', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default BalanceStep;

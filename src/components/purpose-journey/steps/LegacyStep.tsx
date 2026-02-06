import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Award, MessageCircle, Star } from "lucide-react";

interface LegacyStepProps {
  data: {
    legacy_statement?: string;
    remembered_for?: string;
    life_message?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const LegacyStep = ({ data, onUpdate, language }: LegacyStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-600/20 mb-4">
          <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'המורשת שלך' : 'Your Legacy'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'מה אתה רוצה להשאיר אחריך?' 
            : 'What do you want to leave behind?'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה המורשת שאתה רוצה להשאיר?' : 'What legacy do you want to leave?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המורשת שאני רוצה להשאיר היא...' 
              : 'The legacy I want to leave is...'}
            value={data.legacy_statement || ''}
            onChange={(e) => handleChange('legacy_statement', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'בעוד 50 שנה, על מה אתה רוצה שיזכרו אותך?' : 'In 50 years, what do you want to be remembered for?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רוצה שיזכרו אותי כמי ש...' 
              : 'I want to be remembered as someone who...'}
            value={data.remembered_for || ''}
            onChange={(e) => handleChange('remembered_for', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'אם היית יכול להעביר מסר אחד לדורות הבאים, מה הוא היה?' : 'If you could pass one message to future generations, what would it be?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'המסר שלי לדורות הבאים הוא...' 
              : 'My message to future generations is...'}
            value={data.life_message || ''}
            onChange={(e) => handleChange('life_message', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default LegacyStep;

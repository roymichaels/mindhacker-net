import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Target, Heart } from "lucide-react";

interface HealthVisionStepProps {
  data: {
    health_vision?: string;
    ideal_feeling?: string;
    motivation?: string;
  };
  onUpdate: (data: any) => void;
  language: string;
}

const HealthVisionStep = ({ data, onUpdate, language }: HealthVisionStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 dark:bg-red-600/20 mb-4">
          <Sparkles className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'חזון הבריאות שלך' : 'Your Health Vision'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'תאר את עצמך בעוד 90 יום - איך תרגיש? איך תיראה?' 
            : 'Describe yourself in 90 days - how will you feel? How will you look?'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
            {language === 'he' ? 'החזון שלי לבריאות מיטבית' : 'My vision for optimal health'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'בעוד 90 יום אני רואה את עצמי...' 
              : 'In 90 days I see myself...'}
            value={data.health_vision || ''}
            onChange={(e) => handleChange('health_vision', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-red-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
            {language === 'he' ? 'איך אני רוצה להרגיש כל יום?' : 'How do I want to feel every day?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רוצה להתעורר ולהרגיש...' 
              : 'I want to wake up feeling...'}
            value={data.ideal_feeling || ''}
            onChange={(e) => handleChange('ideal_feeling', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-red-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
            {language === 'he' ? 'למה זה חשוב לי עכשיו?' : 'Why is this important to me now?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הסיבה שאני מחויב לשינוי הזה היא...' 
              : 'The reason I\'m committed to this change is...'}
            value={data.motivation || ''}
            onChange={(e) => handleChange('motivation', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-red-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default HealthVisionStep;

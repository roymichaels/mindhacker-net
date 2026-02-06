import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Compass, Target, Sparkles } from "lucide-react";

interface VisionStepProps {
  data: {
    life_purpose?: string;
    big_picture?: string;
    ideal_future?: string;
  };
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-600/20 mb-4">
          <Compass className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'חזון הייעוד שלך' : 'Your Purpose Vision'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'מה הייעוד שלך בחיים? מה התמונה הגדולה?' 
            : 'What is your purpose in life? What is the big picture?'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה הייעוד שלך בחיים?' : 'What is your life purpose?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מאמין שהייעוד שלי הוא...' 
              : 'I believe my purpose is...'}
            value={data.life_purpose || ''}
            onChange={(e) => handleChange('life_purpose', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה התמונה הגדולה של החיים שלך?' : 'What is the big picture of your life?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'כשאני מסתכל על החיים שלי מלמעלה, אני רואה...' 
              : 'When I look at my life from above, I see...'}
            value={data.big_picture || ''}
            onChange={(e) => handleChange('big_picture', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'איך נראה העתיד האידיאלי שלך?' : 'What does your ideal future look like?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'בעוד 10 שנים אני רואה את עצמי...' 
              : 'In 10 years I see myself...'}
            value={data.ideal_future || ''}
            onChange={(e) => handleChange('ideal_future', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default VisionStep;

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Target, Heart } from "lucide-react";

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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 dark:bg-pink-600/20 mb-4">
          <Sparkles className="w-8 h-8 text-pink-600 dark:text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'חזון הקשרים שלך' : 'Your Relationship Vision'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'תאר את הקשרים שאתה רוצה לבנות ולטפח בחייך' 
            : 'Describe the relationships you want to build and nurture in your life'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            {language === 'he' ? 'החזון שלי לקשרים משמעותיים' : 'My vision for meaningful relationships'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רואה את עצמי מוקף באנשים שאוהבים אותי ותומכים בי...' 
              : 'I see myself surrounded by people who love and support me...'}
            value={(data.relationship_vision as string) || ''}
            onChange={(e) => handleChange('relationship_vision', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-pink-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            {language === 'he' ? 'הקשרים האידיאליים שלי' : 'My ideal connections'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני רוצה קשרים שמאופיינים ב...' 
              : 'I want connections that are characterized by...'}
            value={(data.ideal_connections as string) || ''}
            onChange={(e) => handleChange('ideal_connections', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-pink-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            {language === 'he' ? 'למה קשרים טובים חשובים לי עכשיו?' : 'Why are good relationships important to me now?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מחויב לשיפור הקשרים שלי כי...' 
              : 'I\'m committed to improving my relationships because...'}
            value={(data.motivation as string) || ''}
            onChange={(e) => handleChange('motivation', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-pink-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default VisionStep;

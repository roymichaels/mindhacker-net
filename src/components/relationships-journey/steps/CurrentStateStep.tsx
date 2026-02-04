import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Users, Heart, Activity } from "lucide-react";

interface CurrentStateStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const CurrentStateStep = ({ data, onUpdate, language }: CurrentStateStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600/20 mb-4">
          <Activity className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'המצב הנוכחי שלך' : 'Your Current State'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את מצב הקשרים הנוכחי שלך' 
            : 'Let\'s understand your current relationship situation'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'שביעות רצון מהקשרים' : 'Relationship Satisfaction'}
          </Label>
          <Slider
            value={[(data.relationship_satisfaction as number) || 50]}
            onValueChange={(value) => handleChange('relationship_satisfaction', value[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{language === 'he' ? 'לא מרוצה' : 'Not satisfied'}</span>
            <span className="font-medium text-pink-400">{(data.relationship_satisfaction as number) || 50}%</span>
            <span>{language === 'he' ? 'מאוד מרוצה' : 'Very satisfied'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'רמת בדידות' : 'Loneliness Level'}
          </Label>
          <Slider
            value={[(data.loneliness_level as number) || 30]}
            onValueChange={(value) => handleChange('loneliness_level', value[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{language === 'he' ? 'לא בודד' : 'Not lonely'}</span>
            <span className="font-medium text-pink-400">{(data.loneliness_level as number) || 30}%</span>
            <span>{language === 'he' ? 'מאוד בודד' : 'Very lonely'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            {language === 'he' ? 'רמת התמיכה שאתה מקבל' : 'Support level you receive'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'תאר את רמת התמיכה שאתה מקבל מסביבתך...' 
              : 'Describe the support level you receive from your environment...'}
            value={(data.support_level as string) || ''}
            onChange={(e) => handleChange('support_level', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-pink-500"
          />
        </div>
      </div>
    </div>
  );
};

export default CurrentStateStep;

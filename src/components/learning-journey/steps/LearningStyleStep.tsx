import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Clock, Lightbulb } from "lucide-react";

interface LearningStyleStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const LearningStyleStep = ({ data, onUpdate, language }: LearningStyleStepProps) => {
  const handleChange = (field: string, value: unknown) => {
    onUpdate({ ...data, [field]: value });
  };

  const learningStyles = [
    { value: 'visual', he: 'ויזואלי', en: 'Visual' },
    { value: 'auditory', he: 'שמיעתי', en: 'Auditory' },
    { value: 'reading', he: 'קריאה/כתיבה', en: 'Reading/Writing' },
    { value: 'kinesthetic', he: 'תנועתי/מעשי', en: 'Kinesthetic' },
    { value: 'mixed', he: 'משולב', en: 'Mixed' },
  ];

  const bestTimes = [
    { value: 'morning', he: 'בוקר', en: 'Morning' },
    { value: 'afternoon', he: 'צהריים', en: 'Afternoon' },
    { value: 'evening', he: 'ערב', en: 'Evening' },
    { value: 'night', he: 'לילה', en: 'Night' },
    { value: 'flexible', he: 'גמיש', en: 'Flexible' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/20 mb-4">
          <Brain className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'סגנון הלמידה שלך' : 'Your Learning Style'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין איך אתה לומד הכי טוב' 
            : 'Let\'s understand how you learn best'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            {language === 'he' ? 'סגנון למידה מועדף' : 'Preferred Learning Style'}
          </Label>
          <Select
            value={(data.preferred_style as string) || ''}
            onValueChange={(value) => handleChange('preferred_style', value)}
          >
            <SelectTrigger className="bg-gray-800/50 border-gray-700">
              <SelectValue placeholder={language === 'he' ? 'בחר סגנון' : 'Select style'} />
            </SelectTrigger>
            <SelectContent>
              {learningStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {language === 'he' ? style.he : style.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            {language === 'he' ? 'הזמן הטוב ביותר ללמידה' : 'Best Time to Learn'}
          </Label>
          <Select
            value={(data.best_time as string) || ''}
            onValueChange={(value) => handleChange('best_time', value)}
          >
            <SelectTrigger className="bg-gray-800/50 border-gray-700">
              <SelectValue placeholder={language === 'he' ? 'בחר זמן' : 'Select time'} />
            </SelectTrigger>
            <SelectContent>
              {bestTimes.map((time) => (
                <SelectItem key={time.value} value={time.value}>
                  {language === 'he' ? time.he : time.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-indigo-400" />
            {language === 'he' ? 'סביבת למידה אידיאלית' : 'Ideal Learning Environment'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני לומד הכי טוב כש...' 
              : 'I learn best when...'}
            value={(data.learning_environment as string) || ''}
            onChange={(e) => handleChange('learning_environment', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default LearningStyleStep;

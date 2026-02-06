import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Palette, Lightbulb } from "lucide-react";

interface CreativityStepProps {
  data: {
    creative_outlets?: string[];
    creative_expression?: string;
    new_creative_interests?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const CreativityStep = ({ data, onUpdate, language }: CreativityStepProps) => {
  const handleChange = (field: string, value: string | string[]) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleOutletsChange = (value: string) => {
    const outlets = value.split(',').map(o => o.trim()).filter(Boolean);
    handleChange('creative_outlets', outlets);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 dark:bg-teal-600/20 mb-4">
          <Sparkles className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'ביטוי יצירתי' : 'Creative Expression'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'חקור את הצד היצירתי שלך ואת דרכי הביטוי' 
            : 'Explore your creative side and modes of expression'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Palette className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'מהם האפיקים היצירתיים שלך? (מופרדים בפסיקים)' : 'What are your creative outlets? (separated by commas)'}
          </Label>
          <Input
            placeholder={language === 'he' 
              ? 'ציור, כתיבה, מוזיקה, בישול...' 
              : 'Painting, writing, music, cooking...'}
            value={(data.creative_outlets || []).join(', ')}
            onChange={(e) => handleOutletsChange(e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'איך אתה מבטא את עצמך יצירתית?' : 'How do you express yourself creatively?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מבטא את עצמי דרך...' 
              : 'I express myself through...'}
            value={data.creative_expression || ''}
            onChange={(e) => handleChange('creative_expression', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Lightbulb className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {language === 'he' ? 'אילו תחומים יצירתיים חדשים מעניינים אותך?' : 'What new creative areas interest you?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הייתי רוצה לנסות...' 
              : 'I would like to try...'}
            value={data.new_creative_interests || ''}
            onChange={(e) => handleChange('new_creative_interests', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-teal-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default CreativityStep;

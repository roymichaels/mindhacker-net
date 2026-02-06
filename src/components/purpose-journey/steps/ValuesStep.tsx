import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Scale, AlertTriangle } from "lucide-react";

interface ValuesStepProps {
  data: {
    core_values?: string;
    values_expression?: string;
    neglected_value?: string;
    values_conflict?: string;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const ValuesStep = ({ data, onUpdate, language }: ValuesStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 dark:bg-purple-600/20 mb-4">
          <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'ערכי הליבה שלך' : 'Your Core Values'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'מה הערכים העמוקים ביותר שמנחים אותך?' 
            : 'What are the deepest values that guide you?'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מהם 5 הערכים הכי חשובים לך בחיים?' : 'What are your 5 most important values?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הערכים שהכי חשובים לי הם: חופש, אמת, יצירתיות...' 
              : 'My most important values are: freedom, truth, creativity...'}
            value={data.core_values || ''}
            onChange={(e) => handleChange('core_values', e.target.value)}
            className="min-h-[100px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'כיצד הערכים האלה מתבטאים ביום-יום שלך?' : 'How do these values show up in your daily life?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הערכים שלי מתבטאים כאשר אני...' 
              : 'My values show up when I...'}
            value={data.values_expression || ''}
            onChange={(e) => handleChange('values_expression', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'איזה ערך אתה מרגיש שאתה לא חי לפיו מספיק?' : 'Which value do you feel you\'re not living enough?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מרגיש שאני לא מספיק חי את...' 
              : 'I feel I\'m not living enough...'}
            value={data.neglected_value || ''}
            onChange={(e) => handleChange('neglected_value', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {language === 'he' ? 'מה קורה כשאתה פועל נגד הערכים שלך?' : 'What happens when you act against your values?'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'כשאני פועל נגד הערכים שלי אני מרגיש...' 
              : 'When I act against my values I feel...'}
            value={data.values_conflict || ''}
            onChange={(e) => handleChange('values_conflict', e.target.value)}
            className="min-h-[80px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-purple-500 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default ValuesStep;

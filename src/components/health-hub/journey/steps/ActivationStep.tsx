import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Rocket, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { HealthJourneyData } from "@/hooks/useHealthJourney";

interface ActivationStepProps {
  data: {
    commitment_level?: number;
    priority_area?: string;
    first_action?: string;
    support_needed?: string;
  };
  onUpdate: (data: any) => void;
  language: string;
  journeyData?: HealthJourneyData;
}

const priorityOptions = {
  he: [
    { value: 'nutrition', label: 'תזונה והרגלי אכילה' },
    { value: 'exercise', label: 'פעילות גופנית' },
    { value: 'sleep', label: 'שינה ומנוחה' },
    { value: 'stress', label: 'ניהול מתח' },
    { value: 'energy', label: 'רמות אנרגיה' },
    { value: 'mindset', label: 'שינוי אמונות' }
  ],
  en: [
    { value: 'nutrition', label: 'Nutrition and eating habits' },
    { value: 'exercise', label: 'Physical activity' },
    { value: 'sleep', label: 'Sleep and rest' },
    { value: 'stress', label: 'Stress management' },
    { value: 'energy', label: 'Energy levels' },
    { value: 'mindset', label: 'Belief change' }
  ]
};

const ActivationStep = ({ data, onUpdate, language, journeyData }: ActivationStepProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const priorities = language === 'he' ? priorityOptions.he : priorityOptions.en;

  // Summarize what was collected
  const getSummary = () => {
    const items = [];
    
    if (journeyData?.step_1_vision?.health_vision) {
      items.push({
        label: language === 'he' ? 'החזון שלך' : 'Your Vision',
        value: journeyData.step_1_vision.health_vision.slice(0, 50) + '...'
      });
    }
    
    if (journeyData?.step_2_current_state?.overall_health) {
      items.push({
        label: language === 'he' ? 'בריאות נוכחית' : 'Current Health',
        value: `${journeyData.step_2_current_state.overall_health}/10`
      });
    }
    
    if (journeyData?.step_6_stress?.stress_level) {
      items.push({
        label: language === 'he' ? 'רמת מתח' : 'Stress Level',
        value: `${journeyData.step_6_stress.stress_level}/10`
      });
    }
    
    return items;
  };

  const summaryItems = getSummary();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 dark:bg-red-600/20 mb-4">
          <Rocket className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'סיכום והפעלה' : 'Summary & Activation'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'עכשיו ניצור לך תוכנית בריאות מותאמת אישית ל-90 יום!' 
            : 'Now we\'ll create a personalized 90-day health plan for you!'}
        </p>
      </div>

      {/* Journey Summary */}
      {summaryItems.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-red-100 to-gray-100 dark:from-red-900/30 dark:to-gray-900/50 rounded-lg border border-red-300/50 dark:border-red-800/30">
          <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {language === 'he' ? 'מה אספנו עד כה' : 'What we\'ve gathered'}
          </h3>
          <div className="space-y-2">
            {summaryItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commitment Level */}
      <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'רמת המחויבות שלי לשינוי (1-10)' : 'My commitment level to change (1-10)'}
        </Label>
        <div className="px-2">
          <Slider
            value={[data.commitment_level || 7]}
            onValueChange={([value]) => handleChange('commitment_level', value)}
            min={1}
            max={10}
            step={1}
            className="[&>span:first-child]:bg-red-950 [&_[role=slider]]:bg-red-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{language === 'he' ? 'מתלבט' : 'Uncertain'}</span>
            <span className="font-bold text-red-600 dark:text-red-400 text-lg">{data.commitment_level || 7}</span>
            <span>{language === 'he' ? 'מחויב לגמרי' : 'Fully committed'}</span>
          </div>
        </div>
      </div>

      {/* Priority Area */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'התחום שהכי חשוב לי להתמקד בו' : 'The area most important for me to focus on'}
        </Label>
        <RadioGroup
          value={data.priority_area || ''}
          onValueChange={(value) => handleChange('priority_area', value)}
          className="grid grid-cols-2 gap-3"
        >
          {priorities.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem 
                value={option.value} 
                id={`priority-${option.value}`}
                className="border-red-600 text-red-600"
              />
              <label htmlFor={`priority-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* First Action */}
      <div className="space-y-2">
        <Label className="text-foreground">
          {language === 'he' ? 'הפעולה הראשונה שאני מתחייב לעשות היום' : 'The first action I commit to doing today'}
        </Label>
        <Textarea
          placeholder={language === 'he' 
            ? 'היום אני אעשה...' 
            : 'Today I will do...'}
          value={data.first_action || ''}
          onChange={(e) => handleChange('first_action', e.target.value)}
          className="min-h-[60px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-red-500 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Support Needed */}
      <div className="space-y-2">
        <Label className="text-foreground">
          {language === 'he' ? 'איזו תמיכה אני צריך?' : 'What support do I need?'}
        </Label>
        <Textarea
          placeholder={language === 'he' 
            ? 'כדי להצליח, אני צריך...' 
            : 'To succeed, I need...'}
          value={data.support_needed || ''}
          onChange={(e) => handleChange('support_needed', e.target.value)}
          className="min-h-[60px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-red-500 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Motivational Message */}
      <div className="p-4 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-600/20 dark:to-pink-600/20 rounded-lg border border-red-300/50 dark:border-red-500/30 text-center">
        <Sparkles className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
        <p className="text-sm text-foreground">
          {language === 'he' 
            ? 'לחץ על "סיים וצור תוכנית" כדי לקבל תוכנית בריאות מותאמת אישית ל-90 יום עם משימות שבועיות!' 
            : 'Click "Finish & Create Plan" to get a personalized 90-day health plan with weekly tasks!'}
        </p>
      </div>
    </div>
  );
};

export default ActivationStep;

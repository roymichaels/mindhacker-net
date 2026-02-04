import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Brain, AlertTriangle, Heart } from "lucide-react";

interface StressStepProps {
  data: {
    stress_level?: number;
    stress_triggers?: string[];
    coping_methods?: string[];
    relaxation_time?: string;
  };
  onUpdate: (data: any) => void;
  language: string;
}

const triggerOptions = {
  he: [
    { value: 'work', label: 'עבודה/קריירה' },
    { value: 'money', label: 'כספים' },
    { value: 'relationships', label: 'מערכות יחסים' },
    { value: 'health', label: 'בריאות' },
    { value: 'family', label: 'משפחה' },
    { value: 'time', label: 'חוסר זמן' },
    { value: 'uncertainty', label: 'אי-וודאות' },
    { value: 'social', label: 'לחץ חברתי' }
  ],
  en: [
    { value: 'work', label: 'Work/Career' },
    { value: 'money', label: 'Finances' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'health', label: 'Health' },
    { value: 'family', label: 'Family' },
    { value: 'time', label: 'Lack of time' },
    { value: 'uncertainty', label: 'Uncertainty' },
    { value: 'social', label: 'Social pressure' }
  ]
};

const copingOptions = {
  he: [
    { value: 'exercise', label: 'פעילות גופנית' },
    { value: 'meditation', label: 'מדיטציה' },
    { value: 'breathing', label: 'תרגילי נשימה' },
    { value: 'nature', label: 'בילוי בטבע' },
    { value: 'music', label: 'מוזיקה' },
    { value: 'talking', label: 'שיחה עם אנשים קרובים' },
    { value: 'hobbies', label: 'תחביבים' },
    { value: 'sleep', label: 'שינה' },
    { value: 'food', label: 'אוכל (לא תמיד בריא)' },
    { value: 'avoidance', label: 'הימנעות' }
  ],
  en: [
    { value: 'exercise', label: 'Physical activity' },
    { value: 'meditation', label: 'Meditation' },
    { value: 'breathing', label: 'Breathing exercises' },
    { value: 'nature', label: 'Time in nature' },
    { value: 'music', label: 'Music' },
    { value: 'talking', label: 'Talking to loved ones' },
    { value: 'hobbies', label: 'Hobbies' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'food', label: 'Food (not always healthy)' },
    { value: 'avoidance', label: 'Avoidance' }
  ]
};

const relaxationOptions = {
  he: [
    { value: 'none', label: 'כמעט ולא' },
    { value: '15min', label: '15 דקות ביום' },
    { value: '30min', label: '30 דקות ביום' },
    { value: '1hour', label: 'שעה או יותר ביום' }
  ],
  en: [
    { value: 'none', label: 'Almost never' },
    { value: '15min', label: '15 minutes daily' },
    { value: '30min', label: '30 minutes daily' },
    { value: '1hour', label: '1 hour or more daily' }
  ]
};

const StressStep = ({ data, onUpdate, language }: StressStepProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleTrigger = (trigger: string) => {
    const current = data.stress_triggers || [];
    const updated = current.includes(trigger)
      ? current.filter(t => t !== trigger)
      : [...current, trigger];
    handleChange('stress_triggers', updated);
  };

  const toggleCoping = (method: string) => {
    const current = data.coping_methods || [];
    const updated = current.includes(method)
      ? current.filter(m => m !== method)
      : [...current, method];
    handleChange('coping_methods', updated);
  };

  const triggers = language === 'he' ? triggerOptions.he : triggerOptions.en;
  const coping = language === 'he' ? copingOptions.he : copingOptions.en;
  const relaxation = language === 'he' ? relaxationOptions.he : relaxationOptions.en;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 mb-4">
          <Brain className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'מתח ורגש' : 'Stress & Emotions'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'הבריאות הנפשית משפיעה על כל שאר הבריאות' 
            : 'Mental health affects all other aspects of health'}
        </p>
      </div>

      {/* Stress Level */}
      <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          {language === 'he' ? 'רמת הלחץ הממוצעת שלי (1-10)' : 'My average stress level (1-10)'}
        </Label>
        <div className="px-2">
          <Slider
            value={[data.stress_level || 5]}
            onValueChange={([value]) => handleChange('stress_level', value)}
            min={1}
            max={10}
            step={1}
            className="[&>span:first-child]:bg-red-950 [&_[role=slider]]:bg-red-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{language === 'he' ? 'רגוע' : 'Calm'}</span>
            <span className="font-bold text-red-400 text-lg">{data.stress_level || 5}</span>
            <span>{language === 'he' ? 'לחוץ מאוד' : 'Very stressed'}</span>
          </div>
        </div>
      </div>

      {/* Stress Triggers */}
      <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          {language === 'he' ? 'מקורות לחץ עיקריים' : 'Main stress sources'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {triggers.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`trigger-${option.value}`}
                checked={(data.stress_triggers || []).includes(option.value)}
                onCheckedChange={() => toggleTrigger(option.value)}
                className="border-red-600 data-[state=checked]:bg-red-600"
              />
              <label
                htmlFor={`trigger-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Coping Methods */}
      <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-400" />
          {language === 'he' ? 'איך אני מתמודד עם לחץ?' : 'How do I cope with stress?'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {coping.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`coping-${option.value}`}
                checked={(data.coping_methods || []).includes(option.value)}
                onCheckedChange={() => toggleCoping(option.value)}
                className="border-red-600 data-[state=checked]:bg-red-600"
              />
              <label
                htmlFor={`coping-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Relaxation Time */}
      <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg">
        <Label>
          {language === 'he' ? 'כמה זמן ביום אני מקדיש להרפיה?' : 'How much daily time do I dedicate to relaxation?'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {relaxation.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('relaxation_time', option.value)}
              className={`p-3 rounded-lg text-sm text-center transition-all ${
                data.relaxation_time === option.value
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StressStep;

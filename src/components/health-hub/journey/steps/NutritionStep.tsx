import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Apple, Droplets, AlertTriangle } from "lucide-react";

interface NutritionStepProps {
  data: {
    eating_habits?: string;
    water_intake?: string;
    diet_challenges?: string[];
    allergies?: string[];
  };
  onUpdate: (data: any) => void;
  language: string;
}

const waterOptions = {
  he: [
    { value: 'less-4', label: 'פחות מ-4 כוסות' },
    { value: '4-6', label: '4-6 כוסות' },
    { value: '6-8', label: '6-8 כוסות' },
    { value: 'more-8', label: 'יותר מ-8 כוסות' }
  ],
  en: [
    { value: 'less-4', label: 'Less than 4 glasses' },
    { value: '4-6', label: '4-6 glasses' },
    { value: '6-8', label: '6-8 glasses' },
    { value: 'more-8', label: 'More than 8 glasses' }
  ]
};

const challengeOptions = {
  he: [
    { value: 'emotional_eating', label: 'אכילה רגשית' },
    { value: 'late_night', label: 'נשנושים לילה' },
    { value: 'processed_food', label: 'מזון מעובד' },
    { value: 'sugar', label: 'תלות בסוכר' },
    { value: 'irregular_meals', label: 'ארוחות לא סדירות' },
    { value: 'overeating', label: 'אכילת יתר' },
    { value: 'undereating', label: 'אכילה לא מספקת' },
    { value: 'no_veggies', label: 'חוסר ירקות/פירות' }
  ],
  en: [
    { value: 'emotional_eating', label: 'Emotional eating' },
    { value: 'late_night', label: 'Late night snacking' },
    { value: 'processed_food', label: 'Processed food' },
    { value: 'sugar', label: 'Sugar dependency' },
    { value: 'irregular_meals', label: 'Irregular meals' },
    { value: 'overeating', label: 'Overeating' },
    { value: 'undereating', label: 'Undereating' },
    { value: 'no_veggies', label: 'Lack of fruits/vegetables' }
  ]
};

const NutritionStep = ({ data, onUpdate, language }: NutritionStepProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleChallenge = (challenge: string) => {
    const current = data.diet_challenges || [];
    const updated = current.includes(challenge)
      ? current.filter(c => c !== challenge)
      : [...current, challenge];
    handleChange('diet_challenges', updated);
  };

  const challenges = language === 'he' ? challengeOptions.he : challengeOptions.en;
  const water = language === 'he' ? waterOptions.he : waterOptions.en;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 mb-4">
          <Apple className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'התזונה שלך' : 'Your Nutrition'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'מה אתה אוכל משפיע על איך אתה מרגיש' 
            : 'What you eat affects how you feel'}
        </p>
      </div>

      {/* Eating Habits Description */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Apple className="w-4 h-4 text-red-400" />
          {language === 'he' ? 'תאר את הרגלי האכילה שלך' : 'Describe your eating habits'}
        </Label>
        <Textarea
          placeholder={language === 'he' 
            ? 'איך נראה יום טיפוסי של אכילה?' 
            : 'What does a typical eating day look like?'}
          value={data.eating_habits || ''}
          onChange={(e) => handleChange('eating_habits', e.target.value)}
          className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-red-500"
        />
      </div>

      {/* Water Intake */}
      <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-red-400" />
          {language === 'he' ? 'כמה מים אתה שותה ביום?' : 'How much water do you drink daily?'}
        </Label>
        <RadioGroup
          value={data.water_intake || ''}
          onValueChange={(value) => handleChange('water_intake', value)}
          className="grid grid-cols-2 gap-3"
        >
          {water.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem 
                value={option.value} 
                id={`water-${option.value}`}
                className="border-red-600 text-red-600"
              />
              <label htmlFor={`water-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Diet Challenges */}
      <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          {language === 'he' ? 'אתגרים בתזונה (סמן הכל שרלוונטי)' : 'Diet challenges (select all that apply)'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {challenges.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`challenge-${option.value}`}
                checked={(data.diet_challenges || []).includes(option.value)}
                onCheckedChange={() => toggleChallenge(option.value)}
                className="border-red-600 data-[state=checked]:bg-red-600"
              />
              <label
                htmlFor={`challenge-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionStep;

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, Target, AlertCircle } from "lucide-react";

interface ExerciseStepProps {
  data: {
    current_activity?: string;
    preferred_exercise?: string[];
    limitations?: string[];
    frequency_goal?: string;
  };
  onUpdate: (data: any) => void;
  language: string;
}

const activityLevels = {
  he: [
    { value: 'sedentary', label: 'יושבני - ללא פעילות' },
    { value: 'light', label: 'קל - הליכה מזדמנת' },
    { value: 'moderate', label: 'בינוני - 1-2 אימונים בשבוע' },
    { value: 'active', label: 'פעיל - 3-4 אימונים בשבוע' },
    { value: 'very_active', label: 'מאוד פעיל - 5+ אימונים' }
  ],
  en: [
    { value: 'sedentary', label: 'Sedentary - no activity' },
    { value: 'light', label: 'Light - occasional walking' },
    { value: 'moderate', label: 'Moderate - 1-2 workouts/week' },
    { value: 'active', label: 'Active - 3-4 workouts/week' },
    { value: 'very_active', label: 'Very active - 5+ workouts' }
  ]
};

const exerciseTypes = {
  he: [
    { value: 'walking', label: 'הליכה' },
    { value: 'running', label: 'ריצה' },
    { value: 'swimming', label: 'שחייה' },
    { value: 'gym', label: 'חדר כושר' },
    { value: 'yoga', label: 'יוגה/פילאטיס' },
    { value: 'cycling', label: 'רכיבה על אופניים' },
    { value: 'dancing', label: 'ריקוד' },
    { value: 'martial_arts', label: 'אומנויות לחימה' },
    { value: 'home_workout', label: 'אימון בבית' },
    { value: 'team_sports', label: 'ספורט קבוצתי' }
  ],
  en: [
    { value: 'walking', label: 'Walking' },
    { value: 'running', label: 'Running' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'gym', label: 'Gym' },
    { value: 'yoga', label: 'Yoga/Pilates' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'dancing', label: 'Dancing' },
    { value: 'martial_arts', label: 'Martial Arts' },
    { value: 'home_workout', label: 'Home Workout' },
    { value: 'team_sports', label: 'Team Sports' }
  ]
};

const frequencyGoals = {
  he: [
    { value: '2-3', label: '2-3 פעמים בשבוע' },
    { value: '3-4', label: '3-4 פעמים בשבוע' },
    { value: '4-5', label: '4-5 פעמים בשבוע' },
    { value: 'daily', label: 'כל יום' }
  ],
  en: [
    { value: '2-3', label: '2-3 times a week' },
    { value: '3-4', label: '3-4 times a week' },
    { value: '4-5', label: '4-5 times a week' },
    { value: 'daily', label: 'Daily' }
  ]
};

const ExerciseStep = ({ data, onUpdate, language }: ExerciseStepProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const toggleExercise = (exercise: string) => {
    const current = data.preferred_exercise || [];
    const updated = current.includes(exercise)
      ? current.filter(e => e !== exercise)
      : [...current, exercise];
    handleChange('preferred_exercise', updated);
  };

  const activities = language === 'he' ? activityLevels.he : activityLevels.en;
  const exercises = language === 'he' ? exerciseTypes.he : exerciseTypes.en;
  const goals = language === 'he' ? frequencyGoals.he : frequencyGoals.en;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 dark:bg-red-600/20 mb-4">
          <Dumbbell className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'פעילות גופנית' : 'Physical Activity'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'תנועה היא תרופה - בוא נמצא את מה שמתאים לך' 
            : 'Movement is medicine - let\'s find what works for you'}
        </p>
      </div>

      {/* Current Activity Level */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Dumbbell className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'רמת הפעילות הנוכחית שלי' : 'My current activity level'}
        </Label>
        <RadioGroup
          value={data.current_activity || ''}
          onValueChange={(value) => handleChange('current_activity', value)}
          className="space-y-2"
        >
          {activities.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem 
                value={option.value} 
                id={`activity-${option.value}`}
                className="border-red-600 text-red-600"
              />
              <label htmlFor={`activity-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Preferred Exercise Types */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="text-foreground">
          {language === 'he' ? 'סוגי פעילות שמעניינים אותי' : 'Activities I\'m interested in'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {exercises.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`exercise-${option.value}`}
                checked={(data.preferred_exercise || []).includes(option.value)}
                onCheckedChange={() => toggleExercise(option.value)}
                className="border-red-600 data-[state=checked]:bg-red-600"
              />
              <label
                htmlFor={`exercise-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Frequency Goal */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'היעד שלי לפעילות' : 'My activity goal'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {goals.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('frequency_goal', option.value)}
              className={`p-3 rounded-lg text-sm text-center transition-all ${
                data.frequency_goal === option.value
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-foreground">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'מגבלות או פציעות שצריך להתחשב בהן' : 'Limitations or injuries to consider'}
        </Label>
        <Textarea
          placeholder={language === 'he' 
            ? 'יש לי בעיה בברך / גב / אחר...' 
            : 'I have a knee/back/other issue...'}
          value={(data.limitations || []).join('\n') || ''}
          onChange={(e) => handleChange('limitations', e.target.value.split('\n').filter(Boolean))}
          className="min-h-[60px] bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:border-red-500 text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default ExerciseStep;

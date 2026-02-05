import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, Battery, Zap } from "lucide-react";

interface CurrentStateStepProps {
  data: {
    energy_level?: string;
    sleep_quality?: string;
    pain_areas?: string[];
    overall_health?: number;
  };
  onUpdate: (data: any) => void;
  language: string;
}

const painAreaOptions = {
  he: [
    { value: 'head', label: 'ראש/מיגרנות' },
    { value: 'neck', label: 'צוואר' },
    { value: 'back', label: 'גב' },
    { value: 'shoulders', label: 'כתפיים' },
    { value: 'joints', label: 'מפרקים' },
    { value: 'stomach', label: 'בטן/עיכול' },
    { value: 'chest', label: 'חזה' },
    { value: 'none', label: 'אין כאבים משמעותיים' }
  ],
  en: [
    { value: 'head', label: 'Head/Migraines' },
    { value: 'neck', label: 'Neck' },
    { value: 'back', label: 'Back' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'joints', label: 'Joints' },
    { value: 'stomach', label: 'Stomach/Digestion' },
    { value: 'chest', label: 'Chest' },
    { value: 'none', label: 'No significant pain' }
  ]
};

const energyLevels = {
  he: ['נמוכה מאוד', 'נמוכה', 'בינונית', 'גבוהה', 'גבוהה מאוד'],
  en: ['Very Low', 'Low', 'Medium', 'High', 'Very High']
};

const CurrentStateStep = ({ data, onUpdate, language }: CurrentStateStepProps) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const togglePainArea = (area: string) => {
    const current = data.pain_areas || [];
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    handleChange('pain_areas', updated);
  };

  const options = language === 'he' ? painAreaOptions.he : painAreaOptions.en;
  const levels = language === 'he' ? energyLevels.he : energyLevels.en;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 dark:bg-red-600/20 mb-4">
          <Activity className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'המצב הנוכחי שלך' : 'Your Current State'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין איפה אתה עכשיו כדי לתכנן את הדרך קדימה' 
            : 'Let\'s understand where you are now to plan the way forward'}
        </p>
      </div>

      {/* Overall Health Rating */}
      <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Zap className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'דירוג הבריאות הכללית שלי (1-10)' : 'My overall health rating (1-10)'}
        </Label>
        <div className="px-2">
          <Slider
            value={[data.overall_health || 5]}
            onValueChange={([value]) => handleChange('overall_health', value)}
            min={1}
            max={10}
            step={1}
            className="[&>span:first-child]:bg-red-950 [&_[role=slider]]:bg-red-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1</span>
            <span className="font-bold text-red-600 dark:text-red-400 text-lg">{data.overall_health || 5}</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Energy Level */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="flex items-center gap-2 text-foreground">
          <Battery className="w-4 h-4 text-red-600 dark:text-red-400" />
          {language === 'he' ? 'רמת האנרגיה היומית שלי' : 'My daily energy level'}
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {levels.map((level, idx) => (
            <button
              key={idx}
              onClick={() => handleChange('energy_level', level)}
              className={`p-2 rounded-lg text-xs text-center transition-all ${
                data.energy_level === level
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Pain Areas */}
      <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
        <Label className="text-foreground">
          {language === 'he' ? 'אזורי כאב או אי-נוחות (סמן הכל שרלוונטי)' : 'Pain or discomfort areas (select all that apply)'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={option.value}
                checked={(data.pain_areas || []).includes(option.value)}
                onCheckedChange={() => togglePainArea(option.value)}
                className="border-red-600 data-[state=checked]:bg-red-600"
              />
              <label
                htmlFor={option.value}
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

export default CurrentStateStep;

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Monitor, PlayCircle, Target } from "lucide-react";

interface CoursesStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  language: string;
}

const CoursesStep = ({ data, onUpdate, language }: CoursesStepProps) => {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/20 mb-4">
          <Monitor className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'he' ? 'קורסים ולמידה מקוונת' : 'Courses & Online Learning'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {language === 'he' 
            ? 'בוא נבין את ניסיון הלמידה המקוונת שלך' 
            : 'Let\'s understand your online learning experience'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-400" />
            {language === 'he' ? 'קורסים שהשלמתי' : 'Courses Completed'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'הקורסים שהשלמתי כוללים...' 
              : 'Courses I\'ve completed include...'}
            value={(data.courses_completed as string) || ''}
            onChange={(e) => handleChange('courses_completed', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-indigo-400" />
            {language === 'he' ? 'קורסים נוכחיים' : 'Current Courses'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'כרגע אני לומד...' 
              : 'Currently I\'m learning...'}
            value={(data.current_courses as string) || ''}
            onChange={(e) => handleChange('current_courses', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            {language === 'he' ? 'העדפות קורסים' : 'Course Preferences'}
          </Label>
          <Textarea
            placeholder={language === 'he' 
              ? 'אני מעדיף קורסים שהם...' 
              : 'I prefer courses that are...'}
            value={(data.course_preferences as string) || ''}
            onChange={(e) => handleChange('course_preferences', e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default CoursesStep;

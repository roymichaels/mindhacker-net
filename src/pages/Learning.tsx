/**
 * Learning Hub - /learning
 * Indigo/Violet themed hub for learning and growth
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  GraduationCap, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Target, 
  Trophy,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const Learning = () => {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  const tools = [
    { 
      id: 'skills', 
      icon: Brain, 
      label: language === 'he' ? 'כישורים' : 'Skills',
      description: language === 'he' ? 'עץ כישורים אישי' : 'Personal skill tree'
    },
    { 
      id: 'reading', 
      icon: BookOpen, 
      label: language === 'he' ? 'קריאה' : 'Reading',
      description: language === 'he' ? 'מעקב ספרים' : 'Book tracker'
    },
    { 
      id: 'courses', 
      icon: GraduationCap, 
      label: language === 'he' ? 'קורסים' : 'Courses',
      description: language === 'he' ? 'קורסים ולימודים' : 'Courses and learning'
    },
    { 
      id: 'ideas', 
      icon: Lightbulb, 
      label: language === 'he' ? 'רעיונות' : 'Ideas',
      description: language === 'he' ? 'תיעוד תובנות ורעיונות' : 'Document insights and ideas'
    },
    { 
      id: 'goals', 
      icon: Target, 
      label: language === 'he' ? 'יעדים' : 'Goals',
      description: language === 'he' ? 'יעדי למידה' : 'Learning goals'
    },
    { 
      id: 'achievements', 
      icon: Trophy, 
      label: language === 'he' ? 'הישגים' : 'Achievements',
      description: language === 'he' ? 'הישגים והתקדמות' : 'Achievements and progress'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24 pt-9" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-950 dark:to-gray-900 p-6 border border-indigo-200 dark:border-indigo-800/30"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 dark:from-indigo-500/10 to-transparent" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-xl">
                <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                  {language === 'he' ? 'מרכז הלמידה' : 'Learning Hub'}
                </h1>
                <p className="text-indigo-600/80 dark:text-muted-foreground">
                  {language === 'he' 
                    ? 'צמח ולמד כל יום' 
                    : 'Grow and learn every day'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/learning/journey')}
              className="w-full sm:w-auto self-stretch sm:self-auto bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white"
            >
              <Sparkles className="w-4 h-4 me-2" />
              {language === 'he' ? 'התחל מסע' : 'Start Journey'}
              {isRTL ? <ArrowLeft className="w-4 h-4 ms-2" /> : <ArrowRight className="w-4 h-4 ms-2" />}
            </Button>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl border border-indigo-200 dark:border-indigo-800/30 hover:border-indigo-400 dark:hover:border-indigo-600/50 transition-all text-start group shadow-sm"
            >
              <div className="p-2 bg-indigo-100 dark:bg-indigo-600/20 rounded-lg w-fit mb-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-600/30 transition-colors">
                <tool.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{tool.label}</h3>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Status Card Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl border border-indigo-200 dark:border-indigo-800/30 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-4">
            {language === 'he' ? 'מדד הצמיחה האישית' : 'Personal Growth Index'}
          </h2>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>{language === 'he' ? 'השלם את המסע כדי לקבל את המדד שלך' : 'Complete the journey to get your index'}</p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Learning;

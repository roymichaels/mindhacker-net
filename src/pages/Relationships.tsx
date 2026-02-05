/**
 * Relationships Hub - /relationships
 * Pink/Rose themed hub for relationship management
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Shield, 
  Gift, 
  Home,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const Relationships = () => {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  const tools = [
    { 
      id: 'partner', 
      icon: Heart, 
      label: language === 'he' ? 'זוגיות' : 'Partner',
      description: language === 'he' ? 'ניהול מערכת היחסים הזוגית' : 'Manage your romantic relationship'
    },
    { 
      id: 'family', 
      icon: Home, 
      label: language === 'he' ? 'משפחה' : 'Family',
      description: language === 'he' ? 'קשרים משפחתיים' : 'Family connections'
    },
    { 
      id: 'social', 
      icon: Users, 
      label: language === 'he' ? 'חברתי' : 'Social',
      description: language === 'he' ? 'חברים וקהילה' : 'Friends and community'
    },
    { 
      id: 'communication', 
      icon: MessageCircle, 
      label: language === 'he' ? 'תקשורת' : 'Communication',
      description: language === 'he' ? 'שיפור יכולות תקשורת' : 'Improve communication skills'
    },
    { 
      id: 'boundaries', 
      icon: Shield, 
      label: language === 'he' ? 'גבולות' : 'Boundaries',
      description: language === 'he' ? 'הגדרת גבולות בריאים' : 'Set healthy boundaries'
    },
    { 
      id: 'gratitude', 
      icon: Gift, 
      label: language === 'he' ? 'הכרת תודה' : 'Gratitude',
      description: language === 'he' ? 'תרגול הכרת תודה' : 'Practice gratitude'
    },
  ];

  return (
    <DashboardLayout hideRightPanel>
      <div className="space-y-6 pb-24 pt-9" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-950 dark:to-gray-900 p-6 border border-pink-200 dark:border-pink-800/30"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 dark:from-pink-500/10 to-transparent" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-500/20 dark:bg-pink-600/20 rounded-xl">
                <Users className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-400">
                  {language === 'he' ? 'מרכז הקשרים' : 'Relationships Hub'}
                </h1>
                <p className="text-pink-600/80 dark:text-muted-foreground">
                  {language === 'he' 
                    ? 'בנה קשרים עמוקים ומשמעותיים' 
                    : 'Build deep and meaningful connections'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/relationships/journey')}
              className="w-full sm:w-auto self-stretch sm:self-auto bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white"
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
              className="p-4 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl border border-pink-200 dark:border-pink-800/30 hover:border-pink-400 dark:hover:border-pink-600/50 transition-all text-start group shadow-sm"
            >
              <div className="p-2 bg-pink-100 dark:bg-pink-600/20 rounded-lg w-fit mb-3 group-hover:bg-pink-200 dark:group-hover:bg-pink-600/30 transition-colors">
                <tool.icon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
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
          className="p-6 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl border border-pink-200 dark:border-pink-800/30 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-pink-700 dark:text-pink-400 mb-4">
            {language === 'he' ? 'מדד בריאות הקשרים' : 'Relationship Health Index'}
          </h2>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>{language === 'he' ? 'השלם את המסע כדי לקבל את המדד שלך' : 'Complete the journey to get your index'}</p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Relationships;

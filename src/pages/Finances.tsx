/**
 * Finances Hub - /finances
 * Emerald/Green themed hub for financial management
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  Target, 
  BarChart3,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const Finances = () => {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  const tools = [
    { 
      id: 'income', 
      icon: TrendingUp, 
      label: language === 'he' ? 'הכנסות' : 'Income',
      description: language === 'he' ? 'מעקב אחרי הכנסות' : 'Track your income'
    },
    { 
      id: 'expenses', 
      icon: CreditCard, 
      label: language === 'he' ? 'הוצאות' : 'Expenses',
      description: language === 'he' ? 'ניהול הוצאות' : 'Manage expenses'
    },
    { 
      id: 'savings', 
      icon: PiggyBank, 
      label: language === 'he' ? 'חסכון' : 'Savings',
      description: language === 'he' ? 'יעדי חיסכון' : 'Savings goals'
    },
    { 
      id: 'investments', 
      icon: BarChart3, 
      label: language === 'he' ? 'השקעות' : 'Investments',
      description: language === 'he' ? 'מעקב השקעות' : 'Track investments'
    },
    { 
      id: 'goals', 
      icon: Target, 
      label: language === 'he' ? 'יעדים' : 'Goals',
      description: language === 'he' ? 'יעדים פיננסיים' : 'Financial goals'
    },
    { 
      id: 'budget', 
      icon: Wallet, 
      label: language === 'he' ? 'תקציב' : 'Budget',
      description: language === 'he' ? 'תכנון תקציב' : 'Budget planning'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24 sm:pt-9" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-gray-900 p-6 border border-emerald-200 dark:border-emerald-800/30"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 dark:from-emerald-500/10 to-transparent" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 dark:bg-emerald-600/20 rounded-xl">
                <Wallet className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {language === 'he' ? 'מרכז הפיננסים' : 'Finances Hub'}
                </h1>
                <p className="text-emerald-600/80 dark:text-muted-foreground">
                  {language === 'he' 
                    ? 'שלוט בכסף שלך ובנה עתיד פיננסי' 
                    : 'Control your money and build financial future'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/finances/journey')}
              className="w-full sm:w-auto self-stretch sm:self-auto bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white"
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
              className="p-4 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl border border-emerald-200 dark:border-emerald-800/30 hover:border-emerald-400 dark:hover:border-emerald-600/50 transition-all text-start group shadow-sm"
            >
              <div className="p-2 bg-emerald-100 dark:bg-emerald-600/20 rounded-lg w-fit mb-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-600/30 transition-colors">
                <tool.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
          className="p-6 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl border border-emerald-200 dark:border-emerald-800/30 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
            {language === 'he' ? 'מדד הבריאות הפיננסית' : 'Financial Health Index'}
          </h2>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>{language === 'he' ? 'השלם את המסע כדי לקבל את המדד שלך' : 'Complete the journey to get your index'}</p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Finances;

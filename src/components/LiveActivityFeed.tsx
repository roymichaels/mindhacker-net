import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Users } from "lucide-react";

interface Activity {
  id: string;
  type: "viewing" | "started" | "completed";
  name: string;
  action: string;
  timestamp: Date;
}

// Hebrew first names for realistic activity
const hebrewNames = [
  "שרה", "דניאל", "נועה", "יובל", "מיכל", "אורי", "תמר", "איתי", "ליאור", "גיל",
  "רונית", "עומר", "הדר", "אריאל", "מאיה", "יונתן", "שירה", "רועי", "ענת", "עידו"
];

const englishNames = [
  "Yoav", "Noa", "Tamar", "Oren", "Maya", "Gal", "Shira", "Eitan", "Lior", "Amit",
  "Yael", "Rotem", "Hila", "Ido", "Talia", "Omer", "Dana", "Ariel", "Shani", "Tomer"
];

const generateRandomActivity = (language: string): Activity => {
  const names = language === "he" ? hebrewNames : englishNames;
  const name = names[Math.floor(Math.random() * names.length)];
  
  const actions = language === "he" 
    ? [
        "התחיל/ה את מסע ההתבוננות",
        "צופה בעמוד",
        "הוריד/ה את המתנה החינמית",
        "השלים/ה את השאלון",
        "נרשם/ה לייעוץ חינם"
      ]
    : [
        "started the introspection journey",
        "is viewing the page",
        "downloaded the free gift",
        "completed the questionnaire",
        "signed up for free consultation"
      ];
  
  return {
    id: Math.random().toString(36).substring(7),
    type: "started",
    name,
    action: actions[Math.floor(Math.random() * actions.length)],
    timestamp: new Date()
  };
};

export const LiveActivityFeed = () => {
  const { t, language, isRTL } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentViewers, setCurrentViewers] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Initialize viewer count
  useEffect(() => {
    const baseViewers = Math.floor(Math.random() * 3) + 1; // 1-3 viewers
    setCurrentViewers(baseViewers);
    
    // Show after 3 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 3000);
    
    // Periodically update viewer count
    const viewerInterval = setInterval(() => {
      setCurrentViewers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(1, Math.min(3, prev + change));
      });
    }, 15000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(viewerInterval);
    };
  }, []);

  // Generate random activities
  useEffect(() => {
    const generateActivity = () => {
      if (Math.random() > 0.8) { // 20% chance to show activity
        const newActivity = generateRandomActivity(language);
        setActivities(prev => [newActivity, ...prev].slice(0, 1)); // Max 1 activity
        
        // Remove after 6 seconds
        setTimeout(() => {
          setActivities(prev => prev.filter(a => a.id !== newActivity.id));
        }, 6000);
      }
    };

    // First activity after 30 seconds
    const firstTimer = setTimeout(generateActivity, 30000);
    
    // Then every 80-160 seconds
    const interval = setInterval(generateActivity, 80000 + Math.random() * 80000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [language]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-32 z-30 pointer-events-none" style={{ [isRTL ? 'left' : 'left']: '1rem' }}>
      {/* Viewer count badge */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel px-3 py-2 mb-2 flex items-center gap-2 text-sm pointer-events-auto"
      >
        <div className="relative">
          <Users className="h-4 w-4 text-primary" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <span className="text-muted-foreground">
          {isRTL ? (
            <><span className="text-primary font-bold">{currentViewers}</span> {t('liveActivity.viewingNow')}</>
          ) : (
            <><span className="text-primary font-bold">{currentViewers}</span> {t('liveActivity.viewingNow')}</>
          )}
        </span>
      </motion.div>

      {/* Activity notifications */}
      <AnimatePresence mode="popLayout">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="glass-panel px-4 py-3 mb-2 max-w-[280px] border-primary/30 pointer-events-auto"
          >
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 animate-pulse flex-shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-semibold text-primary">{activity.name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1" style={{ paddingInlineStart: '1rem' }}>
              {t('liveActivity.justNow')}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LiveActivityFeed;

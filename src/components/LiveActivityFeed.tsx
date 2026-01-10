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
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize viewer count - always 1 for boutique feel
  useEffect(() => {
    setCurrentViewers(1);
    
    // Show after 3 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 3000);

    return () => {
      clearTimeout(showTimer);
    };
  }, []);

  // Generate random activities - very infrequent (once every 3-10 minutes)
  useEffect(() => {
    const generateActivity = () => {
      const newActivity = generateRandomActivity(language);
      setActivities([newActivity]); // Only 1 activity max
      
      // Remove after 6 seconds
      setTimeout(() => {
        setActivities([]);
      }, 6000);
    };

    // First activity after 3 minutes (180 seconds)
    const firstTimer = setTimeout(generateActivity, 180000);
    
    // Then every 3-10 minutes (180-600 seconds)
    const interval = setInterval(generateActivity, 180000 + Math.random() * 420000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [language]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
      {/* Mobile: Collapsed compact badge */}
      <div className="md:hidden">
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="glass-panel px-2.5 py-1.5 flex items-center gap-1.5 text-xs pointer-events-auto cursor-pointer"
        >
          <div className="relative">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="text-primary font-bold">{currentViewers}</span>
        </motion.button>

        {/* Expanded activity on mobile - only when clicked */}
        <AnimatePresence>
          {isExpanded && activities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="glass-panel px-3 py-2 mt-1 max-w-[220px] border-primary/30 pointer-events-auto"
            >
              <div className="flex items-start gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 animate-pulse flex-shrink-0" />
                <p className="text-xs text-foreground">
                  <span className="font-semibold text-primary">{activities[0].name}</span>{" "}
                  <span className="text-muted-foreground">{activities[0].action}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: Full viewer count and activities */}
      <div className="hidden md:block">
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
            <span className="text-primary font-bold">{currentViewers}</span> {t('liveActivity.viewingNow')}
          </span>
        </motion.div>

        {/* Activity notifications - Desktop */}
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
    </div>
  );
};

export default LiveActivityFeed;

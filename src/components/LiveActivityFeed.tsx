import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  action: string;
  timestamp: Date;
}

// Map conversion event types to user-friendly action text
const getActionText = (eventType: string, language: string): string => {
  const actionsHe: Record<string, string> = {
    form_start: "התחיל/ה את מסע ההתבוננות",
    form_complete: "השלים/ה את השאלון",
    cta_click: "לחץ/ה על כפתור",
    video_play: "צופה בסרטון",
    lead_submit: "השאיר/ה פרטים",
    page_view: "צופה בעמוד",
  };
  
  const actionsEn: Record<string, string> = {
    form_start: "started the introspection journey",
    form_complete: "completed the questionnaire",
    cta_click: "clicked a button",
    video_play: "is watching a video",
    lead_submit: "submitted their details",
    page_view: "is viewing the page",
  };
  
  const actions = language === "he" ? actionsHe : actionsEn;
  return actions[eventType] || (language === "he" ? "פעיל/ה באתר" : "is active on the site");
};

export const LiveActivityFeed = () => {
  const { t, language } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentViewers, setCurrentViewers] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch real active viewers from page_views (last 5 minutes)
  const fetchActiveViewers = async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { count } = await supabase
      .from('page_views')
      .select('session_id', { count: 'exact', head: true })
      .gte('entered_at', fiveMinutesAgo);
    
    setCurrentViewers(count || 0);
  };

  // Fetch real recent activities from conversion_events
  const fetchRecentActivities = async () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data } = await supabase
      .from('conversion_events')
      .select('id, event_type, created_at')
      .in('event_type', ['form_start', 'form_complete', 'cta_click', 'video_play', 'lead_submit'])
      .gte('created_at', tenMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data && data.length > 0) {
      const mappedActivities: Activity[] = data.map(event => ({
        id: event.id,
        type: event.event_type,
        action: getActionText(event.event_type, language),
        timestamp: new Date(event.created_at || Date.now()),
      }));
      setActivities(mappedActivities);
    } else {
      setActivities([]);
    }
  };

  // Initial data fetch and realtime subscription
  useEffect(() => {
    // Initial fetch
    fetchActiveViewers();
    fetchRecentActivities();
    
    // Show after 2 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 2000);

    // Refresh viewer count every 30 seconds
    const viewerInterval = setInterval(fetchActiveViewers, 30000);
    
    // Refresh activities every 60 seconds
    const activityInterval = setInterval(fetchRecentActivities, 60000);

    // Set up realtime subscription for new conversion events
    const channel = supabase
      .channel('live-activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversion_events'
        },
        (payload) => {
          const event = payload.new as { id: string; event_type: string; created_at: string };
          
          // Only show specific event types
          const trackableEvents = ['form_start', 'form_complete', 'cta_click', 'video_play', 'lead_submit'];
          if (!trackableEvents.includes(event.event_type)) return;
          
          const newActivity: Activity = {
            id: event.id,
            type: event.event_type,
            action: getActionText(event.event_type, language),
            timestamp: new Date(event.created_at || Date.now()),
          };
          
          setActivities(prev => [newActivity, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      clearTimeout(showTimer);
      clearInterval(viewerInterval);
      clearInterval(activityInterval);
      supabase.removeChannel(channel);
    };
  }, [language]);

  if (!isVisible) return null;

  const noActivityText = language === 'he' ? 'אין פעילות אחרונה' : 'No recent activity';
  const anonymousUser = language === 'he' ? 'מישהו' : 'Someone';

  return (
    <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
      {/* Mobile: Collapsed compact badge */}
      <div className="md:hidden">
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-card border border-border shadow-md rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs pointer-events-auto cursor-pointer"
        >
          <div className="relative">
            <Users className="h-3.5 w-3.5 text-primary" />
            {currentViewers > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-primary font-bold">{currentViewers}</span>
        </motion.button>

        {/* Expanded activity on mobile - only when clicked */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-card border border-border shadow-md rounded-xl px-3 py-2 mt-1 max-w-[220px] pointer-events-auto"
            >
              {activities.length > 0 ? (
                <div className="flex items-start gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 animate-pulse flex-shrink-0" />
                  <p className="text-xs text-foreground">
                    <span className="font-semibold text-primary">{anonymousUser}</span>{" "}
                    <span className="text-muted-foreground">{activities[0].action}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{noActivityText}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: Full viewer count and activities */}
      <div className="hidden md:block">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border shadow-md rounded-xl px-3 py-2 mb-2 flex items-center gap-2 text-sm pointer-events-auto"
        >
          <div className="relative">
            <Users className="h-4 w-4 text-primary" />
            {currentViewers > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-muted-foreground">
            <span className="text-primary font-bold">{currentViewers}</span> {t('liveActivity.viewingNow')}
          </span>
        </motion.div>

        {/* Activity notifications - Desktop */}
        <AnimatePresence mode="popLayout">
          {activities.slice(0, 3).map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="bg-card border border-border shadow-md rounded-xl px-4 py-3 mb-2 max-w-[280px] pointer-events-auto"
            >
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 animate-pulse flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold text-primary">{anonymousUser}</span>{" "}
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

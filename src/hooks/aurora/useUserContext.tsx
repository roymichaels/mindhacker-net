import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type DeviceType = 'mobile' | 'desktop' | 'tablet';

export interface UserContext {
  // Time context
  timeOfDay: TimeOfDay;
  dayOfWeek: string;
  isWeekend: boolean;
  localHour: number;
  
  // Activity context
  lastActiveTime: Date | null;
  currentPage: string;
  sessionDuration: number; // minutes since session started
  
  // Device context
  deviceType: DeviceType;
  isMobile: boolean;
  
  // User state
  focusMode: boolean;
  energyLevel: EnergyLevel;
  currentStreak: number;
  moodSignals: string[];
  
  // Proactive settings
  proactiveEnabled: boolean;
  voiceModeEnabled: boolean;
}

const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const getDayOfWeek = (): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const getDeviceType = (): DeviceType => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const useUserContext = () => {
  const { user } = useAuth();
  const location = useLocation();
  const sessionStartRef = useRef<Date>(new Date());
  
  const [context, setContext] = useState<UserContext>({
    timeOfDay: getTimeOfDay(new Date().getHours()),
    dayOfWeek: getDayOfWeek(),
    isWeekend: [0, 6].includes(new Date().getDay()),
    localHour: new Date().getHours(),
    lastActiveTime: null,
    currentPage: location.pathname,
    sessionDuration: 0,
    deviceType: getDeviceType(),
    isMobile: getDeviceType() === 'mobile',
    focusMode: false,
    energyLevel: 'medium',
    currentStreak: 0,
    moodSignals: [],
    proactiveEnabled: true,
    voiceModeEnabled: false,
  });

  // Update time context every minute
  useEffect(() => {
    const updateTimeContext = () => {
      const now = new Date();
      const hour = now.getHours();
      
      setContext(prev => ({
        ...prev,
        timeOfDay: getTimeOfDay(hour),
        dayOfWeek: getDayOfWeek(),
        isWeekend: [0, 6].includes(now.getDay()),
        localHour: hour,
        sessionDuration: Math.floor((now.getTime() - sessionStartRef.current.getTime()) / 60000),
      }));
    };

    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update page context on navigation
  useEffect(() => {
    setContext(prev => ({
      ...prev,
      currentPage: location.pathname,
    }));

    // Update last active page in database
    if (user?.id) {
      supabase
        .from('aurora_onboarding_progress')
        .update({ 
          last_active_page: location.pathname,
          last_active_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .then(() => {});
    }
  }, [location.pathname, user?.id]);

  // Update device context on resize
  useEffect(() => {
    const handleResize = () => {
      const deviceType = getDeviceType();
      setContext(prev => ({
        ...prev,
        deviceType,
        isMobile: deviceType === 'mobile',
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load user preferences from database
  useEffect(() => {
    if (!user?.id) return;

    const loadUserPreferences = async () => {
      const { data } = await supabase
        .from('aurora_onboarding_progress')
        .select('energy_level, mood_signals, proactive_enabled, voice_mode_enabled, last_active_at')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setContext(prev => ({
          ...prev,
          energyLevel: (data.energy_level as EnergyLevel) || 'medium',
          moodSignals: (data.mood_signals as string[]) || [],
          proactiveEnabled: data.proactive_enabled ?? true,
          voiceModeEnabled: data.voice_mode_enabled ?? false,
          lastActiveTime: data.last_active_at ? new Date(data.last_active_at) : null,
        }));
      }

      // Load streak
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const { count } = await supabase
        .from('daily_habit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('track_date', thirtyDaysAgo.toISOString().split('T')[0]);

      setContext(prev => ({
        ...prev,
        currentStreak: count || 0,
      }));
    };

    loadUserPreferences();
  }, [user?.id]);

  // Update energy level
  const setEnergyLevel = useCallback(async (level: EnergyLevel) => {
    setContext(prev => ({ ...prev, energyLevel: level }));
    
    if (user?.id) {
      await supabase
        .from('aurora_onboarding_progress')
        .update({ energy_level: level })
        .eq('user_id', user.id);
    }
  }, [user?.id]);

  // Update mood signals
  const addMoodSignal = useCallback(async (signal: string) => {
    setContext(prev => {
      const newSignals = [...prev.moodSignals, signal].slice(-10); // Keep last 10
      return { ...prev, moodSignals: newSignals };
    });

    if (user?.id) {
      const { data } = await supabase
        .from('aurora_onboarding_progress')
        .select('mood_signals')
        .eq('user_id', user.id)
        .single();

      const currentSignals = (data?.mood_signals as string[]) || [];
      const newSignals = [...currentSignals, signal].slice(-10);

      await supabase
        .from('aurora_onboarding_progress')
        .update({ mood_signals: newSignals })
        .eq('user_id', user.id);
    }
  }, [user?.id]);

  // Toggle focus mode
  const setFocusMode = useCallback((enabled: boolean) => {
    setContext(prev => ({ ...prev, focusMode: enabled }));
  }, []);

  // Toggle proactive notifications
  const setProactiveEnabled = useCallback(async (enabled: boolean) => {
    setContext(prev => ({ ...prev, proactiveEnabled: enabled }));

    if (user?.id) {
      await supabase
        .from('aurora_onboarding_progress')
        .update({ proactive_enabled: enabled })
        .eq('user_id', user.id);
    }
  }, [user?.id]);

  // Toggle voice mode
  const setVoiceModeEnabled = useCallback(async (enabled: boolean) => {
    setContext(prev => ({ ...prev, voiceModeEnabled: enabled }));

    if (user?.id) {
      await supabase
        .from('aurora_onboarding_progress')
        .update({ voice_mode_enabled: enabled })
        .eq('user_id', user.id);
    }
  }, [user?.id]);

  // Get context summary for AI
  const getContextSummary = useCallback((): string => {
    const parts: string[] = [];
    
    parts.push(`Time: ${context.timeOfDay} (${context.localHour}:00), ${context.dayOfWeek}`);
    
    if (context.isWeekend) {
      parts.push('Weekend');
    }
    
    if (context.sessionDuration > 0) {
      parts.push(`Session: ${context.sessionDuration} min`);
    }
    
    parts.push(`Device: ${context.deviceType}`);
    parts.push(`Energy: ${context.energyLevel}`);
    
    if (context.currentStreak > 0) {
      parts.push(`Streak: ${context.currentStreak} days`);
    }
    
    if (context.moodSignals.length > 0) {
      parts.push(`Mood: ${context.moodSignals.slice(-3).join(', ')}`);
    }
    
    if (context.focusMode) {
      parts.push('Focus Mode ON');
    }

    return parts.join(' | ');
  }, [context]);

  return {
    context,
    setEnergyLevel,
    addMoodSignal,
    setFocusMode,
    setProactiveEnabled,
    setVoiceModeEnabled,
    getContextSummary,
  };
};

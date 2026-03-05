/**
 * Aurora Opportunity Engine — contextual MOS earning suggestions
 * based on user activity, time of day, and FM state.
 */
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

export interface FMOpportunity {
  id: string;
  text: string;
  subtext: string;
  reward: number;
  action: { type: 'navigate'; path: string } | { type: 'prompt'; message: string };
  icon: '🎯' | '💼' | '📊' | '✍️' | '💡' | '🧠';
  priority: number;
}

export function useAuroraOpportunities() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';

  const { data: state } = useQuery({
    queryKey: ['fm-opportunity-state', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const today = new Date().toISOString().split('T')[0];

      const [
        { data: wallet },
        { data: activeBounties },
        { data: myClaims },
        { data: myGigs },
        { data: dataContribs },
        { data: completedHabits },
        { data: recentSessions },
      ] = await Promise.all([
        supabase.from('fm_wallets').select('mos_balance, lifetime_earned').eq('user_id', user.id).maybeSingle(),
        supabase.from('fm_bounties').select('id').eq('status', 'active').limit(5),
        supabase.from('fm_bounty_claims').select('id').eq('user_id', user.id).limit(1),
        supabase.from('fm_gigs').select('id').eq('posted_by', user.id).limit(1) as any,
        supabase.from('fm_data_contributions').select('id').eq('user_id', user.id).eq('is_active', true).limit(1) as any,
        supabase
          .from('daily_habit_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('track_date', today)
          .eq('is_completed', true)
          .limit(1),
        supabase
          .from('hypnosis_sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .limit(1),
      ]);

      return {
        balance: wallet?.mos_balance ?? 0,
        lifetimeEarned: wallet?.lifetime_earned ?? 0,
        hasBounties: (activeBounties?.length ?? 0) > 0,
        hasClaimed: (myClaims?.length ?? 0) > 0,
        hasPostedGig: (myGigs?.length ?? 0) > 0,
        hasSharingData: (dataContribs?.length ?? 0) > 0,
        didHabitsToday: (completedHabits?.length ?? 0) > 0,
        didSessionToday: (recentSessions?.length ?? 0) > 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const opportunities = useMemo<FMOpportunity[]>(() => {
    if (!state) return [];

    const result: FMOpportunity[] = [];
    const hour = new Date().getHours();

    // 1. Never claimed a bounty — first-time CTA
    if (!state.hasClaimed && state.hasBounties) {
      result.push({
        id: 'first-bounty',
        text: isHe ? 'השלם את הבאונטי הראשון שלך' : 'Complete your first bounty',
        subtext: isHe ? 'משימות מהירות עם תגמול מיידי' : 'Quick tasks with instant rewards',
        reward: 50,
        action: { type: 'navigate', path: '/fm/earn' },
        icon: '🎯',
        priority: 1,
      });
    }

    // 2. Not sharing data yet — passive income
    if (!state.hasSharingData) {
      result.push({
        id: 'start-sharing',
        text: isHe ? 'שתף נתונים אנונימיים והרוויח' : 'Share anonymous data & earn',
        subtext: isHe ? 'הכנסה פסיבית מנתוני הבריאות שלך' : 'Passive income from your health data',
        reward: 30,
        action: { type: 'navigate', path: '/fm/share' },
        icon: '📊',
        priority: 2,
      });
    }

    // 3. Completed habits today — reward prompt
    if (state.didHabitsToday) {
      result.push({
        id: 'habit-tip',
        text: isHe ? 'כתוב טיפ בריאות לקהילה' : 'Write a health tip for the community',
        subtext: isHe ? 'שתף מה עובד בשבילך והרוויח' : 'Share what works for you & earn',
        reward: 50,
        action: { type: 'navigate', path: '/fm/earn' },
        icon: '✍️',
        priority: 3,
      });
    }

    // 4. Morning suggestion — energy content
    if (hour >= 6 && hour < 10) {
      result.push({
        id: 'morning-content',
        text: isHe ? 'בוקר טוב! תרום תובנה מהבוקר שלך' : 'Good morning! Share a morning insight',
        subtext: isHe ? 'תובנות בוקר שוות יותר MOS' : 'Morning insights are worth more MOS',
        reward: 40,
        action: { type: 'navigate', path: '/fm/earn' },
        icon: '💡',
        priority: 4,
      });
    }

    // 5. Did a hypnosis session — leverage momentum
    if (state.didSessionToday) {
      result.push({
        id: 'post-session',
        text: isHe ? 'תעד את החוויה שלך' : 'Document your experience',
        subtext: isHe ? 'שתף תובנות מהסשן לתגמול' : 'Share session insights for rewards',
        reward: 35,
        action: { type: 'navigate', path: '/fm/earn' },
        icon: '🧠',
        priority: 5,
      });
    }

    // 6. Has balance but never posted a gig
    if (state.balance >= 100 && !state.hasPostedGig) {
      result.push({
        id: 'post-gig',
        text: isHe ? 'צריך עזרה? פרסם עבודה' : 'Need help? Post a gig',
        subtext: isHe ? 'השתמש ב-MOS שלך לשכור פרילנסרים' : 'Use your MOS to hire freelancers',
        reward: 0,
        action: { type: 'navigate', path: '/fm/work' },
        icon: '💼',
        priority: 6,
      });
    }

    // 7. General fallback for returning users
    if (state.hasClaimed && state.hasBounties) {
      result.push({
        id: 'more-bounties',
        text: isHe ? 'באונטיז חדשים זמינים' : 'New bounties available',
        subtext: isHe ? 'יש משימות חדשות שמתאימות לך' : 'Fresh tasks matching your skills',
        reward: 75,
        action: { type: 'navigate', path: '/fm/earn' },
        icon: '🎯',
        priority: 7,
      });
    }

    return result.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [state, isHe]);

  return { opportunities, isLoading: !state };
}

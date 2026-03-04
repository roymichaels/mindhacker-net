/**
 * Global hook: registers the "Build Curriculum" pillar action button
 * in the Aurora Dock whenever activePillar === 'learn'.
 * 
 * This must be mounted globally (e.g. DashboardLayout) so the button
 * appears regardless of which page the user is currently viewing.
 */
import { useCallback, useEffect } from 'react';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLearnPillarAction() {
  const auroraChat = useAuroraChatContextSafe();
  const { user } = useAuth();
  const { language } = useTranslation();
  const queryClient = useQueryClient();
  const isHe = language === 'he';

  const isWizardActive = auroraChat?.activePillar === 'learn';

  const handleGenerateFromDock = useCallback(async () => {
    if (!auroraChat || !user?.id) return;
    auroraChat.setPillarActionLoading(true);
    try {
      const convId = auroraChat.pillarConversationId;
      if (!convId) throw new Error('No conversation found');

      const { data: dbMessages, error: msgErr } = await supabase
        .from('messages')
        .select('content, sender_id')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (msgErr) throw msgErr;

      const chatMessages = (dbMessages || []).map((m: any) => ({
        role: m.sender_id === user.id ? 'user' : 'assistant',
        content: m.content,
      }));

      if (chatMessages.length < 2) {
        toast.error(isHe ? 'דבר עם Aurora קודם כדי לתאר מה תרצה ללמוד' : 'Chat with Aurora first to describe what you want to learn');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: 'generate',
          messages: chatMessages,
        }),
      });

      if (!resp.ok) throw new Error('Generation failed');

      const data = await resp.json();
      if (!data.success || !data.curriculum_id) throw new Error('Invalid response');

      // Success: clear pillar, invalidate queries, navigate to learn
      auroraChat.setActivePillar(null);
      queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });
      queryClient.invalidateQueries({ queryKey: ['learning-lessons'] });
      toast.success(isHe ? '🔥 תוכנית הלימודים נוצרה!' : '🔥 Curriculum created!');

      // Dispatch event so Learn page can select the new curriculum if mounted
      window.dispatchEvent(new CustomEvent('learn:select-curriculum', { detail: data.curriculum_id }));
    } catch (err: any) {
      toast.error(err.message || (isHe ? 'שגיאה ביצירת תוכנית לימודים' : 'Failed to generate curriculum'));
    } finally {
      auroraChat?.setPillarActionLoading(false);
    }
  }, [auroraChat, user?.id, isHe, queryClient]);

  useEffect(() => {
    if (isWizardActive && auroraChat) {
      const label = isHe ? '🔥 בנה את תוכנית הלימודים!' : '🔥 Build the Curriculum!';
      auroraChat.setPillarAction(label, handleGenerateFromDock);
    }
    return () => {
      // Only clear if we were the ones who set it
      if (isWizardActive) {
        auroraChat?.setPillarAction(null, null);
      }
    };
  }, [isWizardActive, auroraChat, handleGenerateFromDock, isHe]);
}

/**
 * FlowAuditProvider — Passive route + auth monitor for the Flow Auditor.
 * Renders no DOM. Only active when localStorage.FLOW_AUDIT = "true".
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { flowAudit } from '@/lib/flowAudit';

export default function FlowAuditProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  // Log mount/unmount
  useEffect(() => {
    flowAudit.context('FlowAuditProvider', 'mount');
    flowAudit.startScenario();
    return () => flowAudit.context('FlowAuditProvider', 'unmount');
  }, []);

  // Log route transitions
  useEffect(() => {
    const from = prevPath.current;
    const to = location.pathname;
    if (from !== to) {
      flowAudit.route(from, to);
    }
    prevPath.current = to;
  }, [location.pathname]);

  // Log auth state changes
  useEffect(() => {
    if (!flowAudit.isEnabled()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      flowAudit.auth(event, session?.user?.id ?? null, !!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}

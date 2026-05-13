/**
 * Global bridge: listens for `aion:capability:invoke` events
 * (emitted by artifact CTAs and confirmation sheets) and dispatches them
 * to the `aion-capabilities` edge function.
 *
 * Phase 3 — closes the loop between artifact CTAs and the capability registry.
 */
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvokeDetail {
  capability: string;
  params?: Record<string, unknown>;
  traceId?: string;
}

export function CapabilityInvokerBridge() {
  useEffect(() => {
    const onInvoke = (e: Event) => {
      const detail = (e as CustomEvent<InvokeDetail>).detail;
      if (!detail?.capability) return;
      void (async () => {
        try {
          const { data, error } = await supabase.functions.invoke('aion-capabilities', {
            body: {
              capability: detail.capability,
              params: detail.params ?? {},
              traceId: detail.traceId ?? null,
            },
          });
          if (error || !(data as { ok?: boolean })?.ok) {
            console.warn('[capability-invoker] failed', detail.capability, error ?? data);
            toast.error('הפעולה נכשלה');
            return;
          }
          window.dispatchEvent(
            new CustomEvent('aion:capability:result', { detail: { ...detail, result: data } }),
          );
        } catch (err) {
          console.warn('[capability-invoker] error', err);
          toast.error('הפעולה נכשלה');
        }
      })();
    };
    window.addEventListener('aion:capability:invoke', onInvoke);
    return () => window.removeEventListener('aion:capability:invoke', onInvoke);
  }, []);

  return null;
}

export default CapabilityInvokerBridge;
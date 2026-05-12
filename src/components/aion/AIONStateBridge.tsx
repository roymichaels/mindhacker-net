/**
 * AIONStateBridge — derives `AIONLiveState` from existing chat/voice signals.
 *
 * - isStreaming (assistant generating)  → 'thinking'
 * - voice capture active                → 'listening'
 * - TTS speaking (aurora:tts:start/end) → 'speaking'
 * - dock open + assistant idle          → 'guiding'
 * - otherwise                           → 'idle'
 *
 * Phase 1 of the AION Orchestration Redesign.
 */
import { useEffect } from 'react';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useAIONState } from '@/contexts/AIONStateContext';

export function AIONStateBridge() {
  const chat = useAuroraChatContextSafe();
  const { setState } = useAIONState();

  // Streaming → thinking
  useEffect(() => {
    if (!chat) return;
    if (chat.isStreaming) setState('thinking');
    else if (chat.isDockVisible || chat.isChatExpanded) setState('guiding');
    else setState('idle');
  }, [chat?.isStreaming, chat?.isDockVisible, chat?.isChatExpanded, setState, chat]);

  // Voice + TTS via global events (existing bus)
  useEffect(() => {
    const onListenStart = () => setState('listening');
    const onListenEnd = () => setState('idle');
    const onSpeakStart = () => setState('speaking');
    const onSpeakEnd = () => setState('idle');

    window.addEventListener('aion:voice:listen:start', onListenStart);
    window.addEventListener('aion:voice:listen:end', onListenEnd);
    window.addEventListener('aurora:voice:listen:start', onListenStart);
    window.addEventListener('aurora:voice:listen:end', onListenEnd);
    window.addEventListener('aurora:tts:start', onSpeakStart);
    window.addEventListener('aurora:tts:end', onSpeakEnd);

    return () => {
      window.removeEventListener('aion:voice:listen:start', onListenStart);
      window.removeEventListener('aion:voice:listen:end', onListenEnd);
      window.removeEventListener('aurora:voice:listen:start', onListenStart);
      window.removeEventListener('aurora:voice:listen:end', onListenEnd);
      window.removeEventListener('aurora:tts:start', onSpeakStart);
      window.removeEventListener('aurora:tts:end', onSpeakEnd);
    };
  }, [setState]);

  return null;
}

export default AIONStateBridge;
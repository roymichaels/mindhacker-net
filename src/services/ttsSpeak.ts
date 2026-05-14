/**
 * TTS preview service — Phase 2 Batch 3.
 * Validates text; actual TTS playback happens in safeMutationExecutor
 * after explicit user confirmation.
 */
export interface TTSPreview {
  text: string;
  charCount: number;
  voiceId: string;
  ok: boolean;
}

const DEFAULT_VOICE = 'JBFqnCBsd6RMkjVDRZzb';
const MAX_CHARS = 4000;

export function previewTTS(text: string, voiceId?: string): TTSPreview {
  const trimmed = (text ?? '').trim();
  return {
    text: trimmed
      ? `מוכן להקראה (${Math.min(trimmed.length, MAX_CHARS)} תווים).`
      : 'אין טקסט להקראה.',
    charCount: Math.min(trimmed.length, MAX_CHARS),
    voiceId: voiceId || DEFAULT_VOICE,
    ok: trimmed.length > 0 && trimmed.length <= MAX_CHARS,
  };
}
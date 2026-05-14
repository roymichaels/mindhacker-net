/**
 * Voice capture descriptor — Phase 2 Batch 3.
 * Pure metadata; actual transcription lives in `useAuroraVoice` and is
 * gated by user mic gesture. AION uses this only to surface a hint card.
 */
export function describeVoiceCapture(): { text: string; endpoint: string } {
  return {
    text: 'מוכן להקליט הודעה קולית. לחץ על מיקרופון כדי להתחיל.',
    endpoint: 'elevenlabs-transcribe',
  };
}
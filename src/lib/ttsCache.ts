/**
 * ttsCache — Cached TTS layer.
 * Hash-based lookup → generate via ElevenLabs if miss → store in storage + DB.
 */
import { supabase } from '@/integrations/supabase/client';

export interface TTSCacheEntry {
  id: string;
  audioUrl: string;
  durationSeconds: number | null;
  textHash: string;
}

/** Simple hash of text content for cache key */
async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Strip markdown and nikud for consistent hashing */
function normalizeText(text: string): string {
  return text
    .replace(/[\u0591-\u05C7]/g, '') // nikud
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/[-*]\s/g, '')
    .trim();
}

/** Look up cached TTS audio for given text + voice settings */
export async function lookupCache(
  userId: string,
  rawText: string,
  voiceId: string,
  speed: number,
): Promise<TTSCacheEntry | null> {
  const normalized = normalizeText(rawText);
  const textHash = await hashText(normalized + voiceId + speed.toFixed(1));

  const { data, error } = await supabase
    .from('tts_cache')
    .select('id, audio_path, duration_seconds, text_hash')
    .eq('user_id', userId)
    .eq('text_hash', textHash)
    .eq('voice_id', voiceId)
    .eq('speed', speed)
    .maybeSingle();

  if (error || !data) return null;

  // Build public URL
  const { data: urlData } = supabase.storage
    .from('tts-audio')
    .getPublicUrl(data.audio_path);

  return {
    id: data.id,
    audioUrl: urlData.publicUrl,
    durationSeconds: data.duration_seconds,
    textHash: data.text_hash,
  };
}

/** Generate TTS, upload to storage, save cache entry. Returns audio URL. */
export async function generateAndCache(
  userId: string,
  rawText: string,
  voiceId: string,
  speed: number,
): Promise<TTSCacheEntry> {
  const normalized = normalizeText(rawText);
  const textHash = await hashText(normalized + voiceId + speed.toFixed(1));

  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // Call existing ElevenLabs TTS edge function
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: normalized, voiceId, speed }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `TTS generation failed: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('audio')) {
    throw new Error('TTS response was not audio');
  }

  const blob = await response.blob();
  const filePath = `${userId}/${textHash}.mp3`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('tts-audio')
    .upload(filePath, blob, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (uploadError) {
    console.warn('[TTS Cache] Upload failed, using blob URL fallback:', uploadError);
    // Return a blob URL as fallback
    const blobUrl = URL.createObjectURL(blob);
    return { id: '', audioUrl: blobUrl, durationSeconds: null, textHash };
  }

  // Get audio duration from blob
  const durationSeconds = await getAudioDuration(blob);

  // Save to DB cache
  const { data: cacheEntry, error: insertError } = await supabase
    .from('tts_cache')
    .upsert({
      user_id: userId,
      text_hash: textHash,
      voice_id: voiceId,
      speed,
      audio_path: filePath,
      duration_seconds: durationSeconds,
      file_size_bytes: blob.size,
    }, { onConflict: 'user_id,text_hash,voice_id,speed' })
    .select('id')
    .single();

  const { data: urlData } = supabase.storage
    .from('tts-audio')
    .getPublicUrl(filePath);

  return {
    id: cacheEntry?.id || '',
    audioUrl: urlData.publicUrl,
    durationSeconds,
    textHash,
  };
}

/** Get audio duration from a blob */
function getAudioDuration(blob: Blob): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      const duration = isFinite(audio.duration) ? Math.round(audio.duration * 10) / 10 : null;
      URL.revokeObjectURL(url);
      resolve(duration);
    });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve(null);
    });
  });
}

/**
 * Main entry: get cached or generate TTS audio for a message.
 */
export async function getCachedTTS(
  userId: string,
  rawText: string,
  voiceId: string,
  speed: number,
): Promise<TTSCacheEntry> {
  // 1. Check cache
  const cached = await lookupCache(userId, rawText, voiceId, speed);
  if (cached) {
    console.log('[TTS Cache] Hit:', cached.textHash.slice(0, 8));
    return cached;
  }

  // 2. Generate, upload, and cache
  console.log('[TTS Cache] Miss — generating...');
  return generateAndCache(userId, rawText, voiceId, speed);
}

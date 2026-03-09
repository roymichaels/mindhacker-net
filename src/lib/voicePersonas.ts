/**
 * Voice Personas — Coaching voice styles mapped to ElevenLabs voices + settings
 * Each persona bundles a voice ID, stability, style, and speed for a distinct coaching feel.
 */

export type VoicePersonaId = 'calm' | 'motivational' | 'drill_sergeant' | 'wise_mentor' | 'empathetic';

export interface VoicePersona {
  id: VoicePersonaId;
  name_en: string;
  name_he: string;
  description_en: string;
  description_he: string;
  icon: string;
  voiceId: string;        // ElevenLabs voice name key
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'calm',
    name_en: 'Calm Guide',
    name_he: 'מדריך רגוע',
    description_en: 'Soothing and meditative. Perfect for deep work and reflection.',
    description_he: 'מרגיע ומדיטטיבי. מושלם לעבודה עמוקה ורפלקציה.',
    icon: '🧘',
    voiceId: 'laura',
    stability: 0.7,
    similarityBoost: 0.75,
    style: 0.3,
    speed: 0.9,
  },
  {
    id: 'motivational',
    name_en: 'Motivator',
    name_he: 'מוטיבטור',
    description_en: 'Energetic and uplifting. Pushes you forward with enthusiasm.',
    description_he: 'אנרגטי ומעורר השראה. דוחף אותך קדימה בהתלהבות.',
    icon: '🔥',
    voiceId: 'roger',
    stability: 0.4,
    similarityBoost: 0.8,
    style: 0.6,
    speed: 1.05,
  },
  {
    id: 'drill_sergeant',
    name_en: 'Drill Sergeant',
    name_he: 'מפקד',
    description_en: 'Direct and no-nonsense. Holds you accountable with tough love.',
    description_he: 'ישיר וחד. מחזיק אותך באחריותיות עם אהבה קשוחה.',
    icon: '⚔️',
    voiceId: 'brian',
    stability: 0.6,
    similarityBoost: 0.85,
    style: 0.7,
    speed: 1.1,
  },
  {
    id: 'wise_mentor',
    name_en: 'Wise Mentor',
    name_he: 'מנטור חכם',
    description_en: 'Thoughtful and measured. Guides with wisdom and patience.',
    description_he: 'מחושב ומדוד. מנחה בחוכמה וסבלנות.',
    icon: '🦉',
    voiceId: 'daniel',
    stability: 0.6,
    similarityBoost: 0.7,
    style: 0.4,
    speed: 0.95,
  },
  {
    id: 'empathetic',
    name_en: 'Empathetic Friend',
    name_he: 'חברה אמפתית',
    description_en: 'Warm and understanding. Like talking to a close friend who truly gets you.',
    description_he: 'חמימה ומבינה. כמו לדבר עם חברה קרובה שבאמת מבינה אותך.',
    icon: '💜',
    voiceId: 'sarah',
    stability: 0.45,
    similarityBoost: 0.75,
    style: 0.5,
    speed: 1.0,
  },
];

export const DEFAULT_PERSONA: VoicePersona = VOICE_PERSONAS[4]; // empathetic (sarah)

export function getPersonaById(id: VoicePersonaId | string | null): VoicePersona {
  return VOICE_PERSONAS.find(p => p.id === id) || DEFAULT_PERSONA;
}

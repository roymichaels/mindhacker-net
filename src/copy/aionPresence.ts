/**
 * AION Presence Copy — single source of truth for empty-state and CTA copy
 * across collapsed legacy surfaces.
 */
export const aionPresence = {
  stillLearning: { en: 'AION is still learning this.', he: 'AION עדיין לומד את זה.' },
  askAion: { en: 'Ask AION', he: 'שאל את AION' },
  askAionAboutThis: { en: 'Ask AION about this', he: 'שאל את AION על זה' },
  openAsArtifact: { en: 'Open as artifact', he: 'פתח כפריט' },
  continueJourney: { en: 'Continue your journey', he: 'המשך את המסע' },
  openAion: { en: 'Open AION', he: 'פתח את AION' },
  aionListening: {
    en: 'AION is still listening. Speak to it.',
    he: 'AION עדיין מקשיב. דבר איתו.',
  },
  aionLearning: { en: 'AION is learning this', he: 'AION עדיין לומד את זה' },
  feelsClear: { en: 'This feels clear', he: 'זה מרגיש ברור' },
  whatShapedThis: { en: 'What shaped this', he: 'מה עיצב את זה' },
  memory: { en: 'Memory', he: 'זיכרון' },
  pattern: { en: 'Pattern', he: 'דפוס' },
  connection: { en: 'Connection', he: 'חיבור' },
  space: { en: 'Space', he: 'מרחב' },
  realm: { en: 'Realm', he: 'ממלכה' },
  reflection: { en: 'Reflection', he: 'השתקפות' },
  reflectionsSoFar: { en: 'Reflections so far', he: 'השתקפויות עד כה' },
  composeRhythm: {
    en: 'AION will compose your rhythm',
    he: 'AION יחבר את הקצב שלך',
  },
  // Phase 4C — trajectory observation lines (AION-voiced, never instructions).
  trajectoryNoticing: {
    en: 'I notice this keeps returning.',
    he: 'אני שם לב שזה ממשיך לחזור.',
  },
  trajectoryNowFeelsRight: {
    en: 'Now feels right for this.',
    he: 'עכשיו מרגיש נכון לזה.',
  },
  trajectoryEnergyShift: {
    en: 'I noticed your energy shifts here.',
    he: 'הרגשתי שהאנרגיה שלך משתנה כאן.',
  },
  trajectoryStayWithIt: {
    en: 'Stay with this for a moment.',
    he: 'הישאר עם זה לרגע.',
  },
  // Phase 4F — Self contemplation lines.
  selfPhase: {
    en: 'You are in a phase of becoming.',
    he: 'אתה בשלב של היווצרות.',
  },
  // Phase 4D — Brain conversationalization lines.
  roomStillForming: {
    en: 'This area is still forming.',
    he: 'האזור הזה עדיין נוצר.',
  },
  roomNoticingPattern: {
    en: 'AION keeps noticing this pattern.',
    he: 'AION ממשיך להבחין בדפוס הזה.',
  },
  roomConnectedTo: {
    en: 'This seems connected to something deeper.',
    he: 'זה נראה קשור למשהו עמוק יותר.',
  },
  exploreDeeper: {
    en: 'Explore deeper',
    he: 'חקור לעומק',
  },
  aionPiecingTogether: {
    en: 'AION is still piecing this together.',
    he: 'AION עדיין מחבר את החלקים.',
  },
  aionLostFocus: {
    en: 'AION lost focus for a moment.',
    he: 'AION איבד מיקוד לרגע.',
  },
  aionInnerView: {
    en: "AION's view of your inner world",
    he: 'כך AION רואה אותך מבפנים',
  },
  tellMeMoreAboutPattern: {
    en: 'Tell me more about this pattern.',
    he: 'ספר לי עוד על הדפוס הזה.',
  },
} as const;

/** Convenience helper — pick the right language. */
export function aionPresenceText(
  key: keyof typeof aionPresence,
  lang: 'en' | 'he',
): string {
  return aionPresence[key][lang];
}

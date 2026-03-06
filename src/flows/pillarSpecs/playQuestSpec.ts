/**
 * Play / Recreation Pillar Quest Spec
 * Collects hobbies, play preferences, adventure interests to generate
 * meaningful Play milestones about actual recreation activities.
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.play.answers' };

export const playQuestSpec: FlowSpec = {
  id: 'quest-play',
  title_he: 'משחק והנאה',
  title_en: 'Play & Recreation',
  steps: [{
    id: 1,
    title_he: 'משחק',
    title_en: 'Play',
    renderer: 'card',
    miniSteps: [
      {
        id: 'play_activities',
        title_he: 'מה הפעילויות שאתה הכי נהנה מהן? (בחר הכל)',
        title_en: 'What activities do you enjoy the most? (select all)',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 2 },
        dbPath: DB,
        options: [
          { value: 'hiking', label_he: 'טיולים בטבע / הליכות', label_en: 'Hiking / Nature walks', icon: '🥾' },
          { value: 'travel', label_he: 'טיולים ונסיעות', label_en: 'Travel & Exploring', icon: '✈️' },
          { value: 'camping', label_he: 'קמפינג / לינה בטבע', label_en: 'Camping / Outdoor stays', icon: '⛺' },
          { value: 'surfing', label_he: 'גלישה / ספורט ימי', label_en: 'Surfing / Water sports', icon: '🏄' },
          { value: 'cycling', label_he: 'רכיבת אופניים', label_en: 'Cycling', icon: '🚴' },
          { value: 'rock_climbing', label_he: 'טיפוס סלעים', label_en: 'Rock climbing', icon: '🧗' },
          { value: 'team_sports', label_he: 'ספורט קבוצתי (כדורגל, כדורסל)', label_en: 'Team sports (soccer, basketball)', icon: '⚽' },
          { value: 'swimming', label_he: 'שחייה', label_en: 'Swimming', icon: '🏊' },
          { value: 'running', label_he: 'ריצה', label_en: 'Running / Jogging', icon: '🏃' },
          { value: 'gaming', label_he: 'משחקי מחשב / קונסולה', label_en: 'Video gaming', icon: '🎮' },
          { value: 'board_games', label_he: 'משחקי קופסה / שחמט', label_en: 'Board games / Chess', icon: '♟️' },
          { value: 'music', label_he: 'מוזיקה (נגינה / שירה)', label_en: 'Music (playing / singing)', icon: '🎵' },
          { value: 'cooking', label_he: 'בישול / אפייה', label_en: 'Cooking / Baking', icon: '👨‍🍳' },
          { value: 'photography', label_he: 'צילום', label_en: 'Photography', icon: '📷' },
          { value: 'art', label_he: 'ציור / אמנות', label_en: 'Art / Drawing / Painting', icon: '🎨' },
          { value: 'dancing', label_he: 'ריקוד', label_en: 'Dancing', icon: '💃' },
          { value: 'reading', label_he: 'קריאה', label_en: 'Reading', icon: '📚' },
          { value: 'gardening', label_he: 'גינון', label_en: 'Gardening', icon: '🌱' },
          { value: 'fishing', label_he: 'דיג', label_en: 'Fishing', icon: '🎣' },
          { value: 'skateboarding', label_he: 'סקייטבורד / רולרבליידס', label_en: 'Skateboarding / Rollerblading', icon: '🛹' },
          { value: 'motorsports', label_he: 'מוטורספורט / אופנועים', label_en: 'Motorsports / Motorcycles', icon: '🏍️' },
          { value: 'diy', label_he: 'עשה זאת בעצמך / בנייה', label_en: 'DIY / Building', icon: '🔨' },
          { value: 'movies_tv', label_he: 'סרטים / סדרות', label_en: 'Movies / TV shows', icon: '🎬' },
          { value: 'social_events', label_he: 'אירועים חברתיים / ברביקיו', label_en: 'Social events / BBQ', icon: '🎉' },
        ],
      },
      {
        id: 'play_frequency',
        title_he: 'כמה זמן בשבוע אתה מקדיש להנאה ופנאי?',
        title_en: 'How much weekly time do you spend on fun & leisure?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'none', label_he: 'כמעט כלום — אני עובד כל הזמן', label_en: 'Almost none — always working', icon: '😞' },
          { value: '1-2h', label_he: '1-2 שעות', label_en: '1-2 hours', icon: '😐' },
          { value: '3-5h', label_he: '3-5 שעות', label_en: '3-5 hours', icon: '🙂' },
          { value: '5-10h', label_he: '5-10 שעות', label_en: '5-10 hours', icon: '😊' },
          { value: '10+h', label_he: '10+ שעות', label_en: '10+ hours', icon: '🎉' },
        ],
      },
      {
        id: 'play_wish_list',
        title_he: 'מה היית רוצה לנסות אבל עדיין לא הגעת לזה?',
        title_en: 'What would you love to try but haven\'t yet?',
        inputType: 'multi_select',
        validation: { required: false },
        dbPath: DB,
        options: [
          { value: 'skydiving', label_he: 'צניחה חופשית', label_en: 'Skydiving', icon: '🪂' },
          { value: 'scuba', label_he: 'צלילה', label_en: 'Scuba diving', icon: '🤿' },
          { value: 'mountain_trek', label_he: 'טרק הרים רציני', label_en: 'Mountain trekking', icon: '🏔️' },
          { value: 'martial_arts', label_he: 'אומנות לחימה', label_en: 'Martial arts', icon: '🥋' },
          { value: 'sailing', label_he: 'שייט', label_en: 'Sailing', icon: '⛵' },
          { value: 'paragliding', label_he: 'מצנח רחיפה', label_en: 'Paragliding', icon: '🪂' },
          { value: 'pottery', label_he: 'קרמיקה', label_en: 'Pottery', icon: '🏺' },
          { value: 'instrument', label_he: 'כלי נגינה חדש', label_en: 'Learn an instrument', icon: '🎸' },
          { value: 'standup', label_he: 'סטנדאפ / אימפרוב', label_en: 'Stand-up comedy / Improv', icon: '🎤' },
          { value: 'backpacking', label_he: 'טיול תרמיל ארוך', label_en: 'Long backpacking trip', icon: '🎒' },
        ],
      },
      {
        id: 'play_companion',
        title_he: 'אתה מעדיף פעילויות פנאי...',
        title_en: 'You prefer leisure activities...',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'solo', label_he: 'לבד — זמן לעצמי', label_en: 'Solo — me time', icon: '🧘' },
          { value: 'partner', label_he: 'עם בן/בת זוג', label_en: 'With partner', icon: '💑' },
          { value: 'friends', label_he: 'עם חברים', label_en: 'With friends', icon: '👥' },
          { value: 'family', label_he: 'עם המשפחה', label_en: 'With family', icon: '👨‍👩‍👧‍👦' },
          { value: 'mix', label_he: 'שילוב של הכל', label_en: 'Mix of everything', icon: '🔄' },
        ],
      },
      {
        id: 'play_blocker',
        title_he: 'מה מונע ממך ליהנות יותר?',
        title_en: 'What prevents you from having more fun?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'time', label_he: 'חוסר זמן', label_en: 'Lack of time', icon: '⏰' },
          { value: 'guilt', label_he: 'תחושת אשמה — ״צריך לעבוד״', label_en: 'Guilt — "should be working"', icon: '😓' },
          { value: 'energy', label_he: 'חוסר אנרגיה', label_en: 'No energy left', icon: '🔋' },
          { value: 'money', label_he: 'עלויות', label_en: 'Cost / Budget', icon: '💸' },
          { value: 'no_one', label_he: 'אין עם מי', label_en: 'No one to do it with', icon: '😔' },
          { value: 'nothing', label_he: 'שום דבר — אני נהנה מספיק!', label_en: 'Nothing — I enjoy enough!', icon: '✨' },
        ],
      },
      {
        id: 'play_goal',
        title_he: 'מה המטרה שלך בתחום הפנאי ב-100 הימים הקרובים?',
        title_en: 'What\'s your leisure goal for the next 100 days?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1, maxSelected: 3 },
        dbPath: DB,
        options: [
          { value: 'more_time', label_he: 'להקדיש יותר זמן להנאה', label_en: 'Dedicate more time to fun', icon: '⏳' },
          { value: 'try_new', label_he: 'לנסות פעילויות חדשות', label_en: 'Try new activities', icon: '🆕' },
          { value: 'outdoor_more', label_he: 'יותר פעילות בחוץ', label_en: 'More outdoor activities', icon: '🌿' },
          { value: 'adventure', label_he: 'להוסיף הרפתקאות', label_en: 'Add adventure to my life', icon: '🏔️' },
          { value: 'social_play', label_he: 'פעילויות עם חברים/משפחה', label_en: 'Activities with friends/family', icon: '👥' },
          { value: 'balance', label_he: 'איזון עבודה-פנאי', label_en: 'Work-life balance', icon: '⚖️' },
        ],
      },
    ],
  }],
};

registerFlow(playQuestSpec);

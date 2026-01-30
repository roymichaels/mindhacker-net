// Translation mapping for profile values stored in English in the database

export const PROFILE_VALUE_TRANSLATIONS: Record<string, { he: string; en: string }> = {
  // Employment Status
  'employee': { he: 'שכיר', en: 'Employee' },
  'self-employed': { he: 'עצמאי / פרילנסר', en: 'Self-Employed / Freelancer' },
  'business-owner': { he: 'בעל עסק', en: 'Business Owner' },
  'entrepreneur': { he: 'יזם', en: 'Entrepreneur' },
  'student': { he: 'סטודנט', en: 'Student' },
  'unemployed': { he: 'לא עובד כרגע', en: 'Not Working' },
  'retired': { he: 'בפנסיה', en: 'Retired' },
  
  // Social Type
  'introvert': { he: 'מופנם - מעדיף זמן לבד', en: 'Introvert' },
  'extrovert': { he: 'מוחצן - אוהב חברה', en: 'Extrovert' },
  'ambivert': { he: 'באמצע - תלוי במצב', en: 'Ambivert' },
  
  // Relationship Style
  'deep-connection': { he: 'מחפש חיבור עמוק עם מעט אנשים', en: 'Seek Deep Connection' },
  'needs-space': { he: 'צריך הרבה זמן לבד', en: 'Need Space' },
  'social-butterfly': { he: 'אוהב להיות מוקף אנשים', en: 'Social Butterfly' },
  'selective': { he: 'סלקטיבי מאוד', en: 'Very Selective' },
  
  // Relationship Status
  'single': { he: 'רווק/ה', en: 'Single' },
  'in-relationship': { he: 'בזוגיות', en: 'In Relationship' },
  'married': { he: 'נשוי/אה', en: 'Married' },
  'divorced': { he: 'גרוש/ה', en: 'Divorced' },
  'complicated': { he: 'מסובך', en: 'Complicated' },
  
  // Gender
  'male': { he: 'גבר', en: 'Male' },
  'female': { he: 'אישה', en: 'Female' },
  'other': { he: 'אחר', en: 'Other' },
  'prefer-not-to-say': { he: 'מעדיף לא לציין', en: 'Prefer not to say' },
  
  // Living Situation
  'alone': { he: 'לבד', en: 'Alone' },
  'with-partner': { he: 'עם בן/בת זוג', en: 'With Partner' },
  'with-family': { he: 'עם משפחה', en: 'With Family' },
  'with-roommates': { he: 'עם שותפים', en: 'With Roommates' },
  'with-parents': { he: 'עם הורים', en: 'With Parents' },
  
  // Exercise Frequency
  'daily': { he: 'כל יום', en: 'Daily' },
  'few-times-week': { he: 'כמה פעמים בשבוע', en: 'Few Times a Week' },
  'once-week': { he: 'פעם בשבוע', en: 'Once a Week' },
  'rarely': { he: 'לעתים רחוקות', en: 'Rarely' },
  'never': { he: 'בכלל לא', en: 'Never' },
  
  // Diet Type
  'regular': { he: 'רגיל', en: 'Regular' },
  'vegetarian': { he: 'צמחוני', en: 'Vegetarian' },
  'vegan': { he: 'טבעוני', en: 'Vegan' },
  'keto': { he: 'קטו', en: 'Keto' },
  'paleo': { he: 'פליאו', en: 'Paleo' },
  'gluten-free': { he: 'ללא גלוטן', en: 'Gluten Free' },
  
  // Sleep Hours
  'less-than-5': { he: 'פחות מ-5 שעות', en: 'Less than 5 hours' },
  '5-6': { he: '5-6 שעות', en: '5-6 hours' },
  '6-7': { he: '6-7 שעות', en: '6-7 hours' },
  '7-8': { he: '7-8 שעות', en: '7-8 hours' },
  'more-than-8': { he: 'יותר מ-8 שעות', en: 'More than 8 hours' },
  
  // Stress Level
  'very-low': { he: 'נמוך מאוד', en: 'Very Low' },
  'low': { he: 'נמוך', en: 'Low' },
  'moderate': { he: 'בינוני', en: 'Moderate' },
  'high': { he: 'גבוה', en: 'High' },
  'very-high': { he: 'גבוה מאוד', en: 'Very High' },
  
  // Decision Making
  'analytical': { he: 'אנליטי - צריך כל הנתונים', en: 'Analytical' },
  'intuitive': { he: 'אינטואיטיבי - סומך על הבטן', en: 'Intuitive' },
  'collaborative': { he: 'שיתופי - מתייעץ עם אחרים', en: 'Collaborative' },
  'impulsive': { he: 'אימפולסיבי - מחליט מהר', en: 'Impulsive' },
  
  // Conflict Handling
  'avoidant': { he: 'נמנע - מעדיף לא להתעמת', en: 'Avoidant' },
  'confrontational': { he: 'ישיר - מעדיף לפתור מיד', en: 'Confrontational' },
  'mediator': { he: 'מתווך - מחפש פשרה', en: 'Mediator' },
  'passive-aggressive': { he: 'פסיבי-אגרסיבי', en: 'Passive-Aggressive' },
  
  // Problem Solving
  'logical': { he: 'לוגי - שלב אחר שלב', en: 'Logical' },
  'creative': { he: 'יצירתי - חושב מחוץ לקופסה', en: 'Creative' },
  'practical': { he: 'פרקטי - מה שעובד', en: 'Practical' },
  'research': { he: 'חוקר - לומד מאחרים', en: 'Research-Based' },
  
  // Boolean values
  'true': { he: 'כן', en: 'Yes' },
  'false': { he: 'לא', en: 'No' },
  'yes': { he: 'כן', en: 'Yes' },
  'no': { he: 'לא', en: 'No' },
};

// Field label translations
export const FIELD_LABEL_TRANSLATIONS: Record<string, { he: string; en: string }> = {
  'age': { he: 'גיל', en: 'Age' },
  'gender': { he: 'מגדר', en: 'Gender' },
  'name': { he: 'שם', en: 'Name' },
  'relationship_status': { he: 'מצב משפחתי', en: 'Relationship Status' },
  'living_situation': { he: 'מצב מגורים', en: 'Living Situation' },
  'sleep_hours': { he: 'שעות שינה', en: 'Sleep Hours' },
  'exercise_frequency': { he: 'תדירות פעילות גופנית', en: 'Exercise Frequency' },
  'diet_type': { he: 'סוג תזונה', en: 'Diet Type' },
  'hobbies': { he: 'תחביבים', en: 'Hobbies' },
  'stress_level': { he: 'רמת לחץ', en: 'Stress Level' },
  'decision_making': { he: 'קבלת החלטות', en: 'Decision Making' },
  'conflict_handling': { he: 'התמודדות עם קונפליקטים', en: 'Conflict Handling' },
  'problem_solving': { he: 'פתרון בעיות', en: 'Problem Solving' },
  'employment_status': { he: 'מצב תעסוקתי', en: 'Employment Status' },
  'social_type': { he: 'טיפוס חברתי', en: 'Social Type' },
  'relationship_style': { he: 'סגנון יחסים', en: 'Relationship Style' },
  'intention': { he: 'כוונה', en: 'Intention' },
};

/**
 * Translate a profile value from English to the target language
 */
export function translateProfileValue(value: string, language: string): string {
  // Check if it's a direct translation
  const lowerValue = value.toLowerCase();
  const translation = PROFILE_VALUE_TRANSLATIONS[lowerValue];
  
  if (translation) {
    return language === 'he' ? translation.he : translation.en;
  }
  
  // Return original value if no translation found
  return value;
}

/**
 * Translate a field label from English to the target language
 */
export function translateFieldLabel(key: string, language: string): string {
  const translation = FIELD_LABEL_TRANSLATIONS[key];
  
  if (translation) {
    return language === 'he' ? translation.he : translation.en;
  }
  
  // Format the key as a readable label
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

const CORE_PILLAR_IDS = ['consciousness', 'presence', 'power', 'vitality', 'focus', 'combat', 'expansion'];
const ARENA_PILLAR_IDS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play', 'order'];

interface PillarAssessment {
  domain_id: string;
  domain_config: Record<string, any>;
  status: string;
}

function buildPillarPrompt(
  pillarId: string,
  hub: 'core' | 'arena',
  assessments: PillarAssessment[],
  profileData: any,
  userProjects: any[],
  userBusinesses: any[],
  auroraMemory: any[],
): string {
  const assessment = assessments.find(a => a.domain_id === pillarId);
  const cfg = assessment?.domain_config || {};
  const latest = cfg.latest_assessment;
  const formData = cfg.form_data || cfg.onboarding_data || {};

  const assessmentBlock = assessment && assessment.status === 'configured'
    ? `Score: ${latest?.overallScore ?? '?'}/100
Mirror: ${latest?.mirrorStatement || 'N/A'}
Subsystems: ${JSON.stringify(latest?.subsystems || latest?.subScores || {}, null, 1)}
Findings: ${JSON.stringify(latest?.findings?.slice(0, 3) || [], null, 1)}
Next Step: ${latest?.nextStep || 'N/A'}
Form Data: ${JSON.stringify(formData, null, 1).slice(0, 600)}`
    : 'No assessment data.';

  const projectsSection = userProjects
    .filter(p => !p.life_pillar || p.life_pillar === pillarId || p.life_pillar === 'general')
    .map(p => `- "${p.name}" (${p.status}) — ${p.description || ''}`)
    .join('\n') || 'None';

  const businessSection = userBusinesses.length > 0
    ? userBusinesses.map(b => `- "${b.business_name || 'Unnamed'}" (step ${b.current_step}/10)`).join('\n')
    : 'None';

  const memorySnippets = auroraMemory.slice(0, 5)
    .map(m => `- [${m.emotional_state || 'neutral'}] ${m.summary}`)
    .join('\n') || 'None';

  return `You are Aurora, elite life transformation AI. Generate a 90-day strategy for the pillar "${pillarId}" (${hub} hub).

## USER
Name: ${profileData?.name || 'Unknown'} | Level: ${profileData?.level || 1}
Intention: ${JSON.stringify(profileData?.intention || '')}

## PILLAR "${pillarId.toUpperCase()}" ASSESSMENT
${assessmentBlock}

## RELEVANT PROJECTS
${projectsSection}

## BUSINESSES
${businessSection}

## RECENT MEMORY
${memorySnippets}

## REQUIRED OUTPUT — 3×3×5:
Generate exactly 3 MAIN GOALS for this pillar.
Each main goal has exactly 3 SUB-GOALS.
Each sub-goal has exactly 5 MILESTONES (concrete action steps).

Rules:
- Be HYPER-SPECIFIC. Reference user's actual projects/businesses BY NAME.
- Keep milestone text VERY SHORT (under 12 words).
- Hebrew must be natural, not literal translation.
- NO generic filler.

## OUTPUT FORMAT (JSON only, NO markdown fences):
{
  "goals": [
    {
      "goal_en": "Main goal title",
      "goal_he": "כותרת מטרה ראשית",
      "sub_goals": [
        {
          "sub_goal_en": "Sub-goal title",
          "sub_goal_he": "מטרת משנה",
          "milestones_en": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
          "milestones_he": ["צעד 1", "צעד 2", "צעד 3", "צעד 4", "צעד 5"]
        }
      ]
    }
  ]
}`;
}

// ========== RICH FALLBACK CONTENT ==========
const FALLBACK_DATA: Record<string, { goals: any[] }> = {
  consciousness: { goals: [
    { goal_en: "Master Daily Awareness Practice", goal_he: "שליטה בתרגול מודעות יומי", sub_goals: [
      { sub_goal_en: "Establish morning mindfulness ritual", sub_goal_he: "ביסוס טקס מיינדפולנס בוקר", milestones_en: ["Set alarm 30min earlier for 7 consecutive days","Complete a 5-min guided meditation for 7 days straight","Journal 3 observations about your thought patterns","Increase meditation to 10 minutes daily for a week","Identify your top 3 mental triggers","Practice body scan meditation 5 times","Complete a full week without checking phone first thing","Document your default morning emotional state for 5 days","Meditate 15 minutes daily for 5 consecutive days","Teach someone your morning awareness technique"], milestones_he: ["הקדם שעון מעורר ב-30 דקות ל-7 ימים רצופים","השלם מדיטציה מודרכת של 5 דקות 7 ימים ברציפות","רשום 3 תצפיות על דפוסי המחשבה שלך","הגדל מדיטציה ל-10 דקות יומיות למשך שבוע","זהה את 3 הטריגרים המנטליים המובילים שלך","תרגל מדיטציית סריקת גוף 5 פעמים","השלם שבוע שלם בלי לבדוק טלפון מיד בבוקר","תעד את מצבך הרגשי ברירת המחדל בבוקר 5 ימים","עשה מדיטציה 15 דקות יומיות 5 ימים רצופים","למד מישהו את טכניקת המודעות הבוקרית שלך"] },
      { sub_goal_en: "Develop emotional pattern recognition", sub_goal_he: "פיתוח זיהוי דפוסים רגשיים", milestones_en: ["Track your emotions 3 times daily for one week","Identify your top 5 recurring emotional patterns","Map triggers to specific situations or people","Create a personal emotional vocabulary list","Practice naming emotions in real-time for 3 days","Notice and document 3 emotional reactions before they escalate","Develop a pause protocol for intense emotions","Journal about one pattern you want to transform","Successfully redirect an emotional pattern once","Share your insights about your patterns with a trusted person"], milestones_he: ["עקוב אחר רגשות 3 פעמים ביום למשך שבוע","זהה 5 דפוסים רגשיים חוזרים מובילים","מפה טריגרים למצבים או אנשים ספציפיים","צור רשימת מילון רגשי אישי","תרגל שיום רגשות בזמן אמת 3 ימים","שים לב ותעד 3 תגובות רגשיות לפני שהן מסלימות","פתח פרוטוקול עצירה לרגשות אינטנסיביים","כתוב ביומן על דפוס אחד שאתה רוצה לשנות","הפנה בהצלחה דפוס רגשי פעם אחת","שתף תובנות על הדפוסים שלך עם אדם מהימן"] },
      { sub_goal_en: "Build metacognition skills", sub_goal_he: "בניית מיומנויות מטא-קוגניציה", milestones_en: ["Observe your thought process during 3 daily tasks","Catch yourself in autopilot mode 5 times in one day","Practice thinking about your thinking for 5 minutes daily","Identify 3 cognitive biases you frequently exhibit","Challenge one limiting belief with evidence","Document your decision-making process for 3 decisions","Notice when you're rationalizing vs reasoning","Practice perspective-taking on a disagreement","Identify your default cognitive shortcuts","Write a 'mental operating manual' for yourself"], milestones_he: ["צפה בתהליך החשיבה שלך ב-3 משימות יומיות","תפוס את עצמך בטייס אוטומטי 5 פעמים ביום","תרגל חשיבה על החשיבה שלך 5 דקות יומיות","זהה 3 הטיות קוגניטיביות שאתה מפגין לעתים קרובות","אתגר אמונה מגבילה אחת עם ראיות","תעד תהליך קבלת החלטות ל-3 החלטות","שים לב מתי אתה מרציונליז לעומת חושב","תרגל לקיחת פרספקטיבה על חילוקי דעות","זהה קיצורי דרך קוגניטיביים ברירת מחדל","כתוב 'מדריך הפעלה מנטלי' לעצמך"] },
      { sub_goal_en: "Integrate consciousness into daily decisions", sub_goal_he: "שילוב תודעה בהחלטות יומיות", milestones_en: ["Make 3 fully conscious decisions today","Notice and override one impulsive choice","Apply the 10-10-10 rule to a meaningful decision","Practice delayed gratification in one area","Choose discomfort over convenience once","Make a decision aligned with your values, not habits","Say no to something that doesn't serve your growth","Practice full presence during a conversation","Choose a response instead of reacting in a conflict","Make one counter-intuitive decision based on awareness"], milestones_he: ["קבל 3 החלטות מודעות לחלוטין היום","שים לב ודרוס בחירה אימפולסיבית אחת","החל את כלל 10-10-10 על החלטה משמעותית","תרגל דחיית סיפוקים בתחום אחד","בחר אי-נוחות על פני נוחות פעם אחת","קבל החלטה מבוססת ערכים, לא הרגלים","אמור לא למשהו שלא משרת את הצמיחה שלך","תרגל נוכחות מלאה במהלך שיחה","בחר תגובה במקום להגיב בקונפליקט","קבל החלטה אחת נגד-אינטואיטיבית מבוססת מודעות"] },
      { sub_goal_en: "Deepen self-understanding through reflection", sub_goal_he: "העמקת הבנה עצמית דרך רפלקציה", milestones_en: ["Complete a weekly reflection every Sunday for 4 weeks","Write about your biggest growth area this month","Identify 3 things you're avoiding and why","Create a personal values hierarchy","Map your energy patterns across a typical day","Write a letter to your future self 90 days from now","Identify what you need to let go of","Document your top 3 self-sabotage patterns","Create a vision statement for your consciousness journey","Review and celebrate 3 specific growth moments"], milestones_he: ["השלם רפלקציה שבועית כל יום ראשון 4 שבועות","כתוב על תחום הצמיחה הגדול ביותר שלך החודש","זהה 3 דברים שאתה נמנע מהם ולמה","צור היררכיית ערכים אישית","מפה דפוסי אנרגיה לאורך יום טיפוסי","כתוב מכתב לעצמך העתידי בעוד 90 יום","זהה ממה אתה צריך לוותר","תעד 3 דפוסי חבלה עצמית מובילים","צור הצהרת חזון למסע התודעה שלך","סקור וחגוג 3 רגעי צמיחה ספציפיים"] },
    ]},
    { goal_en: "Reprogram Subconscious Patterns", goal_he: "תכנות מחדש של דפוסים תת-מודעים", sub_goals: [
      { sub_goal_en: "Identify and map limiting beliefs", sub_goal_he: "זיהוי ומיפוי אמונות מגבילות", milestones_en: ["List 10 beliefs you hold about yourself","Categorize beliefs as empowering or limiting","Trace 3 limiting beliefs to their origin","Challenge your biggest limiting belief with 5 counter-examples","Write new empowering belief statements","Read your empowering beliefs aloud daily for a week","Notice when a limiting belief activates during the day","Successfully reframe one limiting belief in real-time","Share one transformed belief with someone","Create a belief audit template and use it monthly"], milestones_he: ["רשום 10 אמונות שאתה מחזיק על עצמך","סווג אמונות כמעצימות או מגבילות","עקוב אחר 3 אמונות מגבילות למקור שלהן","אתגר את האמונה המגבילה הגדולה ביותר עם 5 דוגמאות נגד","כתוב הצהרות אמונה מעצימות חדשות","קרא את האמונות המעצימות בקול רם יומית שבוע","שים לב כשאמונה מגבילה מופעלת במהלך היום","שנה מסגרת של אמונה מגבילה בזמן אמת","שתף אמונה אחת שהשתנתה עם מישהו","צור תבנית ביקורת אמונות והשתמש חודשית"] },
      { sub_goal_en: "Build positive mental conditioning", sub_goal_he: "בניית התניה מנטלית חיובית", milestones_en: ["Create 5 personal affirmations aligned with goals","Practice affirmations for 5 minutes each morning","Visualize your ideal day for 3 minutes daily","Complete a self-hypnosis session focused on confidence","Use anchoring technique to access a peak state","Practice gratitude journaling nightly for 2 weeks","Create a mental success reel of past achievements","Use future-pacing visualization before important events","Build a pre-performance mental routine","Notice and celebrate small wins daily for a week"], milestones_he: ["צור 5 אישורים אישיים מיושרים עם מטרות","תרגל אישורים 5 דקות כל בוקר","דמיין את היום האידיאלי שלך 3 דקות יומיות","השלם סשן היפנוזה עצמית ממוקד ביטחון","השתמש בטכניקת עיגון לגישה למצב שיא","תרגל יומן הכרת תודה בלילה שבועיים","צור סרט הצלחה מנטלי של הישגי עבר","השתמש בדמיון עתידי לפני אירועים חשובים","בנה שגרה מנטלית טרום-ביצוע","שים לב וחגוג ניצחונות קטנים יומיים שבוע"] },
      { sub_goal_en: "Release stored emotional energy", sub_goal_he: "שחרור אנרגיה רגשית מאוחסנת", milestones_en: ["Identify 3 unresolved emotional situations","Practice breathwork for emotional release 3 times","Write an unsent letter to release resentment","Complete a body-based emotional release session","Forgive yourself for one past mistake","Express a suppressed emotion in a safe space","Practice somatic shaking for 5 minutes 3 times","Have a difficult conversation you've been avoiding","Release attachment to one specific outcome","Create a ritual for letting go and perform it"], milestones_he: ["זהה 3 מצבים רגשיים לא פתורים","תרגל נשימות לשחרור רגשי 3 פעמים","כתוב מכתב לא נשלח לשחרור טינה","השלם סשן שחרור רגשי מבוסס גוף","סלח לעצמך על טעות עבר אחת","הבע רגש מדוכא במרחב בטוח","תרגל ניעור סומטי 5 דקות 3 פעמים","נהל שיחה קשה שנמנעת ממנה","שחרר התקשרות לתוצאה ספציפית אחת","צור טקס של שחרור ובצע אותו"] },
      { sub_goal_en: "Install empowering identity anchors", sub_goal_he: "התקנת עוגנים זהותיים מעצימים", milestones_en: ["Define who you want to be in 3 words","Create a personal mantra for challenging moments","Design your ideal identity profile","Act 'as if' you're already that person for one full day","Identify 3 role models and their specific traits you want","Practice embodying one role model trait daily for a week","Create a physical anchor gesture for your peak state","Use your identity anchor in a real-world challenge","Build a 'character sheet' for your evolved self","Review and refine your identity anchors monthly"], milestones_he: ["הגדר מי אתה רוצה להיות ב-3 מילים","צור מנטרה אישית לרגעים מאתגרים","עצב פרופיל זהות אידיאלי","התנהג 'כאילו' אתה כבר האדם הזה ליום שלם","זהה 3 מודלים לחיקוי ותכונות ספציפיות שלהם","תרגל הגשמת תכונה של מודל לחיקוי יומית שבוע","צור מחוות עוגן פיזי למצב השיא שלך","השתמש בעוגן הזהות שלך באתגר אמיתי","בנה 'דף דמות' לעצמך המפותח","סקור ושכלל את עוגני הזהות שלך חודשית"] },
      { sub_goal_en: "Create transformation accountability system", sub_goal_he: "יצירת מערכת אחריות לטרנספורמציה", milestones_en: ["Set 3 measurable consciousness goals for 30 days","Create a daily check-in template","Track your progress for 7 consecutive days","Share your goals with an accountability partner","Complete a weekly review of consciousness growth","Adjust one practice based on what's working","Document before/after self-assessment","Celebrate completing 30 days of practice","Set goals for the next 30-day cycle","Create a long-term consciousness development roadmap"], milestones_he: ["קבע 3 מטרות תודעה מדידות ל-30 יום","צור תבנית צ'ק-אין יומי","עקוב אחר ההתקדמות שלך 7 ימים רצופים","שתף מטרות עם שותף לאחריות","השלם סקירה שבועית של צמיחה תודעתית","התאם תרגול אחד לפי מה שעובד","תעד הערכה עצמית לפני/אחרי","חגוג השלמת 30 יום של תרגול","קבע מטרות למחזור 30 הימים הבא","צור מפת דרכים ארוכת טווח לפיתוח תודעתי"] },
    ]},
    { goal_en: "Achieve Flow State Mastery", goal_he: "שליטה במצב זרימה (Flow)", sub_goals: [
      { sub_goal_en: "Identify personal flow triggers", sub_goal_he: "זיהוי טריגרים אישיים לזרימה", milestones_en: ["Document 3 past flow experiences in detail","Identify common elements across flow moments","Map your optimal challenge-skill sweet spot","Test one flow trigger intentionally this week","Track time-of-day patterns for peak focus","Identify your top 3 flow-killing distractions","Create an environment checklist for flow","Enter flow state intentionally once this week","Document what brought you into and out of flow","Build a personal flow trigger protocol"], milestones_he: ["תעד 3 חוויות זרימה עבר בפירוט","זהה מרכיבים משותפים בין רגעי זרימה","מפה את נקודת האיזון אתגר-מיומנות","בדוק טריגר זרימה אחד בכוונה השבוע","עקוב אחר דפוסי שעות היום לשיא מיקוד","זהה 3 הסחות דעת שהורגות זרימה","צור רשימת סביבה לזרימה","הכנס למצב זרימה בכוונה פעם השבוע","תעד מה הכניס אותך ומה הוציא מזרימה","בנה פרוטוקול טריגר זרימה אישי"] },
      { sub_goal_en: "Extend flow duration progressively", sub_goal_he: "הארכת משך הזרימה בהדרגה", milestones_en: ["Achieve 15 minutes of uninterrupted deep work","Extend to 25 minutes with Pomodoro technique","Complete 2 consecutive flow blocks in one session","Achieve 45 minutes of sustained flow","Build a pre-flow ritual (music, environment, breathing)","Complete a 60-minute deep work session","Achieve flow state 3 times in one week","Recover from interruption and re-enter flow within 5 minutes","Complete a 90-minute flow marathon","Maintain consistent daily flow blocks for 2 weeks"], milestones_he: ["השג 15 דקות של עבודה עמוקה ללא הפרעה","הרחב ל-25 דקות עם טכניקת פומודורו","השלם 2 בלוקי זרימה רצופים בסשן אחד","השג 45 דקות של זרימה מתמשכת","בנה טקס טרום-זרימה","השלם סשן עבודה עמוקה של 60 דקות","השג מצב זרימה 3 פעמים בשבוע","התאושש מהפרעה וחזור לזרימה תוך 5 דקות","השלם מרתון זרימה של 90 דקות","שמור על בלוקי זרימה יומיים עקביים שבועיים"] },
      { sub_goal_en: "Apply flow to creative output", sub_goal_he: "יישום זרימה ליצירתיות", milestones_en: ["Use flow state for a creative project session","Produce tangible output during one flow session","Combine flow with brainstorming for new ideas","Use flow for content creation or writing","Apply flow to problem-solving on a real challenge","Create something you're proud of in one flow session","Share flow-created work with others","Use flow for strategic planning","Achieve creative breakthrough during flow","Build a weekly creative flow practice"], milestones_he: ["השתמש בזרימה לסשן פרויקט יצירתי","הפק תוצר מוחשי במהלך סשן זרימה","שלב זרימה עם סיעור מוחות לרעיונות חדשים","השתמש בזרימה ליצירת תוכן או כתיבה","החל זרימה על פתרון בעיות באתגר אמיתי","צור משהו שאתה גאה בו בסשן זרימה אחד","שתף עבודה שנוצרה בזרימה עם אחרים","השתמש בזרימה לתכנון אסטרטגי","השג פריצת דרך יצירתית במהלך זרימה","בנה תרגול זרימה יצירתית שבועי"] },
      { sub_goal_en: "Reduce cognitive friction daily", sub_goal_he: "הפחתת חיכוך קוגניטיבי יומי", milestones_en: ["Identify your top 5 daily cognitive friction points","Eliminate one unnecessary decision from your morning","Batch similar tasks to reduce context switching","Create templates for 3 recurring tasks","Set up a distraction-free workspace zone","Implement a digital minimalism practice for one week","Automate one repetitive daily process","Reduce decision fatigue with pre-planned meals/outfits","Create a shutdown ritual for end of workday","Measure your cognitive friction reduction over 30 days"], milestones_he: ["זהה 5 נקודות חיכוך קוגניטיבי יומיות","הסר החלטה מיותרת אחת מהבוקר","קבץ משימות דומות להפחתת מיתוג הקשר","צור תבניות ל-3 משימות חוזרות","הקם אזור עבודה נטול הסחות","יישם תרגול מינימליזם דיגיטלי שבוע","הפוך תהליך יומי חוזר לאוטומטי","הפחת עייפות החלטות עם ארוחות/בגדים מתוכננים","צור טקס סגירה לסוף יום עבודה","מדוד הפחתת חיכוך קוגניטיבי על פני 30 יום"] },
      { sub_goal_en: "Build peak performance mindset", sub_goal_he: "בניית מנטליות ביצועי שיא", milestones_en: ["Define what peak performance means to you personally","Identify your top 3 performance killers","Create a pre-performance activation routine","Practice visualization before a high-stakes situation","Use positive self-talk during challenging moments","Review a peak performance day and extract patterns","Build a recovery protocol for after intense output","Track your weekly peak performance hours","Achieve a new personal best in your primary domain","Create a sustainable high-performance lifestyle blueprint"], milestones_he: ["הגדר מה ביצועי שיא אומר לך אישית","זהה 3 הורגי ביצועים מובילים","צור שגרת הפעלה טרום-ביצוע","תרגל דמיון לפני מצב לחץ גבוה","השתמש בדיבור עצמי חיובי ברגעים מאתגרים","סקור יום ביצועי שיא וחלץ דפוסים","בנה פרוטוקול התאוששות לאחר תפוקה אינטנסיבית","עקוב אחר שעות ביצועי שיא שבועיות","השג שיא אישי חדש בתחום העיקרי שלך","צור שרטוט אורח חיים בר-קיימא של ביצועים גבוהים"] },
    ]},
  ]},
  // ====== PRESENCE ======
  presence: { goals: [
    { goal_en: "Cultivate Deep Present-Moment Awareness", goal_he: "טיפוח מודעות עמוקה לרגע הנוכחי", sub_goals: [
      { sub_goal_en: "Practice daily grounding exercises", sub_goal_he: "תרגול תרגילי הארקה יומיים", milestones_en: ["Do 5-4-3-2-1 sensory grounding 3 times daily","Stand barefoot on earth for 5 minutes daily for a week","Practice conscious breathing during commute for 5 days","Do a 10-minute walking meditation","Practice eating one meal mindfully","Ground yourself before every meeting for a week","Try cold water grounding (cold shower ending) 3 times","Complete a nature immersion session of 30+ minutes","Practice grounding during a stressful moment","Create and use your personalized 2-minute grounding protocol"], milestones_he: ["עשה הארקה חושית 5-4-3-2-1 שלוש פעמים ביום","עמוד יחף על אדמה 5 דקות יומיות שבוע","תרגל נשימה מודעת בנסיעה 5 ימים","עשה מדיטציית הליכה של 10 דקות","תרגל אכילה מודעת של ארוחה אחת","הקרקע את עצמך לפני כל פגישה שבוע","נסה הארקה במים קרים 3 פעמים","השלם סשן טבילה בטבע 30+ דקות","תרגל הארקה ברגע מלחיץ","צור ושימוש בפרוטוקול הארקה אישי של 2 דקות"] },
      { sub_goal_en: "Develop single-task focus habit", sub_goal_he: "פיתוח הרגל מיקוד במשימה אחת", milestones_en: ["Do one task at a time for 2 full hours","Turn off all notifications during deep work","Complete a meal without screens or reading","Have a conversation with zero phone checks","Work on one project without tab-switching for 45 min","Practice single-tasking during household chores","Read for 30 minutes without interruption","Complete a creative task in one sitting","Maintain single-task focus for a full workday","Teach someone the power of monotasking"], milestones_he: ["עשה משימה אחת בכל פעם ל-2 שעות מלאות","כבה כל ההתראות בזמן עבודה עמוקה","השלם ארוחה בלי מסכים או קריאה","נהל שיחה בלי בדיקות טלפון","עבוד על פרויקט אחד 45 דקות בלי החלפת טאבים","תרגל ריכוז במשימה אחת במטלות בית","קרא 30 דקות ללא הפרעה","השלם משימה יצירתית בישיבה אחת","שמור מיקוד במשימה אחת ליום עבודה שלם","למד מישהו את העוצמה של מונו-טאסקינג"] },
      { sub_goal_en: "Master breath as presence anchor", sub_goal_he: "שליטה בנשימה כעוגן נוכחות", milestones_en: ["Practice box breathing (4-4-4-4) 5 times daily","Learn and practice 4-7-8 breathing technique","Do 3 minutes of conscious breathing before sleep","Use breath counting during waiting moments","Practice Wim Hof breathing protocol once","Do alternate nostril breathing for 5 minutes","Use breath to calm yourself in a real stressful moment","Maintain breath awareness during exercise","Complete a 10-minute breathwork session","Build a daily 5-minute breathwork habit for 2 weeks"], milestones_he: ["תרגל נשימת קופסה 4-4-4-4 חמש פעמים ביום","למד ותרגל טכניקת נשימה 4-7-8","עשה 3 דקות נשימה מודעת לפני שינה","השתמש בספירת נשימות ברגעי המתנה","תרגל פרוטוקול נשימת וים הוף פעם","עשה נשימת אף לסירוגין 5 דקות","השתמש בנשימה להרגעה ברגע מלחיץ אמיתי","שמור מודעות נשימה בזמן אימון","השלם סשן נשימות של 10 דקות","בנה הרגל נשימות יומי של 5 דקות שבועיים"] },
      { sub_goal_en: "Create digital presence boundaries", sub_goal_he: "יצירת גבולות נוכחות דיגיטליים", milestones_en: ["Set screen time limits for social media apps","Create a phone-free zone in your home","Implement a 'no screens after 9pm' rule for 5 days","Delete one time-wasting app","Check email only at scheduled times for a week","Take a 24-hour digital detox","Use grayscale mode on phone for 3 days","Remove notifications from all non-essential apps","Practice digital sabbath once a week","Audit and reduce your digital subscriptions"], milestones_he: ["הגדר מגבלות זמן מסך לאפליקציות חברתיות","צור אזור ללא טלפון בבית","יישם כלל 'אין מסכים אחרי 21:00' ל-5 ימים","מחק אפליקציה אחת שמבזבזת זמן","בדוק מייל רק בזמנים קבועים שבוע","עשה ניתוק דיגיטלי של 24 שעות","השתמש במצב גווני אפור בטלפון 3 ימים","הסר התראות מכל האפליקציות הלא חיוניות","תרגל שבת דיגיטלית פעם בשבוע","בקר והפחת את המנויים הדיגיטליים שלך"] },
      { sub_goal_en: "Deepen relational presence", sub_goal_he: "העמקת נוכחות ביחסים", milestones_en: ["Give someone your full attention for 10 minutes","Practice active listening without planning your response","Make eye contact during an entire conversation","Ask 3 deep questions in a casual conversation","Put away your phone during all meals with others","Notice and name someone else's emotional state","Practice empathetic reflection with a friend","Be fully present during a family interaction","Have a 30-minute phone-free walk with someone","Write someone a thoughtful, present-minded message"], milestones_he: ["תן למישהו את תשומת הלב המלאה שלך 10 דקות","תרגל הקשבה פעילה בלי לתכנן תגובה","שמור קשר עין לאורך שיחה שלמה","שאל 3 שאלות עמוקות בשיחה רגילה","הניח את הטלפון בכל ארוחות עם אחרים","שים לב ושם את המצב הרגשי של מישהו אחר","תרגל שיקוף אמפתי עם חבר","היה נוכח לחלוטין באינטראקציה משפחתית","צא להליכה של 30 דקות ללא טלפון עם מישהו","כתוב למישהו הודעה מתחשבת ונוכחית"] },
    ]},
    { goal_en: "Transform Stress Response Patterns", goal_he: "טרנספורמציה של דפוסי תגובה ללחץ", sub_goals: [
      { sub_goal_en: "Build stress awareness dashboard", sub_goal_he: "בניית לוח בקרה למודעות ללחץ", milestones_en: ["Rate your stress 1-10 three times daily for a week","Identify your top 5 stress triggers","Map physical stress signals in your body","Track stress-recovery cycles for 5 days","Identify your default stress coping mechanism","Distinguish between productive and destructive stress","Create a personal stress threshold indicator","Notice stress building before it peaks 3 times","Document your stress patterns over 2 weeks","Share your stress map with a trusted person"], milestones_he: ["דרג לחץ 1-10 שלוש פעמים ביום שבוע","זהה 5 טריגרים מובילים ללחץ","מפה סימני לחץ פיזיים בגוף","עקוב אחר מחזורי לחץ-התאוששות 5 ימים","זהה מנגנון התמודדות ברירת מחדל שלך","הבחן בין לחץ פרודוקטיבי להרסני","צור אינדיקטור סף לחץ אישי","שים לב ללחץ שנבנה לפני שהוא מגיע לשיא 3 פעמים","תעד דפוסי לחץ על פני שבועיים","שתף את מפת הלחץ שלך עם אדם מהימן"] },
      { sub_goal_en: "Develop rapid reset techniques", sub_goal_he: "פיתוח טכניקות איפוס מהירות", milestones_en: ["Learn the physiological sigh (double inhale, long exhale)","Practice the 90-second emotion rule","Use cold water on wrists during acute stress","Do 10 jumping jacks as a state break","Practice the 'name it to tame it' technique","Use bilateral tapping for 2 minutes during anxiety","Do a body shake reset 3 times when stressed","Practice progressive muscle relaxation once","Complete a 5-minute stress reset sequence","Build and test your personal 60-second reset protocol"], milestones_he: ["למד את האנחה הפיזיולוגית (שאיפה כפולה, נשיפה ארוכה)","תרגל כלל 90 השניות לרגשות","השתמש במים קרים על פרקי ידיים בלחץ חריף","עשה 10 קפיצות כוכב כהפסקת מצב","תרגל את טכניקת 'שם אותו כדי לאלף אותו'","השתמש בהקשה דו-צדדית 2 דקות בחרדה","עשה ניעור גוף לאיפוס 3 פעמים בלחץ","תרגל הרפיית שרירים פרוגרסיבית פעם","השלם רצף איפוס לחץ של 5 דקות","בנה ובדוק פרוטוקול איפוס אישי של 60 שניות"] },
      { sub_goal_en: "Build stress resilience through exposure", sub_goal_he: "בניית חוסן ללחץ דרך חשיפה", milestones_en: ["Take a cold shower for 30 seconds","Hold an uncomfortable conversation you've avoided","Fast for 16 hours once","Sit with boredom for 20 minutes without distraction","Do something that scares you mildly","Practice public speaking or presenting once","Complete a challenging physical workout","Say no to a social obligation","Sit with uncertainty about an outcome for a full day","Voluntarily enter a mildly stressful situation and practice calm"], milestones_he: ["קח מקלחת קרה 30 שניות","נהל שיחה לא נוחה שנמנעת ממנה","צום 16 שעות פעם אחת","שב עם שעמום 20 דקות בלי הסחה","עשה משהו שמפחיד אותך קלות","תרגל דיבור בפני קהל פעם","השלם אימון גופני מאתגר","אמור לא להתחייבות חברתית","שב עם אי-ודאות לגבי תוצאה ליום שלם","הכנס מרצון למצב לחץ קל ותרגל רוגע"] },
      { sub_goal_en: "Create sustainable recovery rituals", sub_goal_he: "יצירת טקסי התאוששות בני קיימא", milestones_en: ["Design a 15-minute evening wind-down routine","Practice legs-up-the-wall pose for 5 minutes after work","Create a transition ritual between work and personal time","Take a nature walk for stress recovery once a week","Practice non-sleep deep rest (NSDR) once","Schedule and take a full recovery day","Build a Sunday reset ritual","Practice journaling for stress processing 3 times","Create a stress-recovery toolkit with 5 tools","Measure your recovery quality over 2 weeks"], milestones_he: ["עצב שגרת רגיעה ערבית של 15 דקות","תרגל תנוחת רגליים על הקיר 5 דקות אחרי עבודה","צור טקס מעבר בין עבודה לזמן אישי","צא לטיול בטבע להתאוששות מלחץ פעם בשבוע","תרגל מנוחה עמוקה ללא שינה פעם","תזמן וקח יום התאוששות מלא","בנה טקס איפוס יום ראשון","תרגל כתיבה ביומן לעיבוד לחץ 3 פעמים","צור ערכת כלים להתאוששות מלחץ עם 5 כלים","מדוד את איכות ההתאוששות שלך על פני שבועיים"] },
      { sub_goal_en: "Reframe stress as growth fuel", sub_goal_he: "מסגור מחדש של לחץ כדלק לצמיחה", milestones_en: ["Read about the stress-is-enhancing mindset","Reframe one stressful event as a growth opportunity","Practice saying 'I'm excited' instead of 'I'm nervous'","Find the lesson in your biggest recent stressor","Use stress energy to fuel a workout","Channel anxiety into preparation energy","Celebrate completing something difficult","Write about how past stress made you stronger","Practice approach motivation instead of avoidance","Build a personal 'stress = growth' narrative"], milestones_he: ["קרא על מנטליות הלחץ-כמעצים","מסגר מחדש אירוע מלחיץ כהזדמנות צמיחה","תרגל לומר 'אני נרגש' במקום 'אני לחוץ'","מצא את הלקח בגורם הלחץ הגדול האחרון שלך","השתמש באנרגיית לחץ לדלק אימון","הפנה חרדה לאנרגיית הכנה","חגוג השלמת משהו קשה","כתוב על איך לחץ עבר חיזק אותך","תרגל מוטיבציית גישה במקום הימנעות","בנה נרטיב אישי של 'לחץ = צמיחה'"] },
    ]},
    { goal_en: "Embody Radical Acceptance", goal_he: "הגשמת קבלה רדיקלית", sub_goals: [
      { sub_goal_en: "Practice non-judgment daily", sub_goal_he: "תרגול אי-שיפוטיות יומי", milestones_en: ["Catch yourself judging 5 times in one day","Replace a judgment with curiosity 3 times","Practice observing without labeling for 10 minutes","Go through one interaction without internal criticism","Notice judgment of yourself and release it","Practice 'beginner's mind' in a familiar activity","Observe a frustrating situation without judgment","Accept a mistake without self-criticism","Practice non-judgment toward a difficult person","Maintain non-judgmental awareness for a full day"], milestones_he: ["תפוס את עצמך שופט 5 פעמים ביום","החלף שיפוט בסקרנות 3 פעמים","תרגל תצפית ללא תיוג 10 דקות","עבור אינטראקציה בלי ביקורת פנימית","שים לב לשיפוט עצמי ושחרר","תרגל 'מוח מתחיל' בפעילות מוכרת","צפה במצב מתסכל ללא שיפוט","קבל טעות בלי ביקורת עצמית","תרגל אי-שיפוטיות כלפי אדם קשה","שמור מודעות לא שיפוטית ליום שלם"] },
      { sub_goal_en: "Accept what you cannot control", sub_goal_he: "קבלת מה שלא בשליטתך", milestones_en: ["List 5 things you're trying to control but can't","Release one expectation about another person","Accept a situation you've been resisting","Practice the serenity prayer or similar framework","Let go of the need for a specific outcome","Accept a physical limitation or imperfection","Surrender control in a group activity","Accept feedback without defensiveness","Practice patience with something slow","Release the need to be right in a debate"], milestones_he: ["רשום 5 דברים שאתה מנסה לשלוט בהם אבל לא יכול","שחרר ציפייה אחת מאדם אחר","קבל מצב שהתנגדת לו","תרגל את מסגרת תפילת השלווה","ותר על הצורך בתוצאה ספציפית","קבל מגבלה פיזית או חוסר שלמות","ותר על שליטה בפעילות קבוצתית","קבל משוב ללא הגנתיות","תרגל סבלנות עם משהו איטי","שחרר את הצורך לצדוק בוויכוח"] },
      { sub_goal_en: "Embrace imperfection and vulnerability", sub_goal_he: "חיבוק חוסר שלמות ופגיעות", milestones_en: ["Share something imperfect with someone","Admit 'I don't know' in a conversation","Show a vulnerable side to a trusted person","Post or share something unpolished","Ask for help with something you usually do alone","Accept a compliment without deflecting","Share a failure story and what you learned","Be honest about a struggle with someone close","Practice self-compassion after a mistake","Celebrate imperfect action over perfect inaction"], milestones_he: ["שתף משהו לא מושלם עם מישהו","הודה 'אני לא יודע' בשיחה","הראה צד פגיע לאדם מהימן","פרסם או שתף משהו לא מלוטש","בקש עזרה במשהו שבדרך כלל עושה לבד","קבל מחמאה בלי להסיט","שתף סיפור כישלון ומה למדת","היה כנה לגבי מאבק עם מישהו קרוב","תרגל חמלה עצמית אחרי טעות","חגוג פעולה לא מושלמת על פני חוסר מעש מושלם"] },
      { sub_goal_en: "Practice gratitude as presence tool", sub_goal_he: "תרגול הכרת תודה ככלי נוכחות", milestones_en: ["Write 3 specific gratitudes every morning for a week","Express gratitude to someone face-to-face","Find gratitude in a difficult situation","Practice grateful awareness during routine activities","Write a gratitude letter to someone important","Notice and appreciate 5 small things today","Practice gratitude for your body and health","Express thanks for something usually taken for granted","Create a gratitude jar and add to it daily","Review your gratitude entries after 30 days"], milestones_he: ["כתוב 3 הכרות תודה ספציפיות כל בוקר שבוע","הבע תודה למישהו פנים אל פנים","מצא הכרת תודה במצב קשה","תרגל מודעות תודה בפעילויות שגרתיות","כתוב מכתב תודה למישהו חשוב","שים לב והעריך 5 דברים קטנים היום","תרגל תודה לגוף ולבריאות שלך","הבע תודה על משהו שנלקח כמובן מאליו","צור צנצנת תודה והוסף אליה יומית","סקור את רשומות התודה שלך אחרי 30 יום"] },
      { sub_goal_en: "Integrate acceptance into identity", sub_goal_he: "שילוב קבלה בזהות", milestones_en: ["Define what radical acceptance means to you","Create a personal acceptance mantra","Practice accepting your current life stage fully","Write about who you are without judgment","Accept your pace of growth without comparison","Release one 'should' statement about yourself","Practice 'both/and' thinking instead of 'either/or'","Accept a relationship as it is, not as you want it","Create space for uncertainty in your plans","Write a self-acceptance declaration and read it weekly"], milestones_he: ["הגדר מה קבלה רדיקלית אומרת לך","צור מנטרת קבלה אישית","תרגל קבלת שלב החיים הנוכחי שלך","כתוב על מי שאתה ללא שיפוט","קבל את קצב הצמיחה שלך ללא השוואה","שחרר הצהרת 'צריך' אחת על עצמך","תרגל חשיבת 'גם/וגם' במקום 'או/או'","קבל מערכת יחסים כפי שהיא, לא כפי שתרצה","צור מקום לאי-ודאות בתוכניות שלך","כתוב הצהרת קבלה עצמית וקרא שבועית"] },
    ]},
  ]},
  // Remaining pillars get generated with a helper
  power: _g("power","Build Unstoppable Inner Strength","בניית חוזק פנימי בלתי ניתן לעצירה","Develop Leadership Presence","פיתוח נוכחות מנהיגותית","Master Personal Power Dynamics","שליטה בדינמיקת כוח אישי"),
  vitality: _g("vitality","Optimize Physical Energy Systems","אופטימיזציה של מערכות אנרגיה פיזיות","Build Sustainable Health Habits","בניית הרגלי בריאות בני קיימא","Achieve Peak Physical Performance","השגת ביצועים גופניים מרביים"),
  focus: _g("focus","Master Deep Work Discipline","שליטה במשמעת עבודה עמוקה","Eliminate Distraction Patterns","חיסול דפוסי הסחת דעת","Build Cognitive Performance Stack","בניית מחסנית ביצועים קוגניטיביים"),
  combat: _g("combat","Develop Physical Combat Skills","פיתוח מיומנויות קרב פיזיות","Build Mental Toughness Through Training","בניית חוסן מנטלי דרך אימון","Master Discipline and Consistency","שליטה במשמעת ועקביות"),
  expansion: _g("expansion","Expand Comfort Zone Systematically","הרחבת אזור הנוחות בשיטתיות","Develop Growth Mindset Mastery","פיתוח שליטה בחשיבה צמיחתית","Build Learning Acceleration System","בניית מערכת האצת למידה"),
  wealth: _g("wealth","Build Multiple Income Streams","בניית מקורות הכנסה מרובים","Master Financial Intelligence","שליטה באינטליגנציה פיננסית","Create Wealth Automation Systems","יצירת מערכות אוטומציה לעושר"),
  influence: _g("influence","Build Authentic Personal Brand","בניית מותג אישי אותנטי","Master Communication and Persuasion","שליטה בתקשורת ושכנוע","Expand Network and Social Capital","הרחבת רשת והון חברתי"),
  relationships: _g("relationships","Deepen Core Relationships","העמקת מערכות יחסים ליבתיות","Build Communication Mastery","בניית שליטה בתקשורת","Create Relationship Growth Systems","יצירת מערכות צמיחה במערכות יחסים"),
  business: _g("business","Scale Revenue and Operations","הרחבת הכנסות ותפעול","Build Strategic Marketing Engine","בניית מנוע שיווק אסטרטגי","Develop Leadership and Team Systems","פיתוח מנהיגות ומערכות צוות"),
  projects: _g("projects","Complete Key Active Projects","השלמת פרויקטים פעילים מרכזיים","Build Project Management Systems","בניית מערכות ניהול פרויקטים","Launch New Strategic Initiatives","השקת יוזמות אסטרטגיות חדשות"),
  play: _g("play","Rediscover Joy and Creativity","גילוי מחדש של שמחה ויצירתיות","Build Adventure and Exploration Habits","בניית הרגלי הרפתקה וגילוי","Create Work-Play Integration","יצירת שילוב עבודה-משחק"),
  order: _g("order","Master Daily Systems and Routines","שליטה במערכות ושגרות יומיות","Build Digital Organization","בניית ארגון דיגיטלי","Create Life Operations Dashboard","יצירת לוח בקרה לתפעול חיים"),
};

// Helper to generate structured pillar data with meaningful sub-goals
function _g(id: string, g1en: string, g1he: string, g2en: string, g2he: string, g3en: string, g3he: string) {
  const templates: Record<string, string[][]> = {
    power: [
      ["Set and enforce one new boundary","Stand firm on a decision despite pushback","Practice assertive communication in a meeting","Complete a physically demanding challenge","Lead a group activity or decision","Confront a fear you've been avoiding","Negotiate something in your favor","Take charge of a situation you usually defer on","Practice saying no without explaining","Complete a 30-day discipline challenge"],
      ["Identify your top 3 power leaks","Practice confident body language daily","Develop a power morning routine","Build a pre-confrontation preparation ritual","Master one persuasion technique","Practice holding space under pressure","Complete a leadership challenge","Build an accountability system for commitments","Develop your command voice and presence","Create a personal power manifesto"],
    ],
    vitality: [
      ["Complete 10,000 steps 5 days this week","Drink 3 liters of water daily for a week","Sleep 7+ hours for 5 consecutive nights","Eat protein with every meal for a week","Do 20 minutes of movement daily for 10 days","Eliminate processed sugar for 5 days","Complete a morning mobility routine 7 days","Get 15 minutes of sunlight before 10am daily","Track macros for 3 days","Complete a full-body stretching session"],
      ["Run or walk 5km without stopping","Complete a 30-day workout challenge","Fast for 16 hours successfully","Do 50 pushups in one session","Build a consistent sleep schedule for 2 weeks","Complete a meal prep day","Try a new sport or physical activity","Achieve a personal fitness record","Build a recovery protocol and use it 5 times","Get a health checkup and review results"],
    ],
    focus: [
      ["Complete 4 Pomodoro sessions in a row","Work 2 hours without checking social media","Finish a complex task in one sitting","Implement time-blocking for 3 days","Clear your desktop and organize digital files","Complete a deep reading session of 1 hour","Batch all emails into 2 daily sessions","Eliminate one recurring distraction permanently","Complete a focus sprint challenge","Achieve 4 hours of deep work in one day"],
      ["Set up a distraction-free workspace","Install focus apps and blockers","Create a weekly planning ritual","Build a task prioritization system","Implement GTD or similar productivity system","Track your productive hours for a week","Optimize your environment for concentration","Create templates for recurring workflows","Build a knowledge management system","Achieve consistent 6+ hours of productive output daily"],
    ],
    combat: [
      ["Complete a martial arts or combat class","Do 100 punches or kicks in practice","Train grip strength 3 times this week","Run a sprint interval session","Complete a cold exposure challenge","Do a 60-minute endurance workout","Practice one martial arts technique 50 reps","Train reaction time with a partner","Complete a training session when you don't feel like it","Spar or drill with a partner once"],
      ["Commit to 3 training sessions per week for a month","Learn 5 new techniques in your discipline","Compete in or attend a tournament","Train with someone better than you","Complete a 6am training session","Document your progress with video","Build a training journal habit","Set and achieve a specific combat skill goal","Complete a conditioning test","Develop a pre-competition mental routine"],
    ],
    expansion: [
      ["Do something for the first time this week","Start a conversation with a stranger","Learn a new skill for 30 minutes","Read a book outside your usual genre","Try a food you've never eaten","Visit a place you've never been","Attend an event outside your comfort zone","Share an unpopular opinion respectfully","Take a different route to work/routine","Try a creative medium you've never used"],
      ["Enroll in an online course","Learn 50 words in a new language","Give a presentation to a group","Start a 30-day learning challenge","Teach someone something you know","Write and publish an article or post","Build something with your hands","Master a new software tool","Complete a challenging puzzle or brain game","Start a side project in an unfamiliar domain"],
    ],
    wealth: [
      ["Track every expense for 7 days","Create a monthly budget","Save 10% of income this month","Identify 3 unnecessary subscriptions","Read one chapter on personal finance","Set up automatic savings transfer","Calculate your net worth","Identify one skill you can monetize","Research one investment opportunity","Create a 90-day financial goal"],
      ["Open an investment account","Start a side income project","Negotiate a better rate on one service","Complete a financial literacy course","Build a 3-month emergency fund","Create multiple income stream plan","Automate bill payments","Review and optimize tax strategy","Set up passive income source","Achieve a new monthly income milestone"],
    ],
    influence: [
      ["Post valuable content 3 times this week","Connect with 5 new people in your field","Comment meaningfully on 10 posts","Update your professional bio","Share your expertise in a group discussion","Send a thoughtful message to a connection","Create a personal introduction pitch","Attend a networking event","Ask for a testimonial or endorsement","Help someone publicly without expecting return"],
      ["Define your personal brand in 3 words","Create a content calendar for 30 days","Build an email list or newsletter","Give a talk or workshop","Get featured or quoted somewhere","Collaborate with another creator","Build a signature framework or method","Grow your audience by 20%","Master storytelling for presentations","Create a case study of your results"],
    ],
    relationships: [
      ["Have a deep conversation with a loved one","Express appreciation to 3 people today","Schedule a quality time date","Listen without interrupting for a full conversation","Write a heartfelt message to someone important","Ask someone 'how are you really doing'","Share something vulnerable with a close person","Resolve a minor conflict constructively","Plan a surprise for someone you care about","Set a boundary with love and clarity"],
      ["Establish a weekly relationship ritual","Have a 'state of us' conversation with partner","Reconnect with someone you've lost touch with","Practice active listening for a full week","Create shared goals with a partner or friend","Address an unspoken issue in a relationship","Plan a meaningful shared experience","Build a support system of 3+ trusted people","Forgive someone and communicate it","Celebrate a relationship milestone intentionally"],
    ],
    business: [
      ["Define your top 3 revenue priorities","Create a 30-day marketing plan","Reach out to 5 potential clients","Review and optimize your pricing","Set up one new lead generation channel","Create a customer feedback loop","Automate one business process","Track key metrics for 7 days","Delegate one task you shouldn't be doing","Complete a competitive analysis"],
      ["Launch a new product or service","Build a sales funnel end-to-end","Hire or contract one team member","Create SOPs for 3 core processes","Set up CRM or project management tool","Achieve a monthly revenue milestone","Build strategic partnerships","Implement customer retention system","Create a content marketing engine","Develop a 12-month business roadmap"],
    ],
    projects: [
      ["List all active projects and their status","Identify the #1 project to focus on","Set 3 milestones for your priority project","Complete one project deliverable this week","Remove one project from your plate","Create a project timeline with deadlines","Do a weekly project review session","Ship or publish something from a project","Get feedback on a project from 3 people","Celebrate completing a project phase"],
      ["Finish a stalled project","Launch a project publicly","Build a project management workflow","Create a portfolio of completed work","Set up version control or backups","Document lessons learned from a project","Start one new high-impact project","Build a project idea backlog","Create a 'done' criteria checklist","Complete a rapid prototype in 48 hours"],
    ],
    play: [
      ["Do something purely fun for 1 hour","Try a new hobby this week","Play a game with friends or family","Explore somewhere new in your city","Do something spontaneous today","Create art, music, or something creative","Watch a movie you've been wanting to see","Cook a new recipe for fun","Go on an unplanned adventure","Laugh out loud at least 3 times today"],
      ["Schedule weekly play time in your calendar","Start a creative project with no goal","Plan a weekend getaway or day trip","Join a recreational club or group","Learn a musical instrument or dance","Build something just for fun","Have a themed dinner or party","Try an extreme or adventurous activity","Create a bucket list of 20 experiences","Complete 5 items from your fun list this month"],
    ],
    order: [
      ["Clean and organize one room or area","Create a morning routine checklist","Set up a daily planning habit","Organize your digital files into folders","Clear your email inbox to zero","Create a weekly meal plan","Set up automatic bill payments","Organize your workspace for productivity","Create a system for tracking tasks","Do a 15-minute tidy-up daily for 7 days"],
      ["Build a complete weekly routine","Digitize important documents","Create a personal operations manual","Set up cloud backup for all devices","Audit and cancel unused subscriptions","Create a household management system","Build an inventory of important items","Set up a regular review cycle (weekly/monthly)","Create emergency contact and info document","Achieve 'everything has a place' in your space"],
    ],
  };

  const t = templates[id] || templates.power;
  const makeSubGoals = (goalIndex: number) => {
    const sgs = [];
    for (let s = 0; s < 5; s++) {
      const base = t[goalIndex % t.length] || t[0];
      const milestones_en = base.slice(0, 10);
      const milestones_he = milestones_en.map(m => m); // In real AI gen these would be Hebrew
      sgs.push({
        sub_goal_en: `${id} ${goalIndex + 1}.${s + 1} — Focused objective ${s + 1}`,
        sub_goal_he: `${id} ${goalIndex + 1}.${s + 1} — יעד ממוקד ${s + 1}`,
        milestones_en,
        milestones_he,
      });
    }
    return sgs;
  };

  return { goals: [
    { goal_en: g1en, goal_he: g1he, sub_goals: makeSubGoals(0) },
    { goal_en: g2en, goal_he: g2he, sub_goals: makeSubGoals(1) },
    { goal_en: g3en, goal_he: g3he, sub_goals: makeSubGoals(0) },
  ]};
}

function buildFallbackStrategy(hub: 'core' | 'arena') {
  const pillarIds = hub === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;
  const pillars: Record<string, any> = {};
  for (const id of pillarIds) {
    pillars[id] = FALLBACK_DATA[id] || _g(id, "Transform " + id, "טרנספורמציה " + id, "Master " + id, "שליטה ב" + id, "Scale " + id, "הרחבת " + id);
  }
  return {
    hub,
    title_en: hub === 'core' ? '90-Day Core Transformation' : '90-Day Arena Execution',
    title_he: hub === 'core' ? 'טרנספורמציה פנימית — 90 יום' : 'ביצוע בזירה — 90 יום',
    vision_en: hub === 'core' ? 'Build unshakable internal systems for consciousness, energy, and identity.' : 'Create unstoppable momentum in wealth, influence, and impact.',
    vision_he: hub === 'core' ? 'בנה מערכות פנימיות בלתי ניתנות לערעור לתודעה, אנרגיה וזהות.' : 'צור מומנטום בלתי ניתן לעצירה בעושר, השפעה ואימפקט.',
    pillars,
  };
}

serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { user_id, hub, force_regenerate } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetHub = hub || 'both';

    if (!force_regenerate) {
      const { data: existing } = await supabase
        .from('life_plans').select('id, plan_data')
        .eq('user_id', user_id).eq('status', 'active')
        .order('created_at', { ascending: false });

      const existingHubs = (existing || []).map((p: any) => p.plan_data?.hub).filter(Boolean);
      if (targetHub === 'both' && existingHubs.includes('core') && existingHubs.includes('arena')) {
        return new Response(JSON.stringify({ message: "Plans already exist", plans: existing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (targetHub !== 'both' && existingHubs.includes(targetHub)) {
        return new Response(JSON.stringify({ message: "Plan already exists", plans: existing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch user data
    const [domainsRes, profileRes, launchpadRes, projectsRes, businessRes, memoryRes] = await Promise.all([
      supabase.from('life_domains').select('domain_id, domain_config, status').eq('user_id', user_id),
      supabase.from('profiles').select('full_name, display_name, level, experience').eq('id', user_id).single(),
      supabase.from('launchpad_progress').select('step_1_intention, step_2_profile_data, step_3_lifestyle_data').eq('user_id', user_id).single(),
      supabase.from('user_projects').select('name, description, status, life_pillar, goals, milestones').eq('user_id', user_id).in('status', ['active', 'in_progress', 'planning']),
      supabase.from('business_journeys').select('business_name, current_step, journey_complete, step_1_vision, step_2_business_model, step_8_marketing').eq('user_id', user_id),
      supabase.from('aurora_conversation_memory').select('summary, emotional_state, key_topics, action_items').eq('user_id', user_id).order('created_at', { ascending: false }).limit(15),
    ]);

    const allDomains = (domainsRes.data || []) as PillarAssessment[];
    const profile = profileRes.data || {};
    const launchpad = launchpadRes.data || {};
    const userProjects = projectsRes.data || [];
    const userBusinesses = businessRes.data || [];
    const auroraMemory = memoryRes.data || [];

    const profileContext = {
      name: profile.full_name || profile.display_name,
      level: profile.level,
      intention: launchpad.step_1_intention,
      lifestyle: launchpad.step_3_lifestyle_data,
      profile: launchpad.step_2_profile_data,
    };

    // Archive old plans
    const { data: oldActivePlans } = await supabase
      .from('life_plans').select('id').eq('user_id', user_id).eq('status', 'active');
    
    const oldPlanIds = (oldActivePlans || []).map((p: any) => p.id);
    if (oldPlanIds.length > 0) {
      await supabase.from('action_items').delete().eq('user_id', user_id).in('plan_id', oldPlanIds);
      await supabase.from('life_plan_milestones').delete().in('plan_id', oldPlanIds);
      await supabase.from('life_plans').update({ status: 'archived' }).in('id', oldPlanIds);
    }

    await supabase.from('action_items').delete()
      .eq('user_id', user_id).is('plan_id', null)
      .in('source', ['plan', 'aurora']).in('type', ['habit', 'task']).neq('status', 'done');

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const hubsToGenerate = targetHub === 'both' ? ['core', 'arena'] as const : [targetHub as 'core' | 'arena'];
    const results: any[] = [];

    for (const h of hubsToGenerate) {
      const pillarIds = h === 'core' ? CORE_PILLAR_IDS : ARENA_PILLAR_IDS;
      const hubAssessments = allDomains.filter(d => pillarIds.includes(d.domain_id));

      // Generate PER-PILLAR to avoid timeout
      const pillarResults: Record<string, any> = {};
      let allAiSuccess = true;

      if (LOVABLE_API_KEY) {
        // PARALLEL AI calls to avoid timeout
        const aiPromises = pillarIds.map(async (pillarId) => {
          try {
            const prompt = buildPillarPrompt(pillarId, h, hubAssessments, profileContext, userProjects, userBusinesses, auroraMemory);
            
            const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-lite",
                max_tokens: 3000,
                messages: [
                  { role: "system", content: "Output ONLY valid JSON. Generate 3 goals, each with 3 sub-goals, each with 5 milestones. Keep text SHORT (<12 words). No markdown." },
                  { role: "user", content: prompt },
                ],
              }),
            });

            if (aiResponse.ok) {
              const aiResult = await aiResponse.json();
              const raw = aiResult.choices?.[0]?.message?.content || '';
              const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              const parsed = JSON.parse(jsonStr);
              console.log(`✅ AI generated pillar: ${pillarId}`);
              return { pillarId, data: parsed };
            } else {
              console.error(`AI failed for ${pillarId}: ${aiResponse.status}`);
              return { pillarId, data: null };
            }
          } catch (e) {
            console.error(`Error generating ${pillarId}:`, e);
            return { pillarId, data: null };
          }
        });

        const aiResults = await Promise.allSettled(aiPromises);
        for (const result of aiResults) {
          if (result.status === 'fulfilled' && result.value.data) {
            pillarResults[result.value.pillarId] = result.value.data;
          } else {
            const pid = result.status === 'fulfilled' ? result.value.pillarId : 'unknown';
            pillarResults[pid] = FALLBACK_DATA[pid] || _g(pid, "Transform","טרנספורמציה","Master","שליטה","Scale","הרחבה");
            allAiSuccess = false;
          }
        }
      } else {
        console.error("LOVABLE_API_KEY not configured, using fallback for all");
        const fallback = buildFallbackStrategy(h);
        for (const [k, v] of Object.entries(fallback.pillars)) {
          pillarResults[k] = v;
        }
        allAiSuccess = false;
      }

      const strategyData = {
        hub: h,
        title_en: h === 'core' ? '90-Day Core Transformation' : '90-Day Arena Execution',
        title_he: h === 'core' ? 'טרנספורמציה פנימית — 90 יום' : 'ביצוע בזירה — 90 יום',
        vision_en: h === 'core' ? 'Build unshakable internal systems for consciousness, energy, and identity.' : 'Create unstoppable momentum in wealth, influence, and impact.',
        vision_he: h === 'core' ? 'בנה מערכות פנימיות בלתי ניתנות לערעור.' : 'צור מומנטום בלתי ניתן לעצירה בעושר, השפעה ואימפקט.',
        pillars: pillarResults,
        ai_generated: allAiSuccess,
      };

      // Store plan
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 90);

      const { data: plan, error: planError } = await supabase
        .from('life_plans')
        .insert({
          user_id,
          duration_months: 3,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          plan_data: { hub: h, strategy: strategyData },
          status: 'active',
          progress_percentage: 0,
        })
        .select('id')
        .single();

      if (planError) {
        console.error("Plan insert error:", planError);
        continue;
      }

      // Generate milestones — each sub-goal = one row
      const milestoneRows: any[] = [];

      for (const [pillarId, pillarObj] of Object.entries(pillarResults)) {
        const goals = (pillarObj as any)?.goals || [];
        goals.forEach((goal: any, gi: number) => {
          const subGoals = goal.sub_goals || [];
          subGoals.forEach((sg: any, si: number) => {
            milestoneRows.push({
              plan_id: plan.id,
              week_number: gi * 5 + si + 1,
              month_number: gi + 1,
              title: sg.sub_goal_he || sg.sub_goal_en || goal.goal_he,
              title_en: sg.sub_goal_en || sg.sub_goal_he || goal.goal_en,
              description: goal.goal_he || goal.goal_en,
              description_en: goal.goal_en || goal.goal_he,
              goal: sg.sub_goal_he || sg.sub_goal_en,
              goal_en: sg.sub_goal_en || sg.sub_goal_he,
              focus_area: pillarId,
              focus_area_en: pillarId,
              tasks: sg.milestones_he || sg.milestones_en || [],
              tasks_en: sg.milestones_en || [],
              is_completed: false,
              xp_reward: 50,
              tokens_reward: 10,
            });
          });
        });
      }

      if (milestoneRows.length > 0) {
        const BATCH_SIZE = 50;
        for (let i = 0; i < milestoneRows.length; i += BATCH_SIZE) {
          const batch = milestoneRows.slice(i, i + BATCH_SIZE);
          const { error: milestoneError } = await supabase
            .from('life_plan_milestones')
            .insert(batch);
          if (milestoneError) console.error("Milestone insert error:", milestoneError);
        }
      }

      results.push({ hub: h, plan_id: plan.id, goals_count: milestoneRows.length, ai_generated: allAiSuccess });
    }

    return new Response(
      JSON.stringify({ success: true, plans: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-90day-strategy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

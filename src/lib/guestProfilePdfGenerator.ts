import jsPDF from 'jspdf';
import { loadHebrewFont } from './fonts/hebrewFont';

interface GuestPDFData {
  summary: {
    life_direction?: {
      core_aspiration?: string;
      vision_summary?: string;
      clarity_score?: number;
    };
    consciousness_analysis?: {
      current_state?: string;
      dominant_patterns?: string[];
      strengths?: string[];
      growth_edges?: string[];
      blind_spots?: string[];
    };
    identity_profile?: {
      suggested_ego_state?: string;
      dominant_traits?: string[];
      values_hierarchy?: string[];
      identity_title?: {
        title?: string;
        title_en?: string;
        icon?: string;
      };
    };
    behavioral_insights?: {
      habits_to_transform?: string[];
      habits_to_cultivate?: string[];
      resistance_patterns?: string[];
    };
    transformation_potential?: {
      readiness_score?: number;
      primary_focus?: string;
      secondary_focus?: string;
    };
  };
  scores: {
    consciousness: number;
    clarity: number;
    readiness: number;
  };
  plan: {
    months: Array<{
      number: number;
      title: string;
      title_he?: string;
      focus: string;
      milestone: string;
      weeks: Array<{
        number: number;
        title: string;
        description: string;
        tasks: string[];
        goal: string;
        challenge: string;
        hypnosis_recommendation: string;
      }>;
    }>;
  };
  language: string;
}

const isHebrew = (lang: string) => lang === 'he';

const addText = (
  doc: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  options: { 
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
    fontSize?: number;
  } = {}
) => {
  if (options.fontSize) {
    doc.setFontSize(options.fontSize);
  }
  
  if (options.maxWidth) {
    const lines = doc.splitTextToSize(text, options.maxWidth);
    doc.text(lines, x, y, { align: options.align || 'left' });
    return lines.length;
  }
  
  doc.text(text, x, y, { align: options.align || 'left' });
  return 1;
};

const addSectionTitle = (doc: jsPDF, title: string, y: number, isRTL: boolean) => {
  doc.setFontSize(16);
  doc.setTextColor(147, 112, 219);
  addText(doc, title, isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  return y + 10;
};

const toArray = (items: unknown): string[] => {
  if (!items) return [];
  if (Array.isArray(items)) return items.filter(item => typeof item === 'string');
  if (typeof items === 'string') return [items];
  return [];
};

const addBulletList = (
  doc: jsPDF, 
  items: unknown, 
  startY: number, 
  isRTL: boolean,
  maxWidth: number = 170
): number => {
  let y = startY;
  const bullet = '•';
  
  const itemsArray = toArray(items);
  if (itemsArray.length === 0) return y;
  
  itemsArray.forEach((item) => {
    const bulletX = isRTL ? 190 : 20;
    const textX = isRTL ? 185 : 25;
    
    doc.text(bullet, bulletX, y);
    const lines = doc.splitTextToSize(item, maxWidth);
    doc.text(lines, textX, y, { align: isRTL ? 'right' : 'left' });
    y += lines.length * 6 + 2;
  });
  
  return y;
};

export const generateGuestProfilePDF = async (data: GuestPDFData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isRTL = isHebrew(data.language);
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Try to load Hebrew font
  if (isRTL) {
    try {
      const fontBase64 = await loadHebrewFont();
      if (fontBase64) {
        doc.addFileToVFS('NotoSansHebrew-Regular.ttf', fontBase64);
        doc.addFont('NotoSansHebrew-Regular.ttf', 'NotoSansHebrew', 'normal');
        doc.setFont('NotoSansHebrew');
      }
    } catch (e) {
      console.warn('Could not load Hebrew font');
    }
  }

  const setDarkBackground = () => {
    doc.setFillColor(15, 15, 20);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setTextColor(255, 255, 255);
  };

  // =====================
  // PAGE 1: Cover
  // =====================
  setDarkBackground();
  
  doc.setFillColor(147, 112, 219);
  doc.circle(pageWidth / 2, 60, 15, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  addText(doc, 'MH', pageWidth / 2, 63, { align: 'center' });
  
  doc.setFontSize(28);
  doc.setTextColor(147, 112, 219);
  const title = isRTL ? 'פרופיל הטרנספורמציה שלי' : 'My Transformation Profile';
  addText(doc, title, pageWidth / 2, 100, { align: 'center' });
  
  // Identity title if exists
  const identityTitle = data.summary.identity_profile?.identity_title;
  if (identityTitle) {
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    const displayTitle = `${identityTitle.icon || '🎯'} ${isRTL ? identityTitle.title : identityTitle.title_en}`;
    addText(doc, displayTitle, pageWidth / 2, 120, { align: 'center' });
  }
  
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  const dateStr = new Date().toLocaleDateString(isRTL ? 'he-IL' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  addText(doc, dateStr, pageWidth / 2, 135, { align: 'center' });
  
  doc.setFontSize(10);
  addText(doc, 'MindHacker.net', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // =====================
  // PAGE 2: Scores
  // =====================
  doc.addPage();
  setDarkBackground();
  
  let y = 30;
  doc.setFontSize(22);
  doc.setTextColor(147, 112, 219);
  addText(doc, isRTL ? 'ציוני התודעה שלך' : 'Your Consciousness Scores', pageWidth / 2, y, { align: 'center' });
  
  y = 60;
  const scores = [
    { 
      label: isRTL ? 'ציון תודעה' : 'Consciousness Score', 
      value: data.scores.consciousness,
      desc: isRTL ? 'סולם הוקינס' : 'Hawkins Scale'
    },
    { 
      label: isRTL ? 'בהירות' : 'Clarity', 
      value: data.scores.clarity,
      desc: isRTL ? 'מידת הבהירות לגבי הכיוון שלך' : 'Direction clarity'
    },
    { 
      label: isRTL ? 'מוכנות לשינוי' : 'Transformation Readiness', 
      value: data.scores.readiness,
      desc: isRTL ? 'מידת המוכנות לתהליך' : 'Process readiness'
    },
  ];
  
  scores.forEach((score, i) => {
    const boxY = y + i * 55;
    
    doc.setFillColor(30, 30, 40);
    doc.roundedRect(margin, boxY, contentWidth, 45, 5, 5, 'F');
    
    doc.setFillColor(147, 112, 219);
    doc.circle(isRTL ? pageWidth - margin - 30 : margin + 30, boxY + 22, 18, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    addText(doc, score.value.toString(), isRTL ? pageWidth - margin - 30 : margin + 30, boxY + 27, { align: 'center' });
    
    doc.setFontSize(14);
    addText(doc, score.label, isRTL ? margin + 20 : margin + 60, boxY + 18, { align: isRTL ? 'right' : 'left' });
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    addText(doc, score.desc, isRTL ? margin + 20 : margin + 60, boxY + 30, { align: isRTL ? 'right' : 'left' });
  });

  // =====================
  // PAGE 3: Life Direction
  // =====================
  if (data.summary.life_direction) {
    doc.addPage();
    setDarkBackground();
    
    y = 30;
    doc.setFontSize(22);
    doc.setTextColor(147, 112, 219);
    addText(doc, isRTL ? 'כיוון החיים שלך' : 'Your Life Direction', pageWidth / 2, y, { align: 'center' });
    
    y = 50;
    const ld = data.summary.life_direction;
    
    if (ld.core_aspiration) {
      y = addSectionTitle(doc, isRTL ? 'שאיפה מרכזית' : 'Central Aspiration', y, isRTL);
      doc.setFontSize(11);
      const lines = addText(doc, ld.core_aspiration, isRTL ? 190 : 20, y, { 
        align: isRTL ? 'right' : 'left',
        maxWidth: contentWidth 
      });
      y += lines * 6 + 10;
    }
    
    if (ld.vision_summary) {
      y = addSectionTitle(doc, isRTL ? 'סיכום החזון' : 'Vision Summary', y, isRTL);
      doc.setFontSize(11);
      const lines = addText(doc, ld.vision_summary, isRTL ? 190 : 20, y, { 
        align: isRTL ? 'right' : 'left',
        maxWidth: contentWidth 
      });
      y += lines * 6 + 10;
    }
  }

  // =====================
  // PAGE 4: Consciousness Analysis
  // =====================
  if (data.summary.consciousness_analysis) {
    doc.addPage();
    setDarkBackground();
    
    y = 30;
    doc.setFontSize(22);
    doc.setTextColor(147, 112, 219);
    addText(doc, isRTL ? 'ניתוח תודעה' : 'Consciousness Analysis', pageWidth / 2, y, { align: 'center' });
    
    const ca = data.summary.consciousness_analysis;
    y = 50;
    
    if (ca.current_state) {
      y = addSectionTitle(doc, isRTL ? 'מצב נוכחי' : 'Current State', y, isRTL);
      doc.setFontSize(11);
      const lines = addText(doc, ca.current_state, isRTL ? 190 : 20, y, { 
        align: isRTL ? 'right' : 'left',
        maxWidth: contentWidth 
      });
      y += lines * 6 + 10;
    }
    
    if (ca.strengths?.length) {
      y = addSectionTitle(doc, isRTL ? 'חוזקות' : 'Strengths', y, isRTL);
      y = addBulletList(doc, ca.strengths, y, isRTL);
      y += 5;
    }
    
    if (ca.growth_edges?.length) {
      y = addSectionTitle(doc, isRTL ? 'קצוות צמיחה' : 'Growth Edges', y, isRTL);
      y = addBulletList(doc, ca.growth_edges, y, isRTL);
    }
  }

  // =====================
  // PAGE 5: Identity Profile
  // =====================
  if (data.summary.identity_profile) {
    doc.addPage();
    setDarkBackground();
    
    y = 30;
    doc.setFontSize(22);
    doc.setTextColor(147, 112, 219);
    addText(doc, isRTL ? 'פרופיל זהות' : 'Identity Profile', pageWidth / 2, y, { align: 'center' });
    
    const ip = data.summary.identity_profile;
    y = 50;
    
    if (ip.dominant_traits?.length) {
      y = addSectionTitle(doc, isRTL ? 'תכונות דומיננטיות' : 'Dominant Traits', y, isRTL);
      y = addBulletList(doc, ip.dominant_traits, y, isRTL);
      y += 5;
    }
    
    const valuesArray = toArray(ip.values_hierarchy);
    if (valuesArray.length > 0) {
      y = addSectionTitle(doc, isRTL ? 'היררכיית ערכים' : 'Values Hierarchy', y, isRTL);
      valuesArray.forEach((value, i) => {
        const num = `${i + 1}. `;
        addText(doc, num + value, isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
        y += 7;
      });
    }
  }

  // =====================
  // PAGES 6+: 90-Day Plan
  // =====================
  if (data.plan?.months?.length > 0) {
    doc.addPage();
    setDarkBackground();
    
    y = 30;
    doc.setFontSize(22);
    doc.setTextColor(147, 112, 219);
    addText(doc, isRTL ? 'תוכנית 90 יום' : '90-Day Transformation Plan', pageWidth / 2, y, { align: 'center' });
    
    y = 50;
    
    for (const month of data.plan.months) {
      for (const week of month.weeks) {
        if (y > pageHeight - 80) {
          doc.addPage();
          setDarkBackground();
          y = 30;
        }
        
        doc.setFillColor(30, 30, 40);
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(147, 112, 219);
        const weekHeader = `${isRTL ? 'שבוע' : 'Week'} ${week.number}: ${week.title}`;
        addText(doc, weekHeader, isRTL ? 190 : margin + 3, y + 6, { align: isRTL ? 'right' : 'left' });
        
        y += 14;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        
        if (week.goal) {
          doc.setTextColor(200, 200, 200);
          addText(doc, `${isRTL ? 'יעד:' : 'Goal:'} ${week.goal}`, isRTL ? 190 : 25, y, { align: isRTL ? 'right' : 'left' });
          y += 7;
        }
        
        if (week.tasks?.length) {
          doc.setTextColor(255, 255, 255);
          y = addBulletList(doc, week.tasks.slice(0, 3), y, isRTL);
        }
        
        y += 8;
      }
    }
  }

  // =====================
  // FINAL PAGE: CTA
  // =====================
  doc.addPage();
  setDarkBackground();
  
  y = pageHeight / 2 - 40;
  doc.setFontSize(20);
  doc.setTextColor(147, 112, 219);
  addText(doc, isRTL ? '🎉 זה רק ההתחלה!' : '🎉 This is Just the Beginning!', pageWidth / 2, y, { align: 'center' });
  
  y += 20;
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  const ctaLines = isRTL 
    ? ['הצטרף ל-MindHacker כדי:', '', '✨ לשמור את התוצאות שלך לתמיד', '🤖 לקבל גישה ל-Aurora - מאמן AI אישי', '🎧 ליצור סשני היפנוזה מותאמים אישית', '📊 לעקוב אחרי ההתקדמות שלך']
    : ['Join MindHacker to:', '', '✨ Save your results forever', '🤖 Get access to Aurora - your AI coach', '🎧 Create personalized hypnosis sessions', '📊 Track your progress'];
  
  ctaLines.forEach(line => {
    addText(doc, line, pageWidth / 2, y, { align: 'center' });
    y += 10;
  });
  
  y += 10;
  doc.setTextColor(147, 112, 219);
  addText(doc, 'mindhacker.net/signup', pageWidth / 2, y, { align: 'center' });

  return doc;
};

export const downloadGuestPDF = async (data: GuestPDFData) => {
  const doc = await generateGuestProfilePDF(data);
  const fileName = data.language === 'he' ? 'פרופיל-טרנספורמציה.pdf' : 'transformation-profile.pdf';
  doc.save(fileName);
};

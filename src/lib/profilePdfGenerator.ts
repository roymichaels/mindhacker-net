import jsPDF from 'jspdf';
import { loadHebrewFont } from './fonts/hebrewFont';

interface ProfilePDFData {
  userName: string;
  summary: {
    life_direction?: {
      central_aspiration?: string;
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
      suggested_ego_state?: string[];
      dominant_traits?: string[];
      values_hierarchy?: string[];
    };
    behavioral_insights?: {
      habits_to_break?: string[];
      habits_to_develop?: string[];
      resistance_patterns?: string[];
    };
    career_path?: {
      current_status?: string;
      aspirations?: string[];
      next_steps?: string[];
    };
  };
  scores: {
    consciousness: number;
    clarity: number;
    readiness: number;
  };
  milestones: Array<{
    week_number: number;
    title?: string;
    goal?: string;
    tasks?: string[];
    weekly_challenge?: string;
    hypnosis_recommendation?: string;
  }>;
  planTitle?: string;
  language: string;
}

const isHebrew = (lang: string) => lang === 'he';

// Helper to add text with RTL support
const addText = (
  doc: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  options: { 
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
    isHebrew?: boolean;
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

// Add a section title
const addSectionTitle = (doc: jsPDF, title: string, y: number, isRTL: boolean) => {
  doc.setFontSize(16);
  doc.setTextColor(147, 112, 219); // Purple
  addText(doc, title, isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
  doc.setTextColor(255, 255, 255); // Reset to white
  doc.setFontSize(11);
  return y + 10;
};

// Helper to ensure we have an array
const toArray = (items: unknown): string[] => {
  if (!items) return [];
  if (Array.isArray(items)) return items.filter(item => typeof item === 'string');
  if (typeof items === 'string') return [items];
  return [];
};

// Add bullet list
const addBulletList = (
  doc: jsPDF, 
  items: unknown, 
  startY: number, 
  isRTL: boolean,
  maxWidth: number = 170
): number => {
  let y = startY;
  const bullet = isRTL ? '•' : '•';
  
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

export const generateProfilePDF = async (data: ProfilePDFData) => {
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
  let hebrewFontLoaded = false;
  if (isRTL) {
    try {
      const fontBase64 = await loadHebrewFont();
      if (fontBase64) {
        doc.addFileToVFS('NotoSansHebrew-Regular.ttf', fontBase64);
        doc.addFont('NotoSansHebrew-Regular.ttf', 'NotoSansHebrew', 'normal');
        doc.setFont('NotoSansHebrew');
        hebrewFontLoaded = true;
      }
    } catch (e) {
      console.warn('Could not load Hebrew font, using fallback');
    }
  }

  // Set background color for all pages
  const setDarkBackground = () => {
    doc.setFillColor(15, 15, 20); // Dark background
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setTextColor(255, 255, 255);
  };

  // =====================
  // PAGE 1: Cover
  // =====================
  setDarkBackground();
  
  // Logo placeholder
  doc.setFillColor(147, 112, 219);
  doc.circle(pageWidth / 2, 60, 15, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  addText(doc, 'MH', pageWidth / 2, 63, { align: 'center' });
  
  // Title
  doc.setFontSize(28);
  doc.setTextColor(147, 112, 219);
  const title = isRTL ? 'פרופיל הטרנספורמציה שלי' : 'My Transformation Profile';
  addText(doc, title, pageWidth / 2, 100, { align: 'center' });
  
  // User name
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  addText(doc, data.userName, pageWidth / 2, 120, { align: 'center' });
  
  // Date
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  const dateStr = new Date().toLocaleDateString(isRTL ? 'he-IL' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  addText(doc, dateStr, pageWidth / 2, 135, { align: 'center' });
  
  // Brand
  doc.setFontSize(10);
  addText(doc, 'MindOS.app', pageWidth / 2, pageHeight - 20, { align: 'center' });

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
      desc: isRTL ? 'מידת הבהירות לגבי הכיוון שלך' : 'How clear you are about your direction'
    },
    { 
      label: isRTL ? 'מוכנות לשינוי' : 'Transformation Readiness', 
      value: data.scores.readiness,
      desc: isRTL ? 'מידת המוכנות לתהליך טרנספורמציה' : 'How ready you are for transformation'
    },
  ];
  
  scores.forEach((score, i) => {
    const centerX = pageWidth / 2;
    const boxY = y + i * 55;
    
    // Score circle
    doc.setFillColor(30, 30, 40);
    doc.roundedRect(margin, boxY, contentWidth, 45, 5, 5, 'F');
    
    doc.setFillColor(147, 112, 219);
    doc.circle(isRTL ? pageWidth - margin - 30 : margin + 30, boxY + 22, 18, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    addText(doc, score.value.toString(), isRTL ? pageWidth - margin - 30 : margin + 30, boxY + 27, { align: 'center' });
    
    // Label and description
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
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
    
    if (ld.central_aspiration) {
      y = addSectionTitle(doc, isRTL ? 'שאיפה מרכזית' : 'Central Aspiration', y, isRTL);
      doc.setFontSize(11);
      const lines = addText(doc, ld.central_aspiration, isRTL ? 190 : 20, y, { 
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
    
    if (ca.dominant_patterns?.length) {
      y = addSectionTitle(doc, isRTL ? 'דפוסים דומיננטיים' : 'Dominant Patterns', y, isRTL);
      y = addBulletList(doc, ca.dominant_patterns, y, isRTL);
      y += 5;
    }
    
    if (y > pageHeight - 60 && (ca.growth_edges?.length || ca.blind_spots?.length)) {
      doc.addPage();
      setDarkBackground();
      y = 30;
    }
    
    if (ca.growth_edges?.length) {
      y = addSectionTitle(doc, isRTL ? 'קצוות צמיחה' : 'Growth Edges', y, isRTL);
      y = addBulletList(doc, ca.growth_edges, y, isRTL);
      y += 5;
    }
    
    if (ca.blind_spots?.length) {
      y = addSectionTitle(doc, isRTL ? 'נקודות עיוורות' : 'Blind Spots', y, isRTL);
      y = addBulletList(doc, ca.blind_spots, y, isRTL);
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
    
    if (ip.suggested_ego_state?.length) {
      y = addSectionTitle(doc, isRTL ? 'מצב אגו מומלץ' : 'Suggested Ego State', y, isRTL);
      y = addBulletList(doc, ip.suggested_ego_state, y, isRTL);
      y += 5;
    }
    
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
  // PAGE 6: Behavioral Insights & Career
  // =====================
  if (data.summary.behavioral_insights || data.summary.career_path) {
    doc.addPage();
    setDarkBackground();
    
    y = 30;
    doc.setFontSize(22);
    doc.setTextColor(147, 112, 219);
    addText(doc, isRTL ? 'תובנות התנהגותיות וקריירה' : 'Behavioral Insights & Career', pageWidth / 2, y, { align: 'center' });
    
    y = 50;
    
    const bi = data.summary.behavioral_insights;
    if (bi) {
      if (bi.habits_to_break?.length) {
        y = addSectionTitle(doc, isRTL ? 'הרגלים לשנות' : 'Habits to Break', y, isRTL);
        y = addBulletList(doc, bi.habits_to_break, y, isRTL);
        y += 5;
      }
      
      if (bi.habits_to_develop?.length) {
        y = addSectionTitle(doc, isRTL ? 'הרגלים לפתח' : 'Habits to Develop', y, isRTL);
        y = addBulletList(doc, bi.habits_to_develop, y, isRTL);
        y += 5;
      }
      
      if (bi.resistance_patterns?.length) {
        y = addSectionTitle(doc, isRTL ? 'דפוסי התנגדות' : 'Resistance Patterns', y, isRTL);
        y = addBulletList(doc, bi.resistance_patterns, y, isRTL);
        y += 5;
      }
    }
    
    const cp = data.summary.career_path;
    if (cp) {
      if (y > pageHeight - 80) {
        doc.addPage();
        setDarkBackground();
        y = 30;
      }
      
      y = addSectionTitle(doc, isRTL ? 'נתיב קריירה' : 'Career Path', y, isRTL);
      
      if (cp.current_status) {
        doc.setFontSize(11);
        addText(doc, `${isRTL ? 'סטטוס נוכחי: ' : 'Current Status: '}${cp.current_status}`, isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
        y += 10;
      }
      
      if (cp.aspirations?.length) {
        doc.setFontSize(12);
        doc.setTextColor(200, 200, 200);
        addText(doc, isRTL ? 'שאיפות:' : 'Aspirations:', isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
        y += 7;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        y = addBulletList(doc, cp.aspirations, y, isRTL);
        y += 5;
      }
      
      if (cp.next_steps?.length) {
        doc.setFontSize(12);
        doc.setTextColor(200, 200, 200);
        addText(doc, isRTL ? 'צעדים הבאים:' : 'Next Steps:', isRTL ? 190 : 20, y, { align: isRTL ? 'right' : 'left' });
        y += 7;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        y = addBulletList(doc, cp.next_steps, y, isRTL);
      }
    }
  }

  // =====================
  // PAGES 7+: 90-Day Plan
  // =====================
  if (data.milestones.length > 0) {
    doc.addPage();
    setDarkBackground();
    
    y = 30;
    doc.setFontSize(22);
    doc.setTextColor(147, 112, 219);
    addText(doc, isRTL ? 'תוכנית 90 יום' : '90-Day Transformation Plan', pageWidth / 2, y, { align: 'center' });
    
    if (data.planTitle) {
      doc.setFontSize(14);
      doc.setTextColor(200, 200, 200);
      addText(doc, data.planTitle, pageWidth / 2, y + 12, { align: 'center' });
    }
    
    y = 55;
    
    // Sort milestones by week number
    const sortedMilestones = [...data.milestones].sort((a, b) => a.week_number - b.week_number);
    
    sortedMilestones.forEach((milestone, index) => {
      // Check if we need a new page
      if (y > pageHeight - 80) {
        doc.addPage();
        setDarkBackground();
        y = 30;
      }
      
      // Week header
      doc.setFillColor(30, 30, 40);
      doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(147, 112, 219);
      const weekHeader = `${isRTL ? 'שבוע' : 'Week'} ${milestone.week_number}${milestone.title ? `: ${milestone.title}` : ''}`;
      addText(doc, weekHeader, isRTL ? 190 : margin + 3, y + 6, { align: isRTL ? 'right' : 'left' });
      
      y += 14;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      
      if (milestone.goal) {
        doc.setTextColor(200, 200, 200);
        addText(doc, `${isRTL ? 'יעד: ' : 'Goal: '}${milestone.goal}`, isRTL ? 190 : margin, y, { 
          align: isRTL ? 'right' : 'left',
          maxWidth: contentWidth 
        });
        y += 8;
      }
      
      const tasksArray = toArray(milestone.tasks);
      if (tasksArray.length > 0) {
        doc.setTextColor(255, 255, 255);
        tasksArray.slice(0, 3).forEach((task) => {
          const taskText = `• ${task}`;
          const lines = doc.splitTextToSize(taskText, contentWidth - 5);
          doc.text(lines, isRTL ? 190 : margin, y, { align: isRTL ? 'right' : 'left' });
          y += lines.length * 5;
        });
        y += 3;
      }
      
      if (milestone.weekly_challenge) {
        doc.setTextColor(255, 200, 100);
        doc.setFontSize(9);
        addText(doc, `✦ ${milestone.weekly_challenge}`, isRTL ? 190 : margin, y, { 
          align: isRTL ? 'right' : 'left',
          maxWidth: contentWidth 
        });
        y += 6;
      }
      
      if (milestone.hypnosis_recommendation) {
        doc.setTextColor(180, 150, 255);
        doc.setFontSize(9);
        addText(doc, `🎧 ${milestone.hypnosis_recommendation}`, isRTL ? 190 : margin, y, { 
          align: isRTL ? 'right' : 'left',
          maxWidth: contentWidth 
        });
        y += 6;
      }
      
      y += 8; // Space between weeks
    });
  }

  // Save PDF
  const fileName = isRTL 
    ? `פרופיל_טרנספורמציה_${data.userName.replace(/\s+/g, '_')}.pdf`
    : `transformation_profile_${data.userName.replace(/\s+/g, '_')}.pdf`;
  
  doc.save(fileName);
};

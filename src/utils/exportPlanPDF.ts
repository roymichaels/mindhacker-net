/**
 * exportPlanPDF — exports the 100-day strategy plan as a PDF
 */
import jsPDF from 'jspdf';

interface PlanExportData {
  title: string;
  dayProgress: string;
  milestones: Array<{
    title: string;
    isCompleted: boolean;
    difficulty: number;
    pillar: string;
  }>;
  traits: Array<{
    name: string;
    pillar: string;
    level: number;
    missionCount: number;
  }>;
}

export async function exportPlanPDF(data: PlanExportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 25;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Progress
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(data.dayProgress, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Traits section
  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Character Traits', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  for (const trait of data.traits) {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(`• ${trait.name} (${trait.pillar}) — Level ${trait.level}, ${trait.missionCount} missions`, margin + 4, y);
    y += 6;
  }
  y += 8;

  // Milestones section
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Milestones', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  for (const ms of data.milestones) {
    if (y > 270) { doc.addPage(); y = 20; }
    const status = ms.isCompleted ? '✓' : '○';
    const stars = '★'.repeat(ms.difficulty) + '☆'.repeat(5 - ms.difficulty);
    doc.text(`${status} ${ms.title} [${ms.pillar}] ${stars}`, margin + 4, y);
    y += 6;
  }

  // Save
  doc.save('100-day-plan.pdf');
}

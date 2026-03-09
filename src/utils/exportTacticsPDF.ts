/**
 * exportTacticsPDF — renders the 10-day tactical phase plan as a polished,
 * RTL-aware PDF using the same html2canvas approach as exportPlanPDF.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface TacticsPDFAction {
  title: string;
  titleEn: string;
  focusArea: string;
  estimatedMinutes: number;
  isCompleted: boolean;
}

export interface TacticsPDFBlock {
  category: string;
  emoji: string;
  label: string;
  labelEn: string;
  estimatedMinutes: number;
  completedCount: number;
  actions: TacticsPDFAction[];
}

export interface TacticsPDFDay {
  dayNumber: number;
  label: string;
  labelEn: string;
  isToday: boolean;
  totalActions: number;
  completedActions: number;
  totalMinutes: number;
  blocks: TacticsPDFBlock[];
}

export interface TacticsExportData {
  title: string;
  phaseLabel: string;
  progress: string;
  isRTL: boolean;
  brandName?: string;
  days: TacticsPDFDay[];
}

const BLOCK_COLORS: Record<string, string> = {
  health: '#10b981', training: '#ef4444', focus: '#f59e0b',
  action: '#3b82f6', creation: '#8b5cf6', review: '#14b8a6', social: '#ec4899',
};

function c(cat: string): string {
  return BLOCK_COLORS[cat] || '#6b7280';
}

function check(done: boolean): string {
  return `<div style="width:12px;height:12px;border-radius:50%;border:2px solid ${done ? '#10b981' : '#d1d5db'};background:${done ? '#10b981' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${done ? '<span style="color:white;font-size:7px;font-weight:bold;">✓</span>' : ''}</div>`;
}

function buildHTML(data: TacticsExportData): string {
  const dir = data.isRTL ? 'rtl' : 'ltr';
  const he = data.isRTL;

  let daysHTML = '';

  for (const day of data.days) {
    if (day.totalActions === 0) continue;

    const dayPct = Math.round((day.completedActions / day.totalActions) * 100);
    const todayBadge = day.isToday ? `<span style="font-size:9px;padding:2px 8px;border-radius:99px;background:#06b6d418;color:#06b6d4;font-weight:600;margin-${he ? 'right' : 'left'}:6px;">${he ? 'היום' : 'Today'}</span>` : '';

    daysHTML += `
      <div style="margin-bottom:22px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:30px;height:30px;border-radius:10px;background:${day.isToday ? '#ef444418' : '#f1f5f9'};border:1px solid ${day.isToday ? '#ef444430' : '#e2e8f0'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="font-size:13px;font-weight:800;color:${day.isToday ? '#ef4444' : '#6b7280'};">${day.dayNumber}</span>
          </div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:800;color:#1a1a2e;">
              ${he ? day.label : day.labelEn}${todayBadge}
            </div>
            <div style="font-size:10px;color:#9ca3af;">${day.completedActions}/${day.totalActions} ${he ? 'משימות' : 'actions'} · ${day.totalMinutes}${he ? ' דק׳' : ' min'} · ${dayPct}%</div>
          </div>
        </div>
        <div style="height:3px;border-radius:2px;background:#f3f4f6;margin-bottom:10px;overflow:hidden;">
          <div style="height:100%;width:${dayPct}%;background:${day.isToday ? '#ef4444' : '#06b6d4'};border-radius:2px;"></div>
        </div>`;

    for (const block of day.blocks) {
      const color = c(block.category);
      const blockPct = block.actions.length > 0 ? Math.round((block.completedCount / block.actions.length) * 100) : 0;

      daysHTML += `
        <div style="margin-${he ? 'right' : 'left'}:12px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:6px;height:22px;border-radius:3px;background:${color};flex-shrink:0;"></div>
            <span style="font-size:14px;">${block.emoji}</span>
            <span style="font-size:12px;font-weight:700;color:${color};">${he ? block.label : block.labelEn}</span>
            <span style="font-size:9px;color:#9ca3af;margin-${he ? 'right' : 'left'}:auto;">${block.estimatedMinutes}${he ? ' דק׳' : 'm'} · ${blockPct}%</span>
          </div>`;

      for (const action of block.actions) {
        daysHTML += `
          <div style="display:flex;align-items:center;gap:8px;padding:5px 10px;margin-${he ? 'right' : 'left'}:20px;margin-bottom:3px;background:${action.isCompleted ? '#f0fdf4' : '#fafafa'};border-radius:8px;border:1px solid ${action.isCompleted ? '#bbf7d0' : '#f0f0f0'};">
            ${check(action.isCompleted)}
            <div style="flex:1;min-width:0;">
              <div style="font-size:11px;font-weight:600;color:${action.isCompleted ? '#9ca3af' : '#1f2937'};${action.isCompleted ? 'text-decoration:line-through;' : ''}">${he ? action.title : action.titleEn}</div>
              <div style="font-size:9px;color:#9ca3af;margin-top:1px;">${action.focusArea}</div>
            </div>
            <span style="font-size:9px;color:#6b7280;flex-shrink:0;">${action.estimatedMinutes}${he ? ' דק׳' : 'm'}</span>
          </div>`;
      }

      daysHTML += '</div>'; // block
    }

    daysHTML += '</div>'; // day
  }

  return `
    <div id="pdf-root" style="width:800px;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;direction:${dir};text-align:${he ? 'right' : 'left'};background:white;color:#1a1a2e;padding:40px;">
      
      <!-- Header -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:28px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;">${data.title}</div>
        <div style="font-size:14px;color:#ef4444;margin-top:4px;font-weight:700;">${data.phaseLabel}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">${data.progress}</div>
        ${data.brandName ? `<div style="font-size:10px;color:#9ca3af;margin-top:4px;">${data.brandName}</div>` : ''}
        <div style="height:3px;background:linear-gradient(90deg,#ef4444,#f59e0b,#06b6d4);border-radius:2px;margin-top:14px;"></div>
      </div>

      ${daysHTML}

      <!-- Footer -->
      <div style="text-align:center;margin-top:28px;padding-top:14px;border-top:1px solid #e5e7eb;">
        <div style="font-size:9px;color:#9ca3af;">Generated ${new Date().toLocaleDateString()}</div>
      </div>
    </div>`;
}

export async function exportTacticsPDF(data: TacticsExportData) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = buildHTML(data);
  document.body.appendChild(container);

  const root = container.querySelector('#pdf-root') as HTMLElement;

  try {
    const canvas = await html2canvas(root, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save(data.isRTL ? 'תוכנית-טקטית-10-ימים.pdf' : 'tactical-10-day-plan.pdf');
  } finally {
    document.body.removeChild(container);
  }
}

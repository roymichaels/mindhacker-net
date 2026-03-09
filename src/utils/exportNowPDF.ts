/**
 * exportNowPDF — renders today's daily schedule (Now tab) as a polished,
 * RTL-aware PDF using the same html2canvas approach as exportPlanPDF.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface NowPDFAction {
  title: string;
  titleEn: string;
  pillarLabel: string;
  durationMin: number;
  isTimeBased: boolean;
}

export interface NowPDFSlot {
  timeBlock: string;
  label: string;
  labelEn: string;
  emoji: string;
  actions: NowPDFAction[];
}

export interface NowExportData {
  title: string;
  subtitle: string;
  dayLabel: string;
  isRTL: boolean;
  brandName?: string;
  quarters: {
    key: string;
    label: string;
    emoji: string;
    slots: NowPDFSlot[];
    totalActions: number;
    totalMinutes: number;
  }[];
}

const BLOCK_COLORS: Record<string, string> = {
  morning: '#f59e0b', training: '#ef4444', deepwork: '#8b5cf6',
  midday: '#0ea5e9', admin: '#10b981', recovery: '#6366f1',
  social: '#ec4899', evening: '#64748b', play: '#84cc16',
};

function c(block: string): string {
  return BLOCK_COLORS[block] || '#6b7280';
}

function check(done: boolean): string {
  return `<div style="width:12px;height:12px;border-radius:50%;border:2px solid #d1d5db;flex-shrink:0;"></div>`;
}

function buildHTML(data: NowExportData): string {
  const dir = data.isRTL ? 'rtl' : 'ltr';
  const he = data.isRTL;

  let quartersHTML = '';

  for (const quarter of data.quarters) {
    if (quarter.slots.length === 0) continue;

    quartersHTML += `
      <div style="margin-bottom:20px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:8px 12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
          <span style="font-size:18px;">${quarter.emoji}</span>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:800;color:#1a1a2e;">${quarter.label}</div>
            <div style="font-size:10px;color:#9ca3af;">${quarter.totalActions} ${he ? 'משימות' : 'tasks'} · ${quarter.totalMinutes}${he ? ' דק׳' : ' min'}</div>
          </div>
        </div>`;

    for (const slot of quarter.slots) {
      const color = c(slot.timeBlock);
      quartersHTML += `
        <div style="margin-${he ? 'right' : 'left'}:12px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:6px;height:22px;border-radius:3px;background:${color};flex-shrink:0;"></div>
            <span style="font-size:14px;">${slot.emoji}</span>
            <span style="font-size:12px;font-weight:700;color:${color};">${he ? slot.label : slot.labelEn}</span>
            <span style="font-size:9px;color:#9ca3af;margin-${he ? 'right' : 'left'}:auto;">${slot.actions.length} ${he ? 'פעולות' : 'actions'}</span>
          </div>`;

      for (const action of slot.actions) {
        quartersHTML += `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;margin-${he ? 'right' : 'left'}:20px;margin-bottom:4px;background:#fafafa;border-radius:8px;border:1px solid #f0f0f0;">
            ${check(false)}
            <div style="flex:1;min-width:0;">
              <div style="font-size:11px;font-weight:600;color:#1f2937;">${he ? action.title : action.titleEn}</div>
              <div style="font-size:9px;color:#9ca3af;margin-top:1px;">${action.pillarLabel}</div>
            </div>
            ${action.isTimeBased ? `<span style="font-size:9px;color:#6b7280;flex-shrink:0;">${action.durationMin}${he ? ' דק׳' : 'm'}</span>` : ''}
          </div>`;
      }

      quartersHTML += '</div>'; // slot
    }

    quartersHTML += '</div>'; // quarter
  }

  return `
    <div id="pdf-root" style="width:800px;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;direction:${dir};text-align:${he ? 'right' : 'left'};background:white;color:#1a1a2e;padding:40px;">
      
      <!-- Header -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:28px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;">${data.title}</div>
        <div style="font-size:14px;color:#4b5563;margin-top:4px;font-weight:600;">${data.dayLabel}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">${data.subtitle}</div>
        ${data.brandName ? `<div style="font-size:10px;color:#9ca3af;margin-top:4px;">${data.brandName}</div>` : ''}
        <div style="height:3px;background:linear-gradient(90deg,#06b6d4,#8b5cf6,#f59e0b);border-radius:2px;margin-top:14px;"></div>
      </div>

      ${quartersHTML}

      <!-- Footer -->
      <div style="text-align:center;margin-top:28px;padding-top:14px;border-top:1px solid #e5e7eb;">
        <div style="font-size:9px;color:#9ca3af;">Generated ${new Date().toLocaleDateString()}</div>
      </div>
    </div>`;
}

export async function exportNowPDF(data: NowExportData) {
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

    doc.save(data.isRTL ? 'תוכנית-יומית.pdf' : 'daily-plan.pdf');
  } finally {
    document.body.removeChild(container);
  }
}

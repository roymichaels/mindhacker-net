/**
 * exportPlanPDF — renders a styled HTML template to canvas → PDF
 * Supports Hebrew, RTL, and produces a polished visual output.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PlanExportData {
  title: string;
  dayProgress: string;
  isRTL: boolean;
  brandName?: string;
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

const PILLAR_COLORS: Record<string, string> = {
  presence: '#06b6d4', power: '#8b5cf6', vitality: '#10b981', focus: '#f59e0b',
  combat: '#ef4444', expansion: '#3b82f6', consciousness: '#a855f7', wealth: '#eab308',
  influence: '#f97316', relationships: '#ec4899', business: '#14b8a6', projects: '#6366f1',
  play: '#22c55e', craft: '#d946ef',
};

function getPillarColor(pillar: string): string {
  return PILLAR_COLORS[pillar] || '#6b7280';
}

function buildHTML(data: PlanExportData): string {
  const dir = data.isRTL ? 'rtl' : 'ltr';
  const align = data.isRTL ? 'right' : 'left';
  const traitLabel = data.isRTL ? 'תכונות אופי' : 'Character Traits';
  const milestoneLabel = data.isRTL ? 'אבני דרך' : 'Milestones';
  const levelLabel = data.isRTL ? 'רמה' : 'Lvl';
  const missionsLabel = data.isRTL ? 'משימות' : 'missions';

  const traitRows = data.traits.map(t => {
    const color = getPillarColor(t.pillar);
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;background:${color}11;border:1px solid ${color}33;margin-bottom:6px;">
        <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:13px;color:#1a1a2e;">${t.name}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:2px;">${t.pillar} · ${levelLabel} ${t.level} · ${t.missionCount} ${missionsLabel}</div>
        </div>
      </div>`;
  }).join('');

  // Group milestones by pillar
  const pillarMap = new Map<string, typeof data.milestones>();
  for (const ms of data.milestones) {
    if (!pillarMap.has(ms.pillar)) pillarMap.set(ms.pillar, []);
    pillarMap.get(ms.pillar)!.push(ms);
  }

  let milestoneHTML = '';
  for (const [pillar, items] of pillarMap) {
    const color = getPillarColor(pillar);
    const completed = items.filter(m => m.isCompleted).length;
    milestoneHTML += `
      <div style="margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <div style="width:6px;height:20px;border-radius:3px;background:${color};"></div>
          <span style="font-weight:700;font-size:13px;color:${color};text-transform:capitalize;">${pillar}</span>
          <span style="font-size:10px;color:#9ca3af;">${completed}/${items.length}</span>
        </div>`;
    for (const ms of items) {
      const dots = Array.from({ length: 5 }, (_, i) =>
        `<span style="color:${i < ms.difficulty ? '#f59e0b' : '#e5e7eb'};font-size:10px;">●</span>`
      ).join('');
      milestoneHTML += `
        <div style="display:flex;align-items:center;gap:8px;padding:5px 12px 5px ${data.isRTL ? '12px' : '24px'};${data.isRTL ? 'padding-right:24px;' : ''}">
          <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${ms.isCompleted ? '#10b981' : '#d1d5db'};background:${ms.isCompleted ? '#10b981' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${ms.isCompleted ? '<span style="color:white;font-size:9px;font-weight:bold;">✓</span>' : ''}
          </div>
          <span style="flex:1;font-size:11px;color:${ms.isCompleted ? '#9ca3af' : '#374151'};${ms.isCompleted ? 'text-decoration:line-through;' : ''}">${ms.title}</span>
          <span style="flex-shrink:0;">${dots}</span>
        </div>`;
    }
    milestoneHTML += '</div>';
  }

  return `
    <div id="pdf-root" style="width:800px;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;direction:${dir};text-align:${align};background:white;color:#1a1a2e;padding:40px;">
      
      <!-- Header -->
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:28px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;">${data.title}</div>
        <div style="font-size:13px;color:#6b7280;margin-top:6px;">${data.dayProgress}</div>
        ${data.brandName ? `<div style="font-size:10px;color:#9ca3af;margin-top:4px;">${data.brandName}</div>` : ''}
        <div style="height:3px;background:linear-gradient(90deg,#06b6d4,#8b5cf6,#f59e0b);border-radius:2px;margin-top:16px;"></div>
      </div>

      <!-- Traits -->
      <div style="margin-bottom:28px;">
        <div style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1a1a2e;">${traitLabel}</div>
        ${traitRows}
      </div>

      <!-- Milestones -->
      <div>
        <div style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1a1a2e;">${milestoneLabel}</div>
        ${milestoneHTML}
      </div>

      <!-- Footer -->
      <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
        <div style="font-size:9px;color:#9ca3af;">Generated ${new Date().toLocaleDateString()}</div>
      </div>
    </div>`;
}

export async function exportPlanPDF(data: PlanExportData) {
  // Create a temporary container
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
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Additional pages if content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save('100-day-plan.pdf');
  } finally {
    document.body.removeChild(container);
  }
}

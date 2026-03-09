/**
 * exportPlanPDF — renders a structured Pillar → Trait → Mission → Milestone
 * hierarchy as a polished, RTL-aware PDF using html2canvas.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ── Types matching the LifeHub view model ──
export interface PDFMilestone {
  title: string;
  isCompleted: boolean;
  difficulty: number;
}

export interface PDFMission {
  title: string;
  isCompleted: boolean;
  milestones: PDFMilestone[];
}

export interface PDFTrait {
  name: string;
  level: number;
  missionCount: number;
  missions: PDFMission[];
}

export interface PDFPillarGroup {
  pillarId: string;
  pillarLabel: string;
  isSelected: boolean;
  traits: PDFTrait[];
  milestoneCount: number;
  completedMilestones: number;
}

export interface PlanExportData {
  title: string;
  dayProgress: string;
  isRTL: boolean;
  brandName?: string;
  pillars: PDFPillarGroup[];
}

// ── Pillar colors ──
const PILLAR_COLORS: Record<string, string> = {
  presence: '#06b6d4', power: '#8b5cf6', vitality: '#10b981', focus: '#f59e0b',
  combat: '#ef4444', expansion: '#3b82f6', consciousness: '#a855f7', wealth: '#eab308',
  influence: '#f97316', relationships: '#ec4899', business: '#14b8a6', projects: '#6366f1',
  play: '#22c55e', craft: '#d946ef', order: '#6b7280', romantics: '#f43f5e',
};

function c(pillar: string): string {
  return PILLAR_COLORS[pillar] || '#6b7280';
}

function dots(difficulty: number): string {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < difficulty ? '#f59e0b' : '#e5e7eb'};font-size:9px;">●</span>`
  ).join('');
}

function check(done: boolean, color: string): string {
  return `<div style="width:14px;height:14px;border-radius:50%;border:2px solid ${done ? '#10b981' : '#d1d5db'};background:${done ? '#10b981' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${done ? '<span style="color:white;font-size:8px;font-weight:bold;">✓</span>' : ''}</div>`;
}

function buildHTML(data: PlanExportData): string {
  const dir = data.isRTL ? 'rtl' : 'ltr';
  const he = data.isRTL;

  let pillarsHTML = '';

  for (const pillar of data.pillars) {
    const color = c(pillar.pillarId);
    const pct = pillar.milestoneCount > 0
      ? Math.round((pillar.completedMilestones / pillar.milestoneCount) * 100)
      : 0;

    // Pillar header
    pillarsHTML += `
      <div style="margin-bottom:20px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:6px;height:28px;border-radius:3px;background:${color};flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="font-size:16px;font-weight:800;color:${color};">${pillar.pillarLabel}</div>
            <div style="font-size:10px;color:#9ca3af;">${pillar.completedMilestones}/${pillar.milestoneCount} ${he ? 'אבני דרך' : 'milestones'} · ${pct}%</div>
          </div>
          ${pillar.isSelected ? `<span style="font-size:9px;padding:2px 8px;border-radius:99px;background:${color}18;color:${color};font-weight:600;">${he ? 'נבחר' : 'Selected'}</span>` : ''}
        </div>`;

    // Progress bar
    pillarsHTML += `
        <div style="height:3px;border-radius:2px;background:#f3f4f6;margin-bottom:10px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:2px;"></div>
        </div>`;

    // Traits
    for (const trait of pillar.traits) {
      pillarsHTML += `
        <div style="margin-${he ? 'right' : 'left'}:16px;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
            <span style="font-size:13px;font-weight:700;color:#1f2937;">${trait.name}</span>
            <span style="font-size:9px;color:#9ca3af;margin-${he ? 'right' : 'left'}:auto;">${he ? 'רמה' : 'Lvl'} ${trait.level}</span>
          </div>`;

      // Missions
      for (const mission of trait.missions) {
        const msDone = mission.milestones.filter(m => m.isCompleted).length;
        const msTotal = mission.milestones.length;

        pillarsHTML += `
          <div style="margin-${he ? 'right' : 'left'}:20px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <span style="font-size:11px;color:${mission.isCompleted ? '#10b981' : '#4b5563'};font-weight:600;">${mission.isCompleted ? '✓' : '▸'} ${mission.title}</span>
              <span style="font-size:9px;color:#9ca3af;">${msDone}/${msTotal}</span>
            </div>`;

        // Milestones
        for (const ms of mission.milestones) {
          pillarsHTML += `
            <div style="display:flex;align-items:center;gap:6px;padding:3px 0;margin-${he ? 'right' : 'left'}:16px;">
              ${check(ms.isCompleted, color)}
              <span style="flex:1;font-size:10px;color:${ms.isCompleted ? '#9ca3af' : '#374151'};${ms.isCompleted ? 'text-decoration:line-through;' : ''}">${ms.title}</span>
              <span style="flex-shrink:0;">${dots(ms.difficulty)}</span>
            </div>`;
        }

        pillarsHTML += '</div>'; // mission
      }

      pillarsHTML += '</div>'; // trait
    }

    pillarsHTML += '</div>'; // pillar
  }

  return `
    <div id="pdf-root" style="width:800px;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;direction:${dir};text-align:${he ? 'right' : 'left'};background:white;color:#1a1a2e;padding:40px;">
      
      <!-- Header -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:28px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;">${data.title}</div>
        <div style="font-size:13px;color:#6b7280;margin-top:6px;">${data.dayProgress}</div>
        ${data.brandName ? `<div style="font-size:10px;color:#9ca3af;margin-top:4px;">${data.brandName}</div>` : ''}
        <div style="height:3px;background:linear-gradient(90deg,#06b6d4,#8b5cf6,#f59e0b);border-radius:2px;margin-top:14px;"></div>
      </div>

      ${pillarsHTML}

      <!-- Footer -->
      <div style="text-align:center;margin-top:28px;padding-top:14px;border-top:1px solid #e5e7eb;">
        <div style="font-size:9px;color:#9ca3af;">Generated ${new Date().toLocaleDateString()}</div>
      </div>
    </div>`;
}

export async function exportPlanPDF(data: PlanExportData) {
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

    doc.save('100-day-plan.pdf');
  } finally {
    document.body.removeChild(container);
  }
}

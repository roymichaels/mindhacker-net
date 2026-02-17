/**
 * Command Bus - Pure TS command registry, tag parser, and risk classifier.
 * No React dependencies. This is the canonical definition of all app commands.
 */

// ─── Command Types ───────────────────────────────────────────────────────────

export type AppCommand =
  | { type: 'openTab'; tabId: 'today' | 'plan' | 'aurora' | 'me' }
  | { type: 'openModal'; modalId: 'hypnosis' | 'settings' | 'profile' | 'upgrade'; payload?: Record<string, unknown> }
  | { type: 'createActionItem'; title: string; checklistTitle?: string }
  | { type: 'completeActionItem'; identifier: string; checklistTitle?: string }
  | { type: 'deleteActionItem'; identifier: string; checklistTitle?: string }
  | { type: 'rescheduleActionItem'; identifier: string; checklistTitle?: string; newDate: string }
  | { type: 'createHabit'; name: string }
  | { type: 'completeHabit'; name: string }
  | { type: 'removeHabit'; name: string }
  | { type: 'createChecklist'; title: string }
  | { type: 'archiveChecklist'; title: string }
  | { type: 'renameChecklist'; oldTitle: string; newTitle: string }
  | { type: 'completeMilestone'; weekNumber: number }
  | { type: 'updatePlan'; weekNumber: number; field: string; value: string }
  | { type: 'addIdentity'; elementType: string; content: string }
  | { type: 'removeIdentity'; elementType: string; content: string }
  | { type: 'setReminder'; message: string; date: string }
  | { type: 'setFocus'; title: string; days: number }
  | { type: 'setTheme'; value: 'light' | 'dark' | 'system' }
  | { type: 'toggleTheme' }
  | { type: 'triggerAnalysis' };

export type CommandType = AppCommand['type'];

export type RiskLevel = 'safe' | 'moderate' | 'destructive';

// ─── Risk Classification ─────────────────────────────────────────────────────

const SAFE_COMMANDS: CommandType[] = [
  'openTab', 'openModal', 'setTheme', 'toggleTheme', 'triggerAnalysis',
];

const DESTRUCTIVE_COMMANDS: CommandType[] = [
  'deleteActionItem', 'archiveChecklist', 'removeHabit', 'removeIdentity',
];

export function classifyRisk(command: AppCommand): RiskLevel {
  if (SAFE_COMMANDS.includes(command.type)) return 'safe';
  if (DESTRUCTIVE_COMMANDS.includes(command.type)) return 'destructive';
  return 'moderate';
}

// ─── Tag Parser ──────────────────────────────────────────────────────────────

export function parseAllTags(content: string): AppCommand[] {
  const commands: AppCommand[] = [];

  // Action tags: [action:analyze]
  for (const m of content.matchAll(/\[action:(\w+)\]/g)) {
    if (m[1] === 'analyze') commands.push({ type: 'triggerAnalysis' });
  }

  // Navigation: [navigate:dashboard] etc
  for (const m of content.matchAll(/\[navigate:(\w+)\]/g)) {
    const map: Record<string, AppCommand['type'] extends 'openTab' ? AppCommand : never> = {} as any;
    const tabMap: Record<string, 'today' | 'plan' | 'aurora' | 'me'> = {
      dashboard: 'today', today: 'today', home: 'today',
      plan: 'plan', life_plan: 'plan',
      aurora: 'aurora', coach: 'aurora',
      me: 'me', profile: 'me', settings: 'me',
    };
    const modalMap: Record<string, 'hypnosis' | 'settings' | 'profile' | 'upgrade'> = {
      hypnosis: 'hypnosis', settings: 'settings',
    };
    const target = m[1];
    if (tabMap[target]) {
      commands.push({ type: 'openTab', tabId: tabMap[target] });
    } else if (modalMap[target]) {
      commands.push({ type: 'openModal', modalId: modalMap[target] });
    }
  }

  // Theme: [setting:theme:dark] [setting:toggle_theme]
  for (const m of content.matchAll(/\[setting:theme:(\w+)\]/g)) {
    const v = m[1] as 'light' | 'dark' | 'system';
    if (['light', 'dark', 'system'].includes(v)) {
      commands.push({ type: 'setTheme', value: v });
    }
  }
  for (const _m of content.matchAll(/\[setting:toggle_theme\]/g)) {
    commands.push({ type: 'toggleTheme' });
  }

  // Checklist creation: [checklist:create:Title]
  for (const m of content.matchAll(/\[checklist:create:(.+?)\]/g)) {
    commands.push({ type: 'createChecklist', title: m[1].trim() });
  }

  // Checklist archive: [checklist:archive:Title]
  for (const m of content.matchAll(/\[checklist:archive:(.+?)\]/g)) {
    commands.push({ type: 'archiveChecklist', title: m[1].trim() });
  }

  // Checklist rename: [checklist:rename:Old:New]
  for (const m of content.matchAll(/\[checklist:rename:(.+?):(.+?)\]/g)) {
    commands.push({ type: 'renameChecklist', oldTitle: m[1].trim(), newTitle: m[2].trim() });
  }

  // Task/checklist item add: [checklist:add:List:Item] or [task:create:List:Item]
  for (const m of content.matchAll(/\[(?:checklist:add|task:create):(.+?):(.+?)\]/g)) {
    commands.push({ type: 'createActionItem', checklistTitle: m[1].trim(), title: m[2].trim() });
  }

  // Task complete: [checklist:complete:List:Item] or [task:complete:List:Item]
  for (const m of content.matchAll(/\[(?:checklist:complete|task:complete):(.+?):(.+?)\]/g)) {
    commands.push({ type: 'completeActionItem', checklistTitle: m[1].trim(), identifier: m[2].trim() });
  }

  // Task delete: [task:delete:List:Item]
  for (const m of content.matchAll(/\[task:delete:(.+?):(.+?)\]/g)) {
    commands.push({ type: 'deleteActionItem', checklistTitle: m[1].trim(), identifier: m[2].trim() });
  }

  // Task reschedule: [task:reschedule:List:Item:YYYY-MM-DD]
  for (const m of content.matchAll(/\[task:reschedule:(.+?):(.+?):(\d{4}-\d{2}-\d{2})\]/g)) {
    commands.push({ type: 'rescheduleActionItem', checklistTitle: m[1].trim(), identifier: m[2].trim(), newDate: m[3] });
  }

  // Milestone: [milestone:complete:N]
  for (const m of content.matchAll(/\[milestone:complete:(\d+)\]/g)) {
    commands.push({ type: 'completeMilestone', weekNumber: parseInt(m[1]) });
  }

  // Habit: [habit:create:Name], [habit:complete:Name], [habit:remove:Name]
  for (const m of content.matchAll(/\[habit:create:(.+?)\]/g)) {
    commands.push({ type: 'createHabit', name: m[1].trim() });
  }
  for (const m of content.matchAll(/\[habit:complete:(.+?)\]/g)) {
    commands.push({ type: 'completeHabit', name: m[1].trim() });
  }
  for (const m of content.matchAll(/\[habit:remove:(.+?)\]/g)) {
    commands.push({ type: 'removeHabit', name: m[1].trim() });
  }

  // Plan update: [plan:update:Week:field:value]
  for (const m of content.matchAll(/\[plan:update:(\d+):(.+?):(.+?)\]/g)) {
    commands.push({ type: 'updatePlan', weekNumber: parseInt(m[1]), field: m[2].trim(), value: m[3].trim() });
  }

  // Identity: [identity:add:type:content], [identity:remove:type:content]
  for (const m of content.matchAll(/\[identity:add:(.+?):(.+?)\]/g)) {
    commands.push({ type: 'addIdentity', elementType: m[1].trim(), content: m[2].trim() });
  }
  for (const m of content.matchAll(/\[identity:remove:(.+?):(.+?)\]/g)) {
    commands.push({ type: 'removeIdentity', elementType: m[1].trim(), content: m[2].trim() });
  }

  // Reminder: [reminder:set:message:YYYY-MM-DD]
  for (const m of content.matchAll(/\[reminder:set:(.+?):(\d{4}-\d{2}-\d{2})\]/g)) {
    commands.push({ type: 'setReminder', message: m[1].trim(), date: m[2] });
  }

  // Focus: [focus:set:title:days]
  for (const m of content.matchAll(/\[focus:set:(.+?):(\d+)\]/g)) {
    commands.push({ type: 'setFocus', title: m[1].trim(), days: parseInt(m[2]) });
  }

  return commands;
}

// ─── Tag Stripper ────────────────────────────────────────────────────────────

export function stripAllTags(content: string): string {
  return content
    .replace(/\[action:\w+\]/g, '')
    .replace(/\[navigate:[^\]]+\]/g, '')
    .replace(/\[setting:[^\]]+\]/g, '')
    .replace(/\[checklist:[^\]]+\]/g, '')
    .replace(/\[task:[^\]]+\]/g, '')
    .replace(/\[milestone:[^\]]+\]/g, '')
    .replace(/\[habit:[^\]]+\]/g, '')
    .replace(/\[plan:[^\]]+\]/g, '')
    .replace(/\[identity:[^\]]+\]/g, '')
    .replace(/\[reminder:[^\]]+\]/g, '')
    .replace(/\[focus:[^\]]+\]/g, '')
    .trim();
}

// ─── Command Description (for confirmation UI) ──────────────────────────────

export function describeCommand(command: AppCommand, isHebrew: boolean): { label: string; description: string; actionType: string } {
  switch (command.type) {
    case 'createActionItem':
      return { actionType: 'task_create', label: isHebrew ? 'יצירת משימה' : 'Create Task', description: `${command.title}${command.checklistTitle ? ` (${command.checklistTitle})` : ''}` };
    case 'completeActionItem':
      return { actionType: 'task_complete', label: isHebrew ? 'השלמת משימה' : 'Complete Task', description: `${command.identifier}${command.checklistTitle ? ` (${command.checklistTitle})` : ''}` };
    case 'deleteActionItem':
      return { actionType: 'task_delete', label: isHebrew ? 'מחיקת משימה' : 'Delete Task', description: `${command.identifier}${command.checklistTitle ? ` (${command.checklistTitle})` : ''}` };
    case 'rescheduleActionItem':
      return { actionType: 'task_reschedule', label: isHebrew ? 'דחיית משימה' : 'Reschedule Task', description: `${command.identifier} → ${command.newDate}` };
    case 'createHabit':
      return { actionType: 'habit_log', label: isHebrew ? 'יצירת הרגל' : 'Create Habit', description: command.name };
    case 'completeHabit':
      return { actionType: 'habit_log', label: isHebrew ? 'רישום הרגל' : 'Log Habit', description: command.name };
    case 'removeHabit':
      return { actionType: 'task_delete', label: isHebrew ? 'הסרת הרגל' : 'Remove Habit', description: command.name };
    case 'createChecklist':
      return { actionType: 'task_create', label: isHebrew ? 'יצירת רשימה' : 'Create Checklist', description: command.title };
    case 'archiveChecklist':
      return { actionType: 'task_delete', label: isHebrew ? 'ארכיון רשימה' : 'Archive Checklist', description: command.title };
    case 'renameChecklist':
      return { actionType: 'task_create', label: isHebrew ? 'שינוי שם רשימה' : 'Rename Checklist', description: `${command.oldTitle} → ${command.newTitle}` };
    case 'completeMilestone':
      return { actionType: 'task_complete', label: isHebrew ? 'השלמת שבוע' : 'Complete Week', description: isHebrew ? `שבוע ${command.weekNumber}` : `Week ${command.weekNumber}` };
    case 'setReminder':
      return { actionType: 'reminder_set', label: isHebrew ? 'תזכורת' : 'Reminder', description: `${command.message} (${command.date})` };
    case 'setFocus':
      return { actionType: 'navigate', label: isHebrew ? 'פוקוס' : 'Focus', description: `${command.title} (${command.days}d)` };
    case 'addIdentity':
      return { actionType: 'task_create', label: isHebrew ? 'זהות' : 'Identity', description: `${command.elementType}: ${command.content}` };
    case 'removeIdentity':
      return { actionType: 'task_delete', label: isHebrew ? 'הסרת זהות' : 'Remove Identity', description: `${command.elementType}: ${command.content}` };
    case 'updatePlan':
      return { actionType: 'task_create', label: isHebrew ? 'עדכון תוכנית' : 'Update Plan', description: `Week ${command.weekNumber}: ${command.field}` };
    default:
      return { actionType: 'navigate', label: command.type, description: '' };
  }
}

/**
 * generateICS — generates an .ics calendar file from action items
 */
export interface CalendarEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function escapeText(text: string): string {
  return text.replace(/[\\;,]/g, c => `\\${c}`).replace(/\n/g, '\\n');
}

export function generateICS(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MindOS//Action Items//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    const end = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@mindos`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${escapeText(event.title)}`,
    );
    if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(events: CalendarEvent[], filename = 'schedule.ics') {
  const ics = generateICS(events);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Calculate the current day number (1-100) of a plan using Israel timezone.
 * Uses date-only comparison to avoid timezone drift issues.
 */
export function getCurrentDayInIsrael(startDate: string | null | undefined): number {
  if (!startDate) return 1;
  
  // Get today's date in Israel timezone (date-only string)
  const israelFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayIsrael = israelFormatter.format(new Date()); // "YYYY-MM-DD"
  
  // Get start date as date-only (strip time component)
  const startOnly = startDate.slice(0, 10); // "YYYY-MM-DD"
  
  // Calculate diff in days using UTC midnight for both
  const todayMs = new Date(todayIsrael + 'T00:00:00Z').getTime();
  const startMs = new Date(startOnly + 'T00:00:00Z').getTime();
  
  const diffDays = Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24));
  
  // Day 1 = first day (diff = 0), clamped 1-100
  return Math.max(1, Math.min(100, diffDays + 1));
}

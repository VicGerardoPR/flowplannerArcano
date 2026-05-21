// dateUtils.ts - Consistent local-time date formatting utilities
// Developed by Arcano Intelligence
//
// IMPORTANT: All date strings in FlowPlanner use local time (YYYY-MM-DD).
// Never use toISOString().split('T')[0] for date-only strings — that returns
// the date in UTC, which can differ from the user's local date after ~7 PM
// in timezones behind UTC (e.g. America/Bogota UTC-5).

/**
 * Returns a local-time YYYY-MM-DD string for the given Date (defaults to now).
 */
export function toLocalDateStr(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a local-time YYYY-MM-DD string offset by `days` from today.
 */
export function getRelativeLocalDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

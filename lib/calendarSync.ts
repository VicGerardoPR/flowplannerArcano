// calendarSync.ts - Client-side iCalendar (.ics) Exporter and Sync utilities
// Developed by Arcano Intelligence

import { Task } from '../types';

/**
 * Formats a YYYY-MM-DD date string and optional HH:MM time into an ICS date format.
 * If no time is provided, returns an all-day date format (YYYYMMDD).
 * If a time is provided, returns date-time format (YYYYMMDDTHHMMSS).
 */
function formatToICSDate(dateStr: string, timeStr: string | null): { value: string; isAllDay: boolean } {
  // Strip hyphens from YYYY-MM-DD to get YYYYMMDD
  const cleanDate = dateStr.replace(/-/g, '');
  
  if (!timeStr) {
    return { value: cleanDate, isAllDay: true };
  }
  
  // Format HH:MM to HHMM00
  const cleanTime = timeStr.replace(/:/g, '').padEnd(4, '0') + '00';
  return { value: `${cleanDate}T${cleanTime}`, isAllDay: false };
}

/**
 * Escapes special characters for iCalendar string values.
 */
function escapeICSValue(str: string | null): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates an iCalendar (.ics) string for a list of tasks and triggers a download.
 */
export function downloadTasksAsICS(tasks: Task[]): void {
  const activeTasks = tasks.filter(t => t.status !== 'archived');
  
  let icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Arcano Intelligence//FlowPlanner Pro//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FlowPlanner - Tareas',
    'X-WR-TIMEZONE:America/Bogota'
  ];

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  activeTasks.forEach(task => {
    const { value: dateVal, isAllDay } = formatToICSDate(task.due_date, task.due_time);
    
    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${task.id}@flowplanner.pro`);
    icsLines.push(`DTSTAMP:${nowStamp}`);
    
    if (isAllDay) {
      icsLines.push(`DTSTART;VALUE=DATE:${dateVal}`);
      // For all-day events, DTEND is exclusive. We calculate next day.
      const d = new Date(task.due_date + 'T12:00:00');
      d.setDate(d.getDate() + 1);
      const nextDayStr = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
      icsLines.push(`DTEND;VALUE=DATE:${nextDayStr}`);
    } else {
      icsLines.push(`DTSTART:${dateVal}`);
      // Default to 1 hour duration if no duration is specified
      const durationMin = task.duration_minutes || 60;
      const d = new Date(`${task.due_date}T${task.due_time || '00:00'}:00`);
      d.setMinutes(d.getMinutes() + durationMin);
      const endYear = d.getFullYear();
      const endMonth = String(d.getMonth() + 1).padStart(2, '0');
      const endDay = String(d.getDate()).padStart(2, '0');
      const endTime = String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + '00';
      icsLines.push(`DTEND:${endYear}${endMonth}${endDay}T${endTime}`);
    }

    icsLines.push(`SUMMARY:${escapeICSValue(task.title)}`);
    if (task.description) {
      icsLines.push(`DESCRIPTION:${escapeICSValue(task.description)}`);
    }
    icsLines.push(`PRIORITY:${task.priority === 'high' ? '1' : task.priority === 'medium' ? '5' : '9'}`);
    icsLines.push(`STATUS:${task.status === 'completed' ? 'COMPLETED' : 'NEEDS-ACTION'}`);
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  const icsString = icsLines.join('\r\n');
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Trigger DOM download link
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'flowplanner_tasks.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import { format, differenceInDays, addDays, parseISO } from "date-fns";

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d");
}

export function getNights(checkIn: Date | string, checkOut: Date | string): number {
  const a = typeof checkIn === "string" ? parseISO(checkIn) : checkIn;
  const b = typeof checkOut === "string" ? parseISO(checkOut) : checkOut;
  return differenceInDays(b, a);
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let current = start;
  while (current < end) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

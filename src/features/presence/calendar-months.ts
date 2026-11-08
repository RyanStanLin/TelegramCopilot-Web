import type { Bucket } from "@/lib/types";
export type CalendarMonth = {
  key: string;
  year: number;
  month: number;
  days: Bucket[];
};
export function calendarParts(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(value));
  const get = (name: string) =>
    Number(parts.find((p) => p.type === name)!.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}
export function calendarMonths(
  days: Bucket[],
  timeZone: string,
): CalendarMonth[] {
  const months = new Map<string, CalendarMonth>();
  for (const day of days) {
    const parts = calendarParts(day.from, timeZone);
    const key = `${parts.year}-${String(parts.month).padStart(2, "0")}`;
    if (!months.has(key))
      months.set(key, { key, year: parts.year, month: parts.month, days: [] });
    months.get(key)!.days.push(day);
  }
  return [...months.values()].sort((a, b) => a.key.localeCompare(b.key));
}

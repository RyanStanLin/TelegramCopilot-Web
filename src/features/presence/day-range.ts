const dayMilliseconds = 86_400_000;
const formatters = new Map<string, Intl.DateTimeFormat>();
const ranges = new Map<string, { from: number; to: number }>();

export function dateKey(value: Date | number | string, timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    });
    if (formatters.size >= 32) formatters.delete(formatters.keys().next().value!);
    formatters.set(timeZone, formatter);
  }
  const parts = formatter.formatToParts(new Date(value));
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function shiftDay(day: string, amount: number) {
  const value = new Date(`${day}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(value.getTime())
    || value.toISOString().slice(0, 10) !== day) throw new RangeError("Invalid date");
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

export function dayDistance(first: string, last: string) {
  return Math.round((Date.parse(`${last}T00:00:00Z`)
    - Date.parse(`${first}T00:00:00Z`)) / dayMilliseconds);
}

function boundary(day: string, timeZone: string) {
  const nominal = Date.parse(`${shiftDay(day, 0)}T00:00:00Z`);
  let low = nominal - dayMilliseconds * 1.5;
  let high = nominal + dayMilliseconds * 1.5;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (dateKey(middle, timeZone) < day) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function dayRange(day: string, timeZone: string) {
  const key = `${day}:${timeZone}`;
  const cached = ranges.get(key);
  if (cached) return cached;
  const from = boundary(day, timeZone);
  const to = boundary(shiftDay(day, 1), timeZone);
  if (from >= to || dateKey(from, timeZone) !== day) throw new RangeError("Missing local day");
  const range = { from, to };
  if (ranges.size >= 128) ranges.delete(ranges.keys().next().value!);
  ranges.set(key, range);
  return range;
}

export function weekDays(day: string) {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  const monday = shiftDay(day, -((weekday + 6) % 7));
  return Array.from({ length: 7 }, (_, n) => shiftDay(monday, n));
}

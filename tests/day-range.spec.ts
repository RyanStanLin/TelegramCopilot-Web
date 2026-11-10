import { expect, test } from "@playwright/test";
import { dateKey, dayDistance, dayRange, shiftDay, weekDays } from "../src/features/presence/day-range";

test("local_day_uses_timezone_midnight_and_calendar_navigation", () => {
  const range = dayRange("2026-11-10", "Asia/Taipei");
  expect(new Date(range.from).toISOString()).toBe("2026-11-09T16:00:00.000Z");
  expect(new Date(range.to).toISOString()).toBe("2026-11-10T16:00:00.000Z");
  expect(dateKey("2026-11-09T18:00:00Z", "Asia/Taipei")).toBe("2026-11-10");
  expect(shiftDay("2026-12-31", 1)).toBe("2027-01-01");
  expect(dayDistance("2026-10-31", "2026-11-02")).toBe(2);
  expect(weekDays("2026-11-10")).toEqual([
    "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15",
  ]);
});

for (const [day, hours, start, end] of [
  ["2026-03-08", 23, "2026-03-08T05:00:00.000Z", "2026-03-09T04:00:00.000Z"],
  ["2026-11-01", 25, "2026-11-01T04:00:00.000Z", "2026-11-02T05:00:00.000Z"],
] as const) {
  test(`local_day_preserves_${hours}_hour_daylight_saving_day`, () => {
    const range = dayRange(day, "America/New_York");
    expect((range.to - range.from) / 3_600_000).toBe(hours);
    expect(new Date(range.from).toISOString()).toBe(start);
    expect(new Date(range.to).toISOString()).toBe(end);
  });
}

test("local_day_rejects_invalid_dates_zones_and_skipped_calendar_day", () => {
  expect(() => dayRange("2026-02-30", "UTC")).toThrow(RangeError);
  expect(() => dayRange("not-a-date", "UTC")).toThrow(RangeError);
  expect(() => dayRange("2026-11-10", "Invalid/Zone")).toThrow(RangeError);
  expect(() => dayRange("2011-12-30", "Pacific/Apia")).toThrow(RangeError);
});

import { expect, test } from "@playwright/test";
import { dayModel, sliceKind } from "../src/features/presence/day-model";
import { dayRange } from "../src/features/presence/day-range";
import type { Interval } from "../src/lib/types";

const from = Date.parse("2026-11-09T16:00:00Z");
const to = from + 86_400_000;
function row(start: number, end: number, state = "Online", reason = "TelegramUpdate", startKnown = true, endKnown = true): Interval {
  return { id: start, targetId: "qa", state, reason, start: new Date(from + start * 1000).toISOString(),
    end: new Date(from + end * 1000).toISOString(), seconds: end - start,
    observedAt: new Date(from + start * 1000).toISOString(), startKnown, endKnown };
}

test("daily_model_places_sessions_at_actual_times_and_conserves_hourly_durations", () => {
  const model = dayModel([row(9 * 3600, 9 * 3600 + 1800), row(12 * 3600, 13 * 3600)], from, to, to);
  expect(model.onlineSeconds).toBe(5400);
  expect(model.count).toBe(2);
  expect(model.longest).toBe(3600);
  expect(model.average).toBe(2700);
  expect(model.hours[9].onlineSeconds).toBe(1800);
  expect(model.hours[12].onlineSeconds).toBe(3600);
  expect(model.hours.reduce((n, h) => n + h.onlineSeconds, 0)).toBe(5400);
  const online = model.slices.filter((s) => s.kind === "online");
  expect((online[0].from - from) / (to - from)).toBe(9 / 24);
  expect((online[1].from - from) / (to - from)).toBe(12 / 24);
  expect(model.slices.reduce((n, s) => n + s.seconds, 0)).toBe(86_400);
});

test("daily_model_keeps_normal_offline_interruption_and_privacy_distinct", () => {
  const model = dayModel([row(0, 3600, "Offline"), row(3600, 7200, "Unknown", "ConnectionUnavailable"),
    row(7200, 10800, "Unknown", "userStatusRecently")], from, to, from + 10800_000);
  expect(model.slices.map((s) => s.kind)).toEqual(["offline", "interrupted", "unobserved", "future"]);
  expect(model.offlineSeconds).toBe(3600);
  expect(model.interruptedSeconds).toBe(3600);
  expect(model.coverage).toBe(1 / 3);
  expect(model.elapsedSeconds).toBe(10800);
  expect(model.count).toBe(0);
  expect(sliceKind(row(0, 1, "Unknown", "MonitoringDisabled"))).toBe("unobserved");
  expect(sliceKind(row(0, 1, "Unknown", "ExpiredOnlineStatus"))).toBe("interrupted");
});

test("daily_model_clips_midnight_sessions_without_inventing_new_online_starts", () => {
  const model = dayModel([row(-3600, 1800), row(23 * 3600, 25 * 3600)], from, to, to);
  expect(model.onlineSeconds).toBe(5400);
  expect(model.count).toBe(1);
  expect(model.average).toBeUndefined();
  expect(model.hours[0].count).toBe(0);
  expect(model.hours[23].count).toBe(1);
  expect(model.slices.filter((s) => s.kind === "online").map((s) => [s.startKnown, s.endKnown]))
    .toEqual([[false, true], [true, false]]);
});

test("daily_model_excludes_future_time_and_fills_missing_observations", () => {
  const model = dayModel([], from, to, from + 1800_000);
  expect(model.slices.map((s) => [s.kind, s.seconds])).toEqual([["unobserved", 1800], ["future", 84600]]);
  expect(model.coverage).toBe(0);
  expect(model.offlineSeconds).toBe(0);
  expect(model.onlineSeconds).toBe(0);
  expect(model.hours[0].elapsedSeconds).toBe(1800);
  expect(model.hours[1].elapsedSeconds).toBe(0);
});

test("daily_model_retains_repeated_dst_hours_as_separate_chronological_bins", () => {
  const range = dayRange("2026-11-01", "America/New_York");
  const interval = { ...row(0, 1), start: new Date(range.from).toISOString(), end: new Date(range.to).toISOString() };
  const model = dayModel([interval], range.from, range.to, range.to);
  expect(model.hours).toHaveLength(25);
  expect(model.onlineSeconds).toBe(25 * 3600);
  expect(model.hours.reduce((n, h) => n + h.onlineSeconds, 0)).toBe(25 * 3600);
});

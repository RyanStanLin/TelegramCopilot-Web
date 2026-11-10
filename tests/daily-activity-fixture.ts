import type { Page } from "@playwright/test";
import { query } from "../src/lib/api";
import { dayRange, weekDays } from "../src/features/presence/day-range";
import type { Interval } from "../src/lib/types";
import { realtimeFixture } from "./realtime-fixture";

export async function dailyActivityFixture(page: Page, target: string) {
  const socket = await realtimeFixture(page);
  const restore: (() => void)[] = [];
  const timeZone = "Asia/Taipei";
  restore.push(socket.set(`/targets/${target}/monitoring`, () => ({ targetId: target,
    enabled: true, pollCount: 25, successfulPollCount: 25, failedPollCount: 0,
    state: "Offline", reason: "CachedReconciliation", now: "2026-11-08T00:00:00Z",
    profile: { displayName: "Alice Lee", hasAvatar: true, userId: 42 },
  })));
  const avatarPath = `**/api/backend/targets/${target}/avatar?*`;
  const avatar = (route: import("@playwright/test").Route) => route.fulfill({
    contentType: "image/png", body: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kQ6sAAAAASUVORK5CYII=", "base64"),
  });
  await page.route(avatarPath, avatar);
  let extra = false;
  const held = new Set<string>();
  const expanded = new Set<string>();
  const paths = new Map<string, string>();
  for (const day of ["2026-11-06", "2026-11-07"]) {
    const range = dayRange(day, timeZone);
    const parts: [number, number, string, string, boolean][] = [
      [0, 8, "Offline", "TelegramUpdate", false], [8, 9.5, "Online", "TelegramUpdate", true],
      [9.5, 10, "Offline", "TelegramUpdate", true], [10, 10.25, "Unknown", "ConnectionUnavailable", false],
      [10.25, 12, "Unknown", "userStatusRecently", false], [12, 12.5, "Online", "TelegramUpdate", false],
      [12.5, 24, "Offline", "TelegramUpdate", true],
    ];
    const rows = (): Interval[] => parts.map(([start, end, state, reason, known], n) => ({
      id: n + 1, targetId: target, state, reason,
      start: new Date(range.from + start * 3_600_000).toISOString(),
      end: new Date(range.from + end * 3_600_000).toISOString(),
      seconds: (end - start) * 3600, observedAt: new Date(range.from + start * 3_600_000).toISOString(),
      startKnown: known, endKnown: known,
    }));
    const path = `/targets/${target}/timeline?${query({ from: new Date(range.from).toISOString(),
      to: new Date(range.to).toISOString(), page: 1, pageSize: 500 })}`;
    paths.set(day, path);
    for (const page of [1, 2]) restore.push(socket.set(path.replace("page=1", `page=${page}`), () => {
      if (held.has(day)) return undefined;
      const items = expanded.has(day) ? Array.from({ length: 501 }, (_, n) => ({
        ...rows()[0], id: 1000 + n, state: n % 2 ? "Online" : "Offline", startKnown: true, endKnown: true,
        start: new Date(range.from + n * 86_400_000 / 501).toISOString(),
        end: new Date(range.from + (n + 1) * 86_400_000 / 501).toISOString(), seconds: 86_400 / 501,
      })) : rows();
      if (extra && !expanded.has(day)) { items[1] = { ...items[1], end: items[2].end, seconds: 7200 }; items.splice(2, 1); }
      return { items: items.slice((page - 1) * 500, page * 500), total: items.length, page, pageSize: 500 };
    }));
  }
  const days = weekDays("2026-11-07");
  const begin = dayRange(days[0], timeZone).from;
  const end = dayRange(days[6], timeZone).to;
  const stats = `/targets/${target}/statistics?${query({ from: new Date(begin).toISOString(),
    to: new Date(end).toISOString(), timeZone, period: "day", pageSize: 7 })}`;
  restore.push(socket.set(stats, () => {
    const items = days.map((day, n) => {
      const r = dayRange(day, timeZone);
      const onlineSeconds = expanded.has(day) ? 86_400 * 250 / 501 : day === "2026-11-06" || day === "2026-11-07"
        ? (extra ? 9000 : 7200) : (n + 1) * 900;
      return { from: new Date(r.from).toISOString(), to: new Date(r.to).toISOString(),
        onlineSeconds, offlineSeconds: expanded.has(day) ? 86_400 - onlineSeconds : 20 * 3600,
        unknownSeconds: expanded.has(day) ? 0 : 4 * 3600 - onlineSeconds,
        count: expanded.has(day) ? 250 : day === "2026-11-06" || day === "2026-11-07" ? 1 : n + 1,
        coverageRatio: expanded.has(day) ? 1 : (onlineSeconds + 20 * 3600) / 86400 };
    });
    return { targetId: target, period: "day", timeZone,
      totals: { onlineSeconds: items.reduce((n, r) => n + r.onlineSeconds, 0), count: items.reduce((n, r) => n + r.count, 0) },
      buckets: { items, total: 7, page: 1, pageSize: 7 } };
  }));
  return { paths, hold: (day: string) => held.add(day),
    subscribed: (day: string, page = 1) => socket.subscribed(paths.get(day)!.replace("page=1", `page=${page}`)),
    release: (day: string) => { held.delete(day); socket.push(paths.get(day)!); },
    fail: (day: string) => socket.fail(paths.get(day)!),
    expand: (day: string) => { expanded.add(day); socket.push(paths.get(day)!); socket.push(stats); },
    collapse: (day: string) => { expanded.delete(day); socket.push(paths.get(day)!); socket.push(stats); },
    push: (day: string) => { extra = true; socket.push(paths.get(day)!); socket.push(stats); },
    dispose: async () => { restore.forEach((remove) => remove()); await page.unroute(avatarPath, avatar); } };
}

import type { Interval } from "@/lib/types";

export type SliceKind = "online" | "offline" | "interrupted" | "unobserved" | "future";
export type DaySlice = Interval & { kind: SliceKind; from: number; to: number };
const interruptions = new Set([
  "ConnectionUnavailable", "AccountNotReady", "ObservationFailed", "RateLimited",
  "ExpiredOnlineStatus", "WorkerUnavailable", "WorkerInterrupted", "Worker stopped",
]);
export function sliceKind(row: Pick<Interval, "state" | "reason">): SliceKind {
  if (row.state === "Online") return "online";
  if (row.state === "Offline") return "offline";
  return interruptions.has(row.reason) ? "interrupted" : "unobserved";
}

export function dayModel(rows: Interval[], from: number, to: number, now: number) {
  const elapsed = Math.max(from, Math.min(to, now));
  const slices: DaySlice[] = [];
  let cursor = from;
  function gap(start: number, end: number, kind: SliceKind) {
    if (end <= start) return;
    slices.push({ id: 0, targetId: "", state: "Unknown", reason: "NoObservation",
      start: new Date(start).toISOString(), end: new Date(end).toISOString(),
      seconds: (end - start) / 1000, observedAt: new Date(start).toISOString(),
      startKnown: false, endKnown: false, from: start, to: end, kind });
  }
  for (const row of [...rows].sort((a, b) => Date.parse(a.start) - Date.parse(b.start))) {
    const start = Math.max(cursor, Date.parse(row.start));
    const end = Math.min(elapsed, Date.parse(row.end));
    if (end <= start) continue;
    gap(cursor, start, "unobserved");
    slices.push({ ...row, from: start, to: end, seconds: (end - start) / 1000,
      kind: sliceKind(row), startKnown: row.startKnown && start === Date.parse(row.start),
      endKnown: row.endKnown && end === Date.parse(row.end) });
    cursor = end;
  }
  gap(cursor, elapsed, "unobserved");
  gap(elapsed, to, "future");
  const observed = slices.filter((s) => s.kind !== "future");
  const online = observed.filter((s) => s.kind === "online");
  const sum = (kind: SliceKind) => observed.filter((s) => s.kind === kind)
    .reduce((total, s) => total + s.seconds, 0);
  const onlineSeconds = sum("online");
  const offlineSeconds = sum("offline");
  const complete = online.filter((s) => s.startKnown && s.endKnown);
  const hours = [];
  for (let start = from; start < to; start += 3_600_000) {
    const end = Math.min(start + 3_600_000, to);
    const overlap = (s: DaySlice) => Math.max(0, Math.min(end, s.to) - Math.max(start, s.from)) / 1000;
    hours.push({ from: start, to: end,
      onlineSeconds: online.reduce((total, s) => total + overlap(s), 0),
      count: online.filter((s) => s.startKnown && s.from >= start && s.from < end).length,
      knownSeconds: observed.filter((s) => s.kind === "online" || s.kind === "offline")
        .reduce((total, s) => total + overlap(s), 0),
      elapsedSeconds: Math.max(0, Math.min(elapsed, end) - start) / 1000 });
  }
  return { slices, observed, hours, onlineSeconds, offlineSeconds,
    count: online.filter((s) => s.startKnown).length,
    longest: Math.max(0, ...online.map((s) => s.seconds)),
    average: complete.length ? complete.reduce((n, s) => n + s.seconds, 0) / complete.length : undefined,
    interruptedSeconds: sum("interrupted"),
    coverage: elapsed > from ? (onlineSeconds + offlineSeconds) / ((elapsed - from) / 1000) : 0,
    elapsedSeconds: (elapsed - from) / 1000 };
}
export type DayModel = ReturnType<typeof dayModel>;

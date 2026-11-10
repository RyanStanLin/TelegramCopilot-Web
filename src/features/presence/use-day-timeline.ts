"use client";
import { useEffect, useRef, useState } from "react";
import { realtime } from "@/lib/realtime-client";
import type { Interval, Page } from "@/lib/types";
import { query } from "@/lib/api";

export function useDayTimeline(target: string, from: number, to: number) {
  const key = `${target}:${from}:${to}`;
  const activePaths = useRef(new Set<string>());
  const [snapshot, setSnapshot] = useState<{ key: string; rows?: Interval[]; error: boolean }>({ key, error: false });
  useEffect(() => {
    const pages = new Map<number, Page<Interval>>();
    const subscriptions = new Map<number, () => void>();
    let stopped = false;
    function subscribe(page: number) {
      const path = `/targets/${target}/timeline?${query({
        from: new Date(from).toISOString(), to: new Date(to).toISOString(), page, pageSize: 500,
      })}`;
      activePaths.current.add(path);
      const close = realtime.subscribe(path, (value) => {
        if (stopped) return;
        if (value.error) {
          setSnapshot((s) => ({ key, rows: s.key === key ? s.rows : undefined, error: true }));
          return;
        }
        if (!value.data) return;
        const result = value.data as Page<Interval>;
        pages.set(page, result);
        const count = Math.max(1, Math.ceil((pages.get(1)?.total ?? result.total) / 500));
        if (count > 29) { setSnapshot({ key, error: true }); return; }
        for (let n = 1; n <= count; n++)
          if (!subscriptions.has(n)) { subscriptions.set(n, () => {}); subscribe(n); }
        for (const [n, remove] of subscriptions)
          if (n > count) { remove(); subscriptions.delete(n); pages.delete(n); }
        if (Array.from({ length: count }, (_, n) => n + 1).every((n) => pages.has(n)))
          setSnapshot({ key, rows: Array.from({ length: count }, (_, n) => pages.get(n + 1)!.items).flat(), error: false });
      });
      subscriptions.set(page, () => { close(); activePaths.current.delete(path); });
    }
    subscriptions.set(1, () => {});
    subscribe(1);
    return () => { stopped = true; for (const remove of subscriptions.values()) remove(); };
  }, [key, target, from, to]);
  return { rows: snapshot.key === key ? snapshot.rows : undefined,
    error: snapshot.key === key && snapshot.error,
    refresh: () => {
      for (const path of activePaths.current) realtime.refresh(path);
    } };
}

"use client";
import { Button, FormControl, Link, Pagination, Stack, TextInput } from "@primer/react";
import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { Choice } from "@/components/Choice";
import type { Resource } from "@/lib/types";
import { dateKey, dayDistance, shiftDay } from "./day-range";
import numeric from "@/components/NumericText.module.css";

export function DailyControls({ target, targets, day, timeZone, navigate, href }: {
  target: Resource; targets: Resource[]; day: string; timeZone: string;
  navigate: (changes: Record<string, string>) => void;
  href: (changes: Record<string, string>) => string;
}) {
  const { t } = useI18n();
  const [date, setDate] = useState(day);
  const [zone, setZone] = useState(timeZone);
  const today = dateKey(Date.now(), timeZone);
  const first = [dateKey(target.createdAt, timeZone), day].sort()[0];
  const current = dayDistance(first, day) + 1;
  const count = dayDistance(first, today) + 1;
  const zones = [...new Set([timeZone, "Asia/Taipei", "Asia/Shanghai", "Asia/Tokyo",
    "UTC", "Europe/London", "America/New_York", "America/Los_Angeles"])];
  return (
    <Stack gap="normal">
      <form onSubmit={(e) => { e.preventDefault(); navigate({ date, timeZone: zone }); }}>
        <Stack direction="horizontal" gap="normal" wrap="wrap" align="end">
          <Choice label={t("targetId")} searchable value={target.id}
            options={targets.map((v) => ({ value: v.id, label: v.name }))}
            change={(value) => navigate({ target: value })} />
          <FormControl required>
            <FormControl.Label>{t("activityDate")}</FormControl.Label>
            <TextInput size="medium" type="date" value={date} max={dateKey(Date.now(), zone)}
              className={numeric.number} onChange={(e) => setDate(e.target.value)} />
          </FormControl>
          <Choice label={t("timeZone")} value={zone} change={setZone}
            options={zones.map((value) => ({ value, label: value }))} />
          <Button size="medium" type="submit">{t("apply")}</Button>
        </Stack>
      </form>
      {count > 1 && (
        <Pagination currentPage={current} pageCount={count} showPages={false}
          aria-label={t("dayNavigation")}
          hrefBuilder={(n) => href({ date: shiftDay(first, n - 1) })}
          onPageChange={(e, n) => {
            if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
            e.preventDefault(); navigate({ date: shiftDay(first, n - 1) });
          }}
          renderPage={({ key, number: _number, children: _children, ...props }) => (
            <Link key={key} {...props} aria-label={t(props.rel === "prev" ? "previousDay" : "nextDay")}>
              {t(props.rel === "prev" ? "previousDay" : "nextDay")}
            </Link>
          )} />
      )}
    </Stack>
  );
}

"use client";
import { Button, Details, Heading, Stack } from "@primer/react";
import { useId } from "react";
import { useI18n } from "@/i18n/provider";
import { NumericText } from "@/components/NumericText";
import { RecordsTable } from "@/components/RecordsTable";
import { formatDuration } from "@/lib/duration";
import type { Statistics } from "@/lib/types";
import { dateKey, dayRange } from "./day-range";
import css from "./ActivityCharts.module.css";
import layout from "./DailyActivity.module.css";

export function WeeklyActivity({ data, days, day, timeZone, metric, select }: {
  data: Statistics; days: string[]; day: string; timeZone: string;
  metric: "duration" | "count"; select: (day: string) => void;
}) {
  const { t, locale } = useI18n();
  const heading = useId();
  const today = dateKey(Date.now(), timeZone);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const rows = days.map((date) => ({ date, bucket: data.buckets.items.find((r) => dateKey(r.from, timeZone) === date) }));
  const value = (row: typeof rows[number]) => metric === "duration"
    ? (row.bucket?.onlineSeconds ?? 0) / 3600 : row.bucket?.count ?? 0;
  const maximum = Math.max(1, ...rows.map(value));
  return (
    <section aria-labelledby={heading} className={layout.section}>
      <Stack gap="normal">
        <Heading as="h2" id={heading} className={layout.heading}>{t("weekActivity")}</Heading>
        <p className={layout.readout}><NumericText>
          {t("weekReadout").replace("{duration}", formatDuration(data.totals.onlineSeconds, locale))
            .replace("{count}", number.format(data.totals.count))}
        </NumericText></p>
        <Stack direction="horizontal" justify="space-between" className={css.axis}>
          <span>{t(metric === "duration" ? "hoursOnline" : "onlineStarts")}</span>
          <NumericText>{number.format(maximum)}</NumericText>
        </Stack>
        <Stack direction="horizontal" gap="tight">
          {rows.map((row) => {
            const stamp = dayRange(row.date, timeZone).from;
            const date = new Intl.DateTimeFormat(locale, { timeZone, dateStyle: "medium" }).format(stamp);
            const state = row.date > today ? t("futureActivity") : !row.bucket?.coverageRatio
              ? t("unknownActivity") : metric === "duration"
                ? formatDuration(row.bucket.onlineSeconds, locale) : t("startCount").replace("{count}", number.format(row.bucket.count));
            return (
              <Stack.Item key={row.date} grow className={css.weekColumn}>
                <Button size="medium" variant={row.date === day ? "default" : "invisible"}
                  className={css.weekButton} disabled={row.date > today} aria-pressed={row.date === day}
                  aria-label={`${date} · ${state}`} onClick={() => select(row.date)}>
                  <Stack as="span" gap="condensed" align="center">
                    <svg className={css.weekPlot} viewBox="0 0 1 100" preserveAspectRatio="none" aria-hidden="true">
                      <line x1={0} x2={1} y1={100} y2={100} className={css.grid} vectorEffect="non-scaling-stroke" />
                      <rect x={0.15} width={0.7} y={100 - value(row) / maximum * 100}
                        height={value(row) / maximum * 100} className={css.bar} />
                    </svg>
                    <span className={css.axis}>{new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone }).format(stamp)}</span>
                    <span className={css.axis}><NumericText>{new Intl.DateTimeFormat(locale, { day: "numeric", timeZone }).format(stamp)}</NumericText></span>
                  </Stack>
                </Button>
              </Stack.Item>
            );
          })}
        </Stack>
        <Details>
          <summary className={layout.disclosure}>{t("chartData")}</summary>
          <RecordsTable title={t("weekActivity")} rows={data.buckets.items} rowId={(r) => r.from}
            columns={[
              { key: "date", label: "activityDate", render: (r) => new Intl.DateTimeFormat(locale, { timeZone, dateStyle: "medium" }).format(new Date(r.from)) },
              { key: "duration", label: "onlineSeconds", render: (r) => formatDuration(r.onlineSeconds, locale) },
              { key: "count", label: "count", render: (r) => number.format(r.count) },
            ]} />
        </Details>
      </Stack>
    </section>
  );
}

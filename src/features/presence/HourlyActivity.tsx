"use client";
import { Details, Heading, Stack } from "@primer/react";
import { useId, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { NumericText } from "@/components/NumericText";
import { RecordsTable } from "@/components/RecordsTable";
import { formatDuration } from "@/lib/duration";
import type { DayModel } from "./day-model";
import { clockTime } from "./day-labels";
import css from "./ActivityCharts.module.css";
import layout from "./DailyActivity.module.css";

export function HourlyActivity({ model, timeZone, metric }: {
  model: DayModel; timeZone: string; metric: "duration" | "count";
}) {
  const { t, locale } = useI18n();
  const heading = useId();
  const [selection, select] = useState(0);
  const index = Math.min(selection, model.hours.length - 1);
  const selected = model.hours[index];
  const value = (hour: DayModel["hours"][number]) => metric === "duration" ? hour.onlineSeconds / 60 : hour.count;
  const maximum = Math.max(1, ...model.hours.map(value));
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const label = selected.elapsedSeconds === 0 ? t("futureActivity")
    : selected.knownSeconds === 0 ? t("unknownActivity")
      : t("hourReadout").replace("{duration}", formatDuration(selected.onlineSeconds, locale))
        .replace("{count}", number.format(selected.count));
  const description = `${clockTime(selected.from, timeZone, locale)}–${clockTime(selected.to, timeZone, locale)} · ${label}`;
  return (
    <section aria-labelledby={heading} className={layout.section}>
      <Stack gap="normal">
        <Heading as="h2" id={heading} className={layout.heading}>{t("hourlyActivity")}</Heading>
        <Stack direction="horizontal" justify="space-between" className={css.axis}>
          <span>{t(metric === "duration" ? "minutesOnline" : "onlineStarts")}</span>
          <NumericText>{number.format(maximum)}</NumericText>
        </Stack>
        <svg className={css.plot} viewBox={`0 0 ${model.hours.length} 100`} preserveAspectRatio="none"
          role="slider" tabIndex={0} aria-label={t("hourCursor")} aria-valuemin={0}
          aria-valuemax={model.hours.length - 1} aria-valuenow={index} aria-valuetext={description}
          onKeyDown={(e) => {
            const values: Record<string, number> = { ArrowLeft: index - 1, ArrowDown: index - 1,
              ArrowRight: index + 1, ArrowUp: index + 1, Home: 0, End: model.hours.length - 1 };
            const n = values[e.key];
            if (n !== undefined) { e.preventDefault(); select(Math.max(0, Math.min(model.hours.length - 1, n))); }
          }} onPointerMove={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            select(Math.max(0, Math.min(model.hours.length - 1,
              Math.floor((e.clientX - box.left) / box.width * model.hours.length))));
          }}>
          {[0, 50, 100].map((y) => <line key={y} x1={0} x2={model.hours.length} y1={y} y2={y}
            className={css.grid} vectorEffect="non-scaling-stroke" />)}
          {model.hours.map((hour, n) => <rect key={hour.from} x={n + 0.15} width={0.7}
            y={100 - value(hour) / maximum * 100} height={value(hour) / maximum * 100}
            className={`${css.bar} ${n === index ? css.selectedBar : ""}`}
            data-hour={n} data-value={value(hour)} vectorEffect="non-scaling-stroke" />)}
        </svg>
        <Stack direction="horizontal" justify="space-between" className={css.axis}>
          {[0, 0.25, 0.5, 0.75, 1].map((v) => <span key={v}><NumericText>
            {v === 1 ? "24:00" : clockTime(model.hours[Math.floor(v * model.hours.length)].from, timeZone, locale)}
          </NumericText></span>)}
        </Stack>
        <p className={layout.readout} aria-live="polite"><NumericText>{description}</NumericText></p>
        <Details>
          <summary className={layout.disclosure}>{t("chartData")}</summary>
          <RecordsTable title={t("hourlyActivity")} rows={model.hours} rowId={(r) => String(r.from)}
            columns={[
              { key: "hour", label: "activityHour", render: (r) => clockTime(r.from, timeZone, locale) },
              { key: "duration", label: "onlineSeconds", render: (r) => formatDuration(r.onlineSeconds, locale) },
              { key: "count", label: "count", render: (r) => number.format(r.count) },
            ]} />
        </Details>
      </Stack>
    </section>
  );
}

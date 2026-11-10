"use client";
import { useI18n } from "@/i18n/provider";
import { NumericText } from "@/components/NumericText";
import { formatDuration } from "@/lib/duration";
import type { DayModel } from "./day-model";
import css from "./DailyActivity.module.css";

export function DailySummary({ model }: { model: DayModel }) {
  const { t, locale } = useI18n();
  const number = new Intl.NumberFormat(locale);
  const rows = [
    ["dayOnlineTotal", formatDuration(model.onlineSeconds, locale)],
    ["dayOnlineStarts", number.format(model.count)],
    ["longestObservedSession", formatDuration(model.longest, locale)],
    ["dayKnownCoverage", new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(model.coverage)],
  ];
  return (
    <dl className={css.summary}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className={css.muted}>{t(label)}</dt>
          <dd className={css.stat}><NumericText>{value}</NumericText></dd>
        </div>
      ))}
    </dl>
  );
}

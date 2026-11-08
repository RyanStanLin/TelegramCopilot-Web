"use client";
import { Link } from "@primer/react";
import NextLink from "next/link";
import { useI18n } from "@/i18n/provider";
import { query } from "@/lib/api";
import { formatDuration } from "@/lib/duration";
import { calendarParts, type CalendarMonth } from "./calendar-months";
import css from "./Contribution.module.css";
import { NumericText } from "@/components/NumericText";
export function MonthGrid({
  month,
  target,
  timeZone,
}: {
  month: CalendarMonth;
  target: string;
  timeZone: string;
}) {
  const { t, locale } = useI18n();
  const number = new Intl.NumberFormat(locale);
  const labels = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    timeZone: "UTC",
  });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone });
  const offset =
    (new Date(Date.UTC(month.year, month.month - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(month.year, month.month, 0)).getUTCDate();
  const observed = new Map(
    month.days.map((d) => [calendarParts(d.from, timeZone).day, d]),
  );
  return (
    <div className={css.calendar}>
      {Array.from({ length: 7 }, (_, i) => (
        <span key={`weekday-${i}`} className={css.weekday}>
          {labels.format(new Date(Date.UTC(2026, 0, 5 + i, 12)))}
        </span>
      ))}
      {Array.from({ length: offset }, (_, i) => (
        <span key={`offset-${i}`} aria-hidden="true" />
      ))}
      {Array.from({ length: count }, (_, index) => {
        const value = index + 1;
        const d = observed.get(value);
        if (!d)
          return (
            <span
              key={value}
              className={css.unobserved}
              aria-label={`${number.format(value)} · ${t("calendarUnavailable")}`}
            >
              <NumericText>{number.format(value)}</NumericText>
            </span>
          );
        const level =
          d.count === 0
            ? 0
            : d.count < 3
              ? 1
              : d.count < 6
                ? 2
                : d.count < 10
                  ? 3
                  : 4;
        const label = `${date.format(new Date(d.from))}: ${t("count")} ${number.format(d.count)}, ${t("onlineSeconds")} ${formatDuration(d.onlineSeconds, locale)}, ${t("unknownSeconds")} ${formatDuration(d.unknownSeconds, locale)}`;
        return (
          <Link
            as={NextLink}
            key={value}
            href={`/presence?${query({ target, from: d.from, to: d.to, timeZone, period: "day" })}`}
            className={css.cell}
            data-level={level}
            data-unknown={d.unknownSeconds > 0}
            aria-label={label}
          >
            <NumericText>{number.format(value)}</NumericText>
          </Link>
        );
      })}
    </div>
  );
}

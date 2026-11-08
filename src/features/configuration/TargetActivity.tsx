"use client";
import { Link, Stack } from "@primer/react";
import NextLink from "next/link";
import { useI18n } from "@/i18n/provider";
import { formatDuration } from "@/lib/duration";
import type { TargetMonitoring } from "@/lib/monitoring-types";
import css from "./TargetMonitoring.module.css";
import { NumericText } from "@/components/NumericText";
export function TargetActivity({ data }: { data: TargetMonitoring }) {
  const { t, locale } = useI18n();
  const activity = data.activity;
  const number = new Intl.NumberFormat(locale);
  const total = data.successfulPollCount + data.failedPollCount;
  const success = total
    ? new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(data.successfulPollCount / total)
    : t("noCompletedPolls");
  const rows = [
    [
      "todayOnline",
      activity
        ? formatDuration(activity.today.onlineSeconds, locale)
        : t("statisticsUnavailable"),
    ],
    [
      "weekOnline",
      activity
        ? formatDuration(activity.week.onlineSeconds, locale)
        : t("statisticsUnavailable"),
    ],
    [
      "weekSessions",
      activity
        ? number.format(activity.week.count)
        : t("statisticsUnavailable"),
    ],
    ["pollSuccessRate", success],
  ];
  return (
    <Stack gap="normal">
      <dl className={css.stats}>
        {rows.map(([label, value]) => (
          <div key={label} className={css.stat}>
            <dt className={css.statLabel}>{t(label)}</dt>
            <dd className={css.statValue}>
              <NumericText>{value}</NumericText>
            </dd>
          </div>
        ))}
      </dl>
      <p className={css.muted}>
        {t("activityHelp").replace("{zone}", activity?.timeZone ?? t("none"))}
      </p>
      <Link as={NextLink} href={`/presence?target=${data.targetId}`}>
        {t("view")}
      </Link>
    </Stack>
  );
}

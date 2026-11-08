"use client";
import { Stack } from "@primer/react";
import { useI18n } from "@/i18n/provider";
import { useLiveData } from "@/lib/use-live-data";
import { formatDuration } from "@/lib/duration";
import type { MonitoringOverview } from "@/lib/monitoring-types";
import css from "./Shared.module.css";

export function MonitoringPulse() {
  const { t, locale } = useI18n();
  const { data, error } = useLiveData<MonitoringOverview>("/monitoring");
  if (!data)
    return (
      <span>{t(error ? "monitoringUnavailable" : "monitoringLoading")}</span>
    );
  const age = data.health.heartbeat
    ? (Date.parse(data.now) - Date.parse(data.health.heartbeat)) / 1000
    : null;
  const successful = data.successfulPollCount ?? 0;
  const completed = successful + (data.failedPollCount ?? 0);
  const successRate = completed
    ? new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(successful / completed)
    : t("noCompletedPolls");
  return (
    <Stack
      direction="horizontal"
      gap="condensed"
      wrap="wrap"
      aria-label={t("backgroundMonitoring")}
      className={css.muted}
    >
      <span role="status">
        {t(
          error
            ? "monitoringUnavailable"
            : data.health.status === "Healthy"
              ? "monitorRunning"
              : "monitorDegraded",
        )}
      </span>
      <span>
        {t("pollCount")}:{" "}
        <strong>{new Intl.NumberFormat(locale).format(data.pollCount)}</strong>
      </span>
      <span>
        {t("enabledTargets")}:{" "}
        {new Intl.NumberFormat(locale).format(data.enabledTargets)}
      </span>
      <span>
        {t("requestSuccess")}: <strong>{successRate}</strong>
      </span>
      <span>
        {t("heartbeatAge")}: {formatDuration(age, locale)}
      </span>
    </Stack>
  );
}

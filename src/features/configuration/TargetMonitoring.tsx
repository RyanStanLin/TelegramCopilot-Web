"use client";
import { Heading, IconButton, Stack } from "@primer/react";
import { SyncIcon } from "@primer/octicons-react";
import { Fragment } from "react";
import { useI18n } from "@/i18n/provider";
import { Failure, Loading } from "@/components/Status";
import { useLiveData } from "@/lib/use-live-data";
import { formatDuration } from "@/lib/duration";
import type { TargetMonitoring as Monitoring } from "@/lib/monitoring-types";
import { TargetActivity } from "./TargetActivity";
import { TargetIdentity } from "./TargetIdentity";
import { Reason } from "@/components/Reason";
import css from "./TargetMonitoring.module.css";
import { NumericText } from "@/components/NumericText";
export function TargetMonitoring({ id }: { id: string }) {
  const { t, locale } = useI18n();
  const { data, error, refresh } = useLiveData<Monitoring>(
    `/targets/${id}/monitoring`,
  );
  const date = (value?: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "medium",
        }).format(new Date(value))
      : t("none");
  if (!data) return error ? <Failure retry={refresh} /> : <Loading />;
  const profile = data.profile;
  const lastSeen =
    profile?.telegramStatus === "userStatusOffline" && profile.lastSeenAt
      ? date(profile.lastSeenAt)
      : t(profile?.telegramStatus ?? "NoObservation");
  const since =
    profile?.lastSeenAt && profile.telegramStatus === "userStatusOffline"
      ? Math.max(
          0,
          (Date.parse(data.now) - Date.parse(profile.lastSeenAt)) / 1000,
        )
      : null;
  const next = data.nextPollAt
    ? Math.max(0, (Date.parse(data.nextPollAt) - Date.parse(data.now)) / 1000)
    : null;
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const rows = [
    ["pollCount", number(data.pollCount)],
    ["successfulPolls", number(data.successfulPollCount)],
    ["failedPolls", number(data.failedPollCount)],
    ["lastPoll", date(data.lastPollCompletedAt)],
    ["lastSuccessfulPoll", date(data.lastSuccessfulPollAt)],
    [
      "nextPoll",
      data.enabled
        ? data.isPolling
          ? t("pollInProgress")
          : formatDuration(next, locale)
        : t("MonitoringDisabled"),
    ],
    ["telegramProfileUpdated", date(profile?.updatedAt)],
  ];
  return (
    <section aria-label={t("targetLiveStatus")}>
      <Stack gap="spacious">
        <TargetIdentity key={profile?.avatarVersion} data={data} />
        {error && <Failure message="monitoringUnavailable" retry={refresh} />}
        <section className={css.lastSeen} aria-label={t("telegramLastSeen")}>
          <Stack gap="condensed">
            <strong>{t("telegramLastSeen")}</strong>
            <span>
              <NumericText>
                {since !== null
                  ? t("lastSeenAgo").replace(
                      "{duration}",
                      formatDuration(since, locale),
                    )
                  : lastSeen}
              </NumericText>
            </span>
            {since !== null && (
              <time className={css.muted} dateTime={profile!.lastSeenAt!}>
                <NumericText>{lastSeen}</NumericText>
              </time>
            )}
          </Stack>
        </section>
        <TargetActivity data={data} />
        <section className={css.polling} aria-labelledby="polling-heading">
          <Stack gap="normal">
            <Stack
              direction="horizontal"
              align="center"
              justify="space-between"
            >
              <Heading as="h2" variant="small" id="polling-heading">
                {t("pollingDetails")}
              </Heading>
              <IconButton
                size="medium"
                icon={SyncIcon}
                aria-label={t("statusRefresh")}
                onClick={refresh}
              />
            </Stack>
            <p className={css.muted}>{t("pollCountHelp")}</p>
            <dl className={css.details}>
              {rows.map(([label, value]) => (
                <Fragment key={label}>
                  <dt className={css.label}>{t(label)}</dt>
                  <dd className={css.value}>
                    <NumericText>{value}</NumericText>
                  </dd>
                </Fragment>
              ))}
              <dt className={css.label}>{t("latestPollResult")}</dt>
              <dd className={css.value}>
                <Reason
                  value={data.enabled ? data.reason : "MonitoringDisabled"}
                />
              </dd>
            </dl>
          </Stack>
        </section>
      </Stack>
    </section>
  );
}

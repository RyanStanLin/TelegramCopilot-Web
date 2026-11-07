"use client";
import { Avatar, Button, Heading, Stack } from "@primer/react";
import { PersonIcon } from "@primer/octicons-react";
import { Fragment, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { Failure, Loading } from "@/components/Status";
import { useLiveData } from "@/lib/use-live-data";
import { formatDuration } from "@/lib/duration";
import type { TargetMonitoring as Monitoring } from "@/lib/monitoring-types";
import css from "./TargetMonitoring.module.css";

function ProfileAvatar({
  id,
  version,
}: {
  id: string;
  version?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <PersonIcon size={48} aria-hidden="true" />
  ) : (
    <Avatar
      size={64}
      alt=""
      src={`/api/backend/targets/${id}/avatar?v=${encodeURIComponent(version ?? "")}`}
      onError={() => setFailed(true)}
    />
  );
}

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
  const age = data.lastPollCompletedAt
    ? Math.max(
        0,
        (Date.parse(data.now) - Date.parse(data.lastPollCompletedAt)) / 1000,
      )
    : null;
  const next = data.nextPollAt
    ? Math.max(0, (Date.parse(data.nextPollAt) - Date.parse(data.now)) / 1000)
    : null;
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const rows = [
    ["telegramLastSeen", lastSeen],
    ["telegramProfileUpdated", date(profile?.updatedAt)],
    ["pollCount", number(data.pollCount)],
    ["successfulPolls", number(data.successfulPollCount)],
    ["failedPolls", number(data.failedPollCount)],
    [
      "lastPoll",
      `${date(data.lastPollCompletedAt)}${age == null ? "" : ` · ${formatDuration(age, locale)} ${t("ago")}`}`,
    ],
    ["lastSuccessfulPoll", date(data.lastSuccessfulPollAt)],
    [
      "nextPoll",
      data.enabled
        ? data.isPolling
          ? t("pollInProgress")
          : formatDuration(next, locale)
        : t("MonitoringDisabled"),
    ],
    [
      "latestPollResult",
      t(data.enabled ? data.reason : "MonitoringDisabled"),
    ],
  ];
  return (
    <section aria-labelledby="target-monitoring-heading">
      <Stack gap="normal">
        <Heading id="target-monitoring-heading" as="h2" variant="small">
          {t("targetLiveStatus")}
        </Heading>
        <Stack direction="horizontal" gap="normal" align="center" wrap="wrap">
          {profile?.hasAvatar ? (
            <ProfileAvatar
              key={profile.avatarVersion}
              id={id}
              version={profile.avatarVersion}
            />
          ) : (
            <PersonIcon size={48} aria-hidden="true" />
          )}
          <Stack gap="condensed">
            <strong>
              {profile?.displayName || t("telegramProfilePending")}
            </strong>
            {profile?.username && <span>@{profile.username}</span>}
            <span>{t(data.enabled ? data.state : "MonitoringDisabled")}</span>
          </Stack>
        </Stack>
        <p>{t("pollCountHelp")}</p>
        {error && <Failure message="monitoringUnavailable" retry={refresh} />}
        <dl className={css.details}>
          {rows.map(([label, value]) => (
            <Fragment key={label}>
              <dt className={css.label}>{t(label)}</dt>
              <dd className={css.value}>{value}</dd>
            </Fragment>
          ))}
        </dl>
        <Stack direction="horizontal">
          <Button size="medium" onClick={refresh}>
            {t("statusRefresh")}
          </Button>
        </Stack>
      </Stack>
    </section>
  );
}

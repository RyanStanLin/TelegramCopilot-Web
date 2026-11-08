"use client";
import { Avatar, Heading, Label, Stack } from "@primer/react";
import { PersonIcon } from "@primer/octicons-react";
import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import type { TargetMonitoring } from "@/lib/monitoring-types";
import css from "./TargetMonitoring.module.css";
import shared from "@/components/Shared.module.css";
export function TargetIdentity({ data }: { data: TargetMonitoring }) {
  const { t } = useI18n();
  const profile = data.profile;
  const [failed, setFailed] = useState(false);
  return (
    <Stack direction="horizontal" gap="normal" align="center">
      {profile?.hasAvatar && !failed ? (
        <Avatar
          size={64}
          alt=""
          src={`/api/backend/targets/${data.targetId}/avatar?v=${encodeURIComponent(profile.avatarVersion ?? "")}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={css.avatarPlaceholder}>
          <PersonIcon size={16} aria-hidden="true" />
        </span>
      )}
      <Stack gap="condensed" className={shared.content}>
        <Heading as="h2" variant="large">
          {profile?.displayName || t("telegramProfilePending")}
        </Heading>
        {profile?.username && (
          <span className={css.muted}>@{profile.username}</span>
        )}
        <Stack direction="horizontal" align="center" gap="condensed">
          <Label
            variant={
              !data.enabled
                ? "secondary"
                : data.state === "Online"
                  ? "success"
                  : "default"
            }
          >
            {t(data.enabled ? data.state : "MonitoringDisabled")}
          </Label>
        </Stack>
      </Stack>
    </Stack>
  );
}

"use client";
import { Details, Stack } from "@primer/react";
import { useI18n } from "@/i18n/provider";
import css from "./Reason.module.css";
import { NumericText } from "./NumericText";
const known = new Set([
  "TelegramUpdate",
  "CachedReconciliation",
  "ConnectionUnavailable",
  "AccountNotReady",
  "ObservationFailed",
  "NoObservation",
  "MonitoringDisabled",
  "RateLimited",
  "ExpiredOnlineStatus",
  "TargetReconfigured",
  "AccountReconfigured",
  "WorkerUnavailable",
  "WorkerInterrupted",
  "Observation resumed",
  "Worker started",
  "Worker stopped",
  "userStatusEmpty",
  "userStatusRecently",
  "userStatusLastWeek",
  "userStatusLastMonth",
]);
export function Reason({ value }: { value: string }) {
  const { t } = useI18n();
  if (!value) return <span>{t("none")}</span>;
  const translated = known.has(value);
  const hint = t(`${value}Help`);
  return (
    <Stack gap="tight" className={css.reason}>
      <span>{translated ? t(value) : t("additionalDetails")}</span>
      {hint !== `${value}Help` && (
        <p className={css.hint}>
          <NumericText>{hint}</NumericText>
        </p>
      )}
      {!translated && (
        <Details>
          <summary>{t("technicalDetails")}</summary>
          <p className={css.detail}>
            <NumericText>{value}</NumericText>
          </p>
        </Details>
      )}
    </Stack>
  );
}

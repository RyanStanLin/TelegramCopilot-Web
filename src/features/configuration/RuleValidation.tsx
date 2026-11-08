"use client";
import { Banner, Stack } from "@primer/react";
import { useI18n } from "@/i18n/provider";
import { NumericText } from "@/components/NumericText";
export type RuleCheck = {
  valid: boolean;
  errors: { field: string; code: string }[];
  warnings: { field: string; code: string }[];
  preview?: {
    destination: string;
    deviceCount: number;
    title: string;
    body: string;
    subtitle?: string;
    group?: string;
    event: string;
  } | null;
};
export function RuleValidation({ value }: { value: RuleCheck }) {
  const { t } = useI18n();
  const preview = value.preview;
  return (
    <Stack gap="normal">
      <Banner
        variant={value.valid ? "success" : "critical"}
        title={t(value.valid ? "ruleValid" : "ruleInvalid")}
      />
      {!!value.errors.length && (
        <ul>
          {value.errors.map((issue, i) => (
            <li key={`${issue.field}-${i}`}>
              {t(issue.field)}: {t(issue.code)}
            </li>
          ))}
        </ul>
      )}
      {!!value.warnings.length && (
        <ul>
          {value.warnings.map((issue, i) => (
            <li key={`${issue.field}-${i}`}>
              {t(issue.field)}: {t(issue.code)}
            </li>
          ))}
        </ul>
      )}
      {preview && (
        <section aria-label={t("notificationPreview")}>
          <p>{t("previewOnly")}</p>
          <p>
            {t("destinations")}: {preview.destination} ·{" "}
            <NumericText>{preview.deviceCount}</NumericText> {t("devices")}
          </p>
          <strong>
            <NumericText>{preview.title}</NumericText>
          </strong>
          {preview.subtitle && (
            <p>
              <NumericText>{preview.subtitle}</NumericText>
            </p>
          )}
          <p>
            <NumericText>{preview.body}</NumericText>
          </p>
          {preview.group && (
            <p>
              {t("group")}: {preview.group}
            </p>
          )}
        </section>
      )}
    </Stack>
  );
}

"use client";
import { Button, Stack } from "@primer/react";
import { useI18n } from "@/i18n/provider";
import { Failure, Loading } from "@/components/Status";
import type { RuleTemplate } from "./use-rule-templates";
import css from "@/components/Shared.module.css";
export function RuleTemplatePanel({
  template,
  loading,
  error,
  apply,
  isNew,
}: {
  template?: RuleTemplate;
  loading: boolean;
  error: boolean;
  apply: () => void;
  isNew: boolean;
}) {
  const { t } = useI18n();
  return (
    <section className={css.section} aria-label={t("builtInTemplate")}>
      <Stack gap="condensed">
        <Stack
          direction="horizontal"
          align="center"
          justify="space-between"
          wrap="wrap"
        >
          <strong>{t("builtInTemplate")}</strong>
          <Button size="medium" onClick={apply} disabled={!template}>
            {t("applyTemplate")}
          </Button>
        </Stack>
        {loading ? (
          <Loading />
        ) : error ? (
          <Failure message="templatesUnavailable" />
        ) : (
          <p className={css.muted}>{template?.description}</p>
        )}
        {isNew && <p className={css.muted}>{t("templateEventHelp")}</p>}
      </Stack>
    </section>
  );
}

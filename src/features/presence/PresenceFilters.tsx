"use client";
import { Button, FormControl, Stack, TextInput } from "@primer/react";
import { useState } from "react";
import { Choice } from "@/components/Choice";
import { useI18n } from "@/i18n/provider";
import type { Resource } from "@/lib/types";
import numeric from "@/components/NumericText.module.css";
export type PresenceFilter = {
  target: string;
  from: string;
  to: string;
  timeZone: string;
  period: string;
  state: string;
};
export function PresenceFilters({
  current,
  targets,
  apply,
}: {
  current: PresenceFilter;
  targets: Resource[];
  apply: (value: PresenceFilter) => void;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState(current);
  const change = (key: keyof PresenceFilter, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(values);
      }}
    >
      <Stack gap="normal">
        <Stack direction="horizontal" gap="normal" wrap="wrap" align="end">
          <Choice
            label={t("targetId")}
            value={values.target}
            searchable
            change={(v) => change("target", v)}
            options={[
              { value: "", label: t("none") },
              ...targets.map((r) => ({ value: r.id, label: r.name })),
            ]}
          />
          {(["from", "to", "timeZone"] as const).map((key) => (
            <FormControl key={key}>
              <FormControl.Label>{t(key)}</FormControl.Label>
              <TextInput
                className={key === "timeZone" ? undefined : numeric.number}
                size="medium"
                value={values[key]}
                onChange={(e) => change(key, e.target.value)}
              />
            </FormControl>
          ))}
          <Choice
            label={t("period")}
            value={values.period}
            change={(v) => change("period", v)}
            options={["day", "week", "month", "year"].map((v) => ({
              value: v,
              label: t(v),
            }))}
          />
          <Choice
            label={t("state")}
            value={values.state}
            change={(v) => change("state", v)}
            options={[
              { value: "", label: t("all") },
              ...["Online", "Offline", "Unknown"].map((v) => ({
                value: v,
                label: t(v),
              })),
            ]}
          />
          <Button size="medium" type="submit">
            {t("apply")}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

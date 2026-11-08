"use client";
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { useI18n } from "@/i18n/provider";
import { useLoad } from "@/lib/use-load";
import type { Kind } from "@/lib/types";
export type RuleTemplate = {
  event: string;
  name: string;
  description: string;
  settings: Record<string, unknown>;
};
export function useRuleTemplates(
  kind: Kind,
  id: string,
  values: Record<string, unknown>,
  setValues: Dispatch<SetStateAction<Record<string, unknown>>>,
  setName: Dispatch<SetStateAction<string>>,
) {
  const { locale } = useI18n();
  const data = useLoad<RuleTemplate[]>(
    kind === "rules" ? `/rules/templates?language=${locale}` : null,
  );
  const initialized = useRef(false);
  const previousName = useRef("");
  const current = data.data?.find((v) => v.event === String(values.event));
  function apply(event: string) {
    const template = data.data?.find((v) => v.event === event);
    if (!template) return;
    const settings = template.settings;
    setValues((v) => ({
      ...v,
      event,
      title: settings.title,
      body: settings.body,
      subtitle: settings.subtitle ?? "",
      group: settings.group ?? "",
      parameters: JSON.stringify(settings.parameters, null, 2),
      language: settings.language,
    }));
    const oldName = previousName.current;
    setName((v) => (!v || v === oldName ? template.name : v));
    previousName.current = template.name;
  }
  useEffect(() => {
    if (kind !== "rules" || id !== "new" || initialized.current || !data.data)
      return;
    initialized.current = true;
    if (values.title === "{NAME}" && values.body === "{EVENT} {TIME_OF_ONLINE}")
      apply(String(values.event));
  });
  return {
    template: current,
    templateLoading: data.loading,
    templateError: !!data.error,
    applyTemplate: () => apply(String(values.event)),
    changeValue: (key: string, value: unknown) => {
      if (key === "event" && id === "new" && data.data) apply(String(value));
      else setValues((v) => ({ ...v, [key]: value }));
    },
  };
}

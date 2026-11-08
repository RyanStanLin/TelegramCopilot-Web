"use client";
import { Stack } from "@primer/react";
import { useI18n } from "@/i18n/provider";
import type { Kind, Resource } from "@/lib/types";
import { FormSection } from "@/components/FormSection";
import { schema } from "./schema";
import { fieldGroups } from "./field-groups";
import { FieldControl } from "./FieldControl";
export function Fields({
  kind,
  values,
  change,
  references,
  invalid,
}: {
  kind: Kind;
  values: Record<string, unknown>;
  change: (key: string, value: unknown) => void;
  references: Record<string, Resource[]>;
  invalid: string[];
}) {
  const { t } = useI18n();
  return (
    <Stack gap="spacious">
      {fieldGroups[kind].map((group) => (
        <FormSection key={group.title} title={t(group.title)}>
          {schema[kind]
            .filter(
              (f) => group.keys.includes(f.key) && (!f.when || f.when(values)),
            )
            .map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                value={values[field.key]}
                change={(v) => change(field.key, v)}
                rows={references[field.reference ?? ""] ?? []}
                invalid={invalid.includes(field.key)}
              />
            ))}
        </FormSection>
      ))}
    </Stack>
  );
}

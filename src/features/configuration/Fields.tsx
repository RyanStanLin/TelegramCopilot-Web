"use client";
import {
  Checkbox,
  FormControl,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@primer/react";
import { useI18n } from "@/i18n/provider";
import type { Resource } from "@/lib/types";
import { schema, type Field } from "./schema";
import type { Kind } from "@/lib/types";
import { formatDuration, parseDuration } from "@/lib/duration";
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
  return (
    <Stack gap="normal">
      {schema[kind]
        .filter((f) => !f.when || f.when(values))
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
    </Stack>
  );
}
function FieldControl({
  field: f,
  value,
  change,
  rows,
  invalid,
}: {
  field: Field;
  value: unknown;
  change: (value: unknown) => void;
  rows: Resource[];
  invalid: boolean;
}) {
  const { t, locale } = useI18n();
  const label = t(f.label ?? f.key);
  let duration: number | undefined;
  let badDuration = false;
  if (f.type === "duration" && value !== "") {
    try {
      duration = parseDuration(value);
      badDuration = duration < (f.min ?? 0) || duration > (f.max ?? Infinity);
    } catch {
      badDuration = true;
    }
  }
  const validation = invalid || badDuration ? ("error" as const) : undefined;
  return (
    <FormControl required={f.required}>
      {f.type === "boolean" && (
        <Checkbox
          checked={!!value}
          onChange={(e) => change(e.target.checked)}
        />
      )}
      <FormControl.Label>{label}</FormControl.Label>
      {f.reference || f.options ? (
        <Select
          size="medium"
          block
          value={String(value ?? "")}
          onChange={(e) => change(e.target.value)}
          validationStatus={validation}
        >
          {f.reference && (
            <Select.Option value="">
              {t(f.required ? "required" : "all")}
            </Select.Option>
          )}
          {f.reference
            ? rows.map((r) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.name}
                </Select.Option>
              ))
            : f.options?.map((o) => (
                <Select.Option key={o} value={o}>
                  {t(f.key === "dayOfWeek" ? `weekday${o}` : o)}
                </Select.Option>
              ))}
        </Select>
      ) : ["textarea", "json", "list"].includes(f.type ?? "") ? (
        <Textarea
          block
          rows={f.type === "json" ? 8 : 4}
          value={String(value ?? "")}
          onChange={(e) => change(e.target.value)}
          validationStatus={validation}
        />
      ) : (
        f.type !== "boolean" && (
          <TextInput
            size="medium"
            block
            type={
              f.type === "number"
                ? "number"
                : f.type === "password"
                  ? "password"
                  : "text"
            }
            value={String(value ?? "")}
            onChange={(e) => change(e.target.value)}
            validationStatus={validation}
            autoComplete="off"
          />
        )
      )}
      {invalid || badDuration ? (
        <FormControl.Validation variant="error">
          {t(
            f.type === "duration"
              ? "invalidDuration"
              : f.type === "json"
                ? "invalidJson"
                : "required",
          )}
          {f.type === "duration" &&
            ` (${formatDuration(f.min, locale)} – ${formatDuration(f.max, locale)})`}
        </FormControl.Validation>
      ) : (
        f.hint && (
          <FormControl.Caption>
            {t(f.hint)}
            {f.type === "duration" && duration !== undefined
              ? ` · ${formatDuration(duration, locale)}`
              : ""}
          </FormControl.Caption>
        )
      )}
    </FormControl>
  );
}

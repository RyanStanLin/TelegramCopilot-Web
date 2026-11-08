"use client";
import { Checkbox, FormControl, Textarea, TextInput } from "@primer/react";
import { useI18n } from "@/i18n/provider";
import type { Resource } from "@/lib/types";
import { Choice } from "@/components/Choice";
import { formatDuration, parseDuration } from "@/lib/duration";
import type { Field } from "./schema";
import numeric from "@/components/NumericText.module.css";
export function FieldControl({
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
  if (f.reference || f.options)
    return (
      <Choice
        label={label}
        value={String(value ?? "")}
        change={change}
        required={f.required}
        invalid={invalid}
        searchable={!!f.reference}
        caption={f.hint ? t(f.hint) : undefined}
        options={
          f.reference
            ? [
                { value: "", label: t(f.required ? "chooseOption" : "all") },
                ...rows.map((r) => ({ value: r.id, label: r.name })),
              ]
            : (f.options ?? []).map((o) => ({
                value: o,
                label: t(f.key === "dayOfWeek" ? `weekday${o}` : o),
              }))
        }
      />
    );
  return (
    <FormControl required={f.required}>
      {f.type === "boolean" && (
        <Checkbox
          checked={!!value}
          onChange={(e) => change(e.target.checked)}
        />
      )}
      <FormControl.Label>{label}</FormControl.Label>
      {["textarea", "json", "list"].includes(f.type ?? "") ? (
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
            className={
              ["number", "duration"].includes(f.type ?? "")
                ? numeric.number
                : undefined
            }
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

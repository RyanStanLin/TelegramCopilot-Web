"use client";
import { ActionList, ActionMenu, FormControl } from "@primer/react";
import { useId } from "react";
import { useI18n } from "@/i18n/provider";
import { ResourcePicker } from "./ResourcePicker";
export type ChoiceOption = { value: string; label: string };
export type ChoiceProps = {
  label: string;
  value: string;
  options: ChoiceOption[];
  change: (value: string) => void;
  searchable?: boolean;
  required?: boolean;
  invalid?: boolean;
  caption?: string;
};
export function Choice(props: ChoiceProps) {
  const {
    label,
    value,
    options,
    change,
    searchable,
    required,
    invalid,
    caption,
  } = props;
  const { t } = useI18n();
  const id = useId();
  const current =
    options.find((o) => o.value === value)?.label ?? t("chooseOption");
  return (
    <FormControl required={required}>
      <FormControl.Label id={`${id}-label`}>{label}</FormControl.Label>
      {searchable ? (
        <ResourcePicker {...props} id={id} current={current} />
      ) : (
        <ActionMenu>
          <ActionMenu.Button
            size="medium"
            aria-labelledby={`${id}-label ${id}-value`}
            aria-invalid={invalid || undefined}
            aria-describedby={
              invalid ? `${id}-error` : caption ? `${id}-caption` : undefined
            }
          >
            <span id={`${id}-value`}>{current}</span>
          </ActionMenu.Button>
          <ActionMenu.Overlay>
            <ActionList selectionVariant="single">
              {options.map((o) => (
                <ActionList.Item
                  key={o.value}
                  selected={o.value === value}
                  onSelect={() => change(o.value)}
                >
                  {o.label}
                </ActionList.Item>
              ))}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
      {invalid ? (
        <FormControl.Validation id={`${id}-error`} variant="error">
          {t("required")}
        </FormControl.Validation>
      ) : caption ? (
        <FormControl.Caption id={`${id}-caption`}>
          {caption}
        </FormControl.Caption>
      ) : null}
    </FormControl>
  );
}

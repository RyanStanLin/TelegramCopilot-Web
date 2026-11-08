"use client";
import { Button, SelectPanel, type SelectPanelItemInput } from "@primer/react";
import { TriangleDownIcon } from "@primer/octicons-react";
import { useState, type MouseEvent } from "react";
import { useI18n } from "@/i18n/provider";
import type { ChoiceProps } from "./Choice";
import css from "./Shared.module.css";
export function ResourcePicker({
  id,
  label,
  current,
  value,
  options,
  change,
  invalid,
  caption,
}: ChoiceProps & { id: string; current: string }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const items = options.map((o) => ({
    id: o.value || "unselected",
    text: o.label,
    onMouseDown: (event: MouseEvent) => event.preventDefault(),
  }));
  const filtered = items.filter((o) =>
    o.text.toLocaleLowerCase(locale).includes(filter.toLocaleLowerCase(locale)),
  );
  return (
    <>
      <SelectPanel
        title={label}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setFilter("");
        }}
        items={filtered}
        selected={items.find((o) => o.id === (value || "unselected"))}
        onSelectedChange={(o: SelectPanelItemInput | undefined) =>
          change(o?.id === "unselected" ? "" : String(o?.id ?? ""))
        }
        filterValue={filter}
        onFilterChange={setFilter}
        placeholder={t("chooseOption")}
        placeholderText={t("filterOptions")}
        inputLabel={t("filterOptions")}
        textInputProps={{ size: "medium" }}
        disableFullscreenOnNarrow
        displayInViewport
        announcementsEnabled={false}
        message={
          filtered.length
            ? undefined
            : {
                title: t("noOptions"),
                body: t("tryAnotherFilter"),
                variant: "empty",
              }
        }
        secondaryAction={
          <SelectPanel.SecondaryActionButton
            size="medium"
            onClick={() => setOpen(false)}
          >
            {t("close")}
          </SelectPanel.SecondaryActionButton>
        }
        renderAnchor={({ children: _children, ...anchor }) => (
          <Button
            {...anchor}
            size="medium"
            trailingAction={TriangleDownIcon}
            aria-labelledby={`${id}-label ${id}-value`}
            aria-invalid={invalid || undefined}
            aria-describedby={
              invalid ? `${id}-error` : caption ? `${id}-caption` : undefined
            }
          >
            <span id={`${id}-value`}>{current}</span>
          </Button>
        )}
      />
      {open && (
        <span className={css.srOnly} role="status">
          {t("optionCount").replace(
            "{count}",
            new Intl.NumberFormat(locale).format(filtered.length),
          )}
        </span>
      )}
    </>
  );
}

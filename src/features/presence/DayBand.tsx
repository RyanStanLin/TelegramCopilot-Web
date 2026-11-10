"use client";
import { Heading, Stack } from "@primer/react";
import { useId, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { NumericText } from "@/components/NumericText";
import { formatDuration } from "@/lib/duration";
import type { DayModel, SliceKind } from "./day-model";
import { clockTime, sliceLabels } from "./day-labels";
import css from "./ActivityCharts.module.css";
import layout from "./DailyActivity.module.css";

export function DayBand({ model, from, to, timeZone }: {
  model: DayModel; from: number; to: number; timeZone: string;
}) {
  const { t, locale } = useI18n();
  const heading = useId();
  const [cursor, setCursor] = useState<number | null>(null);
  const position = Math.min(to - 1, Math.max(from, cursor ?? from));
  const selected = model.slices.find((s) => s.from <= position && s.to > position);
  const duration = (to - from) / 1000;
  const at = (value: number) => ((value - from) / (to - from)) * 100;
  const description = selected
    ? `${clockTime(position, timeZone, locale, true)} · ${t(sliceLabels[selected.kind])} · ${formatDuration(selected.seconds, locale)}`
    : t("noActivityData");
  const kinds: SliceKind[] = ["online", "offline", "interrupted", "unobserved", "future"];
  return (
    <section aria-labelledby={heading}>
      <Stack gap="normal">
        <Heading as="h2" id={heading} className={layout.heading}>{t("dayChronology")}</Heading>
        <Stack direction="horizontal" gap="normal" wrap="wrap">
          {kinds.map((kind) => (
            <Stack key={kind} as="span" direction="horizontal" gap="condensed" align="center">
              <span className={css.key} data-kind={kind} aria-hidden="true" />
              <span className={layout.muted}>{t(sliceLabels[kind])}</span>
            </Stack>
          ))}
        </Stack>
        <svg className={css.band} viewBox="0 0 100 1" preserveAspectRatio="none"
          role="slider" tabIndex={0} aria-label={t("dayCursor")}
          aria-valuemin={0} aria-valuemax={duration} aria-valuenow={Math.floor((position - from) / 1000)}
          aria-valuetext={description}
          onKeyDown={(e) => {
            const values: Record<string, number> = { ArrowLeft: position - 60_000, ArrowDown: position - 60_000,
              ArrowRight: position + 60_000, ArrowUp: position + 60_000, Home: from, End: to - 1 };
            if (e.key in values) { e.preventDefault(); setCursor(Math.max(from, Math.min(to - 1, values[e.key]))); }
          }}
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            setCursor(from + Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)) * (to - from));
            e.currentTarget.focus();
          }}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse" && !e.buttons) return;
            const box = e.currentTarget.getBoundingClientRect();
            setCursor(from + Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)) * (to - from));
          }}>
          {model.slices.map((slice) => (
            <rect key={`${slice.id}-${slice.from}`} x={at(slice.from)} y={0}
              width={at(slice.to) - at(slice.from)} height={1} data-kind={slice.kind}
              data-from={slice.start} data-to={slice.end} className={css.segment}
              vectorEffect="non-scaling-stroke" />
          ))}
          {cursor !== null && <line x1={at(position)} x2={at(position)} y1={0} y2={1}
            className={css.cursor} vectorEffect="non-scaling-stroke" />}
        </svg>
        <Stack direction="horizontal" justify="space-between" className={css.axis}>
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <span key={fraction}><NumericText>{fraction === 1 ? "24:00"
              : clockTime(from + (to - from) * fraction, timeZone, locale)}</NumericText></span>
          ))}
        </Stack>
        <p className={layout.readout} aria-live="polite"><NumericText>{description}</NumericText></p>
        {duration !== 86_400 && <p className={layout.muted}>
          <NumericText>{t("daylightDay").replace("{hours}", new Intl.NumberFormat(locale).format(duration / 3600))}</NumericText>
        </p>}
      </Stack>
    </section>
  );
}

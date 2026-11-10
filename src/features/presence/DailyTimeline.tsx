"use client";
import { Details, Heading, Stack, Timeline } from "@primer/react";
import { AlertIcon, ArrowDownIcon, ArrowUpIcon, QuestionIcon } from "@primer/octicons-react";
import { useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { NumericText } from "@/components/NumericText";
import { Reason } from "@/components/Reason";
import { Pager } from "@/components/Pager";
import { formatDuration } from "@/lib/duration";
import type { DaySlice } from "./day-model";
import { clockTime, sliceLabels } from "./day-labels";
import { dayRange } from "./day-range";
import css from "./DailyActivity.module.css";

export function DailyTimeline({ rows, timeZone, day }: {
  rows: DaySlice[]; timeZone: string; day: string;
}) {
  const { t, locale } = useI18n();
  const heading = useId();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const endOfDay = dayRange(day, timeZone).to;
  const page = Math.max(1, Number(params.get("sessionPage")) || 1);
  const setPage = (n: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("sessionPage", String(n));
    router.push(`${path}?${next}`);
  };
  const current = Math.min(page, Math.max(1, Math.ceil(rows.length / 20)));
  return (
    <section aria-labelledby={heading} id="daily-events" tabIndex={-1} className={css.anchor}>
      <Stack gap="normal">
        <Heading as="h2" id={heading} className={css.heading}>{t("dailyActivityDetails")}</Heading>
        {!rows.length || rows.every((r) => r.reason === "NoObservation") ? (
          <p>{t("noActivityData")}</p>
        ) : (
          <>
            <Timeline clipSidebar>
              {rows.slice((current - 1) * 20, current * 20).map((row) => {
                const Icon = row.kind === "online" ? ArrowUpIcon : row.kind === "offline"
                  ? ArrowDownIcon : row.kind === "interrupted" ? AlertIcon : QuestionIcon;
                const label = row.kind === "online" && !row.startKnown ? "observedAlreadyOnline"
                  : row.kind === "offline" && !row.startKnown ? "observedAlreadyOffline"
                    : row.kind === "online" ? "wentOnline" : row.kind === "offline" ? "wentOffline" : sliceLabels[row.kind];
                return (
                  <Timeline.Item key={`${row.id}-${row.from}`}>
                    <Timeline.Badge variant={row.kind === "online" ? "success"
                      : row.kind === "interrupted" ? "danger" : undefined}>
                      <Icon size={16} aria-label={t(sliceLabels[row.kind])} />
                    </Timeline.Badge>
                    <Timeline.Body>
                      <Stack gap="condensed">
                        <Stack direction="horizontal" gap="normal" justify="space-between" wrap="wrap" align="baseline">
                          <strong><time dateTime={row.start}><NumericText>
                            {clockTime(row.from, timeZone, locale, true)}
                          </NumericText></time> · {t(label)}</strong>
                          <span><NumericText>{formatDuration(row.seconds, locale)}</NumericText></span>
                        </Stack>
                        <p className={css.muted}><NumericText>
                          {`${clockTime(row.from, timeZone, locale, true)} – ${row.to === endOfDay ? "24:00:00" : clockTime(row.to, timeZone, locale, true)}`}
                        </NumericText>{!row.endKnown && ` · ${t("observedBoundary")}`}</p>
                        {row.kind === "interrupted" || row.kind === "unobserved" ? <Reason value={row.reason} /> : null}
                        <Details>
                          <summary className={css.disclosure}>{t("observationDetails")}</summary>
                          <Stack gap="condensed" className={css.metadata}>
                            <Reason value={row.reason} />
                            <span>{t("observedAt")}: <NumericText>{new Intl.DateTimeFormat(locale, {
                              timeZone, dateStyle: "medium", timeStyle: "medium",
                            }).format(new Date(row.observedAt))}</NumericText></span>
                            {row.telegramAt && <span>{t("telegramAt")}: <NumericText>{new Intl.DateTimeFormat(locale, {
                              timeZone, dateStyle: "medium", timeStyle: "medium",
                            }).format(new Date(row.telegramAt))}</NumericText></span>}
                          </Stack>
                        </Details>
                      </Stack>
                    </Timeline.Body>
                  </Timeline.Item>
                );
              })}
            </Timeline>
            <Pager page={current} total={rows.length} size={20} change={setPage}
              parameter="sessionPage" focusId="daily-events" />
          </>
        )}
      </Stack>
    </section>
  );
}

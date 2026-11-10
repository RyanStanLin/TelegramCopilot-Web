"use client";
import { Button, Heading, IconButton, PageHeader, Stack } from "@primer/react";
import { DownloadIcon, SyncIcon } from "@primer/octicons-react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { Failure, Loading } from "@/components/Status";
import { Choice } from "@/components/Choice";
import { NumericText } from "@/components/NumericText";
import { ResourceAvatar } from "@/features/configuration/ResourceAvatar";
import { useLiveData } from "@/lib/use-live-data";
import type { Resource, Statistics } from "@/lib/types";
import type { TargetMonitoring } from "@/lib/monitoring-types";
import { query } from "@/lib/api";
import { dayRange, weekDays } from "./day-range";
import { dayModel } from "./day-model";
import { useDayTimeline } from "./use-day-timeline";
import { DailyControls } from "./DailyControls";
import { DailySummary } from "./DailySummary";
import { DayBand } from "./DayBand";
import { HourlyActivity } from "./HourlyActivity";
import { WeeklyActivity } from "./WeeklyActivity";
import { DailyTimeline } from "./DailyTimeline";
import { formatDuration } from "@/lib/duration";
import css from "./DailyActivity.module.css";

export function DailyActivity({ target, targets, day, timeZone, range, navigate, href }: {
  target: Resource; targets: Resource[]; day: string; timeZone: string;
  range: { from: number; to: number }; navigate: (changes: Record<string, string>) => void;
  href: (changes: Record<string, string>) => string;
}) {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const metric = params.get("metric") === "count" ? "count" : "duration";
  const timeline = useDayTimeline(target.id, range.from, range.to);
  const monitoring = useLiveData<TargetMonitoring>(`/targets/${target.id}/monitoring`);
  const week = useMemo(() => {
    const days = weekDays(day);
    return { days, from: dayRange(days[0], timeZone).from, to: dayRange(days[6], timeZone).to };
  }, [day, timeZone]);
  const statistics = useLiveData<Statistics>(`/targets/${target.id}/statistics?${query({
    from: new Date(week.from).toISOString(), to: new Date(week.to).toISOString(),
    timeZone, period: "day", pageSize: 7,
  })}`);
  const now = monitoring.data ? Date.parse(monitoring.data.now) : Date.now();
  const model = useMemo(() => timeline.rows ? dayModel(timeline.rows, range.from, range.to, now) : null,
    [timeline.rows, range.from, range.to, now]);
  const ready = !!model;
  useEffect(() => {
    if (ready && window.location.hash === "#daily-activity") {
      const section = document.getElementById("daily-activity");
      section?.focus({ preventScroll: true });
      section?.scrollIntoView({ block: "start" });
    }
  }, [ready, day, timeZone]);
  const refresh = () => { timeline.refresh(); statistics.refresh(); monitoring.refresh(); };
  return (
    <Stack gap="spacious">
      <PageHeader>
        <PageHeader.TitleArea>
          <PageHeader.Title as="h1" className={css.title}><NumericText>{t("personDailyActivity").replace("{name}", target.name)}</NumericText></PageHeader.Title>
        </PageHeader.TitleArea>
        <PageHeader.Actions>
          <IconButton size="medium" icon={SyncIcon} aria-label={t("refreshActivity")} onClick={refresh} />
          <Button as="a" size="medium" leadingVisual={DownloadIcon}
            href={`/api/backend/targets/${target.id}/export.csv?${query({ from: new Date(range.from).toISOString(), to: new Date(range.to).toISOString() })}`}>
            {t("exportDay")}
          </Button>
        </PageHeader.Actions>
      </PageHeader>
      <Stack direction="horizontal" gap="normal" align="center">
        <ResourceAvatar id={target.id} revision={target.revision} />
        <Stack gap="none">
          <strong><NumericText>{monitoring.data?.profile?.displayName ?? target.name}</NumericText></strong>
          <span className={css.muted}><NumericText>{new Intl.DateTimeFormat(locale, {
            timeZone, dateStyle: "full",
          }).format(new Date(range.from))}</NumericText> · {timeZone}</span>
        </Stack>
      </Stack>
      <DailyControls target={target} targets={targets} day={day} timeZone={timeZone} navigate={navigate} href={href} />
      {(timeline.error || statistics.error) && <Failure message="activityConnectionLost" retry={refresh} />}
      {!model ? (!timeline.error && <Loading />) : (
        <section id="daily-activity" tabIndex={-1} className={css.anchor}>
          <Stack gap="spacious">
            <DailySummary model={model} />
            {model.interruptedSeconds > 0 && <p className={css.muted}><NumericText>
              {t("interruptionReadout").replace("{duration}", formatDuration(model.interruptedSeconds, locale))}
            </NumericText></p>}
            <DayBand model={model} from={range.from} to={range.to} timeZone={timeZone} />
            <Stack direction="horizontal" align="center" justify="space-between" wrap="wrap" gap="normal">
              <Heading as="h2" className={css.heading}>{t("activityAnalysis")}</Heading>
              <Choice label={t("activityMetric")} value={metric}
                change={(v) => navigate({ metric: v })}
                options={[{ value: "duration", label: t("onlineSeconds") }, { value: "count", label: t("onlineStarts") }]} />
            </Stack>
            <Stack direction="horizontal" wrap="wrap" gap="normal">
              <Stack.Item grow shrink={false} className={css.chartColumn}><HourlyActivity model={model} timeZone={timeZone} metric={metric} /></Stack.Item>
              <Stack.Item grow shrink={false} className={css.chartColumn}>{statistics.data ? (
                <WeeklyActivity data={statistics.data} days={week.days} day={day} timeZone={timeZone}
                  metric={metric} select={(date) => navigate({ date })} />
              ) : !statistics.error && <Loading />}</Stack.Item>
            </Stack>
            <DailyTimeline rows={model.observed} timeZone={timeZone} day={day} />
          </Stack>
        </section>
      )}
    </Stack>
  );
}

"use client";
import { Button, Details, PageHeader, Stack } from "@primer/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { Failure, Loading } from "@/components/Status";
import { allResources } from "@/lib/api";
import type { Resource } from "@/lib/types";
import { dateKey, dayRange } from "./day-range";
import { DailyActivity } from "./DailyActivity";
import { PresenceHistory } from "./PresenceHistory";
import css from "./DailyActivity.module.css";

export function Presence() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [targets, setTargets] = useState<Resource[]>();
  const [error, setError] = useState(false);
  const [revision, refresh] = useState(0);
  const historyKey = JSON.stringify([params.get("target"), params.get("date"),
    params.get("timeZone"), params.get("from"), params.get("to")]);
  const [disclosure, setDisclosure] = useState({ key: historyKey, open: params.has("from") });
  const history = disclosure.key === historyKey ? disclosure.open : params.has("from");
  useEffect(() => {
    let active = true;
    setError(false);
    allResources("targets").then((v) => { if (active) setTargets(v); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [revision]);
  const timeZone = params.get("timeZone") ?? "Asia/Taipei";
  const target = params.get("target")
    ? targets?.find((v) => v.id === params.get("target")) : targets?.[0];
  function href(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    if (target) next.set("target", target.id);
    for (const [key, value] of Object.entries(changes)) next.set(key, value);
    if ("target" in changes || "date" in changes || "timeZone" in changes) next.delete("sessionPage");
    return `/presence?${next}${"date" in changes ? "#daily-activity" : ""}`;
  }
  let day = params.get("date") ?? "";
  let range: { from: number; to: number } | undefined;
  try {
    day ||= dateKey(Date.now(), timeZone);
    range = dayRange(day, timeZone);
    if (range.from > Date.now()) range = undefined;
  } catch {}
  return (
    <Stack gap="spacious">
      {error ? <Failure retry={() => refresh((n) => n + 1)} />
        : !targets ? <Loading /> : !target ? (
          <>
            <PageHeader><PageHeader.TitleArea><PageHeader.Title as="h1">{t("presence")}</PageHeader.Title></PageHeader.TitleArea></PageHeader>
            <p>{targets.length ? t("activityTargetMissing") : t("noTarget")}</p>
            <Button as="a" href="/targets" size="medium">{t("targets")}</Button>
          </>
        ) : !range ? (
          <><Failure message="invalidActivityDate" />
            <Button size="medium" onClick={() => router.push(href({ date: dateKey(Date.now(), "Asia/Taipei"), timeZone: "Asia/Taipei" }))}>
              {t("backToToday")}
            </Button></>
        ) : (
          <DailyActivity key={`${target.id}:${day}:${timeZone}`} target={target} targets={targets}
            day={day} timeZone={timeZone} range={range} href={href}
            navigate={(values) => router.push(href(values))} />
        )}
      <Details className={css.details} open={history}
        onToggle={(e) => setDisclosure({ key: historyKey, open: e.currentTarget.open })}>
        <summary className={css.disclosure}>{t("activityHistory")}</summary>
        {history && <PresenceHistory />}
      </Details>
    </Stack>
  );
}

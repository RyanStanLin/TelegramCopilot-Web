"use client";
import { Link, Stack } from "@primer/react";
import NextLink from "next/link";
import { useI18n } from "@/i18n/provider";
import { Reason } from "@/components/Reason";
import { formatDuration } from "@/lib/duration";
import type { Row } from "@/lib/types";
import css from "./EventList.module.css";
import { NumericText } from "@/components/NumericText";
export function EventList({ rows }: { rows: Row[] }) {
  const { t, locale } = useI18n();
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
  return (
    <section aria-label={t("events")} className={css.container}>
      {rows.length === 0 ? (
        <p className={css.empty}>{t("empty")}</p>
      ) : (
        <ul className={css.list}>
          {rows.map((r) => (
            <li key={r.id} className={css.row}>
              <Stack gap="condensed">
                <Stack
                  direction="horizontal"
                  gap="normal"
                  justify="space-between"
                  align="baseline"
                  wrap="wrap"
                >
                  <strong className={css.title}>
                    {r.targetId ? (
                      <Link as={NextLink} href={`/targets/${r.targetId}`}>
                        {String(r.name)}
                      </Link>
                    ) : (
                      String(r.name || t("systemEvent"))
                    )}
                    {" · "}
                    {t(String(r.type))}
                  </strong>
                  <time className={css.date} dateTime={String(r.at)}>
                    <NumericText>{date.format(new Date(String(r.at)))}</NumericText>
                  </time>
                </Stack>
                {r.type === "Offline" && (
                  <span>
                    {t("onlineSeconds")}:{" "}
                    <NumericText>{formatDuration(
                      r.onlineSeconds == null ? null : Number(r.onlineSeconds),
                      locale,
                    )}</NumericText>
                  </span>
                )}
                <Reason value={String(r.detail ?? "")} />
              </Stack>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

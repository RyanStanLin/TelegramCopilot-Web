"use client";
import { Heading, Stack } from "@primer/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useRef } from "react";
import { useI18n } from "@/i18n/provider";
import { Pager } from "@/components/Pager";
import type { Bucket } from "@/lib/types";
import { calendarMonths } from "./calendar-months";
import { MonthGrid } from "./MonthGrid";
import { ContributionLegend } from "./ContributionLegend";
import css from "./Contribution.module.css";
export function Contribution({
  days,
  target,
  timeZone,
}: {
  days: Bucket[];
  target: string;
  timeZone: string;
}) {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const id = useId();
  const swiped = useRef(false);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const months = calendarMonths(days, timeZone);
  const page = Math.min(
    months.length,
    Math.max(1, Number(params.get("calendarPage")) || months.length),
  );
  const month = months[page - 1];
  const href = (n: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("calendarPage", String(n));
    return `${path}?${next}`;
  };
  const change = (n: number) => {
    if (n >= 1 && n <= months.length) router.push(href(n), { scroll: false });
  };
  if (!month) return null;
  const title = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(month.year, month.month - 1, 1)));
  return (
    <section id={id} tabIndex={-1} aria-label={t("calendarMonth")}>
      <Stack gap="normal">
        <Heading as="h2" variant="small">
          {t("calendarMonth")}
        </Heading>
        <strong aria-live="polite">{title}</strong>
        <div
          className={css.scroll}
          role="region"
          aria-label={`${t("calendarMonth")} · ${title}`}
          tabIndex={0}
          onClickCapture={(e) => {
            if (swiped.current) {
              e.preventDefault();
              e.stopPropagation();
              swiped.current = false;
            }
          }}
          onPointerDown={(e) => {
            swiped.current = false;
            if (e.pointerType === "touch") {
              pointer.current = { x: e.clientX, y: e.clientY };
            }
          }}
          onPointerCancel={() => {
            pointer.current = null;
          }}
          onPointerUp={(e) => {
            const start = pointer.current;
            pointer.current = null;
            if (!start) return;
            const distance = e.clientX - start.x;
            if (
              Math.abs(distance) > 48 &&
              Math.abs(distance) > Math.abs(e.clientY - start.y)
            ) {
              swiped.current = true;
              e.preventDefault();
              change(page + (distance < 0 ? 1 : -1));
            }
          }}
        >
          <MonthGrid month={month} target={target} timeZone={timeZone} />
        </div>
        <ContributionLegend />
        {months.length > 1 && <p className={css.hint}>{t("calendarSwipe")}</p>}
        <Pager
          page={page}
          total={months.length}
          size={1}
          change={change}
          hrefBuilder={href}
          parameter="calendarPage"
          focusId={id}
        />
      </Stack>
    </section>
  );
}

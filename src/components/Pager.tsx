"use client";
import { Link, Pagination, Stack } from "@primer/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import css from "./Pager.module.css";
import { NumericText } from "./NumericText";
export function Pager({
  page,
  total,
  size,
  change,
  parameter = "page",
  hrefBuilder,
  focusId = "content",
}: {
  page: number;
  total: number;
  size: number;
  change: (page: number) => void;
  parameter?: string;
  hrefBuilder?: (page: number) => string;
  focusId?: string;
}) {
  const { t, locale } = useI18n();
  const path = usePathname();
  const params = useSearchParams();
  const pages = Math.ceil(total / size);
  const number = new Intl.NumberFormat(locale);
  const href =
    hrefBuilder ??
    ((n: number) => {
      const next = new URLSearchParams(params.toString());
      next.set(parameter, String(n));
      return `${path}?${next}`;
    });
  if (pages < 2) return null;
  return (
    <Stack gap="condensed" align="center">
      <span className={css.summary}>
        <NumericText>
          {t("pageSummary")
            .replace("{page}", number.format(page))
            .replace("{pages}", number.format(pages))}
        </NumericText>
      </span>
      <Pagination
        pageCount={pages}
        currentPage={page}
        surroundingPageCount={0}
        marginPageCount={1}
        showPages
        hrefBuilder={href}
        aria-label={t("pagination")}
        className={css.pagination}
        onPageChange={(e, n) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          change(n);
          document.getElementById(focusId)?.focus();
        }}
        renderPage={({ key, number: n, children: _children, ...props }) => (
          <Link
            key={key}
            {...props}
            aria-label={
              props.rel === "prev"
                ? t("previous")
                : props.rel === "next"
                  ? t("next")
                  : t("pageNumber").replace("{page}", number.format(n))
            }
          >
            {props.rel === "prev" ? (
              t("previous")
            ) : props.rel === "next" ? (
              t("next")
            ) : (
              <NumericText>{number.format(n)}</NumericText>
            )}
          </Link>
        )}
      />
    </Stack>
  );
}

"use client";
import { Banner, Button, Spinner } from "@primer/react";
import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/provider";
export function Loading() {
  const { t } = useI18n();
  return <Spinner size="medium" srText={t("loading")} delay />;
}
export function Failure({
  retry,
  message = "error",
  focus = false,
}: {
  retry?: () => void;
  message?: string;
  focus?: boolean;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus();
  }, [focus]);
  return (
    <div ref={ref} tabIndex={-1}>
      <Banner
        variant="critical"
        title={t(message)}
        primaryAction={
          retry ? (
            <Button size="medium" onClick={retry}>
              {t("retry")}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
export { Pager } from "./Pager";

"use client";
import { UnderlinePanels } from "@primer/react/experimental";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { TargetMonitoring } from "./TargetMonitoring";
import css from "./TargetMonitoring.module.css";
export function TargetDetail({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const params = useSearchParams();
  return (
    <UnderlinePanels
      aria-label={t("targetNavigation")}
      defaultValue={params.get("tab") === "settings" ? "settings" : "overview"}
      className={css.tabs}
    >
      <UnderlinePanels.Tab value="overview">
        {t("overview")}
      </UnderlinePanels.Tab>
      <UnderlinePanels.Tab value="settings">
        {t("configuration")}
      </UnderlinePanels.Tab>
      <UnderlinePanels.Panel className={css.panel} value="overview">
        <TargetMonitoring key={id} id={id} />
      </UnderlinePanels.Panel>
      <UnderlinePanels.Panel className={css.panel} value="settings">
        {children}
      </UnderlinePanels.Panel>
    </UnderlinePanels>
  );
}

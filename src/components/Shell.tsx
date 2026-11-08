"use client";
import {
  IconButton,
  Link,
  PageLayout,
  Stack,
  UnderlineNav,
} from "@primer/react";
import { SignOutIcon, ThreeBarsIcon } from "@primer/octicons-react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { Language } from "./Language";
import { MonitoringPulse } from "./MonitoringPulse";
import { Navigation } from "./Navigation";
import { NavigationDialog } from "./NavigationDialog";
import css from "./Shell.module.css";
const contexts = [
  ["targets", "presence"],
  ["schedules", "rules", "destinations"],
  ["events", "deliveries"],
  ["accounts", "settings"],
];
export function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const context =
    contexts.find((g) => g.some((s) => path.startsWith(`/${s}`))) ??
    contexts[0];
  return (
    <>
      <Link className={css.skip} href="#content">
        {t("skip")}
      </Link>
      <header className={css.header}>
        <Stack
          direction="horizontal"
          align="center"
          justify="space-between"
          gap="condensed"
          padding="normal"
        >
          <Stack direction="horizontal" align="center" gap="condensed">
            <IconButton
              size="medium"
              ref={trigger}
              icon={ThreeBarsIcon}
              aria-label={t("openMenu")}
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            />
            <Link as={NextLink} href="/targets" className={css.brand}>
              TelegramCopilot
            </Link>
          </Stack>
          <Stack direction="horizontal" align="center" gap="condensed">
            <Language compact />
            <IconButton
              size="medium"
              icon={SignOutIcon}
              aria-label={t("logout")}
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.replace("/login");
              }}
            />
          </Stack>
        </Stack>
        <UnderlineNav aria-label={t("sectionNavigation")}>
          {context.map((s) => (
            <UnderlineNav.Item
              as={NextLink}
              key={s}
              href={`/${s}`}
              aria-current={path.startsWith(`/${s}`) ? "page" : undefined}
            >
              {t(s)}
            </UnderlineNav.Item>
          ))}
        </UnderlineNav>
      </header>
      <PageLayout containerWidth="xlarge" padding="normal">
        <PageLayout.Pane
          position="start"
          width="small"
          hidden={{ narrow: true }}
          divider="line"
          aria-label={t("mainNavigation")}
        >
          <Navigation />
        </PageLayout.Pane>
        <PageLayout.Content>
          <section id="content" tabIndex={-1} className={css.content}>
            <Stack gap="spacious">
              <MonitoringPulse />
              {children}
            </Stack>
          </section>
        </PageLayout.Content>
      </PageLayout>
      {open && (
        <NavigationDialog close={() => setOpen(false)} trigger={trigger} />
      )}
    </>
  );
}

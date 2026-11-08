"use client";
import { ActionList, ActionMenu, IconButton } from "@primer/react";
import { GlobeIcon } from "@primer/octicons-react";
import { useI18n, type Locale } from "@/i18n/provider";
const languages: { value: Locale; label: string; flag: string }[] = [
  { value: "zh-CN", label: "简体中文", flag: "🇨🇳" },
  { value: "en", label: "English", flag: "🇬🇧" },
];
export function Language({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const current = languages.find((l) => l.value === locale)!;
  return (
    <ActionMenu>
      {compact ? (
        <ActionMenu.Anchor>
          <IconButton
            size="medium"
            icon={GlobeIcon}
            aria-label={`${t("language")}: ${current.label}`}
          />
        </ActionMenu.Anchor>
      ) : (
        <ActionMenu.Button
          size="medium"
          aria-label={`${t("language")}: ${current.label}`}
        >
          <span aria-hidden="true">{current.flag}</span> {current.label}
        </ActionMenu.Button>
      )}
      <ActionMenu.Overlay align="end">
        <ActionList selectionVariant="single">
          {languages.map((l) => (
            <ActionList.Item
              key={l.value}
              selected={locale === l.value}
              onSelect={() => setLocale(l.value)}
            >
              <ActionList.LeadingVisual>
                <span aria-hidden="true">{l.flag}</span>
              </ActionList.LeadingVisual>
              {l.label}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}

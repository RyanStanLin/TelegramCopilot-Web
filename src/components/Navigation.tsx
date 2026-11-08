"use client";
import { NavList } from "@primer/react";
import {
  PeopleIcon,
  PulseIcon,
  PersonIcon,
  ClockIcon,
  BellIcon,
  DeviceMobileIcon,
  LogIcon,
  InboxIcon,
  GearIcon,
} from "@primer/octicons-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/provider";
const groups = [
  [
    ["targets", PeopleIcon],
    ["presence", PulseIcon],
  ],
  [
    ["schedules", ClockIcon],
    ["rules", BellIcon],
    ["destinations", DeviceMobileIcon],
  ],
  [
    ["events", LogIcon],
    ["deliveries", InboxIcon],
  ],
  [
    ["accounts", PersonIcon],
    ["settings", GearIcon],
  ],
] as const;
export function Navigation({ close }: { close?: () => void }) {
  const { t } = useI18n();
  const path = usePathname();
  return (
    <NavList aria-label={t("mainNavigation")}>
      {groups.map((group, index) => (
        <NavList.Group key={index}>
          {group.map(([section, Icon]) => (
            <NavList.Item
              as={NextLink}
              key={section}
              href={`/${section}`}
              aria-current={path.startsWith(`/${section}`) ? "page" : undefined}
              onClick={close}
            >
              <NavList.LeadingVisual>
                <Icon size={16} />
              </NavList.LeadingVisual>
              {t(section)}
            </NavList.Item>
          ))}
        </NavList.Group>
      ))}
    </NavList>
  );
}

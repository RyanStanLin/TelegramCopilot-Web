import type { SliceKind } from "./day-model";

export const sliceLabels: Record<SliceKind, string> = {
  online: "Online", offline: "Offline", interrupted: "monitoringInterrupted",
  unobserved: "unknownActivity", future: "futureActivity",
};
export function clockTime(value: number | string, timeZone: string, locale: string, seconds = false) {
  return new Intl.DateTimeFormat(locale, {
    timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    ...(seconds ? { second: "2-digit" } : {}),
  }).format(new Date(value));
}

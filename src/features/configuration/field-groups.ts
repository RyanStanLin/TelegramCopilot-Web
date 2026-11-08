import type { Kind } from "@/lib/types";
export const fieldGroups: Record<Kind, { title: string; keys: string[] }[]> = {
  accounts: [
    { title: "telegramConnection", keys: ["apiId", "apiHash", "phone"] },
  ],
  targets: [
    {
      title: "monitoringSettings",
      keys: ["accountId", "identifier", "refreshSeconds"],
    },
  ],
  schedules: [
    { title: "messageSettings", keys: ["accountId", "recipient", "message"] },
    {
      title: "scheduleSettings",
      keys: [
        "frequency",
        "timeZone",
        "localTime",
        "dayOfWeek",
        "dayOfMonth",
        "month",
      ],
    },
  ],
  destinations: [
    { title: "pushConnection", keys: ["serverUrl", "deviceKeys"] },
    {
      title: "encryptionSettings",
      keys: [
        "encryptionEnabled",
        "encryptionKey",
        "encryptionIV",
        "encryptionMode",
      ],
    },
  ],
  rules: [
    { title: "ruleTrigger", keys: ["destinationId", "event", "targetId"] },
    {
      title: "notificationContent",
      keys: ["title", "body", "subtitle", "group"],
    },
    { title: "advancedSettings", keys: ["parameters"] },
  ],
  settings: [
    {
      title: "workerSettings",
      keys: [
        "timeZone",
        "heartbeatSeconds",
        "staleAfterSeconds",
        "schedulerGraceSeconds",
      ],
    },
  ],
};

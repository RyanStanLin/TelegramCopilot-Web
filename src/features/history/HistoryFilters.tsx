"use client";
import { Button, FormControl, Stack, TextInput } from "@primer/react";
import { Choice } from "@/components/Choice";
import { useI18n } from "@/i18n/provider";
type Props = {
  section: "events" | "deliveries";
  from: string;
  to: string;
  filter: string;
  entity: string;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  setFilter: (value: string) => void;
  setEntity: (value: string) => void;
  apply: () => void;
};
export function HistoryFilters({
  section,
  from,
  to,
  filter,
  entity,
  setFrom,
  setTo,
  setFilter,
  setEntity,
  apply,
}: Props) {
  const { t } = useI18n();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
    >
      <Stack direction="horizontal" align="end" gap="normal" wrap="wrap">
        {section === "events" && (
          <>
            {[
              ["from", from, setFrom],
              ["to", to, setTo],
            ].map(([key, value, setter]) => (
              <FormControl key={String(key)}>
                <FormControl.Label>{t(String(key))}</FormControl.Label>
                <TextInput
                  size="medium"
                  value={String(value)}
                  onChange={(e) =>
                    (setter as (v: string) => void)(e.target.value)
                  }
                />
              </FormControl>
            ))}
          </>
        )}
        <Choice
          label={t(section === "events" ? "type" : "channel")}
          value={filter}
          change={setFilter}
          options={[
            { value: "", label: t("all") },
            ...(section === "events"
              ? [
                  "Online",
                  "Offline",
                  "Unknown",
                  "Error",
                  "AccountReady",
                  "AccountUnavailable",
                  "WorkerStarted",
                  "WorkerStopped",
                  "MessageSent",
                  "MessageFailed",
                  "MonitorRestored",
                ]
              : ["Telegram", "Bark"]
            ).map((v) => ({ value: v, label: t(v) })),
          ]}
        />
        <FormControl>
          <FormControl.Label>
            {t(section === "events" ? "targetId" : "resource")}
          </FormControl.Label>
          <TextInput
            size="medium"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
          />
        </FormControl>
        <Button size="medium" type="submit">
          {t("apply")}
        </Button>
      </Stack>
    </form>
  );
}

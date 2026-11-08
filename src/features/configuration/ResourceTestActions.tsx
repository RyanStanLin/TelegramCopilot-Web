"use client";
import { Banner, Button, Heading, Link, Stack } from "@primer/react";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { api } from "@/lib/api";
import { Failure } from "@/components/Status";
import { RuleValidation, type RuleCheck } from "./RuleValidation";
import { NumericText } from "@/components/NumericText";

type Delivery = {
  id: string;
  status: string;
  error?: string | null;
  externalId?: string | null;
};
export function ResourceTestActions({
  kind,
  id,
  dirty,
  getDraft,
  changeToken,
  recipient,
}: {
  kind: "schedules" | "rules";
  id: string;
  dirty: boolean;
  getDraft: () => {
    name: string;
    enabled: boolean;
    settings: Record<string, unknown>;
  };
  changeToken: string;
  recipient?: string;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [check, setCheck] = useState<RuleCheck>();
  const [result, setResult] = useState<{ deliveries: Delivery[] }>();
  useEffect(() => {
    setCheck(undefined);
    setResult(undefined);
    setError(undefined);
  }, [changeToken]);
  async function validate() {
    setError(undefined);
    setBusy(true);
    try {
      setCheck(
        await api<RuleCheck>("/rules/validate", {
          method: "POST",
          body: JSON.stringify(getDraft()),
        }),
      );
    } catch {
      setError("validationFailed");
    } finally {
      setBusy(false);
    }
  }
  async function test() {
    if (busy || dirty || id === "new") return;
    setBusy(true);
    setError(undefined);
    setResult(undefined);
    try {
      if (kind === "rules") {
        const verified = await api<RuleCheck>("/rules/validate", {
          method: "POST",
          body: JSON.stringify(getDraft()),
        });
        setCheck(verified);
        if (!verified.valid) return;
      }
      setResult(
        await api(`/${kind}/${id}/test`, {
          method: "POST",
          body: JSON.stringify({ requestId: crypto.randomUUID() }),
        }),
      );
    } catch {
      setError("manualTestRequestFailed");
    } finally {
      setBusy(false);
    }
  }
  const sent =
    result?.deliveries.filter((row) => row.status === "Sent").length ?? 0;
  const total = result?.deliveries.length ?? 0;
  return (
    <section aria-labelledby="resource-test-heading">
      <Stack gap="normal">
        <Heading id="resource-test-heading" as="h2" variant="small">
          {t(kind === "rules" ? "ruleTests" : "scheduleTest")}
        </Heading>
        <p>
          {t(kind === "rules" ? "ruleTestHelp" : "scheduleTestHelp")}{" "}
          {recipient}
        </p>
        {(dirty || id === "new") && <p>{t("saveBeforeTest")}</p>}
        <Stack direction="horizontal" gap="condensed" wrap="wrap">
          {kind === "rules" && (
            <Button
              size="medium"
              onClick={() => void validate()}
              disabled={busy}
            >
              {t("validateRule")}
            </Button>
          )}
          <Button
            size="medium"
            onClick={() => void test()}
            loading={busy}
            loadingAnnouncement={t("loading")}
            disabled={dirty || id === "new" || busy}
          >
            {t(kind === "rules" ? "sendTestNotification" : "sendTestMessage")}
          </Button>
        </Stack>
        {error && <Failure message={error} />}
        {check && <RuleValidation value={check} />}
        {result && (
          <Stack gap="condensed">
            <Banner
              variant={
                sent === total && total > 0
                  ? "success"
                  : sent > 0
                    ? "warning"
                    : "critical"
              }
              title={t(
                sent === total && total > 0
                  ? "manualTestSent"
                  : sent > 0
                    ? "manualTestPartial"
                    : "manualTestFailed",
              )}
              description={
                <NumericText>{`${sent}/${total} ${t("deliveriesSent")}`}</NumericText>
              }
            />
            <ul>
              {result.deliveries.map((row, index) => (
                <li key={row.id}>
                  {t("testDelivery")} <NumericText>{index + 1}</NumericText>:{" "}
                  {t(row.status)}
                  {row.error ? ` · ${t(row.error)}` : ""}
                </li>
              ))}
            </ul>
            <Link as={NextLink} href={`/deliveries?resourceId=${id}`}>
              {t("viewTestDeliveries")}
            </Link>
          </Stack>
        )}
      </Stack>
    </section>
  );
}

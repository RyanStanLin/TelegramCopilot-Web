"use client";
import { Banner, Button, Heading, Stack } from "@primer/react";
import { useI18n } from "@/i18n/provider";
import { Loading } from "@/components/Status";
import { LoginChallenge } from "./LoginChallenge";
import { useAccountLogin } from "./use-account-login";
import { formatDuration } from "@/lib/duration";
import { NumericText } from "@/components/NumericText";

const steps: Record<string, [string, string, string?]> = {
  authorizationStateWaitPhoneNumber: [
    "loginPhoneTitle",
    "loginPhoneHelp",
    "phone",
  ],
  authorizationStateWaitCode: ["loginCodeTitle", "loginCodeHelp", "code"],
  authorizationStateWaitPassword: [
    "loginPasswordTitle",
    "loginPasswordHelp",
    "password",
  ],
  authorizationStateWaitEmailAddress: [
    "loginEmailTitle",
    "loginEmailHelp",
    "email",
  ],
  authorizationStateWaitEmailCode: [
    "loginEmailCodeTitle",
    "loginEmailCodeHelp",
    "emailCode",
  ],
  authorizationStateReady: ["loginReadyTitle", "loginReadyHelp"],
  Inactive: ["loginInactiveTitle", "loginInactiveHelp"],
  authorizationStateWaitRegistration: [
    "loginRegistrationTitle",
    "loginRegistrationHelp",
  ],
  authorizationStateWaitPremiumPurchase: [
    "loginPremiumTitle",
    "loginPremiumHelp",
  ],
  authorizationStateWaitOtherDeviceConfirmation: [
    "loginDeviceTitle",
    "loginDeviceHelp",
  ],
  authorizationStateClosed: ["loginClosedTitle", "loginClosedHelp"],
  authorizationStateClosing: ["loginStartingTitle", "loginStartingHelp"],
  authorizationStateLoggingOut: ["loginStartingTitle", "loginStartingHelp"],
};

export function AccountLogin({ id, phone }: { id: string; phone: string }) {
  const { t, locale } = useI18n();
  const { status, error, retryAfter, busy, refresh, submit } =
    useAccountLogin(id);
  const [title, help, type] = steps[status?.authorizationState ?? ""] ?? [
    "loginStartingTitle",
    "loginStartingHelp",
  ];
  const problem = error ?? status?.error;
  const ready = status?.authorizationState === "authorizationStateReady";
  const wait = retryAfter ?? status?.retryAfterSeconds;
  return (
    <section aria-labelledby="telegram-login-heading">
      <Stack gap="normal">
        <Heading id="telegram-login-heading" as="h2" variant="small">
          {t("accountStatus")}
        </Heading>
        {!status && !error && <Loading />}
        {status && (
          <div role="status" aria-live="polite">
            <Banner
              variant={ready ? "success" : "info"}
              description={<NumericText>{t(help)}</NumericText>}
            >
              <Banner.Title>
                <NumericText>{t(title)}</NumericText>
              </Banner.Title>
            </Banner>
          </div>
        )}
        {problem && (
          <Banner
            variant="critical"
            title={t(problem) === problem ? t("loginRejected") : t(problem)}
            description={
              wait ? (
                <NumericText>{`${t("loginRetryAfter")} ${formatDuration(wait, locale)}`}</NumericText>
              ) : undefined
            }
          />
        )}
        {ready && status.connectionState !== "connectionStateReady" && (
          <p>{t("loginReconnecting")}</p>
        )}
        {type && (
          <LoginChallenge
            key={`${id}:${type}`}
            type={type}
            phone={status?.login?.phoneNumber ?? phone}
            details={status?.login}
            busy={busy}
            submit={submit}
          />
        )}
        {(problem === "PHONE_CODE_EXPIRED" ||
          problem === "AUTH_RESTART" ||
          problem === "EMAIL_CODE_EXPIRED") && (
          <Button
            size="medium"
            onClick={() => void submit("phone", phone)}
            disabled={busy}
          >
            {t("loginSendCode")}
          </Button>
        )}
        <Button size="medium" onClick={() => void refresh()} disabled={busy}>
          {t("statusRefresh")}
        </Button>
      </Stack>
    </section>
  );
}

"use client";
import { Button, FormControl, Stack, TextInput } from "@primer/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";
import type { AccountStatus } from "./use-account-login";
import { NumericText } from "@/components/NumericText";
import numeric from "@/components/NumericText.module.css";

const deliveryHelp: Record<string, string> = {
  authenticationCodeTypeTelegramMessage: "loginViaTelegram",
  authenticationCodeTypeSms: "loginViaSms",
  authenticationCodeTypeSmsWord: "loginViaSms",
  authenticationCodeTypeSmsPhrase: "loginViaSms",
  authenticationCodeTypeCall: "loginViaCall",
  authenticationCodeTypeMissedCall: "loginViaMissedCall",
};

export function LoginChallenge({
  type,
  phone,
  details,
  busy,
  submit,
}: {
  type: string;
  phone: string;
  details: AccountStatus["login"];
  busy: boolean;
  submit: (type: string, value: string) => Promise<boolean>;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, []);
  const isPhone = type === "phone";
  const isCode = type === "code" || type === "emailCode";
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        if (
          await submit(
            type,
            isPhone ? phone : type === "password" ? value : value.trim(),
          )
        )
          setValue("");
      }}
    >
      <Stack gap="normal">
        {isPhone ? (
          <p>
            {t("loginSavedPhone")} <NumericText>{phone}</NumericText>
          </p>
        ) : (
          <FormControl required disabled={busy}>
            <FormControl.Label>{t(type)}</FormControl.Label>
            <TextInput
              className={isCode ? numeric.number : undefined}
              ref={input}
              size="medium"
              block
              value={value}
              required
              type={
                type === "password"
                  ? "password"
                  : type === "email"
                    ? "email"
                    : "text"
              }
              autoComplete={
                isCode
                  ? "one-time-code"
                  : type === "password"
                    ? "current-password"
                    : "email"
              }
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => setValue(event.target.value)}
            />
            <FormControl.Caption>
              {type === "code" &&
                t(deliveryHelp[details?.delivery ?? ""] ?? "loginCodeHelp")}
              {isCode && !!details?.codeLength && (
                <NumericText>{` · ${details.codeLength} ${t("loginCodeCharacters")}`}</NumericText>
              )}
              {type === "password" &&
                (details?.passwordHint
                  ? `${t("loginPasswordHint")} ${details.passwordHint}`
                  : t("loginPasswordHelp"))}
              {type === "email" && t("loginEmailHelp")}
              {type === "emailCode" &&
                `${t("loginEmailSentTo")} ${details?.emailAddressPattern ?? ""}`}
            </FormControl.Caption>
          </FormControl>
        )}
        <Button
          size="medium"
          variant="primary"
          type="submit"
          loading={busy}
          loadingAnnouncement={t("loginSubmitting")}
          disabled={!isPhone && !value.trim()}
        >
          {t(
            isPhone
              ? "loginSendCode"
              : type === "password"
                ? "loginVerifyPassword"
                : type === "email"
                  ? "loginContinue"
                  : "loginVerifyCode",
          )}
        </Button>
      </Stack>
    </form>
  );
}

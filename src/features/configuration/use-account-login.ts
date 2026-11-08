"use client";
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useLiveData } from "@/lib/use-live-data";

export type AccountStatus = {
  authorizationState: string;
  connectionState: string;
  error?: string | null;
  retryAfterSeconds?: number | null;
  login?: {
    type: string;
    phoneNumber?: string | null;
    delivery?: string | null;
    codeLength?: number | null;
    passwordHint?: string | null;
    emailAddressPattern?: string | null;
  } | null;
};

export function useAccountLogin(id: string) {
  const live = useLiveData<AccountStatus>(`/accounts/${id}/status`);
  const status = live.data;
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number>();
  const submitting = useRef(false);
  const active = useRef(false);
  const lastState = useRef<string>(undefined);
  useEffect(() => {
    if (!status) return;
    if (lastState.current && lastState.current !== status.authorizationState)
      setError(undefined);
    lastState.current = status.authorizationState;
  }, [status]);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  async function submit(type: string, value: string) {
    if (submitting.current) return false;
    submitting.current = true;
    setBusy(true);
    setError(undefined);
    setRetryAfter(undefined);
    try {
      const result = await api<AccountStatus>(`/accounts/${id}/login`, {
        method: "POST",
        body: JSON.stringify({ type, value }),
      });
      if (active.current) live.update(result);
      return true;
    } catch (cause) {
      if (active.current) {
        setError(
          cause instanceof ApiError
            ? (cause.code ??
                (cause.status === 504
                  ? "loginTimeout"
                  : cause.status === 502
                    ? "loginServiceUnavailable"
                    : "loginRejected"))
            : "loginServiceUnavailable",
        );
        if (cause instanceof ApiError) setRetryAfter(cause.retryAfterSeconds);
      }
      return false;
    } finally {
      submitting.current = false;
      if (active.current) {
        setBusy(false);
        live.refresh();
      }
    }
  }
  return {
    status,
    error: error ?? (live.error ? "loginStatusUnavailable" : undefined),
    retryAfter,
    busy,
    refresh: live.refresh,
    submit,
  };
}

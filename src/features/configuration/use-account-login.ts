"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";

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
  const [status, setStatus] = useState<AccountStatus>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number>();
  const submitting = useRef(false);
  const version = useRef(0);
  const active = useRef(false);
  const lastState = useRef<string>(undefined);
  const refresh = useCallback(async () => {
    if (submitting.current) return;
    const current = ++version.current;
    try {
      const result = await api<AccountStatus>(`/accounts/${id}/status`);
      if (active.current && current === version.current) {
        if (
          lastState.current &&
          lastState.current !== result.authorizationState
        )
          setError(undefined);
        lastState.current = result.authorizationState;
        setStatus(result);
        setError((previous) =>
          previous === "loginStatusUnavailable" ? undefined : previous,
        );
      }
    } catch {
      if (active.current && current === version.current)
        setError("loginStatusUnavailable");
    }
  }, [id]);
  useEffect(() => {
    active.current = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      await refresh();
      if (active.current) timer = setTimeout(poll, 2000);
    };
    void poll();
    return () => {
      active.current = false;
      version.current++;
      clearTimeout(timer);
    };
  }, [refresh]);

  async function submit(type: string, value: string) {
    if (submitting.current) return false;
    submitting.current = true;
    version.current++;
    setBusy(true);
    setError(undefined);
    setRetryAfter(undefined);
    try {
      const result = await api<AccountStatus>(`/accounts/${id}/login`, {
        method: "POST",
        body: JSON.stringify({ type, value }),
      });
      if (active.current) setStatus(result);
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
        void refresh();
      }
    }
  }
  return { status, error, retryAfter, busy, refresh, submit };
}

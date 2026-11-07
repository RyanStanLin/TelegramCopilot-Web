"use client";
import { useEffect, useState } from "react";
import { api } from "./api";

export function useLiveData<T>(path: string, interval = 2000) {
  const [revision, reload] = useState(0);
  const [state, setState] = useState<{
    path: string;
    data?: T;
    error: boolean;
  }>({ path, error: false });
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const read = async () => {
      try {
        const data = await api<T>(path);
        if (active) setState({ path, data, error: false });
      } catch {
        if (active)
          setState((previous) => ({
            path,
            data: previous.path === path ? previous.data : undefined,
            error: true,
          }));
      }
      if (active) timer = setTimeout(read, interval);
    };
    void read();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [path, interval, revision]);
  return {
    data: state.path === path ? state.data : undefined,
    error: state.path === path && state.error,
    refresh: () => reload((n) => n + 1),
  };
}

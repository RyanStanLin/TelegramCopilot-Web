"use client";
import { useCallback, useEffect, useState } from "react";
import { realtime } from "./realtime-client";

export function useLiveData<T>(path: string) {
  const [state, setState] = useState<{
    path: string;
    data?: T;
    error: boolean;
  }>({ path, error: false });
  useEffect(() => {
    return realtime.subscribe(path, (value) =>
      setState({ path, data: value.data as T | undefined, error: value.error }),
    );
  }, [path]);
  const refresh = useCallback(() => realtime.refresh(path), [path]);
  const update = useCallback((data: T) => realtime.update(path, data), [path]);
  return {
    data: state.path === path ? state.data : undefined,
    error: state.path === path && state.error,
    refresh,
    update,
  };
}

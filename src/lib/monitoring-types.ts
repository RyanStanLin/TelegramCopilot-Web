import type { Bucket } from "./types";
export type MonitoringOverview = {
  now: string;
  health: {
    status: string;
    heartbeat?: string | null;
    nativeAvailable: boolean;
  };
  pollCount: number;
  successfulPollCount?: number;
  failedPollCount?: number;
  enabledTargets: number;
  lastPollAt?: string | null;
};
export type TargetMonitoring = {
  targetId: string;
  enabled: boolean;
  pollCount: number;
  successfulPollCount: number;
  failedPollCount: number;
  lastPollStartedAt?: string | null;
  lastPollCompletedAt?: string | null;
  lastSuccessfulPollAt?: string | null;
  nextPollAt?: string | null;
  state: string;
  reason: string;
  error?: string | null;
  isPolling: boolean;
  now: string;
  activity?: { timeZone: string; today: Bucket; week: Bucket } | null;
  profile?: {
    userId: number;
    displayName: string;
    username?: string | null;
    hasAvatar: boolean;
    avatarVersion?: string | null;
    telegramStatus?: string | null;
    lastSeenAt?: string | null;
    updatedAt?: string | null;
  } | null;
};

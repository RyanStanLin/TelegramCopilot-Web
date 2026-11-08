import { expect, type Page, type TestInfo } from "@playwright/test";
import { realtimeFixture } from "./realtime-fixture";

export async function verifyMonitoringDetails(page: Page, info: TestInfo) {
  const targets = await (await page.request.get("/api/backend/targets")).json();
  const target = targets.items.find(
    (row: { name: string }) => row.name === "QA renamed user",
  );
  expect(target).toBeTruthy();
  const at = "2026-11-08T00:00:00Z";
  let count = 17;
  let coarse = false;
  const realtime = await realtimeFixture(page);
  const path = `/targets/${target.id}/monitoring`;
  realtime.set(path, () => ({
    targetId: target.id,
    enabled: true,
    pollCount: count,
    successfulPollCount: count - 2,
    failedPollCount: 2,
    lastPollStartedAt: at,
    lastPollCompletedAt: at,
    lastSuccessfulPollAt: at,
    nextPollAt: "2026-11-08T00:00:05Z",
    state: coarse ? "Unknown" : "Offline",
    reason: "CachedReconciliation",
    error: null,
    isPolling: false,
    now: at,
    activity: {
      timeZone: "Asia/Taipei",
      today: { onlineSeconds: 3600, count: 1 },
      week: { onlineSeconds: 9000, count: 3 },
    },
    profile: {
      userId: 42,
      displayName: "Alice Lee",
      username: "alice",
      hasAvatar: true,
      avatarVersion: "qa-photo",
      telegramStatus: coarse ? "userStatusRecently" : "userStatusOffline",
      lastSeenAt: coarse ? null : "2026-11-07T22:00:00Z",
      updatedAt: at,
    },
  }));
  await page.route(`**/api/backend/targets/${target.id}/avatar?*`, (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kQ6sAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  await page.goto(`/targets/${target.id}`);
  const region = page.getByRole("region", {
    name: "Telegram 用户与实时检测",
    exact: true,
  });
  await expect(region.getByText("Alice Lee", { exact: true })).toBeVisible();
  await expect(region.getByText("@alice", { exact: true })).toBeVisible();
  await expect(region.getByText("17", { exact: true }).first()).toBeVisible();
  await expect(region.getByText("1小时", { exact: true })).toBeVisible();
  await expect(region.getByText("2小时30分", { exact: true })).toBeVisible();
  await expect(region.getByText("88.2%", { exact: true })).toBeVisible();
  await expect(region.getByText("3", { exact: true })).toBeVisible();
  const avatar = region.locator("img");
  await expect(avatar).toBeVisible();
  await expect
    .poll(() =>
      avatar.evaluate(
        (element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0,
      ),
    )
    .toBe(true);
  count = 18;
  realtime.push(path);
  await expect(region.getByText("18", { exact: true }).first()).toBeVisible();
  await page.screenshot({
    path: info.outputPath("target-monitoring-wide.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
  await region.screenshot({
    path: info.outputPath("target-monitoring-mobile.png"),
  });
  coarse = true;
  realtime.push(path);
  await expect(
    region.getByText("Telegram 仅返回“最近在线”，未提供精确时间", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "配置", exact: true }).click();
  const interval = page.getByRole("textbox", { name: /^检测间隔\s*\*?$/ });
  await interval.fill("2小时32分1秒");
  await expect(page.getByText(/请输入范围内的完整时长/)).toBeVisible();
  await interval.fill("1分钟");
  await page.getByRole("button", { name: "保存更改", exact: true }).click();
  await expect(page).toHaveURL(/\/targets$/);
  const saved = await (
    await page.request.get(`/api/backend/targets/${target.id}`)
  ).json();
  expect(saved.settings.refreshSeconds).toBe(60);
  await page.setViewportSize({ width: 1280, height: 900 });
  realtime.remove(path);
  await page.unroute(`**/api/backend/targets/${target.id}/avatar?*`);
  return target.id as string;
}

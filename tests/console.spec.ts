import { choose, changeLanguage } from "./choice-checks";
import { verifyExperience } from "./experience-checks";
import { test, expect } from "@playwright/test";
import {
  beginRegistrationRace,
  verifySingleton,
  registerOwner,
} from "./passkey-checks";
import {
  verifyPresenceLayout,
  verifyResponsivePresence,
} from "./visual-checks";
import { verifyConfigurationPages } from "./configuration-checks";
import { verifyAccountLogin } from "./account-login-checks";
import { verifyMonitoringDetails } from "./monitoring-checks";
import { verifyManualTests } from "./manual-test-checks";
import {
  observeRealtime,
  verifyRealtime,
  verifyUnauthenticatedRealtime,
} from "./realtime-checks";
import { verifyTablePolish } from "./table-polish-checks";
import { verifyIdleRecovery } from "./realtime-idle-checks";

test("single_passkey_guards_console_and_configuration_workflows", async ({
  page,
  context,
  request,
}) => {
  const pageErrors: string[] = [];
  const realtime = await observeRealtime(page);
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
    console.error("Browser error:", error.message);
  });
  const base = process.env.TEST_API_URL ?? "http://127.0.0.1:5080";
  const accountResponse = await request.post(`${base}/api/accounts`, {
    data: {
      name: "QA disabled account",
      enabled: false,
      settings: {
        apiId: 12345,
        apiHash: "0123456789abcdef0123456789abcdef",
        phone: "+886912345678",
      },
    },
  });
  expect(accountResponse.status()).toBe(201);
  const account = await accountResponse.json();
  expect(account.settings.apiHash).toBe("***");
  const unauthenticated = await request.get("/api/backend/accounts");
  expect(unauthenticated.status()).toBe(401);
  await verifyUnauthenticatedRealtime(page);
  await beginRegistrationRace(request);
  const cdp = await registerOwner(page, context);
  await verifyRealtime(page, realtime, account.id);
  await verifyIdleRecovery(page);
  await verifySingleton(request);
  await changeLanguage(page, "English");
  await expect(
    page.getByRole("heading", { name: "Targets", exact: true }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Language: English", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "New", exact: true }).click();
  await page
    .getByRole("textbox", { name: /^Name\s*\*?$/ })
    .fill("QA monitored user");
  await choose(page, page, "Telegram account", "QA disabled account", true);
  await page
    .getByRole("textbox", { name: /^Username or phone\s*\*?$/ })
    .fill("@alice");
  await page.getByLabel("Enabled", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page).toHaveURL(/\/targets$/);
  await expect(
    page.getByRole("link", { name: "QA monitored user", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "QA monitored user", exact: true })
    .click();
  await page.getByRole("tab", { name: "Configuration", exact: true }).click();
  await page
    .getByRole("textbox", { name: /^Name\s*\*?$/ })
    .fill("QA renamed user");
  await changeLanguage(page, "简体中文");
  await expect(page.getByRole("textbox", { name: /^名称\s*\*?$/ })).toHaveValue(
    "QA renamed user",
  );
  await page.getByRole("button", { name: "保存更改", exact: true }).click();
  await page.getByRole("link", { name: "查看在线记录", exact: true }).click();
  await page.getByText("历史查询与导出", { exact: true }).first().click();
  await expect(
    page.getByRole("heading", { name: "统计数据", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "在线状态时间线", exact: true }),
  ).toBeVisible();
  await verifyPresenceLayout(page);
  await page.screenshot({
    path: test.info().outputPath("presence-wide.png"),
    fullPage: true,
  });
  await verifyResponsivePresence(page, test.info());
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "导出 CSV", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toContain("presence-");
  await verifyConfigurationPages(page);
  const monitoringTarget = await verifyMonitoringDetails(page, test.info());
  await verifyTablePolish(page, monitoringTarget, test.info());
  await verifyExperience(page, monitoringTarget, test.info(), cdp);
  await verifyManualTests(page, account.id, monitoringTarget, test.info());
  await verifyAccountLogin(page, account.id, test.info());
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(
    page.getByRole("link", { name: "系统设置", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "系统设置", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "后台服务", exact: true }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflow).toBe(false);
  const wrongOrigin = await context.request.post("/api/auth/options", {
    headers: { Origin: "https://wrong.example" },
  });
  expect(wrongOrigin.status()).toBe(400);
  const status = await context.request.get("/api/auth/status");
  expect(await status.json()).toMatchObject({
    registered: true,
    authenticated: true,
  });
  await page.getByRole("button", { name: "退出登录", exact: true }).click();
  await expect(page).toHaveURL(/login/);
  await page
    .getByRole("button", { name: "使用通行密钥登录", exact: true })
    .click();
  await expect(page).toHaveURL(/targets/);
  await page.goto("/unknown-section");
  await expect(
    page.getByRole("heading", { name: "页面不存在", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "返回监控对象", exact: true }).click();
  await page
    .getByRole("button", { name: "删除 QA renamed user", exact: true })
    .click();
  await page.getByRole("button", { name: "删除配置", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "QA renamed user", exact: true }),
  ).toHaveCount(0);
  const deleteAccount = await request.delete(
    `${base}/api/accounts/${account.id}?revision=${account.revision}`,
  );
  expect(deleteAccount.status()).toBe(204);
  expect(pageErrors).toEqual([]);
  expect(realtime.httpReads()).toBe(0);
  await cdp.detach();
});

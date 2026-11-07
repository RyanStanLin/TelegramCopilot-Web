import { expect, type Page, type TestInfo } from "@playwright/test";

export async function verifyManualTests(
  page: Page,
  accountId: string,
  targetId: string,
  info: TestInfo,
) {
  async function create(kind: string, name: string, settings: unknown) {
    const response = await page.request.post(`/api/backend/${kind}`, {
      data: { name, enabled: false, settings },
      headers: { Origin: new URL(page.url()).origin },
    });
    expect(response.status()).toBe(201);
    return response.json();
  }
  const destination = await create("destinations", "QA manual destination", {
    serverUrl: "http://127.0.0.1:1",
    deviceKeys: ["fake-manual-device"],
  });
  const rule = await create("rules", "QA manual rule", {
    destinationId: destination.id,
    targetId,
    event: "Offline",
    title: "{NAME} test",
    body: "{TIME_OF_ONLINE}",
  });
  const schedule = await create("schedules", "QA manual schedule", {
    accountId,
    recipient: "@test_bot",
    message: "Disabled manual fixture",
    frequency: "Daily",
    timeZone: "UTC",
    localTime: "12:00:00",
  });
  await page.goto(`/rules/${rule.id}`);
  await page.getByRole("button", { name: "检查配置", exact: true }).click();
  await expect(
    page.getByText("当前规则配置有效", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "通知预览", exact: true })
      .getByText("2小时32分1秒", { exact: true }),
  ).toBeVisible();
  const body = page.getByRole("textbox", { name: /^正文模板\s*\*?$/ });
  await body.fill("{TYPO}");
  await page.getByRole("button", { name: "检查配置", exact: true }).click();
  await expect(page.getByText(/包含不支持的模板变量/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "发送测试通知", exact: true }),
  ).toBeDisabled();
  await body.fill("{TIME_OF_ONLINE}");
  await page.getByRole("button", { name: "保存更改", exact: true }).click();
  await page.getByRole("link", { name: "QA manual rule", exact: true }).click();
  let sends = 0;
  await page.route(`**/api/backend/rules/${rule.id}/test`, async (route) => {
    const value = route.request().postDataJSON();
    expect(value.requestId).toMatch(/^[\da-f-]{36}$/);
    sends++;
    await route.fulfill({
      json: {
        deliveries: [{ id: "qa-notification", status: "Sent", error: null }],
      },
    });
  });
  await page.getByRole("button", { name: "发送测试通知", exact: true }).click();
  await expect(page.getByText("测试已发送", { exact: true })).toBeVisible();
  expect(sends).toBe(1);
  await page.screenshot({
    path: info.outputPath("rule-validation-and-test.png"),
    fullPage: true,
  });
  await page.goto(`/schedules/${schedule.id}`);
  await page
    .getByRole("button", { name: "立即发送测试消息", exact: true })
    .click();
  await expect(page.getByText("测试发送未成功", { exact: true })).toBeVisible();
  const audit = await (
    await page.request.get(`/api/backend/deliveries?resourceId=${schedule.id}`)
  ).json();
  expect(audit.items).toHaveLength(1);
  expect(audit.items[0].status).toBe("Failed");
  expect(audit.items[0].id).toMatch(/^test:telegram:/);
  await page.route(`**/api/backend/schedules/${schedule.id}/test`, (route) =>
    route.fulfill({
      json: {
        deliveries: [{ id: "qa-message", status: "Sent", externalId: "991" }],
      },
    }),
  );
  await page
    .getByRole("button", { name: "立即发送测试消息", exact: true })
    .click();
  await expect(page.getByText("测试已发送", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
  await page.screenshot({
    path: info.outputPath("schedule-manual-test-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.unroute(`**/api/backend/rules/${rule.id}/test`);
  await page.unroute(`**/api/backend/schedules/${schedule.id}/test`);
  for (const [kind, id] of [
    ["rules", rule.id],
    ["schedules", schedule.id],
    ["destinations", destination.id],
  ]) {
    const current = await (
      await page.request.get(`/api/backend/${kind}/${id}`)
    ).json();
    const response = await page.request.delete(
      `/api/backend/${kind}/${id}?revision=${current.revision}`,
      { headers: { Origin: new URL(page.url()).origin } },
    );
    expect(response.status()).toBe(204);
  }
}

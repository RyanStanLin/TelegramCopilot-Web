import { expect, test } from "@playwright/test";
import { isolatedConsole } from "./isolated-console";
import { registerOwner } from "./passkey-checks";
import { verifyDailyActivity } from "./daily-activity-checks";

test("daily_activity_charts_use_realtime_status_and_calendar_days", async ({ browser, request }, info) => {
  const api = process.env.TEST_API_URL ?? "http://127.0.0.1:5080";
  expect(api).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  const accountResponse = await request.post(`${api}/api/accounts`, { data: {
    name: "QA daily account", enabled: false,
    settings: { apiId: 12345, apiHash: "0123456789abcdef0123456789abcdef", phone: "+886912345676" },
  } });
  expect(accountResponse.status()).toBe(201);
  const account = await accountResponse.json();
  const targetResponse = await request.post(`${api}/api/targets`, { data: {
    name: "QA daily activity", enabled: false,
    settings: { accountId: account.id, identifier: "@qa_daily_activity", refreshSeconds: 5 },
  } });
  expect(targetResponse.status()).toBe(201);
  const target = await targetResponse.json();
  const server = await isolatedConsole();
  const context = await browser.newContext({ baseURL: server.url, viewport: { width: 1280, height: 900 } });
  try {
    const page = await context.newPage();
    await registerOwner(page, context);
    await verifyDailyActivity(page, target.id, info);
  } finally {
    await context.close();
    await server.close();
    expect((await request.delete(`${api}/api/targets/${target.id}?revision=${target.revision}`)).status()).toBe(204);
    expect((await request.delete(`${api}/api/accounts/${account.id}?revision=${account.revision}`)).status()).toBe(204);
  }
});

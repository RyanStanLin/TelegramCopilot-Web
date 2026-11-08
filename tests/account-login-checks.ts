import { expect, type Page, type TestInfo } from "@playwright/test";
import { realtimeFixture } from "./realtime-fixture";

export async function verifyAccountLogin(
  page: Page,
  id: string,
  info: TestInfo,
) {
  let status = {
    authorizationState: "authorizationStateWaitPhoneNumber",
    connectionState: "connectionStateReady",
    error: null as string | null,
    login: {} as Record<string, unknown>,
  };
  const realtime = await realtimeFixture(page);
  const path = `/accounts/${id}/status`;
  realtime.set(path, () => status);
  const submitted: string[] = [];
  await page.route(`**/api/backend/accounts/${id}/status`, async (route) => {
    await route.fulfill({ json: status });
  });
  await page.route(`**/api/backend/accounts/${id}/login`, async (route) => {
    const { type, value } = route.request().postDataJSON();
    submitted.push(type);
    if (type === "phone") {
      expect(value).toBe("+886912345678");
      status = {
        ...status,
        authorizationState: "authorizationStateWaitCode",
        login: {
          type: "code",
          delivery: "authenticationCodeTypeTelegramMessage",
          codeLength: 5,
        },
      };
    } else if (type === "code" && value === "11111") {
      status.error = "PHONE_CODE_INVALID";
      await route.fulfill({
        status: 400,
        json: { code: "PHONE_CODE_INVALID" },
      });
      return;
    } else if (type === "code") {
      expect(value).toBe("12345");
      status = {
        ...status,
        error: null,
        authorizationState: "authorizationStateWaitPassword",
        login: {
          type: "password",
          passwordHint: "QA password hint",
        },
      };
    } else if (type === "password") {
      expect(value).toBe("qa-two-step-password");
      status = {
        ...status,
        error: null,
        authorizationState: "authorizationStateReady",
        login: {},
      };
    }
    await route.fulfill({ json: status });
  });
  const createPath = /\/api\/backend\/accounts$/;
  await page.route(createPath, async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const body = route.request().postDataJSON();
    expect(body.enabled).toBe(true);
    await route.fulfill({ status: 201, json: { ...body, id } });
  });
  await page.goto("/accounts/new");
  await page
    .getByRole("textbox", { name: /^名称\s*\*?$/ })
    .fill("QA login navigation");
  await page
    .getByRole("spinbutton", { name: /^API 编号\s*\*?$/ })
    .fill("12345");
  await page
    .getByLabel(/^API 哈希\s*\*?$/)
    .fill("0123456789abcdef0123456789abcdef");
  await page
    .getByRole("textbox", { name: /^手机号码\s*\*?$/ })
    .fill("+886912345678");
  await page.getByRole("button", { name: "保存更改", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/accounts/${id}$`));
  await page.unroute(createPath);
  const login = page.getByRole("region", { name: "登录状态", exact: true });
  await expect(
    login.getByText("第 1 步：发送登录验证码", { exact: true }),
  ).toBeVisible();
  await expect(login.getByRole("combobox")).toHaveCount(0);
  await expect(login.getByRole("textbox")).toHaveCount(0);
  await login.getByRole("button", { name: "发送验证码", exact: true }).click();
  const code = login.getByRole("textbox", { name: /^验证码\s*\*?$/ });
  await expect(code).toBeFocused();
  await expect(code).toHaveAttribute("type", "text");
  await expect(
    login.getByText(/验证码已发送到你已登录的 Telegram/),
  ).toBeVisible();
  await code.fill("12");
  realtime.push(path);
  await expect(code).toHaveValue("12");
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(
    login.getByRole("button", { name: "验证并继续", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
  await login.screenshot({
    path: info.outputPath("account-login-code-mobile.png"),
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await code.fill("11111");
  await login.getByRole("button", { name: "验证并继续", exact: true }).click();
  await expect(login.getByText(/验证码不正确/)).toBeVisible();
  await expect(code).toHaveValue("11111");
  await code.fill("12345");
  await login.getByRole("button", { name: "验证并继续", exact: true }).click();
  const password = login.getByLabel(/^两步验证密码\s*\*?$/);
  await expect(password).toBeFocused();
  await expect(password).toHaveAttribute("type", "password");
  await expect(login.getByText(/QA password hint/)).toBeVisible();
  await expect(login.getByText(/验证码不正确/)).toHaveCount(0);
  await password.fill("qa-two-step-password");
  await login
    .getByRole("button", { name: "验证密码并登录", exact: true })
    .click();
  await expect(
    login.getByText("Telegram 已登录", { exact: true }),
  ).toBeVisible();
  await expect(login.getByRole("textbox")).toHaveCount(0);
  await expect(login.locator("input")).toHaveCount(0);
  expect(submitted).toEqual(["phone", "code", "code", "password"]);
  await login.screenshot({ path: info.outputPath("account-login-ready.png") });
  status = { ...status, authorizationState: "Inactive" };
  realtime.push(path);
  await expect(login.getByText("账号尚未启动", { exact: true })).toBeVisible();
  await expect(
    login.getByRole("button", { name: "发送验证码", exact: true }),
  ).toHaveCount(0);
  await page.unroute(`**/api/backend/accounts/${id}/status`);
  await page.unroute(`**/api/backend/accounts/${id}/login`);
  realtime.remove(path);
}

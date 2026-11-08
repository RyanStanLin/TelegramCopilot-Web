import {
  expect,
  type Page,
  type TestInfo,
  type CDPSession,
} from "@playwright/test";
import { choose, changeLanguage } from "./choice-checks";
import { verifyDelayedRuleTemplates } from "./rule-template-checks";
export async function verifyExperience(
  page: Page,
  targetId: string,
  info: TestInfo,
  touch: CDPSession,
) {
  await verifyDelayedRuleTemplates(page);
  const form = page.getByRole("main").locator("form").first();
  const title = form.getByRole("textbox", { name: /^标题模板/ });
  await expect(title).toHaveValue("{NAME} 在线");
  await choose(form, page, "触发事件", "离线");
  await expect(title).toHaveValue("{NAME} 已下线");
  await expect(form.getByLabel("其他 Bark 参数")).toHaveValue(
    /"level": "active"/,
  );
  await expect(form.getByLabel(/^正文模板/)).toHaveValue(
    "本次在线时长：{TIME_OF_ONLINE}",
  );
  await expect(form.getByLabel(/^名称/)).toHaveValue("My notification draft");
  await title.fill("Keep my draft");
  await changeLanguage(page, "English");
  await expect(form.getByLabel(/^Title template/)).toHaveValue("Keep my draft");
  await form
    .getByRole("button", { name: "Restore built-in template", exact: true })
    .click();
  await expect(form.getByLabel(/^Title template/)).toHaveValue(
    "{NAME} went offline",
  );
  await choose(form, page, "Event", "Online");
  await expect(form.getByLabel(/^Name/)).toHaveValue("My notification draft");
  await expect(form.getByLabel(/^Title template/)).toHaveValue(
    "{NAME} is online",
  );
  await expect(
    form.getByLabel("Additional Bark parameters (JSON)"),
  ).toHaveValue(/"level": "passive"/);
  await changeLanguage(page, "简体中文");
  await form.getByRole("button", { name: "取消", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "放弃更改", exact: true })
    .click();
  await page.goto(
    `/presence?target=${targetId}&from=2026-09-01T00:00:00%2B08:00&to=2026-11-08T00:00:00%2B08:00`,
  );
  const calendar = page.getByRole("region", { name: "上线日历", exact: true });
  await expect(calendar.getByText("2026年11月", { exact: true })).toBeVisible();
  await calendar.getByRole("link", { name: "上一页", exact: true }).click();
  await expect(calendar.getByText("2026年10月", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/calendarPage=2/);
  await expect(calendar).toBeFocused();
  await page.setViewportSize({ width: 375, height: 812 });
  const grid = calendar.getByRole("region");
  await grid.scrollIntoViewIfNeeded();
  const box = (await grid.boundingBox())!;
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: box.x + box.width * 0.8, y: box.y + box.height / 2 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: box.x + box.width * 0.2, y: box.y + box.height / 2 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(calendar.getByText("2026年11月", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/calendarPage=3/);
  await page.getByRole("button", { name: "打开导航菜单", exact: true }).click();
  const navigation = page.getByRole("dialog", {
    name: "TelegramCopilot",
    exact: true,
  });
  await expect(
    navigation.getByRole("link", { name: "Telegram 账号", exact: true }),
  ).toBeVisible();
  await navigation.screenshot({
    path: info.outputPath("mobile-navigation.png"),
  });
  await page.keyboard.press("Escape");
  await expect(navigation).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "打开导航菜单", exact: true }),
  ).toBeFocused();
  expect(await page.locator("select").count()).toBe(0);
  await page.getByRole("button", { name: "打开导航菜单", exact: true }).click();
  await navigation.getByRole("link", { name: "事件日志", exact: true }).click();
  await expect(page).toHaveURL(/\/events/);
  await expect(navigation).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 900 });
  await verifyLoadingAnimation(page, targetId);
}
async function verifyLoadingAnimation(page: Page, targetId: string) {
  await page.goto(`/targets/${targetId}?tab=settings`);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**/api/backend/targets/${targetId}`, async (route) => {
    if (route.request().method() === "PUT") {
      await pending;
      await route.fulfill({ status: 503, json: { code: "Unavailable" } });
    } else await route.continue();
  });
  await page.getByRole("button", { name: "保存更改", exact: true }).click();
  const spinner = page
    .getByRole("button", { name: "保存更改", exact: true })
    .locator("svg")
    .last();
  try {
    await expect(spinner).toBeVisible();
    const motion = await spinner.evaluate(async (node) => {
      const first = getComputedStyle(node);
      const start = first.transform;
      const duration = first.animationDuration;
      await new Promise((resolve) => setTimeout(resolve, 180));
      return { duration, start, end: getComputedStyle(node).transform };
    });
    expect(motion.duration).toBe("1s");
    expect(motion.end).not.toBe(motion.start);
  } finally {
    release();
  }
  await expect(page.getByText(/保存失败/)).toBeVisible();
  await page.unroute(`**/api/backend/targets/${targetId}`);
}

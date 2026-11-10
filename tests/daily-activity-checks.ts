import { expect, type Page, type TestInfo } from "@playwright/test";
import { choose, changeLanguage } from "./choice-checks";
import { dailyActivityFixture } from "./daily-activity-fixture";

export async function verifyDailyActivity(page: Page, target: string, info: TestInfo) {
  const fixture = await dailyActivityFixture(page, target);
  let httpReads = 0;
  const inspect = (request: import("@playwright/test").Request) => {
    if (/\/api\/backend\/targets\/.+\/(timeline|statistics)\?/.test(request.url())) httpReads++;
  };
  page.on("request", inspect);
  try {
    fixture.hold("2026-11-07");
    await page.goto(`/presence?target=${target}&date=2026-11-07`);
    await expect.poll(() => fixture.subscribed("2026-11-07")).toBe(true);
    await expect(page.locator("#daily-activity")).toHaveCount(0);
    fixture.release("2026-11-07");
    const details = page.getByRole("region", { name: "当天活动详情", exact: true });
    await expect(details).toBeVisible();
    await expect(page.getByText("Alice Lee", { exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath("daily-activity-initial.png"), fullPage: true });
    await expect(page.locator("dl").getByText("2小时", { exact: true })).toBeVisible();
    await expect(details.getByText(/· 监测中断/).first()).toBeVisible();
    await expect(details.getByText(/· 观测时已在线/)).toBeVisible();
    await expect(details.getByText(/· 已上线/)).toBeVisible();
    await expect(details.locator("time[datetime]")).toHaveCount(7);
    await expect(details.getByText("12:30:00 – 24:00:00", { exact: true })).toBeVisible();
    const band = page.getByRole("slider", { name: /^查看一天中的状态/ });
    const marks = band.locator('rect[data-kind="online"]');
    expect(Number(await marks.nth(0).getAttribute("x"))).toBeCloseTo(100 / 3);
    expect(Number(await marks.nth(1).getAttribute("x"))).toBe(50);
    await expect(band.locator('rect[data-kind="offline"]')).toHaveCount(3);
    await expect(band.locator('rect[data-kind="interrupted"]')).toHaveCount(1);
    await expect(band.locator('rect[data-kind="unobserved"]')).toHaveCount(1);
    await band.focus(); await page.keyboard.press("Home"); await page.keyboard.press("ArrowRight");
    await expect(band).toHaveAttribute("aria-valuenow", "60");
    const hours = page.getByRole("slider", { name: /^查看每小时活动/ });
    await hours.focus(); await page.keyboard.press("Home");
    for (let n = 0; n < 8; n++) await page.keyboard.press("ArrowRight");
    await expect(hours).toHaveAttribute("aria-valuenow", "8");
    await expect(hours).toHaveAttribute("aria-valuetext", /1小时/);
    await choose(page, page, "图表指标", "上线次数");
    await expect(hours.locator('rect[data-hour="8"]')).toHaveAttribute("data-value", "1");
    fixture.expand("2026-11-06");
    await page.getByRole("button", { name: /^2026年11月6日/ }).click();
    await expect(page).toHaveURL(/date=2026-11-06/);
    await expect(page).toHaveURL(/metric=count/);
    await expect.poll(() => fixture.subscribed("2026-11-06", 2)).toBe(true);
    await expect(band.locator("rect[data-kind]")).toHaveCount(501);
    await expect(page.locator("dl").getByText("250", { exact: true })).toBeVisible();
    await expect(details.locator("time[datetime]")).toHaveCount(20);
    await page.getByRole("navigation", { name: "分页", exact: true })
      .getByRole("link", { name: "下一页", exact: true }).click();
    await expect(page).toHaveURL(/sessionPage=2/);
    await expect(details.locator("time[datetime]").first()).toHaveAttribute("datetime", "2026-11-05T16:57:29.101Z");
    fixture.collapse("2026-11-06");
    await page.getByRole("navigation", { name: "按天浏览", exact: true })
      .getByRole("link", { name: "后一天", exact: true }).click();
    await expect(page).toHaveURL(/date=2026-11-07/);
    await expect(page).not.toHaveURL(/sessionPage=/);
    await expect(page.locator("#daily-activity")).toBeFocused();
    expect(await page.evaluate(() => document.getElementById("daily-activity")!.getBoundingClientRect().top
      - document.querySelector("header")!.getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(0);
    fixture.fail("2026-11-07");
    await expect(page.getByText("活动数据连接中断，正在重连。", { exact: true })).toBeVisible();
    await expect(band).toBeVisible();
    await page.getByRole("button", { name: "重试", exact: true }).click();
    await expect(page.getByText("活动数据连接中断，正在重连。", { exact: true })).toHaveCount(0);
    await expect(page.locator("dl").getByText("2小时", { exact: true })).toBeVisible();
    fixture.push("2026-11-07");
    await expect(page.getByText("活动数据连接中断，正在重连。", { exact: true })).toHaveCount(0);
    await expect(page.locator("dl").getByText("2小时30分", { exact: true })).toBeVisible();
    expect(httpReads).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath("daily-activity-wide.png"), fullPage: true });
    for (const width of [375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await expect(band).toBeVisible();
      await expect(page.getByRole("link", { name: "导出当天 CSV", exact: true })).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: info.outputPath(`daily-activity-${width}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; window.scrollTo(0, 0); });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const hourlyBox = await page.getByRole("region", { name: "每小时分布", exact: true }).boundingBox();
    const weeklyBox = await page.getByRole("region", { name: "本周趋势", exact: true }).boundingBox();
    expect(weeklyBox!.y).toBeGreaterThanOrEqual(hourlyBox!.y + hourlyBox!.height);
    await page.screenshot({ path: info.outputPath("daily-activity-zoom.png"), fullPage: true });
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.screenshot({ path: info.outputPath("daily-activity-dark.png"), fullPage: true });
    await page.emulateMedia({ colorScheme: "light" });
    await changeLanguage(page, "English");
    await expect(page.getByRole("heading", { name: "24-hour status timeline", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daily activity details", exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "Language: English", exact: true })).toBeVisible();
    await changeLanguage(page, "简体中文");
    await choose(page, page, "时区", "UTC");
    await page.getByRole("button", { name: "应用", exact: true }).click();
    await expect(page).toHaveURL(/timeZone=UTC/);
    await expect(page.getByText("这一天没有可用的监测记录。", { exact: true })).toBeVisible();
    await expect(band.locator('rect[data-kind="offline"]')).toHaveCount(0);
    await expect(band.locator('rect[data-kind="unobserved"]')).toHaveCount(1);
    await expect(page.locator("dl").getByText("0s", { exact: true })).toHaveCount(2);
    expect(httpReads).toBe(0);
  } finally {
    page.off("request", inspect);
    await fixture.dispose();
  }
}

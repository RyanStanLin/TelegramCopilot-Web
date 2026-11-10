import { expect, type Page, type TestInfo } from "@playwright/test";

const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kQ6sAAAAASUVORK5CYII=",
  "base64",
);
export async function verifyTablePolish(
  page: Page,
  id: string,
  info: TestInfo,
) {
  const avatarPath = `**/api/backend/targets/${id}/avatar?*`;
  await page.route(avatarPath, (route) =>
    route.fulfill({ contentType: "image/png", body: pixel }),
  );
  await page.goto("/targets");
  const name = page.getByRole("link", { name: "QA renamed user", exact: true });
  await expect(name.locator("img")).toHaveAttribute("alt", "");
  await expect
    .poll(() =>
      name
        .locator("img")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await page.screenshot({
    path: info.outputPath("target-list-leading-avatar.png"),
    fullPage: true,
  });
  await page.unroute(avatarPath);
  const timelinePath = `**/api/backend/targets/${id}/timeline?*`;
  await page.route(timelinePath, (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: 1,
            targetId: id,
            state: "Offline",
            start: "2026-11-07T00:00:00Z",
            end: "2026-11-07T01:00:00Z",
            seconds: 3600,
            reason: "CachedReconciliation",
            observedAt: "2026-11-07T01:00:00Z",
            startKnown: true,
            endKnown: true,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 25,
      },
    }),
  );
  await page.goto(`/presence?target=${id}&from=2026-11-07T00:00:00Z&to=2026-11-07T02:00:00Z`);
  const reason = page.getByText("已读取 Telegram 状态", { exact: true });
  await expect(reason).toBeVisible();
  const geometry = await reason.evaluate((node) => {
    const hint = node.nextElementSibling!;
    const style = getComputedStyle(hint);
    return {
      body: parseFloat(getComputedStyle(node).fontSize),
      hint: parseFloat(style.fontSize),
      gap:
        hint.getBoundingClientRect().top - node.getBoundingClientRect().bottom,
      before: parseFloat(style.marginTop),
      after: parseFloat(style.marginBottom),
    };
  });
  expect(geometry.body).toBe(14);
  expect(geometry.hint).toBe(12);
  expect(geometry.gap).toBeLessThanOrEqual(4.5);
  expect(geometry.before + geometry.after).toBe(0);
  const numeric = page.locator("[data-numeric]").first();
  const font = await numeric.evaluate((node) => {
    const style = getComputedStyle(node);
    const probe = node.cloneNode() as HTMLElement;
    node.parentElement!.append(probe);
    probe.textContent = "111111";
    const narrow = probe.getBoundingClientRect().width;
    probe.textContent = "888888";
    const wide = probe.getBoundingClientRect().width;
    probe.remove();
    return {
      family: style.fontFamily,
      variant: style.fontVariantNumeric,
      narrow,
      wide,
    };
  });
  expect(font.family).toMatch(/mono|Menlo|Consolas/i);
  expect(font.variant).toContain("tabular-nums");
  expect(Math.abs(font.narrow - font.wide)).toBeLessThan(0.1);
  await reason.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("timeline-compact-reasons.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => window.scrollTo(0, 600));
  const header = page.locator("header").first();
  expect((await header.boundingBox())!.y).toBe(0);
  await expect(
    page.getByRole("button", { name: "打开导航菜单", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("sticky-mobile-titlebar.png"),
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.unroute(timelinePath);
  const deliveryPath = "**/api/backend/deliveries?*";
  await page.route(deliveryPath, (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: "qa-delivery",
            channel: "Telegram",
            resourceId: id,
            dueAt: "2026-11-08T00:00:00Z",
            updatedAt: "2026-11-08T00:00:01Z",
            status: "Failed",
            error: "QA delivery failure",
            externalId: null,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 25,
      },
    }),
  );
  await page.goto("/deliveries");
  await expect(
    page.getByRole("columnheader", { name: "失败原因", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", {
      name: "数据加载失败，请重试。",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("cell", { name: "QA delivery failure", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("delivery-correct-error-column.png"),
    fullPage: true,
  });
  await page.unroute(deliveryPath);
}

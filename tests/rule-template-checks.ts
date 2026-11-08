import { expect, type Page } from "@playwright/test";

export async function verifyDelayedRuleTemplates(page: Page) {
  const pattern = "**/api/backend/rules/templates?*";
  let release!: () => void;
  const ready = new Promise<void>((resolve) => (release = resolve));
  const pending: Promise<void>[] = [];
  await page.route(pattern, (route) => {
    const handled = ready.then(() => route.continue());
    pending.push(handled);
    return handled;
  });
  try {
    const requested = page.waitForRequest(pattern);
    await page.goto("/rules/new");
    await requested;
    const name = page.getByRole("main").getByLabel(/^名称/);
    await expect(name).toHaveCount(0);
    release();
    await expect(name).toHaveValue("在线提醒");
    await name.fill("My notification draft");
  } finally {
    release();
    await Promise.all(pending);
    await page.unroute(pattern);
  }
}

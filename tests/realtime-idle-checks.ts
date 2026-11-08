import { expect, type Page } from "@playwright/test";
import { observeRealtime } from "./realtime-checks";

export async function verifyIdleRecovery(page: Page) {
  const probe = await page.context().newPage();
  try {
    await observeRealtime(probe);
    await probe.clock.install();
    let silent = false;
    await probe.routeWebSocket("**/api/live", (browser) => {
      const server = browser.connectToServer();
      server.onMessage((raw) => {
        if (!silent) browser.send(raw);
      });
    });
    await probe.goto("/targets");
    await expect(
      probe.getByText("累计检测次数:", { exact: false }),
    ).toBeVisible();
    const disconnected = probe.getByText("实时连接已断开，正在重连", {
      exact: true,
    });
    await expect(disconnected).toHaveCount(0);
    silent = true;
    await probe.clock.fastForward(46_000);
    await expect(disconnected).toBeVisible();
    silent = false;
    await probe.clock.runFor(1500);
    await expect
      .poll(() =>
        probe.evaluate(
          () =>
            (window as unknown as { qaSockets: WebSocket[] }).qaSockets.length,
        ),
      )
      .toBeGreaterThan(1);
    await expect(disconnected).toHaveCount(0);
  } finally {
    await probe.close();
  }
}

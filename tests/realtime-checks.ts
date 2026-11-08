import { expect, type Page } from "@playwright/test";

export async function verifyUnauthenticatedRealtime(page: Page) {
  await page.goto("/login");
  const result = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const url = new URL("/api/live", location.href);
        url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
        const socket = new WebSocket(url);
        socket.onopen = () => {
          socket.close();
          resolve("opened");
        };
        socket.onerror = () => resolve("rejected");
        socket.onclose = () => resolve("closed");
        setTimeout(() => {
          socket.close();
          resolve("timeout");
        }, 5000);
      }),
  );
  expect(["rejected", "closed"]).toContain(result);
  const wrongOrigin = await page.request.get("/api/live", {
    headers: { Origin: "https://wrong.example" },
  });
  expect(wrongOrigin.status()).toBe(403);
}

export async function observeRealtime(page: Page) {
  const frames: { path: string; data?: { pollCount: number } }[] = [];
  let httpReads = 0;
  page.on("request", (request) => {
    if (
      request.method() === "GET" &&
      /\/api\/backend\/(monitoring|accounts\/.+\/status|targets\/.+\/monitoring)(\?|$)/.test(
        request.url(),
      )
    )
      httpReads++;
  });
  page.on("websocket", (socket) => {
    if (!socket.url().endsWith("/api/live")) return;
    socket.on("framereceived", (frame) =>
      frames.push(JSON.parse(String(frame.payload))),
    );
  });
  await page.addInitScript(() => {
    const Native = window.WebSocket;
    const sockets: WebSocket[] = [];
    (window as unknown as { qaSockets: WebSocket[] }).qaSockets = sockets;
    window.WebSocket = class extends Native {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        if (String(url).endsWith("/api/live")) sockets.push(this);
      }
    };
  });
  return { frames, httpReads: () => httpReads };
}
export async function verifyRealtime(
  page: Page,
  observed: Awaited<ReturnType<typeof observeRealtime>>,
  accountId: string,
) {
  await expect
    .poll(() => observed.frames.some((f) => f.path === "/monitoring" && f.data))
    .toBe(true);
  const initial = observed.frames
    .filter((f) => f.path === "/monitoring")
    .at(-1)!.data!.pollCount;
  const created = await page.request.post("/api/backend/targets", {
    headers: {
      Origin: new URL(process.env.TEST_WEB_URL ?? "http://localhost:3000")
        .origin,
    },
    data: {
      name: "QA disposable realtime target",
      enabled: true,
      settings: { accountId, identifier: "@qa_realtime", refreshSeconds: 1 },
    },
  });
  expect(created.status()).toBe(201);
  const target = await created.json();
  try {
    await expect
      .poll(
        () =>
          observed.frames.filter((f) => f.path === "/monitoring").at(-1)?.data
            ?.pollCount,
        { timeout: 15_000 },
      )
      .toBeGreaterThan(initial + 1);
    await page.evaluate(() =>
      (window as unknown as { qaSockets: WebSocket[] }).qaSockets
        .at(-1)!
        .close(1000, "QA reconnect"),
    );
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as { qaSockets: WebSocket[] }).qaSockets.length,
        ),
      )
      .toBeGreaterThan(1);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as { qaSockets: WebSocket[] }).qaSockets.filter(
              (s) => s.readyState === WebSocket.OPEN,
            ).length,
        ),
      )
      .toBe(1);
    const previous = observed.frames.length;
    await expect.poll(() => observed.frames.length).toBeGreaterThan(previous);
    expect(observed.httpReads()).toBe(0);
  } finally {
    const deleted = await page.request.delete(
      `/api/backend/targets/${target.id}?revision=${target.revision}`,
      {
        headers: {
          Origin: new URL(process.env.TEST_WEB_URL ?? "http://localhost:3000")
            .origin,
        },
      },
    );
    expect(deleted.status()).toBe(204);
  }
}

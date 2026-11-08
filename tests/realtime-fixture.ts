import type { Page, WebSocketRoute } from "@playwright/test";

type Connection = {
  browser: WebSocketRoute;
  server: WebSocketRoute;
  paths: Set<string>;
};
type Fixture = Awaited<ReturnType<typeof createFixture>>;
const fixtures = new WeakMap<Page, Fixture>();
async function createFixture(page: Page) {
  const values = new Map<string, () => unknown>();
  const connections = new Set<Connection>();
  const push = (path: string) => {
    const value = values.get(path);
    if (!value) return;
    for (const connection of connections)
      if (connection.paths.has(path))
        connection.browser.send(JSON.stringify({ path, data: value() }));
  };
  await page.routeWebSocket("**/api/live", (browser) => {
    const server = browser.connectToServer();
    const connection = { browser, server, paths: new Set<string>() };
    connections.add(connection);
    browser.onMessage((raw) => {
      const command = JSON.parse(String(raw));
      if (command.type === "unsubscribe") connection.paths.delete(command.path);
      else connection.paths.add(command.path);
      if (values.has(command.path) && command.type !== "unsubscribe")
        push(command.path);
      else server.send(raw);
    });
    server.onMessage((raw) => {
      const message = JSON.parse(String(raw));
      if (!values.has(message.path)) browser.send(raw);
    });
    browser.onClose((code, reason) => {
      connections.delete(connection);
      server.close({ code, reason });
    });
  });
  return {
    set(path: string, value: () => unknown) {
      values.set(path, value);
    },
    push,
    remove(path: string) {
      values.delete(path);
    },
  };
}
export async function realtimeFixture(page: Page) {
  let fixture = fixtures.get(page);
  if (!fixture) {
    fixture = await createFixture(page);
    fixtures.set(page, fixture);
  }
  return fixture;
}

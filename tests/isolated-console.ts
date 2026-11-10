import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { expect } from "@playwright/test";

export async function isolatedConsole() {
  const socket = createServer();
  await new Promise<void>((done) => socket.listen(0, "127.0.0.1", done));
  const address = socket.address();
  if (!address || typeof address === "string") throw new Error("Missing local port");
  const port = address.port;
  await new Promise<void>((done, reject) => socket.close((error) => error ? reject(error) : done()));
  const data = await mkdtemp(join(tmpdir(), "tgc-daily-console-"));
  const url = `http://localhost:${port}`;
  const root = resolve(".next/standalone");
  const server = existsSync(join(root, "server.js")) ? join(root, "server.js") : join(root, "web/server.js");
  const child = spawn(process.execPath, [server], { stdio: "ignore", env: {
    ...process.env, NODE_OPTIONS: "--experimental-sqlite", PORT: String(port), HOSTNAME: "127.0.0.1",
    WEB_DATA_PATH: data, WEBAUTHN_ORIGIN: url, WEBAUTHN_RP_ID: "localhost",
    TELEGRAMCOPILOT_API_URL: process.env.TEST_GATEWAY_URL
      ?? process.env.TELEGRAMCOPILOT_API_URL ?? "http://127.0.0.1:5080",
  } });
  const close = async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise<void>((done) => child.once("exit", () => done()));
      child.kill("SIGTERM");
      await exited;
    }
    await rm(data, { recursive: true, force: true });
  };
  try {
    await expect.poll(async () => {
      try { return (await fetch(`${url}/api/auth/status`)).ok; } catch { return false; }
    }, { timeout: 20_000 }).toBe(true);
    return { url, close };
  } catch (error) { await close(); throw error; }
}

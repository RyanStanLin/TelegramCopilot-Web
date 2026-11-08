"use client";
type Snapshot = { data?: unknown; error: boolean };
type Listener = (value: Snapshot) => void;
type Subscription = { value: Snapshot; listeners: Set<Listener> };
const subscriptions = new Map<string, Subscription>();
let socket: WebSocket | undefined;
let reconnect: ReturnType<typeof setTimeout> | undefined;
let attempts = 0;

function send(type: string, path: string) {
  if (socket?.readyState === WebSocket.OPEN)
    socket.send(JSON.stringify({ type, path }));
}
function publish(path: string, value: Snapshot) {
  const entry = subscriptions.get(path);
  if (!entry) return;
  entry.value = value;
  for (const listener of entry.listeners) listener(value);
}
function connect() {
  if (socket || !subscriptions.size) return;
  const url = new URL("/api/live", window.location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  const current = new WebSocket(url);
  let idle: ReturnType<typeof setTimeout>;
  const expectUpdates = () => {
    clearTimeout(idle);
    idle = setTimeout(() => current.close(), 45_000);
  };
  socket = current;
  expectUpdates();
  current.onopen = () => {
    expectUpdates();
    attempts = 0;
    for (const path of subscriptions.keys()) send("subscribe", path);
  };
  current.onmessage = (event) => {
    if (socket !== current) return;
    expectUpdates();
    try {
      const frame = JSON.parse(String(event.data));
      if (typeof frame.path !== "string") return;
      publish(
        frame.path,
        frame.error
          ? { data: subscriptions.get(frame.path)?.value.data, error: true }
          : { data: frame.data, error: false },
      );
    } catch {
      current.close();
    }
  };
  current.onerror = () => current.close();
  current.onclose = () => {
    clearTimeout(idle);
    if (socket !== current) return;
    socket = undefined;
    for (const [path, entry] of subscriptions)
      publish(path, { ...entry.value, error: true });
    if (subscriptions.size)
      reconnect = setTimeout(
        () => {
          reconnect = undefined;
          connect();
        },
        Math.min(30_000, 1000 * 2 ** attempts++),
      );
  };
}
export const realtime = {
  subscribe(path: string, listener: Listener) {
    let entry = subscriptions.get(path);
    if (!entry) {
      entry = { value: { error: false }, listeners: new Set() };
      subscriptions.set(path, entry);
      send("subscribe", path);
    }
    entry.listeners.add(listener);
    listener(entry.value);
    connect();
    return () => {
      entry.listeners.delete(listener);
      if (!entry.listeners.size) {
        subscriptions.delete(path);
        send("unsubscribe", path);
      }
      if (!subscriptions.size) {
        clearTimeout(reconnect);
        reconnect = undefined;
        const previous = socket;
        socket = undefined;
        previous?.close();
      }
    };
  },
  refresh(path: string) {
    if (reconnect) clearTimeout(reconnect);
    reconnect = undefined;
    connect();
    send("refresh", path);
  },
  update(path: string, data: unknown) {
    publish(path, { data, error: false });
  },
};

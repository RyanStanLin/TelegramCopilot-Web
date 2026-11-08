import http from "node:http";

const target = new URL(process.env.GATEWAY_TARGET ?? "http://127.0.0.1:5080");
const stats = {
  upgrades: 0,
  rejectedOrigins: 0,
  cookieHeaders: 0,
  authorizationHeaders: 0,
};
function headers(request) {
  return { ...request.headers, host: target.host };
}
function writeHead(socket, response) {
  let value = `HTTP/1.1 ${response.statusCode} ${response.statusMessage}\r\n`;
  for (const [name, values] of Object.entries(response.headers))
    for (const entry of Array.isArray(values) ? values : [values])
      if (entry !== undefined) value += `${name}: ${entry}\r\n`;
  socket.write(value + "\r\n");
}
const server = http.createServer((request, response) => {
  if (request.url === "/__gateway") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(stats));
    return;
  }
  const upstream = http.request(
    new URL(request.url, target),
    { method: request.method, headers: headers(request) },
    (result) => {
      response.writeHead(result.statusCode, result.headers);
      result.pipe(response);
    },
  );
  upstream.on("error", () => {
    response.writeHead(502);
    response.end();
  });
  request.pipe(upstream);
});
server.on("upgrade", (request, socket, head) => {
  const origin = request.headers.origin;
  let valid = !origin;
  try {
    valid ||=
      new URL(origin).host.toLowerCase() === request.headers.host.toLowerCase();
  } catch {}
  if (!valid) {
    stats.rejectedOrigins++;
    socket.end(
      "HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n",
    );
    return;
  }
  if (request.headers.cookie) stats.cookieHeaders++;
  if (request.headers.authorization) stats.authorizationHeaders++;
  socket.on("error", () => {});
  const upstream = http.request(new URL(request.url, target), {
    method: request.method,
    headers: headers(request),
  });
  upstream.on("upgrade", (response, connection, initial) => {
    stats.upgrades++;
    connection.on("error", () => socket.destroy());
    socket.on("close", () => connection.destroy());
    connection.on("close", () => socket.destroy());
    writeHead(socket, response);
    if (initial.length) socket.write(initial);
    if (head.length) connection.write(head);
    socket.pipe(connection).pipe(socket);
  });
  upstream.on("response", (response) => {
    writeHead(socket, response);
    response.pipe(socket);
  });
  upstream.on("error", () => socket.destroy());
  upstream.end();
});
server.listen(Number(process.env.GATEWAY_PORT ?? 5081), "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.closeAllConnections();
    server.close(() => process.exit(0));
  });

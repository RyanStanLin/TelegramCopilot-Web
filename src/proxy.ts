import { NextResponse, type NextRequest } from "next/server";
import { origin, readSession } from "@/lib/server/session";

export function proxy(request: NextRequest) {
  const upgrade = request.headers.get("upgrade")?.toLowerCase() === "websocket";
  const trustedOrigin = request.headers.get("origin") === origin();
  if (!upgrade && !trustedOrigin)
    return new NextResponse(null, { status: 403 });
  const session = trustedOrigin
    ? readSession(request.cookies.get("copilot-session")?.value)
    : undefined;
  if (!upgrade && !session) return new NextResponse(null, { status: 401 });
  if (!upgrade) return new NextResponse(null, { status: 426 });
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.delete("authorization");
  headers.set("X-Copilot-Session-Expires", String(session?.expires ?? 0));
  const api = process.env.TELEGRAMCOPILOT_API_URL ?? "http://127.0.0.1:5080";
  return NextResponse.rewrite(new URL("/api/live", api), {
    request: { headers },
  });
}

export const config = { matcher: "/api/live" };

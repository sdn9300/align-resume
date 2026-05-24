import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (per IP)
// Resets every hour. Not suitable for multi-instance deployments.
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_RUNS_PER_WINDOW = 10;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateMap = new Map<string, RateLimitEntry>();

// Periodic cleanup of stale entries (runs every 15 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateMap) {
      if (entry.resetAt < now) rateMap.delete(key);
    }
  }, 15 * 60 * 1000);
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export function middleware(request: NextRequest) {
  // Only rate-limit the pipeline execution endpoint
  if (
    request.method !== "POST" ||
    !request.nextUrl.pathname.startsWith("/api/runs") ||
    request.nextUrl.pathname.split("/").length > 3 // only /api/runs, not /api/runs/[id]
  ) {
    return NextResponse.next();
  }

  const ip = getClientIp(request);
  const now = Date.now();

  let entry = rateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateMap.set(ip, entry);
  }

  entry.count++;

  if (entry.count > MAX_RUNS_PER_WINDOW) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMIT",
          message: `Too many requests. Try again in ${retryAfterSec}s.`,
          stage: "middleware",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(MAX_RUNS_PER_WINDOW),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const remaining = MAX_RUNS_PER_WINDOW - entry.count;
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(MAX_RUNS_PER_WINDOW));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

export const config = {
  matcher: "/api/runs",
};

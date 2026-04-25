import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verify
 *
 * Verifies the shared access password and sets a long-lived cookie.
 * Uses constant-time comparison to prevent timing attacks.
 * Basic per-IP rate limiting: 5 attempts per minute.
 */

// Simple in-memory rate limiter (resets on cold start — fine for a demo)
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count++;
  return entry.count > 5;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to avoid leaking length info via timing
    const buf = Buffer.alloc(Math.max(a.length, b.length));
    crypto.timingSafeEqual(buf, buf);
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password required." }, { status: 400 });
  }

  const expected = process.env.KINLOOP_ACCESS_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "Access password not configured on server." },
      { status: 500 },
    );
  }

  if (!constantTimeEqual(password, expected)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  // Generate a token to store in the cookie (hash of the password + a server secret)
  const token = crypto
    .createHash("sha256")
    .update(expected + (process.env.KINLOOP_ACCESS_SALT || "kinloop-demo-salt"))
    .digest("hex");

  const response = NextResponse.json({ success: true });

  response.cookies.set("kinloop_access", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}

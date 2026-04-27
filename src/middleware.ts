import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

/**
 * Shared-password gate middleware.
 *
 * Checks for a `kinloop_access` cookie on every request to protected routes.
 * If missing or invalid, redirects to /enter.
 *
 * Public routes (no password needed):
 *   - /            (marketing landing page)
 *   - /enter       (password input page)
 *   - /api/health  (deployment health check)
 *   - /_next/*     (Next.js internals)
 *   - static files (images, css, js, etc.)
 */

const PUBLIC_PATHS = ["/", "/enter", "/api/health", "/api/auth/verify"];

function isPublicPath(pathname: string): boolean {
  // Exact matches
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // Next.js internals and static files are handled by the matcher config below
  return false;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for valid access cookie
  const accessCookie = request.cookies.get("kinloop_access")?.value;
  const password = process.env.KINLOOP_ACCESS_PASSWORD;

  if (!password) {
    // If env var not set, allow access (dev fallback)
    return NextResponse.next();
  }

  // Compute expected token (same hash as /api/auth/verify sets)
  const expectedToken = crypto
    .createHash("sha256")
    .update(password + (process.env.KINLOOP_ACCESS_SALT || "kinloop-demo-salt"))
    .digest("hex");

  if (accessCookie === expectedToken) {
    return NextResponse.next();
  }

  // Redirect to /enter with the original URL as a return path
  const enterUrl = new URL("/enter", request.url);
  enterUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(enterUrl);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

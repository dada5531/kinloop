"use client";

import { type ReactNode } from "react";

/**
 * Auth provider — currently a passthrough.
 * Authentication is handled by the shared-password middleware (src/middleware.ts).
 * Replace with ClerkProvider or similar when adding real multi-user auth.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

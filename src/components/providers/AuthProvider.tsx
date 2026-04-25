"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { type ReactNode } from "react";

/**
 * Auth provider that wraps children in ClerkProvider.
 * When Clerk is not configured, the webpack alias in next.config.js
 * replaces @clerk/nextjs with a stub that renders children directly.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

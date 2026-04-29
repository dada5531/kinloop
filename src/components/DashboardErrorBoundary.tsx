"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  quadrant?: string;
}

export default function DashboardErrorBoundary({
  error,
  reset,
  quadrant,
}: DashboardErrorBoundaryProps) {
  useEffect(() => {
    // Structured error logging — searchable in Vercel logs
    console.error("[DashboardError]", {
      quadrant: quadrant || "unknown",
      errorClass: error.name,
      message: error.message,
      digest: error.digest,
      stack: error.stack?.slice(0, 500),
    });
  }, [error, quadrant]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="font-serif-display text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {quadrant
            ? `The ${quadrant} page ran into an unexpected error. Your data is safe — try refreshing or head back to the dashboard.`
            : "This page ran into an unexpected error. Your data is safe — try refreshing or head back to the dashboard."}
        </p>
        {error.digest && (
          <p className="mt-2 text-[10px] font-mono text-muted-foreground/50">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={reset}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5"
          >
            <Link href="/dashboard">
              <Home className="h-3.5 w-3.5" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

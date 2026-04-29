"use client";

import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";

export default function DevelopmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardErrorBoundary error={error} reset={reset} quadrant="Development" />;
}

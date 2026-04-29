"use client";

import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardErrorBoundary error={error} reset={reset} quadrant="Settings" />;
}

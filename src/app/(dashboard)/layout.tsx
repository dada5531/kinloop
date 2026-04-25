import { TopBar } from "@/components/dashboard/TopBar";
import { ChildProvider } from "@/components/providers/ChildProvider";

/**
 * Dashboard layout — shared chrome for all authenticated pages.
 * Uses a persistent top bar with navigation, child info, and metric chips.
 * ChildProvider wraps all dashboard pages for shared child state.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChildProvider>
      <div className="min-h-screen bg-background">
        <TopBar />
        {/* Main content — max-width centered with padding */}
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </ChildProvider>
  );
}

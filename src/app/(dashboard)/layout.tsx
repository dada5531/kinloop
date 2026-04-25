import { Sidebar } from "@/components/dashboard/Sidebar";
import { ChildProvider } from "@/components/providers/ChildProvider";

/**
 * Dashboard layout — shared chrome for all authenticated pages.
 * Includes sidebar with navigation, child selector, and user button.
 * ChildProvider wraps all dashboard pages for shared child state.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChildProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ChildProvider>
  );
}

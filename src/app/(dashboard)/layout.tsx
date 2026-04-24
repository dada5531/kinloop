import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

/**
 * Dashboard layout — shared chrome for all authenticated pages.
 * Includes header with navigation, child selector, and user button.
 * TODO: Add ChildSelector component and sidebar navigation.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card p-6 lg:flex">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          KIN<span className="text-primary">LOOP</span>
        </Link>

        {/* TODO: Add ChildSelector component here */}
        <div className="mt-8 rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
          Child selector placeholder
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Dashboard
          </Link>
          <Link
            href="/scheduler"
            className="rounded-lg px-3 py-2 text-sm font-medium text-scheduler hover:bg-scheduler-muted"
          >
            Scheduler
          </Link>
          <Link
            href="/development"
            className="rounded-lg px-3 py-2 text-sm font-medium text-development hover:bg-development-muted"
          >
            Development
          </Link>
          <Link
            href="/play"
            className="rounded-lg px-3 py-2 text-sm font-medium text-play hover:bg-play-muted"
          >
            Play Lab
          </Link>
          <Link
            href="/coach"
            className="rounded-lg px-3 py-2 text-sm font-medium text-coach hover:bg-coach-muted"
          >
            Coach
          </Link>
        </nav>

        <div className="mt-auto pt-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}

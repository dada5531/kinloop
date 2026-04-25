"use client";

import {
  Calendar,
  BarChart3,
  Palette,
  MessageCircle,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { useChild } from "@/components/providers/ChildProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scheduler", label: "Scheduler", icon: Calendar },
  { href: "/development", label: "Development", icon: BarChart3 },
  { href: "/play", label: "Play Lab", icon: Palette },
  { href: "/coach", label: "Coach", icon: MessageCircle },
];

interface MetricChips {
  eventsThisWeek: number;
  healthRecords: number;
  savedActivities: number;
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { selectedChild, getAgeDisplay, isLoading } = useChild();
  const [metrics, setMetrics] = useState<MetricChips>({
    eventsThisWeek: 0,
    healthRecords: 0,
    savedActivities: 0,
  });

  const childId = selectedChild?.id;

  const fetchMetrics = useCallback(async () => {
    if (!childId) return;
    try {
      const [eventsRes, healthRes, activitiesRes] = await Promise.all([
        fetch(`/api/events?childId=${childId}`),
        fetch(`/api/health-records?childId=${childId}`),
        fetch(`/api/activities?childId=${childId}`),
      ]);
      const events = eventsRes.ok ? await eventsRes.json() : [];
      const health = healthRes.ok ? await healthRes.json() : [];
      const activities = activitiesRes.ok ? await activitiesRes.json() : [];

      // Count events this week
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const thisWeekEvents = events.filter((e: { start_time: string | null }) => {
        if (!e.start_time) return false;
        const d = new Date(e.start_time);
        return d >= now && d <= weekFromNow;
      });

      setMetrics({
        eventsThisWeek: thisWeekEvents.length,
        healthRecords: health.length,
        savedActivities: activities.length,
      });
    } catch {
      // Silently fail — metrics are non-critical
    }
  }, [childId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  function handleLogout() {
    document.cookie = "kinloop_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/enter");
    router.refresh();
  }

  return (
    <>
      {/* Desktop top bar */}
      <header className="sticky top-0 z-40 border-b-[0.5px] border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-base font-semibold tracking-tight text-foreground"
            >
              kin<span className="font-normal text-muted-foreground">loop</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-background-secondary text-foreground"
                        : "text-muted-foreground hover:bg-background-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Child info + synced + logout */}
          <div className="flex items-center gap-4">
            {/* Synced indicator */}
            <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>Synced</span>
            </div>

            {/* Child avatar + name */}
            {!isLoading && selectedChild && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-scheduler/10 text-xs font-semibold text-scheduler">
                  {selectedChild.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[13px] font-medium leading-none text-foreground">
                    {selectedChild.name}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-none text-muted-foreground">
                    {getAgeDisplay(selectedChild.dob)}
                  </p>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-background-secondary hover:text-foreground lg:block"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-background-secondary lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Metric chips row */}
        {!isLoading && selectedChild && (
          <div className="mx-auto hidden max-w-7xl border-t-[0.5px] border-border px-6 lg:block">
            <div className="flex items-center gap-3 py-2">
              <MetricChip label="This week" value={`${metrics.eventsThisWeek} events`} />
              <MetricChip label="Health records" value={`${metrics.healthRecords}`} />
              <MetricChip label="Saved activities" value={`${metrics.savedActivities}`} />
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="animate-fade-in fixed right-0 top-14 z-50 w-64 rounded-bl-xl border-[0.5px] border-border bg-card p-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-background-secondary text-foreground"
                        : "text-muted-foreground hover:bg-background-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-3 border-t-[0.5px] border-border pt-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-background-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-background-secondary px-2.5 py-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-[11px] font-medium text-foreground">{value}</span>
    </div>
  );
}

"use client";

import { LayoutDashboard, ChevronDown, Baby, Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  SchedulerIcon,
  DevelopmentIcon,
  PlayLabIcon,
  CoachIcon,
} from "@/components/icons/QuadrantIcons";
import { useChild } from "@/components/providers/ChildProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", color: "", icon: LayoutDashboard, custom: false },
  {
    href: "/scheduler",
    label: "Scheduler",
    color: "text-scheduler",
    icon: SchedulerIcon,
    custom: true,
  },
  {
    href: "/development",
    label: "Development",
    color: "text-development",
    icon: DevelopmentIcon,
    custom: true,
  },
  { href: "/play", label: "Play Lab", color: "text-play", icon: PlayLabIcon, custom: true },
  { href: "/coach", label: "Coach", color: "text-coach", icon: CoachIcon, custom: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { children, selectedChild, setSelectedChildId, getAgeDisplay, isLoading } = useChild();
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);

  function handleLogout() {
    document.cookie = "kinloop_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/enter");
    router.refresh();
  }

  const sidebarContent = (
    <>
      <Link href="/dashboard" className="text-base font-semibold tracking-tight text-foreground">
        kin<span className="font-normal text-muted-foreground">loop</span>
      </Link>

      {/* Child Selector */}
      <div className="relative mt-6">
        {isLoading ? (
          <div className="animate-pulse rounded-lg border-[0.5px] border-dashed border-border p-3 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : children.length === 0 ? (
          <div className="rounded-lg border-[0.5px] border-dashed border-border p-3 text-center text-sm text-muted-foreground">
            <Baby className="mx-auto mb-1 h-4 w-4 opacity-50" />
            No children yet
          </div>
        ) : (
          <button
            onClick={() => setChildDropdownOpen(!childDropdownOpen)}
            className="flex w-full items-center gap-3 rounded-lg border-[0.5px] border-border bg-background p-3 text-left transition-colors hover:bg-background-secondary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-scheduler/10 text-sm font-semibold text-scheduler">
              {selectedChild?.name?.charAt(0) || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {selectedChild?.name || "Select child"}
              </p>
              {selectedChild && (
                <p className="text-xs text-muted-foreground">{getAgeDisplay(selectedChild.dob)}</p>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${childDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
        )}

        {/* Dropdown */}
        {childDropdownOpen && children.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border-[0.5px] border-border bg-card">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  setSelectedChildId(child.id);
                  setChildDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-3 p-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-background-secondary ${
                  child.id === selectedChild?.id ? "bg-background-secondary" : ""
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-scheduler/10 text-xs font-semibold text-scheduler">
                  {child.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{child.name}</p>
                  <p className="text-xs text-muted-foreground">{getAgeDisplay(child.dob)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? `bg-background-secondary ${item.color || "text-foreground"}`
                  : `hover:bg-background-secondary ${item.color || "text-foreground"}`
              }`}
            >
              {item.custom ? <item.icon size={16} /> : <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r-[0.5px] border-border bg-card p-6 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b-[0.5px] border-border bg-card px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="text-base font-semibold tracking-tight text-foreground">
          kin<span className="font-normal text-muted-foreground">loop</span>
        </Link>
        <div className="flex items-center gap-2">
          {selectedChild && (
            <span className="text-xs text-muted-foreground">{selectedChild.name}</span>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 hover:bg-background-secondary"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed bottom-0 left-0 top-0 z-50 flex w-64 flex-col border-r-[0.5px] border-border bg-card p-6 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

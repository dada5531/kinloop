/**
 * KINLOOP AppShell — Persistent sidebar navigation + header with child selector
 * Design: Scandinavian Warm Minimalism — cream background, soft shadows, DM Sans headings
 */
import { Link, useLocation } from "wouter";
import { demoChildren, demoParent } from "@/lib/demo-data";
import {
  Calendar,
  TrendingUp,
  Palette,
  MessageCircle,
  LayoutGrid,
  ChevronDown,
  Plus,
  Bell,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutGrid, color: "text-foreground" },
  { path: "/scheduler", label: "Scheduler", icon: Calendar, color: "text-purple" },
  { path: "/development", label: "Development", icon: TrendingUp, color: "text-teal" },
  { path: "/play", label: "Play Lab", icon: Palette, color: "text-coral" },
  { path: "/coach", label: "Coach", icon: MessageCircle, color: "text-rose" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const child = demoChildren[0];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm">
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/">
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              KIN<span className="text-purple">LOOP</span>
            </span>
          </Link>
        </div>

        {/* Child selector */}
        <div className="px-4 pb-4">
          <button
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted transition-colors"
            onClick={() => toast("Child selector coming soon")}
          >
            <Avatar className="h-9 w-9 bg-purple-light">
              <AvatarFallback className="bg-purple-light text-purple font-heading font-semibold text-sm">
                {child.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{child.name}</p>
              <p className="text-xs text-muted-foreground">{child.age}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 ${isActive ? item.color : ""}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-border space-y-1">
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors w-full"
            onClick={() => toast("Settings coming soon")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {demoParent.name[0]}
            </div>
            {demoParent.name}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
          <Link href="/">
            <span className="font-heading text-lg font-bold tracking-tight">
              KIN<span className="text-purple">LOOP</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast("Notifications coming soon")}>
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-7 w-7 bg-purple-light">
              <AvatarFallback className="bg-purple-light text-purple text-xs font-semibold">
                {child.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          className="flex-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children}
        </motion.main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40">
          <div className="flex items-center justify-around py-2 px-2">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div className="flex flex-col items-center gap-0.5 py-1 px-3">
                    <item.icon
                      className={`h-5 w-5 transition-colors ${
                        isActive ? item.color : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

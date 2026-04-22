/**
 * KINLOOP Dashboard — 2×2 quadrant grid home view
 * Design: Scandinavian Warm Minimalism — cream bg, soft shadows, muted quadrant accents
 */
import AppShell from "@/components/AppShell";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useChild } from "@/contexts/ChildContext";
import { trpc } from "@/lib/trpc";
import {
  Calendar,
  TrendingUp,
  Palette,
  MessageCircle,
  Plus,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { selectedChild, isLoading: childLoading } = useChild();
  const [, navigate] = useLocation();

  const { data: contextData, isLoading: contextLoading } = trpc.context.summary.useQuery(
    { childId: selectedChild?.id ?? 0 },
    { enabled: !!selectedChild?.id, staleTime: 30_000 }
  );

  // If not authenticated, show login prompt
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            KIN<span className="text-purple">LOOP</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            Your AI-powered parenting dashboard. Sign in to get started.
          </p>
          <Button
            className="bg-purple hover:bg-purple/90 text-white"
            onClick={() => { window.location.href = getLoginUrl(); }}
          >
            Sign in to KINLOOP
          </Button>
        </div>
      </div>
    );
  }

  if (authLoading || childLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple" />
      </div>
    );
  }

  // If no child, redirect to onboarding
  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
            Welcome to KIN<span className="text-purple">LOOP</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            Let's set up your child's profile to get started.
          </p>
          <Button
            className="bg-purple hover:bg-purple/90 text-white"
            onClick={() => navigate("/onboarding")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your child
          </Button>
        </div>
      </div>
    );
  }

  const stats = contextData?.stats;
  const childAge = selectedChild.dob
    ? (() => {
        const dob = new Date(selectedChild.dob);
        const now = new Date();
        const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
        const years = Math.floor(months / 12);
        const rem = months % 12;
        return `${years}y ${rem}mo`;
      })()
    : "";

  const quadrants = [
    {
      id: "scheduler",
      title: "Scheduler",
      subtitle: "Emails → calendar events",
      icon: Calendar,
      path: "/scheduler",
      colorClass: "text-purple",
      bgClass: "bg-purple-light",
      borderClass: "border-purple/20",
      accentClass: "bg-purple",
      items: (contextData?.recentEvents ?? []).slice(0, 2).map((e: any) => ({
        label: e.title,
        detail: e.startTime ? new Date(e.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date",
      })),
      count: stats?.totalEvents ?? 0,
      countLabel: stats?.pendingEvents ? `${stats.pendingEvents} pending` : "events",
    },
    {
      id: "development",
      title: "Development",
      subtitle: "Growth, milestones & health",
      icon: TrendingUp,
      path: "/development",
      colorClass: "text-teal",
      bgClass: "bg-teal-light",
      borderClass: "border-teal/20",
      accentClass: "bg-teal",
      items: (contextData?.recentRecords ?? []).slice(0, 2).map((r: any) => ({
        label: r.type === "well-visit" ? "Well-child visit" : r.type === "school_report" ? "Progress report" : r.type,
        detail: r.visitDate ? new Date(r.visitDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
      })),
      count: stats?.totalRecords ?? 0,
      countLabel: "records",
    },
    {
      id: "play",
      title: "Play Lab",
      subtitle: "Activities from social links",
      icon: Palette,
      path: "/play",
      colorClass: "text-coral",
      bgClass: "bg-coral-light",
      borderClass: "border-coral/20",
      accentClass: "bg-coral",
      items: (contextData?.recentActivities ?? []).slice(0, 2).map((a: any) => ({
        label: a.title,
        detail: a.durationMinutes ? `${a.durationMinutes} min` : "",
      })),
      count: stats?.totalActivities ?? 0,
      countLabel: "saved",
    },
    {
      id: "coach",
      title: "Coach",
      subtitle: "Personalized parenting guidance",
      icon: MessageCircle,
      path: "/coach",
      colorClass: "text-rose",
      bgClass: "bg-rose-light",
      borderClass: "border-rose/20",
      accentClass: "bg-rose",
      items: [
        { label: "Managing big emotions", detail: `Ages 3-5` },
        { label: "Preparing for kindergarten", detail: `Ages 3-5` },
      ],
      count: 0,
      countLabel: "conversations",
    },
  ];

  const userName = user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">
            {greeting}, {userName}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Here's what's happening with {selectedChild.name} ({childAge}) today
          </p>
        </div>

        {/* Cross-quadrant insights banner */}
        {contextData && (contextData.recentEvents.length > 0 || contextData.recentRecords.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 rounded-xl bg-card border border-border shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4 text-purple" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">Quick summary</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.pendingEvents
                    ? `${stats.pendingEvents} event${stats.pendingEvents > 1 ? "s" : ""} need${stats.pendingEvents === 1 ? "s" : ""} review. `
                    : ""}
                  {stats?.totalRecords
                    ? `${stats.totalRecords} health record${stats.totalRecords > 1 ? "s" : ""} on file. `
                    : ""}
                  {stats?.totalActivities
                    ? `${stats.totalActivities} activit${stats.totalActivities > 1 ? "ies" : "y"} saved.`
                    : ""}
                  {!stats?.pendingEvents && !stats?.totalRecords && !stats?.totalActivities
                    ? "Start by adding content to any quadrant — paste an email, upload a document, or share a link."
                    : ""}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2×2 Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {quadrants.map((q) => (
            <motion.div key={q.id} variants={cardVariants}>
              <Link href={q.path}>
                <div className="group relative bg-card rounded-2xl border border-border p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  {/* Top accent bar */}
                  <div className={`absolute top-0 left-6 right-6 h-0.5 ${q.accentClass} rounded-b opacity-60`} />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${q.bgClass} flex items-center justify-center`}>
                        <q.icon className={`h-5 w-5 ${q.colorClass}`} />
                      </div>
                      <div>
                        <h2 className="font-heading text-base font-semibold text-foreground">{q.title}</h2>
                        <p className="text-xs text-muted-foreground">{q.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2.5 mb-4 min-h-[60px]">
                    {q.items.length > 0 ? (
                      q.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`h-1.5 w-1.5 rounded-full ${q.accentClass} flex-shrink-0`} />
                            <span className="text-sm text-foreground truncate">{item.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{item.detail}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No items yet — tap to get started</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      {q.count} {q.countLabel}
                    </span>
                    <span className={`text-xs font-medium ${q.colorClass} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                      Open <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-full"
            onClick={() => navigate("/scheduler")}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-purple" />
            Paste an email or upload PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-full"
            onClick={() => navigate("/development")}
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-teal" />
            Upload health record
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-full"
            onClick={() => navigate("/play")}
          >
            <Palette className="h-3.5 w-3.5 mr-1.5 text-coral" />
            Paste activity link
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-full"
            onClick={() => navigate("/coach")}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5 text-rose" />
            Ask the coach
          </Button>
        </motion.div>
      </div>
    </AppShell>
  );
}

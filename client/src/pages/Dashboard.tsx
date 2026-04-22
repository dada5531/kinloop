/**
 * KINLOOP Dashboard — 2×2 quadrant grid home view
 * Design: Scandinavian Warm Minimalism — cream bg, soft shadows, muted quadrant accents
 */
import AppShell from "@/components/AppShell";
import { Link } from "wouter";
import {
  Calendar,
  TrendingUp,
  Palette,
  MessageCircle,
  Plus,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoChildren, demoSchedulerEvents, demoHealthRecords, demoActivities, demoCoachTopics, demoContextInsights } from "@/lib/demo-data";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
    items: demoSchedulerEvents.filter(e => e.status === 'pending').map(e => ({
      label: e.title,
      detail: new Date(e.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })),
    count: demoSchedulerEvents.filter(e => e.status === 'pending').length,
    countLabel: "pending",
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
    items: demoHealthRecords.slice(0, 2).map(r => ({
      label: r.type === 'well-visit' ? 'Well-child visit' : 'Progress report',
      detail: new Date(r.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })),
    count: demoHealthRecords.length,
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
    items: demoActivities.map(a => ({
      label: a.title,
      detail: `${a.durationMinutes} min`,
    })),
    count: demoActivities.length,
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
    items: demoCoachTopics.slice(0, 2).map(t => ({
      label: t.title,
      detail: `Ages ${t.ageBucket}`,
    })),
    count: demoCoachTopics.length,
    countLabel: "topics",
  },
];

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
  const child = demoChildren[0];

  return (
    <AppShell>
      <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">
            Good morning, Jenn
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Here's what's happening with {child.name} today
          </p>
        </div>

        {/* Cross-quadrant insights banner */}
        {demoContextInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 rounded-xl bg-card border border-border shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple text-sm">AI</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">Cross-quadrant insight</p>
                <p className="text-sm text-muted-foreground">
                  {demoContextInsights[0].description}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground flex-shrink-0">
                View all
              </Button>
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
                    <button
                      className={`h-8 w-8 rounded-lg ${q.bgClass} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toast(`Quick add for ${q.title} coming soon`);
                      }}
                    >
                      <Plus className={`h-4 w-4 ${q.colorClass}`} />
                    </button>
                  </div>

                  {/* Items */}
                  <div className="space-y-2.5 mb-4">
                    {q.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`h-1.5 w-1.5 rounded-full ${q.accentClass} flex-shrink-0`} />
                          <span className="text-sm text-foreground truncate">{item.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{item.detail}</span>
                      </div>
                    ))}
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
            onClick={() => toast("Demo: Try forwarding an email to jenn+parent@kinloop.app")}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-purple" />
            Forward an email
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-full"
            onClick={() => toast("Demo: Upload a pediatrician summary")}
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-teal" />
            Upload health record
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-full"
            onClick={() => toast("Demo: Paste a TikTok or YouTube link")}
          >
            <Palette className="h-3.5 w-3.5 mr-1.5 text-coral" />
            Paste activity link
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-full"
            onClick={() => toast("Demo: Ask about bedtime routines")}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5 text-rose" />
            Ask the coach
          </Button>
        </motion.div>
      </div>
    </AppShell>
  );
}

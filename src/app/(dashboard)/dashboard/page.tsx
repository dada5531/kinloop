"use client";

import { Calendar, BarChart3, Palette, MessageCircle, Clock } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { useChild } from "@/components/providers/ChildProvider";
import { EmptyState } from "@/components/ui/empty-state";
import { QuadrantCard, PreviewRow } from "@/components/ui/quadrant-card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  events: Array<{
    id: string;
    title: string;
    start_time: string | null;
    location: string | null;
    status: string;
  }>;
  healthRecords: Array<{ id: string; type: string; visit_date: string; summary: string | null }>;
  activities: Array<{ id: string; title: string; category: string; difficulty: string }>;
  eventsCount: number;
  healthCount: number;
  activitiesCount: number;
}

function DashboardSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <Skeleton className="mb-2 h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border-[0.5px] border-border bg-card p-6">
            <Skeleton className="mb-3 h-4 w-20" />
            <Skeleton className="mb-4 h-5 w-40" />
            <div className="space-y-2.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { selectedChild, selectedChildId } = useChild();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!selectedChildId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [eventsRes, healthRes, activitiesRes] = await Promise.all([
        fetch(`/api/events?childId=${selectedChildId}`),
        fetch(`/api/health-records?childId=${selectedChildId}`),
        fetch(`/api/activities?childId=${selectedChildId}`),
      ]);

      const events = eventsRes.ok ? await eventsRes.json() : [];
      const healthRecords = healthRes.ok ? await healthRes.json() : [];
      const activities = activitiesRes.ok ? await activitiesRes.json() : [];

      setData({
        events: events.slice(0, 3),
        healthRecords: healthRecords.slice(0, 3),
        activities: activities.slice(0, 3),
        eventsCount: events.length,
        healthCount: healthRecords.length,
        activitiesCount: activities.length,
      });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const greeting = getTimeOfDayGreeting();

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">
          {selectedChild ? `${greeting}, ${selectedChild.name.split(" ")[0]}` : greeting}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {selectedChild
            ? `Here's what's happening for ${selectedChild.name}`
            : "Select a child to see their dashboard"}
        </p>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Scheduler */}
        <QuadrantCard
          href="/scheduler"
          label="Scheduler"
          headline={
            data?.eventsCount
              ? `${data.eventsCount} event${data.eventsCount !== 1 ? "s" : ""} tracked`
              : "No events yet"
          }
          accentColor="scheduler"
          icon={Calendar}
        >
          {data?.events && data.events.length > 0 ? (
            data.events.map((evt) => (
              <PreviewRow
                key={evt.id}
                dot={evt.status === "approved" ? "bg-green-500" : "bg-scheduler"}
                label={evt.title}
                meta={
                  evt.start_time
                    ? new Date(evt.start_time).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : undefined
                }
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              Paste an email to extract events automatically.
            </p>
          )}
        </QuadrantCard>

        {/* Development */}
        <QuadrantCard
          href="/development"
          label="Development"
          headline={
            data?.healthCount
              ? `${data.healthCount} record${data.healthCount !== 1 ? "s" : ""}`
              : "No records yet"
          }
          accentColor="development"
          icon={BarChart3}
        >
          {data?.healthRecords && data.healthRecords.length > 0 ? (
            data.healthRecords.map((rec) => (
              <PreviewRow
                key={rec.id}
                dot="bg-development"
                label={`${rec.type.replace("_", " ")}${rec.summary ? ` — ${rec.summary.slice(0, 35)}` : ""}`}
                meta={new Date(rec.visit_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              Paste pediatrician notes to track growth and milestones.
            </p>
          )}
        </QuadrantCard>

        {/* Play Lab */}
        <QuadrantCard
          href="/play"
          label="Play Lab"
          headline={
            data?.activitiesCount
              ? `${data.activitiesCount} activit${data.activitiesCount !== 1 ? "ies" : "y"} saved`
              : "No activities yet"
          }
          accentColor="play"
          icon={Palette}
        >
          {data?.activities && data.activities.length > 0 ? (
            data.activities.map((act) => (
              <PreviewRow
                key={act.id}
                dot="bg-play"
                label={act.title}
                meta={act.category || act.difficulty}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              Paste a link to extract an activity plan.
            </p>
          )}
        </QuadrantCard>

        {/* Coach */}
        <QuadrantCard
          href="/coach"
          label="Coach"
          headline="AI parenting guidance"
          accentColor="coach"
          icon={MessageCircle}
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            Ask about sleep, nutrition, tantrums, milestones — personalized to{" "}
            {selectedChild ? selectedChild.name : "your child"}.
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {["Sleep", "Tantrums", "Nutrition", "Milestones"].map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-coach-muted px-2.5 py-0.5 text-[11px] font-medium text-coach"
              >
                {topic}
              </span>
            ))}
          </div>
        </QuadrantCard>
      </div>
    </div>
  );
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

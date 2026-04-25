"use client";

import {
  Calendar,
  BarChart3,
  Gamepad2,
  MessageCircle,
  ChevronRight,
  Clock,
  MapPin,
  Loader2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

import { useChild } from "@/components/providers/ChildProvider";

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
    return (
      <div className="flex h-full items-center justify-center pt-14 lg:pt-0">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 lg:pt-0">
      <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            {selectedChild ? `${selectedChild.name}'s Dashboard` : "Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your 2×2 overview of everything happening
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {/* Scheduler Quadrant */}
          <Link href="/scheduler" className="group">
            <div className="h-full rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-scheduler-muted">
                    <Calendar className="h-4 w-4 text-scheduler" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Scheduler</h2>
                    <p className="text-xs text-muted-foreground">{data?.eventsCount || 0} events</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-scheduler" />
              </div>

              {data?.events && data.events.length > 0 ? (
                <div className="space-y-2">
                  {data.events.map((evt) => (
                    <div key={evt.id} className="flex items-center gap-2 text-xs">
                      <span
                        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                          evt.status === "approved" ? "bg-green-500" : "bg-scheduler"
                        }`}
                      />
                      <span className="flex-1 truncate text-foreground">{evt.title}</span>
                      {evt.start_time && (
                        <span className="flex items-center gap-0.5 whitespace-nowrap text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(evt.start_time).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No events yet. Paste an email to get started.
                </p>
              )}
            </div>
          </Link>

          {/* Development Quadrant */}
          <Link href="/development" className="group">
            <div className="h-full rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-development-muted">
                    <BarChart3 className="h-4 w-4 text-development" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Development</h2>
                    <p className="text-xs text-muted-foreground">
                      {data?.healthCount || 0} records
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-development" />
              </div>

              {data?.healthRecords && data.healthRecords.length > 0 ? (
                <div className="space-y-2">
                  {data.healthRecords.map((rec) => (
                    <div key={rec.id} className="flex items-center gap-2 text-xs">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-development" />
                      <span className="flex-1 truncate text-foreground">
                        {rec.type.replace("_", " ")}{" "}
                        {rec.summary ? `— ${rec.summary.slice(0, 40)}...` : ""}
                      </span>
                      <span className="whitespace-nowrap text-muted-foreground">
                        {new Date(rec.visit_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No health records yet. Paste pediatrician notes to start.
                </p>
              )}
            </div>
          </Link>

          {/* Play Lab Quadrant */}
          <Link href="/play" className="group">
            <div className="h-full rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-play-muted">
                    <Gamepad2 className="h-4 w-4 text-play" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Play Lab</h2>
                    <p className="text-xs text-muted-foreground">
                      {data?.activitiesCount || 0} activities
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-play" />
              </div>

              {data?.activities && data.activities.length > 0 ? (
                <div className="space-y-2">
                  {data.activities.map((act) => (
                    <div key={act.id} className="flex items-center gap-2 text-xs">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-play" />
                      <span className="flex-1 truncate text-foreground">{act.title}</span>
                      <span className="text-muted-foreground">{act.category}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No activities yet. Paste a link to extract an activity plan.
                </p>
              )}
            </div>
          </Link>

          {/* Coach Quadrant */}
          <Link href="/coach" className="group">
            <div className="h-full rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coach-muted">
                    <MessageCircle className="h-4 w-4 text-coach" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Coach</h2>
                    <p className="text-xs text-muted-foreground">AI parenting guidance</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-coach" />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Ask about sleep, nutrition, tantrums, milestones, and more — personalized to{" "}
                  {selectedChild ? selectedChild.name : "your child"}.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Sleep", "Tantrums", "Nutrition", "Milestones"].map((topic) => (
                    <span
                      key={topic}
                      className="rounded bg-coach-muted px-2 py-0.5 text-xs text-coach"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

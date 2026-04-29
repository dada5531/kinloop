"use client";

import { Check, Loader2, Mail, Bell, Shield, ChevronRight, ImageIcon, MapPin, Heart } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { WelcomePhotoUploader } from "@/components/WelcomePhotoUploader";
import { useChild } from "@/components/providers/ChildProvider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { logError } from "@/lib/logger";
import { showErrorToast } from "@/lib/error-toasts";

// ─── Types ──────────────────────────────────────────────────────
interface Settings {
  notification_email: string | null;
  email_calendar_invites: string | null;
  email_weekly_digest: string | null;
  zocdoc_zip_code: string | null;
  insurance_provider: string | null;
}

// ─── Main Component ─────────────────────────────────────────────
export default function SettingsPage() {
  const { selectedChild, isLoading: childLoading, refetch } = useChild();

  const [settings, setSettings] = useState<Settings>({
    notification_email: null,
    email_calendar_invites: "true",
    email_weekly_digest: "true",
    zocdoc_zip_code: null,
    insurance_provider: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [insuranceInput, setInsuranceInput] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
        if (data.notification_email) {
          setEmailInput(data.notification_email);
        }
        if (data.zocdoc_zip_code) {
          setZipInput(data.zocdoc_zip_code);
        }
        if (data.insurance_provider) {
          setInsuranceInput(data.insurance_provider);
        }
      }
    } catch (err) {
      logError(err, { route: "settings" });
      showErrorToast("save");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save a setting
  const saveSetting = async (key: string, value: string) => {
    setSaving(key);
    setSaveError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setSaved(key);
        setTimeout(() => setSaved(null), 2000);
      } else {
        const data = await res.json().catch(() => null);
        setSaveError(data?.error || "Failed to save. Please try again.");
        setTimeout(() => setSaveError(null), 4000);
      }
    } catch (err) {
      logError(err, { route: "settings.save" });
      setSaveError("Network error. Please try again.");
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setSaving(null);
    }
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif-display text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure your Kinloop preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Welcome Photo */}
        <div className="rounded-xl border-[0.5px] border-border bg-card">
          <div className="border-b-[0.5px] border-border p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-play-muted">
                <ImageIcon className="h-4 w-4 text-play" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Welcome photo</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedChild
                    ? `Photo shown on ${selectedChild.name}'s welcome screen`
                    : "Upload a photo for the welcome screen"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {childLoading ? (
              <div className="flex justify-center py-8">
                <Skeleton className="h-48 w-48 rounded-2xl" />
              </div>
            ) : selectedChild ? (
              <WelcomePhotoUploader
                childId={selectedChild.id}
                childName={selectedChild.name}
                currentPhotoUrl={selectedChild.photo_url}
                onPhotoUpdated={refetch}
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No child profile found. Add a child first.
              </p>
            )}
          </div>
        </div>

        {/* Email Configuration */}
        <div className="rounded-xl border-[0.5px] border-border bg-card">
          <div className="border-b-[0.5px] border-border p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-scheduler-muted">
                <Mail className="h-4 w-4 text-scheduler" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Email address</h2>
                <p className="text-xs text-muted-foreground">
                  Calendar invites and notifications are sent here
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 rounded-lg border-[0.5px] border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-scheduler/30"
                  />
                  <Button
                    size="sm"
                    onClick={() => saveSetting("notification_email", emailInput)}
                    disabled={
                      saving === "notification_email" ||
                      !emailInput.includes("@") ||
                      emailInput === settings.notification_email
                    }
                  >
                    {saving === "notification_email" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : saved === "notification_email" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
                {saved === "notification_email" && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Email saved. Calendar invites will be sent here.
                  </p>
                )}
                {saveError && (
                  <p className="text-xs text-red-500">{saveError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Healthcare Preferences */}
        <div className="rounded-xl border-[0.5px] border-border bg-card">
          <div className="border-b-[0.5px] border-border p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-development-muted">
                <Heart className="h-4 w-4 text-development" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Healthcare</h2>
                <p className="text-xs text-muted-foreground">
                  Pre-fill doctor search with your location and insurance
                </p>
              </div>
            </div>
          </div>
          <div className="divide-y-[0.5px] divide-border">
            {/* ZIP Code */}
            <div className="p-5">
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <label className="text-sm font-medium text-foreground">ZIP code</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="e.g. 02163"
                      className="w-32 rounded-lg border-[0.5px] border-border bg-background px-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-development/30"
                    />
                    <Button
                      size="sm"
                      onClick={() => saveSetting("zocdoc_zip_code", zipInput)}
                      disabled={
                        saving === "zocdoc_zip_code" ||
                        zipInput.length !== 5 ||
                        zipInput === settings.zocdoc_zip_code
                      }
                    >
                      {saving === "zocdoc_zip_code" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : saved === "zocdoc_zip_code" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                  {saved === "zocdoc_zip_code" && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> ZIP code saved.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Insurance Provider */}
            <div className="p-5">
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    <label className="text-sm font-medium text-foreground">Insurance provider</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={insuranceInput}
                      onChange={(e) => setInsuranceInput(e.target.value)}
                      placeholder="e.g. Blue Cross Blue Shield"
                      className="flex-1 rounded-lg border-[0.5px] border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-development/30"
                    />
                    <Button
                      size="sm"
                      onClick={() => saveSetting("insurance_provider", insuranceInput)}
                      disabled={
                        saving === "insurance_provider" ||
                        !insuranceInput.trim() ||
                        insuranceInput === settings.insurance_provider
                      }
                    >
                      {saving === "insurance_provider" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : saved === "insurance_provider" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                  {saved === "insurance_provider" && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Insurance provider saved.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-xl border-[0.5px] border-border bg-card">
          <div className="border-b-[0.5px] border-border p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coach-muted">
                <Bell className="h-4 w-4 text-coach" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                <p className="text-xs text-muted-foreground">Choose which emails you receive</p>
              </div>
            </div>
          </div>
          <div className="divide-y-[0.5px] divide-border">
            {/* Calendar invites toggle */}
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-foreground">Calendar invites</p>
                <p className="text-xs text-muted-foreground">
                  Receive .ics files when events are extracted
                </p>
              </div>
              <button
                onClick={() =>
                  saveSetting(
                    "email_calendar_invites",
                    settings.email_calendar_invites === "true" ? "false" : "true",
                  )
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.email_calendar_invites === "true"
                    ? "bg-scheduler"
                    : "bg-muted-foreground/20"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    settings.email_calendar_invites === "true" ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Weekly digest toggle */}
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-foreground">Weekly digest</p>
                <p className="text-xs text-muted-foreground">
                  Summary of upcoming events and action items
                </p>
              </div>
              <button
                onClick={() =>
                  saveSetting(
                    "email_weekly_digest",
                    settings.email_weekly_digest === "true" ? "false" : "true",
                  )
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.email_weekly_digest === "true"
                    ? "bg-scheduler"
                    : "bg-muted-foreground/20"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    settings.email_weekly_digest === "true" ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border-[0.5px] border-border bg-card">
          <div className="border-b-[0.5px] border-border p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-development-muted">
                <Shield className="h-4 w-4 text-development" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Security</h2>
                <p className="text-xs text-muted-foreground">Access and authentication</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Access password</p>
                <p className="text-xs text-muted-foreground">Shared password for demo access</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Protected</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="rounded-xl border-[0.5px] border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Kinloop v1.7</p>
              <p className="text-xs text-muted-foreground">HBS MBA Capstone 2026</p>
            </div>
            <span className="text-[10px] text-muted-foreground">
              Built with Next.js · Supabase · Claude
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

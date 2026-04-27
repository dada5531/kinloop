"use client";

import {
  ClipboardPaste,
  Sparkles,
  Loader2,
  X,
  AlertTriangle,
  Check,
  Clock,
  ListChecks,
  ShoppingCart,
  Shield,
  Brain,
  ChevronDown,
  ChevronUp,
  Plus,
  Link as LinkIcon,
  Star,
  Youtube,
  Globe,
  ExternalLink,
  FileText,
  CalendarPlus,
  Baby,
  ShoppingBag,
  Bell,
  Pencil,
  Calendar,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { PlayLabIcon } from "@/components/icons/QuadrantIcons";
import { PlayLabEmpty } from "@/components/illustrations/PlayLabEmpty";
import { AchievementMicro, ActivityScheduled, SensoryIcon, MotorIcon, CognitiveIcon, CreativeIcon, QuadrantTransition, PlayLabTransition } from "@/components/illustrations";
import { useChild } from "@/components/providers/ChildProvider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ──────────────────────────────────────────────────────
interface ActivityExtractionResult {
  title: string;
  description: string;
  ageRangeMin: number;
  ageRangeMax: number;
  durationMinutes: number;
  difficulty: string;
  category: string;
  steps: string[];
  materials: Array<{
    name: string;
    quantity: string | null;
    required: boolean;
  }>;
  skills: string[];
  safetyNotes: string[];
  _meta?: {
    platform: string;
    extractionSource: string;
    fetchedTitle: string;
    sourceUrl: string | null;
    contentLength: number;
  };
}

interface SavedActivity {
  id: string;
  title: string;
  description: string | null;
  source_url: string | null;
  platform: string;
  age_min: number | null;
  age_max: number | null;
  duration_minutes: number | null;
  difficulty: string;
  category: string;
  steps: string[];
  materials: Array<{ name: string; quantity: string | null; required: boolean }>;
  skills: string[];
  safety_notes: string[];
  scheduled_for: string | null;
  created_at: string;
}

// ─── Platform Helpers ───────────────────────────────────────────

const PLATFORM_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bgColor: string }
> = {
  youtube: {
    icon: <Youtube className="h-3.5 w-3.5" />,
    label: "YouTube",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  tiktok: {
    icon: <span className="text-[11px] font-bold">TT</span>,
    label: "TikTok",
    color: "text-foreground",
    bgColor: "bg-gray-100",
  },
  instagram: {
    icon: <span className="text-[11px] font-bold">IG</span>,
    label: "Instagram",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  pinterest: {
    icon: <span className="text-[11px] font-bold">P</span>,
    label: "Pinterest",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
  other: {
    icon: <Globe className="h-3.5 w-3.5" />,
    label: "Web",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
};

function PlatformBadge({ platform }: { platform: string }) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.other;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-[0.5px] border-border px-2 py-0.5 text-[10px] font-medium ${config.color} ${config.bgColor}`}
    >
      {config.icon} {config.label}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    easy: "border-green-100 bg-green-50 text-green-700",
    medium: "border-yellow-100 bg-yellow-50 text-yellow-700",
    hard: "border-red-100 bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium ${colors[difficulty] || "border-border bg-muted text-muted-foreground"}`}
    >
      {difficulty}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const emojiIcons: Record<string, string> = {
    sensory: "🧠",
    art: "🎨",
    stem: "🧪",
    outdoor: "🌳",
    cooking: "🍳",
    music: "🎵",
    movement: "🏃",
    other: "✨",
  };
  // Map categories to illustration components
  const IllustrationMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    sensory: SensoryIcon,
    motor: MotorIcon,
    movement: MotorIcon,
    cognitive: CognitiveIcon,
    stem: CognitiveIcon,
    creative: CreativeIcon,
    art: CreativeIcon,
  };
  const Illust = IllustrationMap[category];
  return (
    <span className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-play/20 bg-play-muted px-2 py-0.5 text-[10px] font-medium text-play">
      {Illust ? <Illust size={14} className="inline-block" /> : (emojiIcons[category] || "✨")} {category}
    </span>
  );
}

// Fix 4: Skill tag with color differentiation by category
function SkillTag({ skill }: { skill: string }) {
  const lower = skill.toLowerCase();
  let colorClass = "border-slate-200 bg-slate-50 text-slate-600"; // default
  if (
    lower.includes("motor") ||
    lower.includes("coordination") ||
    lower.includes("physical") ||
    lower.includes("movement")
  ) {
    colorClass = "border-emerald-200 bg-emerald-50 text-emerald-700";
  } else if (
    lower.includes("cognitive") ||
    lower.includes("science") ||
    lower.includes("math") ||
    lower.includes("problem") ||
    lower.includes("logic") ||
    lower.includes("counting")
  ) {
    colorClass = "border-blue-200 bg-blue-50 text-blue-700";
  } else if (
    lower.includes("language") ||
    lower.includes("vocabulary") ||
    lower.includes("communication") ||
    lower.includes("reading") ||
    lower.includes("literacy")
  ) {
    colorClass = "border-violet-200 bg-violet-50 text-violet-700";
  } else if (
    lower.includes("social") ||
    lower.includes("emotional") ||
    lower.includes("patience") ||
    lower.includes("sharing") ||
    lower.includes("empathy") ||
    lower.includes("imaginat") ||
    lower.includes("pretend") ||
    lower.includes("creative")
  ) {
    colorClass = "border-amber-200 bg-amber-50 text-amber-700";
  } else if (
    lower.includes("sensory") ||
    lower.includes("tactile") ||
    lower.includes("texture") ||
    lower.includes("exploration")
  ) {
    colorClass = "border-rose-200 bg-rose-50 text-rose-700";
  }
  return (
    <span
      className={`rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium ${colorClass}`}
    >
      {skill}
    </span>
  );
}

// Fix 3: Age range chip component
function AgeRangeBadge({ min, max }: { min: number | null; max: number | null }) {
  const label = formatAgeRange(min, max);
  return (
    <span className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
      <Baby className="h-2.5 w-2.5" /> {label}
    </span>
  );
}

function formatAgeRange(min: number | null, max: number | null): string {
  if (!min && !max) return "All ages";
  const formatAge = (months: number) => {
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y === 0) return `${m}mo`;
    if (m === 0) return `${y}y`;
    return `${y}y ${m}mo`;
  };
  if (min && max) return `${formatAge(min)} – ${formatAge(max)}`;
  if (min) return `${formatAge(min)}+`;
  return `Up to ${formatAge(max!)}`;
}

function LibrarySkeleton() {
  return (
    <div className="max-w-2xl space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border-[0.5px] border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function cleanMaterialName(name: string): string {
  // Strip parenthetical descriptions like "(optional, for fizzing reaction)"
  return name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
}

function buildShopAllUrl(
  materials: Array<{ name: string; quantity: string | null; required: boolean }>,
  activityTitle: string,
): string {
  // Strategy: Use the 2 most distinctive materials + "kids" for a focused search
  // that actually returns results on Amazon
  const purchasable = materials.filter((m) => {
    const price = estimateMaterialPrice(m.name);
    return price > 0; // Skip free items like water
  });
  const topMats = purchasable.slice(0, 2).map((m) => cleanMaterialName(m.name));
  const query = [...topMats, "kids activity supplies"].join(" ");
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=kinloop-20`;
}

function buildMaterialSearchUrl(materialName: string): string {
  const cleaned = cleanMaterialName(materialName);
  return `https://www.amazon.com/s?k=${encodeURIComponent(cleaned)}&tag=kinloop-20`;
}

// Estimated prices for common kids activity materials (V1 heuristic)
// V2: Replace with PA-API real prices when configured
const MATERIAL_PRICE_ESTIMATES: Record<string, number> = {
  "baking soda": 3,
  "vinegar": 3,
  "white vinegar": 3,
  "food coloring": 5,
  "water": 0,
  "plastic dinosaurs": 8,
  "plastic dinosaur figures": 8,
  "small plastic dinosaur figures": 8,
  "spray bottle": 4,
  "paintbrush": 3,
  "small paintbrush or pastry brush": 4,
  "plastic bin": 6,
  "plastic bin or tray": 6,
  "plastic bin or tray (for mess containment)": 6,
  "spoon": 2,
  "small spoon or plastic chisel/tool": 3,
  "sand": 5,
  "sand or dirt": 5,
  "sand or dirt (optional, for texture)": 5,
  "paint": 6,
  "paper": 3,
  "crayons": 4,
  "glue": 3,
  "glue stick": 3,
  "scissors": 4,
  "tape": 3,
  "markers": 5,
  "stickers": 4,
  "playdough": 5,
  "play dough": 5,
  "clay": 6,
  "beads": 5,
  "string": 3,
  "yarn": 4,
  "fabric": 5,
  "felt": 4,
  "pipe cleaners": 4,
  "pom poms": 4,
  "googly eyes": 3,
  "construction paper": 4,
  "cardboard": 0,
  "box": 0,
  "cardboard box": 0,
  "cups": 3,
  "plastic cups": 3,
  "bowls": 4,
  "measuring cups": 5,
};

function estimateMaterialPrice(name: string): number {
  const lower = name.toLowerCase().trim();
  // Exact match
  if (MATERIAL_PRICE_ESTIMATES[lower] !== undefined) return MATERIAL_PRICE_ESTIMATES[lower];
  // Partial match
  for (const [key, price] of Object.entries(MATERIAL_PRICE_ESTIMATES)) {
    if (lower.includes(key) || key.includes(lower)) return price;
  }
  // Default estimate for unknown materials
  return 4;
}

function estimateTotalPrice(
  materials: Array<{ name: string; quantity: string | null; required: boolean }>,
): { total: number; primeEligible: number; itemCount: number } {
  let total = 0;
  let primeEligible = 0;
  const purchasable = materials.filter((m) => {
    const price = estimateMaterialPrice(m.name);
    return price > 0; // Skip free items like water, cardboard
  });
  for (const mat of purchasable) {
    const price = estimateMaterialPrice(mat.name);
    total += price;
    if (price >= 3) primeEligible++; // Items $3+ typically Prime eligible
  }
  return { total, primeEligible, itemCount: purchasable.length };
}

function detectPlatform(url: string): string {
  if (!url) return "other";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("pinterest.com") || url.includes("pin.it")) return "pinterest";
  return "other";
}

// ─── Extraction Status Messages ─────────────────────────────────

const EXTRACTION_STEPS = [
  "Detecting platform...",
  "Fetching content...",
  "Analyzing with AI...",
  "Building activity plan...",
];

// ─── Main Component ─────────────────────────────────────────────

export default function PlayLabPage() {
  const { selectedChild, selectedChildId } = useChild();

  const [activities, setActivities] = useState<SavedActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  // Extraction state
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [inputContent, setInputContent] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const [extractedResult, setExtractedResult] = useState<ActivityExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [canRetryManual, setCanRetryManual] = useState(false);
  const [saving, setSaving] = useState(false);

  // Schedule modal state (PR-C enhanced)
  const [schedulingActivityId, setSchedulingActivityId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [scheduleReminder, setScheduleReminder] = useState<number | null>(15); // minutes before
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleActivityTitle, setScheduleActivityTitle] = useState("");
  const [scheduleActivityDuration, setScheduleActivityDuration] = useState<number | null>(null);
   const [calendarInviteHint, setCalendarInviteHint] = useState(false);
  // Achievement micro state
  const [showAchievement, setShowAchievement] = useState(false);
  // Transition state
  const [showTransition, setShowTransition] = useState(true);
  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      setActivitiesLoading(true);
      const res = await fetch(`/api/activities?childId=${selectedChildId}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch {
      // silently fail
    } finally {
      setActivitiesLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Animated extraction steps
  useEffect(() => {
    if (!extracting) {
      setExtractionStep(0);
      return;
    }
    const interval = setInterval(() => {
      setExtractionStep((prev) => Math.min(prev + 1, EXTRACTION_STEPS.length - 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [extracting]);

  // Extract handler
  const handleExtract = async () => {
    if (!inputContent.trim() && !inputUrl.trim()) return;
    setExtracting(true);
    setExtractionError(null);
    setCanRetryManual(false);

    try {
      const res = await fetch("/api/extract/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputContent,
          url: inputUrl || undefined,
          childId: selectedChildId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.canRetryManual) {
          setCanRetryManual(true);
        }
        throw new Error(err.error || "Extraction failed");
      }

      const result: ActivityExtractionResult = await res.json();
      setExtractedResult(result);
      setShowInputDialog(false);
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  // Manual paste escape hatch — open dialog with URL preserved
  const handleRetryManual = () => {
    setExtractionError(null);
    setCanRetryManual(false);
    setShowInputDialog(true);
  };

  // Save extracted activity
  const handleSaveExtracted = async () => {
    if (!extractedResult || !selectedChildId) return;
    setSaving(true);

    try {
      const sourceUrl = extractedResult._meta?.sourceUrl || inputUrl || null;
      const platform = extractedResult._meta?.platform || detectPlatform(inputUrl);

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          title: extractedResult.title,
          description: extractedResult.description,
          sourceUrl,
          sourcePlatform: platform,
          ageRangeMin: extractedResult.ageRangeMin,
          ageRangeMax: extractedResult.ageRangeMax,
          durationMinutes: extractedResult.durationMinutes,
          difficulty: extractedResult.difficulty,
          category: extractedResult.category,
          steps: extractedResult.steps,
          materials: extractedResult.materials,
          skills: extractedResult.skills,
          safetyNotes: extractedResult.safetyNotes,
        }),
      });

      if (res.ok) {
        setExtractedResult(null);
        setInputContent("");
        setInputUrl("");
        fetchActivities();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  // Open schedule modal for an activity
  const openScheduleModal = (activityId: string, activityTitle: string, durationMin: number | null) => {
    setSchedulingActivityId(activityId);
    setScheduleActivityTitle(activityTitle);
    setScheduleActivityDuration(durationMin);
    setScheduleDate("");
    setScheduleTime("10:00");
    setScheduleNotes("");
    setScheduleReminder(15);
    setShowScheduleModal(true);
  };

  // Enhanced schedule activity handler (PR-C)
  const handleScheduleActivity = async () => {
    if (!scheduleDate || !schedulingActivityId || !selectedChildId) return;
    setScheduleSaving(true);

    try {
      const startISO = `${scheduleDate}T${scheduleTime}:00`;
      // Calculate end time from activity duration
      let endISO: string | null = null;
      if (scheduleActivityDuration) {
        const start = new Date(startISO);
        const end = new Date(start.getTime() + scheduleActivityDuration * 60 * 1000);
        endISO = end.toISOString();
      }

      // Create an event in the scheduler (cross-quadrant)
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          title: `\uD83C\uDFA8 ${scheduleActivityTitle}`,
          startTime: startISO,
          endTime: endISO,
          source: "play_lab",
          sourceLabel: "Play Lab",
          status: "approved",
          rawContent: scheduleNotes || null,
        }),
      });

      if (res.ok) {
        const eventData = await res.json().catch(() => null);

        // Update the activity's scheduled_for field
        await fetch(`/api/activities?activityId=${schedulingActivityId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduledFor: startISO }),
        });

        // Send calendar invite email (.ics via Resend)
        // Find the full activity to include materials in the email
        const fullActivity = activities.find((a) => a.id === schedulingActivityId);
        try {
          const calRes = await fetch("/api/play/send-calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: scheduleActivityTitle,
              description: fullActivity?.description || undefined,
              startDate: startISO,
              endDate: endISO,
              materials: fullActivity?.materials || [],
              childId: selectedChildId,
              eventId: eventData?.id || undefined,
            }),
          });
          const calData = await calRes.json().catch(() => null);
          if (calData?.code === "no_email") {
            // Show a helpful toast — email not configured
            setCalendarInviteHint(true);
            setTimeout(() => setCalendarInviteHint(false), 8000);
          }
        } catch {
          // Calendar invite is best-effort — don't block scheduling
        }

        setScheduleSuccess(schedulingActivityId);
        setShowAchievement(true);
        setShowScheduleModal(false);
        setSchedulingActivityId(null);
        setScheduleDate("");
        setScheduleTime("10:00");
        setScheduleNotes("");
        setTimeout(() => setScheduleSuccess(null), 5000);
        fetchActivities();
      }
    } catch {
      // silently fail
    } finally {
      setScheduleSaving(false);
    }
  };

  return (
    <>
      <AchievementMicro
        illustration={<ActivityScheduled size={64} />}
        show={showAchievement}
        onDismiss={() => setShowAchievement(false)}
        label="Activity scheduled!"
        position="center"
      />
      <QuadrantTransition
        illustration={<PlayLabTransition className="h-full w-full" />}
        bgClass="bg-play-muted/80"
        accentClass="ring-play/30"
        play={showTransition}
        onComplete={() => setShowTransition(false)}
      >
    <div className="animate-fade-in">
      {/* Fix 2: Page header — responsive layout */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <PlayLabIcon size={16} className="text-play" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-play">
                Play Lab
              </span>
            </div>
            <h1 className="font-serif-display text-xl font-semibold text-foreground">Activity library</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste a link from YouTube, TikTok, Instagram, Pinterest, or any blog — AI extracts a
              structured activity plan
            </p>
          </div>
          <Button
            size="sm"
            className="w-full flex-shrink-0 sm:w-auto"
            onClick={() => setShowInputDialog(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New activity
          </Button>
        </div>
      </div>

      {/* ─── Upcoming & Past Scheduled Activities (PR-C) ─── */}
      {(() => {
        const now = new Date();
        const scheduled = activities.filter((a) => a.scheduled_for);
        const upcoming = scheduled
          .filter((a) => new Date(a.scheduled_for!) >= now)
          .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime());
        const past = scheduled
          .filter((a) => new Date(a.scheduled_for!) < now)
          .sort((a, b) => new Date(b.scheduled_for!).getTime() - new Date(a.scheduled_for!).getTime());

        if (scheduled.length === 0) return null;

        return (
          <div className="mb-6">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Upcoming activities
                </p>
                <div className="space-y-2">
                  {upcoming.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-xl border-[0.5px] border-green-200 bg-green-50/50 p-3 transition-colors hover:bg-green-50"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                        <CalendarPlus className="h-3.5 w-3.5 text-green-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                        <p className="text-xs text-green-700">
                          {new Date(a.scheduled_for!).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                          {" at "}
                          {new Date(a.scheduled_for!).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {a.duration_minutes && (
                            <span className="text-green-600"> · {a.duration_minutes} min</span>
                          )}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 border-green-200 text-xs text-green-700 hover:bg-green-100"
                        onClick={() => {
                          setExpandedActivityId(a.id);
                          // Scroll to the card
                          document.getElementById(`activity-${a.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past (collapsed) */}
            {past.length > 0 && (
              <details className="group">
                <summary className="mb-2 flex cursor-pointer items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  <Check className="h-3 w-3" /> Done ({past.length})
                  <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-1.5">
                  {past.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg border-[0.5px] border-border bg-background-secondary/50 p-2.5 opacity-70"
                    >
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-muted-foreground">{a.title}</p>
                        <p className="text-[10px] text-muted-foreground/60">
                          {new Date(a.scheduled_for!).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setExpandedActivityId(a.id);
                          document.getElementById(`activity-${a.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        );
      })()}

      {/* Extraction error with manual-paste escape hatch */}
      {extractionError && (
        <div className="animate-slide-fade-in mb-4 rounded-xl border-[0.5px] border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{extractionError}</p>
            <button
              onClick={() => {
                setExtractionError(null);
                setCanRetryManual(false);
              }}
              className="ml-auto rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {canRetryManual && (
            <div className="mt-2 flex items-center gap-2 border-t border-red-100 pt-2">
              <ClipboardPaste className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs text-red-600">
                Tip: Copy the text from the page and paste it manually.
              </span>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-7 border-red-200 text-xs text-red-700 hover:bg-red-100"
                onClick={handleRetryManual}
              >
                <FileText className="mr-1 h-3 w-3" />
                Paste manually
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Extracted result review */}
      {extractedResult && (
        <div className="animate-slide-fade-in mb-6 rounded-xl border-[0.5px] border-play/20 bg-play-muted p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-4 w-4 text-play" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-play">
                AI activity plan
              </span>
              {extractedResult._meta?.platform && (
                <PlatformBadge platform={extractedResult._meta.platform} />
              )}
              <CategoryBadge category={extractedResult.category} />
              <DifficultyBadge difficulty={extractedResult.difficulty} />
              {/* Fix 3: Age range chip in extraction review */}
              <AgeRangeBadge min={extractedResult.ageRangeMin} max={extractedResult.ageRangeMax} />
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" /> {extractedResult.durationMinutes} min
              </span>
            </div>
            <button
              className="rounded-lg p-1 text-muted-foreground hover:bg-background-secondary"
              onClick={() => setExtractedResult(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 rounded-xl border-[0.5px] border-border bg-card p-4">
            <h3 className="mb-1 text-base font-semibold text-foreground">
              {extractedResult.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {extractedResult.description}
            </p>
            <div className="mt-2 flex items-center gap-3">
              {extractedResult._meta?.sourceUrl && (
                <a
                  href={extractedResult._meta.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-play hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Source
                </a>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <ListChecks className="h-3 w-3" /> Steps
            </p>
            <div className="space-y-2">
              {extractedResult.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-lg border-[0.5px] border-border bg-card p-3"
                >
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-play text-[10px] font-medium text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          {extractedResult.materials.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <ShoppingCart className="h-3 w-3" /> Materials
              </p>
              {/* Per-material chips — each tappable to Amazon */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {extractedResult.materials.map((mat, i) => (
                  <a
                    key={i}
                    href={buildMaterialSearchUrl(mat.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Find on Amazon"
                    className="group flex items-center gap-2 rounded-lg border-[0.5px] border-border bg-card px-3 py-2 transition-colors hover:bg-amber-50 hover:border-amber-200 hover:underline hover:decoration-amber-300"
                  >
                    <span
                      className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${mat.required ? "bg-play" : "bg-muted-foreground/30"}`}
                    />
                    <span className="text-sm text-foreground">{mat.name}</span>
                    {mat.quantity && (
                      <span className="text-xs text-muted-foreground">{mat.quantity}</span>
                    )}
                    <ExternalLink className="ml-auto h-3 w-3 flex-shrink-0 text-muted-foreground/30 transition-colors group-hover:text-amber-600" />
                  </a>
                ))}
              </div>

              {/* Price estimate line */}
              {(() => {
                const est = estimateTotalPrice(extractedResult.materials);
                return est.itemCount > 0 ? (
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Estimated total: <span className="font-medium text-foreground">${est.total}</span> on Amazon
                    {est.primeEligible > 0 && (
                      <> &middot; {est.primeEligible} item{est.primeEligible !== 1 ? "s" : ""} eligible for Prime</>
                    )}
                  </p>
                ) : null;
              })()}

              {/* Prominent bulk CTA — dark pill button */}
              {(() => {
                const est = estimateTotalPrice(extractedResult.materials);
                return (
                  <div className="mt-2">
                    <Button asChild className="text-[14px] px-6 h-10">
                      <a
                        href={buildShopAllUrl(extractedResult.materials, extractedResult.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Shop {est.itemCount} material{est.itemCount !== 1 ? "s" : ""} on Amazon &middot; ~${est.total}
                      </a>
                    </Button>
                    <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                      We earn from qualifying purchases.
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Skills & Safety */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {extractedResult.skills.length > 0 && (
              <div className="rounded-xl border-[0.5px] border-border bg-card p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Brain className="h-3 w-3" /> Skills developed
                </p>
                {/* Fix 4: Skill tags with color differentiation */}
                <div className="flex flex-wrap gap-1.5">
                  {extractedResult.skills.map((skill, i) => (
                    <SkillTag key={i} skill={skill} />
                  ))}
                </div>
              </div>
            )}
            {extractedResult.safetyNotes.length > 0 && (
              <div className="rounded-xl border-[0.5px] border-border bg-card p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Shield className="h-3 w-3" /> Safety notes
                </p>
                <ul className="space-y-1">
                  {extractedResult.safetyNotes.map((note, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Button onClick={handleSaveExtracted} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Star className="mr-1.5 h-3.5 w-3.5" /> Save to library
              </>
            )}
          </Button>
        </div>
      )}

      {/* Activity library */}
      <div>
        {activitiesLoading ? (
          <LibrarySkeleton />
        ) : activities.length > 0 ? (
          <div className="max-w-2xl space-y-3">
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Activity library · {activities.length} saved
            </h2>
            {activities.map((activity) => {
              const isExpanded = expandedActivityId === activity.id;
              return (
                <div key={activity.id} id={`activity-${activity.id}`} className="rounded-xl border-[0.5px] border-border bg-card">
                  <button
                    onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-background-secondary"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-play-muted">
                      {(() => {
                        const cat = activity.category?.toLowerCase() || "";
                        const iconProps = { size: 24, className: "text-play" };
                        if (cat === "sensory") return <SensoryIcon {...iconProps} />;
                        if (cat === "motor" || cat === "movement") return <MotorIcon {...iconProps} />;
                        if (cat === "cognitive" || cat === "stem") return <CognitiveIcon {...iconProps} />;
                        if (cat === "creative" || cat === "art") return <CreativeIcon {...iconProps} />;
                        return <PlayLabIcon size={16} className="text-play" />;
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-foreground">
                        {activity.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {activity.platform && activity.platform !== "other" && (
                          <PlatformBadge platform={activity.platform} />
                        )}
                        <CategoryBadge category={activity.category} />
                        <DifficultyBadge difficulty={activity.difficulty} />
                        {/* Fix 3: Age range chip on collapsed card */}
                        <AgeRangeBadge min={activity.age_min} max={activity.age_max} />
                        {activity.duration_minutes && (
                          <span className="text-[11px] text-muted-foreground">
                            {activity.duration_minutes} min
                          </span>
                        )}
                        {activity.scheduled_for && (
                          <span className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                            <CalendarPlus className="h-2.5 w-2.5" />
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="animate-slide-fade-in space-y-3 border-t-[0.5px] border-border px-4 py-4">
                      {activity.description && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {activity.description}
                        </p>
                      )}

                      {/* Source link + age range in expanded view */}
                      <div className="flex flex-wrap items-center gap-3">
                        {activity.source_url && (
                          <a
                            href={activity.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-play hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View original on {PLATFORM_CONFIG[activity.platform]?.label || "web"}
                          </a>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Ages: {formatAgeRange(activity.age_min, activity.age_max)}
                        </span>
                      </div>

                      {/* Steps */}
                      {(activity.steps as string[])?.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Steps
                          </p>
                          <ol className="space-y-1">
                            {(activity.steps as string[]).map((step, i) => (
                              <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                                <span className="font-medium text-play">{i + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Materials */}
                      {(
                        activity.materials as Array<{
                          name: string;
                          quantity: string | null;
                          required: boolean;
                        }>
                      )?.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Materials
                          </p>
                          {/* Per-material chips — each tappable to Amazon */}
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              activity.materials as Array<{
                                name: string;
                                quantity: string | null;
                                required: boolean;
                              }>
                            ).map((mat, i) => (
                              <a
                                key={i}
                                href={buildMaterialSearchUrl(mat.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Find on Amazon"
                                className="group inline-flex items-center gap-1 rounded-lg bg-background-secondary px-2 py-1 text-xs transition-colors hover:bg-amber-50 hover:underline hover:decoration-amber-300"
                              >
                                <span>
                                  {mat.name}
                                  {mat.quantity && ` (${mat.quantity})`}
                                </span>
                                <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 text-muted-foreground/40 transition-colors group-hover:text-amber-600" />
                              </a>
                            ))}
                          </div>

                          {/* Price estimate line */}
                          {(() => {
                            const mats = activity.materials as Array<{ name: string; quantity: string | null; required: boolean }>;
                            const est = estimateTotalPrice(mats);
                            return est.itemCount > 0 ? (
                              <p className="mt-3 text-[11px] text-muted-foreground">
                                Estimated total: <span className="font-medium text-foreground">${est.total}</span> on Amazon
                                {est.primeEligible > 0 && (
                                  <> &middot; {est.primeEligible} item{est.primeEligible !== 1 ? "s" : ""} eligible for Prime</>
                                )}
                              </p>
                            ) : null;
                          })()}

                          {/* Prominent bulk CTA — dark pill button */}
                          {(() => {
                            const mats = activity.materials as Array<{ name: string; quantity: string | null; required: boolean }>;
                            const est = estimateTotalPrice(mats);
                            return (
                              <div className="mt-2">
                                <Button asChild className="text-[14px] px-6 h-10">
                                  <a
                                    href={buildShopAllUrl(mats, activity.title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Shop {est.itemCount} material{est.itemCount !== 1 ? "s" : ""} on Amazon &middot; ~${est.total}
                                  </a>
                                </Button>
                                <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                                  We earn from qualifying purchases.
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Fix 4: Skills — muted gray tags, not coral */}
                      {(activity.skills as string[])?.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Skills developed
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(activity.skills as string[]).map((skill, i) => (
                              <SkillTag key={i} skill={skill} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Safety notes */}
                      {(activity.safety_notes as string[])?.length > 0 && (
                        <div className="rounded-lg border-[0.5px] border-amber-200 bg-amber-50 p-2.5">
                          <p className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-amber-700">
                            <Shield className="h-3 w-3" /> Safety
                          </p>
                          <ul className="space-y-0.5">
                            {(activity.safety_notes as string[]).map((note, i) => (
                              <li key={i} className="text-[11px] text-amber-700">
                                {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Schedule CTA (PR-C enhanced) */}
                      <div className="border-t-[0.5px] border-border pt-3">
                        {scheduleSuccess === activity.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 rounded-lg border-[0.5px] border-green-200 bg-green-50 px-3 py-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                Scheduled for {activity.scheduled_for ? new Date(activity.scheduled_for).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "soon"}
                              </span>
                            </div>
                            {calendarInviteHint && (
                              <div className="flex items-center gap-2 rounded-lg border-[0.5px] border-amber-200 bg-amber-50 px-3 py-2">
                                <Bell className="h-3.5 w-3.5 text-amber-600" />
                                <span className="text-xs text-amber-700">
                                  Tip: configure your email in{" "}
                                  <a href="/settings" className="font-medium underline">Settings</a>
                                  {" "}to get calendar invites
                                </span>
                              </div>
                            )}
                          </div>
                        ) : activity.scheduled_for ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-lg border-[0.5px] border-green-200 bg-green-50 px-3 py-2">
                              <Calendar className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-xs font-medium text-green-700">
                                Scheduled for{" "}
                                {new Date(activity.scheduled_for).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                                {" at "}
                                {new Date(activity.scheduled_for).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <button
                              onClick={() => openScheduleModal(activity.id, activity.title, activity.duration_minutes)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => openScheduleModal(activity.id, activity.title, activity.duration_minutes)}
                          >
                            <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                            Schedule for...
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Fix 7: Improved empty state with better copy */
          <EmptyState
            icon={PlayLabIcon}
            title="Your activity library is empty"
            description="Drop a TikTok, YouTube, or Pinterest link to extract your first activity — AI builds a step-by-step plan with materials, safety notes, and age-appropriate guidance"
            actionLabel="Add your first activity"
            onAction={() => setShowInputDialog(true)}
            accentColor="play"
            illustration={<PlayLabEmpty />}
          />
        )}
      </div>

      {/* Input Dialog */}
      {showInputDialog && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !extracting && setShowInputDialog(false)}
          />
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border-[0.5px] border-border bg-card p-6">
            <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
              <PlayLabIcon size={16} className="text-play" />
              New activity
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Paste a URL or describe an activity — AI will create a structured plan
            </p>

            {/* Platform detection preview */}
            {inputUrl && !extracting && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border-[0.5px] border-border bg-background-secondary px-3 py-2">
                <PlatformBadge platform={detectPlatform(inputUrl)} />
                <span className="text-xs text-muted-foreground">
                  {detectPlatform(inputUrl) === "youtube"
                    ? "Will auto-fetch transcript"
                    : detectPlatform(inputUrl) === "other"
                      ? "Will scrape page content"
                      : `Will fetch ${PLATFORM_CONFIG[detectPlatform(inputUrl)]?.label} metadata`}
                </span>
              </div>
            )}

            {/* Extraction progress */}
            {extracting && (
              <div className="mb-3 rounded-lg border-[0.5px] border-play/20 bg-play-muted px-3 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-play" />
                  <span className="text-sm font-medium text-play">
                    {EXTRACTION_STEPS[extractionStep]}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-play/10">
                  <div
                    className="h-full rounded-full bg-play transition-all duration-1000 ease-out"
                    style={{
                      width: `${((extractionStep + 1) / EXTRACTION_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  URL (optional)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    disabled={extracting}
                    className="w-full rounded-xl border-[0.5px] border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-play/30 disabled:opacity-50"
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Supports YouTube, TikTok, Instagram, Pinterest, and any web page
                </p>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Description / transcript{" "}
                  <span className="font-normal normal-case text-muted-foreground/60">
                    (paste manually if auto-fetch fails)
                  </span>
                </label>
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Paste the video transcript, blog post, or describe the activity..."
                  rows={8}
                  disabled={extracting}
                  className="w-full resize-none rounded-xl border-[0.5px] border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-play/30 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowInputDialog(false)}
                disabled={extracting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExtract}
                disabled={extracting || (!inputContent.trim() && !inputUrl.trim())}
              >
                {extracting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Extract with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Schedule Modal (PR-C) ─────────────────────────────── */}
      {showScheduleModal && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !scheduleSaving && setShowScheduleModal(false)}
          />
          <div className="relative mx-4 w-full max-w-md rounded-2xl border-[0.5px] border-border bg-card p-6">
            <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
              <CalendarPlus className="h-4 w-4 text-play" />
              Schedule activity
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {scheduleActivityTitle}
            </p>

            <div className="space-y-3">
              {/* Date picker */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border-[0.5px] border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-play/30"
                />
              </div>

              {/* Time picker */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full rounded-xl border-[0.5px] border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-play/30"
                />
              </div>

              {/* Duration auto-fill */}
              {scheduleActivityDuration && (
                <div className="flex items-center gap-2 rounded-lg border-[0.5px] border-border bg-background-secondary px-3 py-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Duration: <span className="font-medium text-foreground">{scheduleActivityDuration} min</span>
                    {scheduleDate && scheduleTime && (
                      <> &middot; Ends at{" "}
                        {(() => {
                          const start = new Date(`${scheduleDate}T${scheduleTime}:00`);
                          const end = new Date(start.getTime() + scheduleActivityDuration * 60 * 1000);
                          return end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                        })()}
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Notes <span className="font-normal normal-case text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="Any prep notes, who's joining, etc."
                  rows={3}
                  className="w-full resize-none rounded-xl border-[0.5px] border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-play/30"
                />
              </div>

              {/* Reminder toggle */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Bell className="mr-1 inline h-3 w-3" /> Reminder
                </label>
                <div className="flex gap-2">
                  {[null, 15, 30, 60].map((mins) => (
                    <button
                      key={mins ?? "none"}
                      onClick={() => setScheduleReminder(mins)}
                      className={`rounded-lg border-[0.5px] px-3 py-1.5 text-xs font-medium transition-colors ${
                        scheduleReminder === mins
                          ? "border-play bg-play-muted text-play"
                          : "border-border bg-background text-muted-foreground hover:bg-background-secondary"
                      }`}
                    >
                      {mins === null ? "None" : `${mins} min`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowScheduleModal(false)}
                disabled={scheduleSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleActivity}
                disabled={!scheduleDate || scheduleSaving}
              >
                {scheduleSaving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Schedule
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
      </QuadrantTransition>
    </>
  );
}

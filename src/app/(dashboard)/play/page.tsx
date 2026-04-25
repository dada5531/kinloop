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
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { PlayLabIcon } from "@/components/icons/QuadrantIcons";
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
  created_at: string;
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
  const icons: Record<string, string> = {
    sensory: "🧠",
    art: "🎨",
    stem: "🧪",
    outdoor: "🌳",
    cooking: "🍳",
    music: "🎵",
    movement: "🏃",
    other: "✨",
  };
  return (
    <span className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-play/20 bg-play-muted px-2 py-0.5 text-[10px] font-medium text-play">
      {icons[category] || "✨"} {category}
    </span>
  );
}

function formatAgeRange(min: number | null, max: number | null): string {
  if (!min && !max) return "All ages";
  const minYears = min ? Math.floor(min / 12) : 0;
  const maxYears = max ? Math.floor(max / 12) : 0;
  const minMonths = min ? min % 12 : 0;
  const maxMonths = max ? max % 12 : 0;

  const formatAge = (years: number, months: number) => {
    if (years === 0) return `${months}mo`;
    if (months === 0) return `${years}y`;
    return `${years}y ${months}mo`;
  };

  if (min && max) return `${formatAge(minYears, minMonths)} – ${formatAge(maxYears, maxMonths)}`;
  if (min) return `${formatAge(minYears, minMonths)}+`;
  return `Up to ${formatAge(maxYears, maxMonths)}`;
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
  const [extractedResult, setExtractedResult] = useState<ActivityExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  // Extract handler
  const handleExtract = async () => {
    if (!inputContent.trim() && !inputUrl.trim()) return;
    setExtracting(true);
    setExtractionError(null);

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

  // Save extracted activity
  const handleSaveExtracted = async () => {
    if (!extractedResult || !selectedChildId) return;
    setSaving(true);

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          title: extractedResult.title,
          description: extractedResult.description,
          sourceUrl: inputUrl || null,
          sourcePlatform: detectPlatform(inputUrl),
          ageRangeMin: extractedResult.ageRangeMin,
          ageRangeMax: extractedResult.ageRangeMax,
          durationMinutes: extractedResult.durationMinutes,
          difficulty: extractedResult.difficulty,
          category: extractedResult.category,
          steps: extractedResult.steps,
          materials: extractedResult.materials,
          skills: extractedResult.skills,
          safetyNotes: extractedResult.safetyNotes,
          sourceContent: inputContent || null,
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

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <PlayLabIcon size={16} className="text-play" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-play">
              Play Lab
            </span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Activity library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste a link or describe an activity — AI creates a structured plan with materials
          </p>
        </div>
        <Button size="sm" onClick={() => setShowInputDialog(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New activity
        </Button>
      </div>

      {/* Extraction error */}
      {extractionError && (
        <div className="animate-slide-fade-in mb-4 flex items-center gap-2 rounded-xl border-[0.5px] border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{extractionError}</p>
          <button
            onClick={() => setExtractionError(null)}
            className="ml-auto rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Extracted result review */}
      {extractedResult && (
        <div className="animate-slide-fade-in mb-6 rounded-xl border-[0.5px] border-play/20 bg-play-muted p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-play" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-play">
                AI activity plan
              </span>
              <CategoryBadge category={extractedResult.category} />
              <DifficultyBadge difficulty={extractedResult.difficulty} />
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
            <p className="mt-2 text-[11px] text-muted-foreground">
              Ages: {formatAgeRange(extractedResult.ageRangeMin, extractedResult.ageRangeMax)}
            </p>
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
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {extractedResult.materials.map((mat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border-[0.5px] border-border bg-card px-3 py-2"
                  >
                    <span
                      className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${mat.required ? "bg-play" : "bg-muted-foreground/30"}`}
                    />
                    <span className="text-sm text-foreground">{mat.name}</span>
                    {mat.quantity && (
                      <span className="ml-auto text-xs text-muted-foreground">{mat.quantity}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills & Safety */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {extractedResult.skills.length > 0 && (
              <div className="rounded-xl border-[0.5px] border-border bg-card p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Brain className="h-3 w-3" /> Skills developed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {extractedResult.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-full border-[0.5px] border-play/20 bg-play-muted px-2 py-0.5 text-[10px] text-play"
                    >
                      {skill}
                    </span>
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
              Activity library
            </h2>
            {activities.map((activity) => {
              const isExpanded = expandedActivityId === activity.id;
              return (
                <div key={activity.id} className="rounded-xl border-[0.5px] border-border bg-card">
                  <button
                    onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-background-secondary"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-play-muted">
                      <PlayLabIcon size={14} className="text-play" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-foreground">
                        {activity.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <CategoryBadge category={activity.category} />
                        <DifficultyBadge difficulty={activity.difficulty} />
                        {activity.duration_minutes && (
                          <span className="text-[11px] text-muted-foreground">
                            {activity.duration_minutes} min
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
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              activity.materials as Array<{
                                name: string;
                                quantity: string | null;
                                required: boolean;
                              }>
                            ).map((mat, i) => (
                              <span
                                key={i}
                                className="rounded-lg bg-background-secondary px-2 py-1 text-xs"
                              >
                                {mat.name}
                                {mat.quantity && ` (${mat.quantity})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {(activity.skills as string[])?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(activity.skills as string[]).map((skill, i) => (
                            <span
                              key={i}
                              className="rounded-full border-[0.5px] border-play/20 bg-play-muted px-2 py-0.5 text-[10px] text-play"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={PlayLabIcon}
            title="No activities yet"
            description="Paste a link or describe an activity to get a structured plan"
            actionLabel="New activity"
            onAction={() => setShowInputDialog(true)}
            accentColor="play"
          />
        )}
      </div>

      {/* Input Dialog */}
      {showInputDialog && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowInputDialog(false)}
          />
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border-[0.5px] border-border bg-card p-6">
            <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
              <PlayLabIcon size={16} className="text-play" />
              New activity
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Paste a URL or describe an activity — AI will create a structured plan
            </p>

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
                    className="w-full rounded-xl border-[0.5px] border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-play/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Description / transcript
                </label>
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Paste the video transcript, blog post, or describe the activity..."
                  rows={8}
                  className="w-full resize-none rounded-xl border-[0.5px] border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-play/30"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowInputDialog(false)}>
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
    </div>
  );
}

function detectPlatform(url: string): string {
  if (!url) return "other";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("pinterest.com")) return "pinterest";
  return "other";
}

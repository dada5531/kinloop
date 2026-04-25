"use client";

import {
  Gamepad2,
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

import { useChild } from "@/components/providers/ChildProvider";

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
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colors[difficulty] || "bg-gray-100 text-gray-700"}`}
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
    <span className="inline-flex items-center gap-1 rounded-full bg-play-muted px-2 py-0.5 text-xs font-medium text-play">
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
    <div className="flex h-screen flex-col pt-14 lg:h-screen lg:pt-0">
      {/* Page header */}
      <div className="flex-shrink-0 border-b bg-card/50 px-4 py-4 md:px-6 md:py-5 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-play-muted">
                <Gamepad2 className="h-4 w-4 text-play" />
              </div>
              Play Lab
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste a link or describe an activity — AI creates a structured plan with materials
            </p>
          </div>
          <button
            onClick={() => setShowInputDialog(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-play px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New activity
          </button>
        </div>
      </div>

      {/* Extraction error */}
      {extractionError && (
        <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-3 md:px-6 lg:px-8">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{extractionError}</p>
          <button
            onClick={() => setExtractionError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Extracted result review */}
      {extractedResult && (
        <div className="max-h-[55vh] flex-shrink-0 overflow-y-auto border-b border-play/10 bg-play-muted/30 px-4 py-4 md:px-6 lg:px-8">
          <div className="mb-4 flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-play" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">AI Activity Plan</p>
              <div className="mt-1 flex items-center gap-2">
                <CategoryBadge category={extractedResult.category} />
                <DifficultyBadge difficulty={extractedResult.difficulty} />
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {extractedResult.durationMinutes} min
                </span>
              </div>
            </div>
            <button
              className="rounded p-1 hover:bg-background/50"
              onClick={() => setExtractedResult(null)}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mb-3 rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-1 text-base font-semibold text-foreground">
              {extractedResult.title}
            </h3>
            <p className="text-sm text-muted-foreground">{extractedResult.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Ages: {formatAgeRange(extractedResult.ageRangeMin, extractedResult.ageRangeMax)}
            </p>
          </div>

          {/* Steps */}
          <div className="mb-3">
            <p className="mb-2 flex items-center gap-1 text-xs font-medium text-foreground">
              <ListChecks className="h-3 w-3 text-play" /> Steps
            </p>
            <div className="space-y-2">
              {extractedResult.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border bg-card p-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-play text-xs font-medium text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          {extractedResult.materials.length > 0 && (
            <div className="mb-3">
              <p className="mb-2 flex items-center gap-1 text-xs font-medium text-foreground">
                <ShoppingCart className="h-3 w-3 text-play" /> Materials
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {extractedResult.materials.map((mat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
                  >
                    <span
                      className={`h-2 w-2 flex-shrink-0 rounded-full ${mat.required ? "bg-play" : "bg-muted-foreground/30"}`}
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
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {extractedResult.skills.length > 0 && (
              <div className="rounded-lg border bg-card p-3">
                <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground">
                  <Brain className="h-3 w-3 text-play" /> Skills developed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {extractedResult.skills.map((skill, i) => (
                    <span key={i} className="rounded bg-play-muted px-2 py-0.5 text-xs text-play">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {extractedResult.safetyNotes.length > 0 && (
              <div className="rounded-lg border bg-card p-3">
                <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground">
                  <Shield className="h-3 w-3 text-yellow-500" /> Safety notes
                </p>
                <ul className="space-y-1">
                  {extractedResult.safetyNotes.map((note, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveExtracted}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-play px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Star className="h-4 w-4" /> Save to library
              </>
            )}
          </button>
        </div>
      )}

      {/* Activity library */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
        {activitiesLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-play" />
            <p className="text-sm text-muted-foreground">Loading activities...</p>
          </div>
        ) : activities.length > 0 ? (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Activity Library</h2>
            {activities.map((activity) => {
              const isExpanded = expandedActivityId === activity.id;
              return (
                <div key={activity.id} className="rounded-xl border bg-card shadow-sm">
                  <button
                    onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-play-muted">
                      <Gamepad2 className="h-4 w-4 text-play" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-foreground">
                        {activity.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <CategoryBadge category={activity.category} />
                        <DifficultyBadge difficulty={activity.difficulty} />
                        {activity.duration_minutes && (
                          <span className="text-xs text-muted-foreground">
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
                    <div className="space-y-3 px-4 pb-4">
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      )}

                      {/* Steps */}
                      {(activity.steps as string[])?.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-foreground">Steps</p>
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
                          <p className="mb-1.5 text-xs font-medium text-foreground">Materials</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              activity.materials as Array<{
                                name: string;
                                quantity: string | null;
                                required: boolean;
                              }>
                            ).map((mat, i) => (
                              <span key={i} className="rounded bg-muted/50 px-2 py-1 text-xs">
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
                              className="rounded bg-play-muted px-2 py-0.5 text-xs text-play"
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
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-play-muted">
              <Gamepad2 className="h-6 w-6 text-play" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">No activities yet</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Paste a link or describe an activity to get a structured plan
            </p>
            <button
              onClick={() => setShowInputDialog(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-play px-4 py-2 text-xs font-medium text-white hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              New activity
            </button>
          </div>
        )}
      </div>

      {/* Input Dialog */}
      {showInputDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInputDialog(false)} />
          <div className="relative mx-4 w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
              <Gamepad2 className="h-5 w-5 text-play" />
              New activity
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Paste a URL or describe an activity — AI will create a structured plan
            </p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  URL (optional)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-play/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Description / transcript
                </label>
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Paste the video transcript, blog post, or describe the activity..."
                  rows={8}
                  className="w-full resize-none rounded-lg border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-play/50"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowInputDialog(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent/50"
              >
                Cancel
              </button>
              <button
                onClick={handleExtract}
                disabled={extracting || (!inputContent.trim() && !inputUrl.trim())}
                className="inline-flex items-center gap-2 rounded-lg bg-play px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {extracting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Extract with AI
                  </>
                )}
              </button>
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

"use client";

import {
  Check,
  X,
  ChevronRight,
  Upload,
  ClipboardPaste,
  Clock,
  MapPin,
  Sparkles,
  ArrowLeft,
  Send,
  Loader2,
  Plus,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

import { SchedulerIcon } from "@/components/icons/QuadrantIcons";
import { useChild } from "@/components/providers/ChildProvider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ──────────────────────────────────────────────────────
interface ExtractedEvent {
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
}

interface ExtractedActionItem {
  task: string;
  dueDate: string | null;
  priority: "high" | "medium" | "low";
}

interface ExtractedAmount {
  description: string;
  amount: number;
  currency: string;
  dueDate: string | null;
  payableTo: string | null;
}

interface ExtractionResult {
  events: ExtractedEvent[];
  actionItems: ExtractedActionItem[];
  amountsDue: ExtractedAmount[];
  suggestedReply: string | null;
  confidence: number;
}

interface SavedEvent {
  id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  source: string;
  source_label: string | null;
  action_items: Array<{ task: string; due_date?: string | null }>;
  amount_due: { what: string; amount: number; dueDate: string; payee: string } | null;
  status: string;
  confidence: number | null;
  raw_content: string | null;
  reply_draft: string | null;
  file_url: string | null;
  created_at: string;
}

// ─── Helper Components ──────────────────────────────────────────
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    confidence >= 0.8 ? "text-green-600" : confidence >= 0.5 ? "text-yellow-600" : "text-red-500";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${color}`}>
      <Sparkles className="h-3 w-3" />
      {pct}%
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: "bg-red-50 text-red-600 border-red-100",
    medium: "bg-yellow-50 text-yellow-600 border-yellow-100",
    low: "bg-green-50 text-green-600 border-green-100",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium ${colors[priority] || "bg-muted text-muted-foreground"}`}
    >
      {priority}
    </span>
  );
}

function InboxSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border-b-[0.5px] border-border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export default function SchedulerPage() {
  const { selectedChild, selectedChildId } = useChild();

  // Event list state
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Extraction state
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pasteContent, setPasteContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [approving, setApproving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      setEventsLoading(true);
      const res = await fetch(`/api/events?childId=${selectedChildId}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      // silently fail
    } finally {
      setEventsLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // ─── Extract Handler ────────────────────────────────────────
  const handleExtract = async (content: string, contentType: string = "text") => {
    if (!content.trim()) return;
    setExtracting(true);
    setExtractionError(null);
    setRawContent(content);

    try {
      const res = await fetch("/api/extract/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          contentType,
          childId: selectedChildId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Extraction failed");
      }

      const result: ExtractionResult = await res.json();
      setExtractedResult(result);
      setShowPasteDialog(false);
      setShowUploadDialog(false);
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  // ─── Approve Extracted Event ────────────────────────────────
  const handleApproveExtracted = async (evt: ExtractedEvent) => {
    if (!selectedChildId) return;
    setApproving(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          title: evt.title,
          startTime: evt.startDate ? new Date(evt.startDate).toISOString() : null,
          endTime: evt.endDate ? new Date(evt.endDate).toISOString() : null,
          location: evt.location,
          source: "paste",
          sourceLabel: "AI extraction",
          actionItems:
            extractedResult?.actionItems?.map((a) => ({
              task: a.task,
              due_date: a.dueDate,
            })) || [],
          amountDue: extractedResult?.amountsDue?.[0]
            ? {
                what: extractedResult.amountsDue[0].description,
                amount: extractedResult.amountsDue[0].amount,
                dueDate: extractedResult.amountsDue[0].dueDate || "",
                payee: extractedResult.amountsDue[0].payableTo || "",
              }
            : null,
          confidence: extractedResult?.confidence,
          rawContent,
          replyDraft: extractedResult?.suggestedReply,
          status: "approved",
        }),
      });

      if (res.ok) {
        if (extractedResult) {
          const remaining = extractedResult.events.filter((e) => e !== evt);
          if (remaining.length === 0) {
            setExtractedResult(null);
          } else {
            setExtractedResult({ ...extractedResult, events: remaining });
          }
        }
        fetchEvents();
      }
    } catch {
      // silently fail
    } finally {
      setApproving(false);
    }
  };

  // ─── Update Event Status ────────────────────────────────────
  const handleUpdateStatus = async (eventId: string, status: string) => {
    try {
      await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status }),
      });
      fetchEvents();
    } catch {
      // silently fail
    }
  };

  // ─── File Upload ────────────────────────────────────────────
  const handleFileUpload = useCallback(
    async (file: File) => {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setExtractionError("File too large. Maximum size is 10MB.");
        return;
      }

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        await handleExtract(text, "text");
        return;
      }

      setExtractionError(
        "File upload for PDFs and images requires cloud storage. Please paste the text content instead.",
      );
    },
    [selectedChildId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) await handleFileUpload(file);
    },
    [handleFileUpload],
  );

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <SchedulerIcon size={16} className="text-scheduler" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-scheduler">
              Scheduler
            </span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Events &amp; deadlines</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste emails or upload documents — AI extracts events, deadlines &amp; action items
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload
          </Button>
          <Button size="sm" onClick={() => setShowPasteDialog(true)}>
            <ClipboardPaste className="mr-1.5 h-3.5 w-3.5" />
            Paste
          </Button>
        </div>
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

      {/* Extracted result banner */}
      {extractedResult && (
        <div className="animate-slide-fade-in mb-6 rounded-xl border-[0.5px] border-scheduler/20 bg-scheduler-muted p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-scheduler" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-scheduler">
                AI extraction
              </span>
              <ConfidenceBadge confidence={extractedResult.confidence} />
            </div>
            <button
              className="rounded-lg p-1 text-muted-foreground hover:bg-background-secondary"
              onClick={() => setExtractedResult(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Extracted events */}
          <div className="space-y-3">
            {extractedResult.events.map((evt, i) => (
              <div key={i} className="rounded-xl border-[0.5px] border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground">{evt.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {evt.startDate}
                      {evt.endDate && ` – ${evt.endDate}`}
                      {evt.location && ` · ${evt.location}`}
                    </p>
                    {evt.description && (
                      <p className="mt-1 text-xs text-muted-foreground/80">{evt.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApproveExtracted(evt)}
                    disabled={approving}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Action items */}
          {extractedResult.actionItems.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Action items
              </p>
              <div className="space-y-1.5">
                {extractedResult.actionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-background-secondary text-[10px] font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-foreground">{item.task}</span>
                    {item.dueDate && (
                      <span className="text-muted-foreground">Due {item.dueDate}</span>
                    )}
                    <PriorityBadge priority={item.priority} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amounts due */}
          {extractedResult.amountsDue.length > 0 && (
            <div className="mt-4 space-y-2">
              {extractedResult.amountsDue.map((amt, i) => (
                <div key={i} className="rounded-lg border-[0.5px] border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{amt.description}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {amt.dueDate && `Due ${amt.dueDate}`}
                        {amt.payableTo && ` to ${amt.payableTo}`}
                      </p>
                    </div>
                    <span className="text-base font-semibold text-scheduler">
                      ${amt.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggested reply */}
          {extractedResult.suggestedReply && (
            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Send className="h-3 w-3" /> Suggested reply
              </p>
              <div className="whitespace-pre-line rounded-lg border-[0.5px] border-border bg-card p-3 text-xs leading-relaxed text-foreground">
                {extractedResult.suggestedReply}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content: inbox + detail */}
      <div className="flex min-h-[60vh] gap-5">
        {/* Inbox list */}
        <div
          className={`w-full overflow-hidden rounded-xl border-[0.5px] border-border bg-card md:w-96 lg:w-[380px] ${
            selectedEvent ? "hidden md:block" : ""
          }`}
        >
          {eventsLoading ? (
            <InboxSkeleton />
          ) : events.length > 0 ? (
            <div className="divide-y divide-border/50">
              {events.map((evt) => (
                <button
                  key={evt.id}
                  className={`w-full p-4 text-left transition-colors duration-150 hover:bg-background-secondary ${
                    selectedEventId === evt.id ? "bg-scheduler-muted/30" : ""
                  }`}
                  onClick={() => setSelectedEventId(evt.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                        evt.status === "approved"
                          ? "bg-green-50 text-green-600"
                          : evt.status === "dismissed"
                            ? "bg-muted text-muted-foreground"
                            : "bg-scheduler-muted text-scheduler"
                      }`}
                    >
                      {evt.status === "approved" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : evt.status === "dismissed" ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        <SchedulerIcon size={14} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-medium text-foreground">
                          {evt.title}
                        </h3>
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40" />
                      </div>
                      {evt.source_label && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {evt.source_label}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-3">
                        {evt.start_time && (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(evt.start_time).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                        {evt.location && (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[120px] truncate">{evt.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SchedulerIcon}
              title="No events yet"
              description="Paste an email or upload a document to extract events"
              actionLabel="Add content"
              onAction={() => setShowPasteDialog(true)}
              accentColor="scheduler"
            />
          )}
        </div>

        {/* Detail pane */}
        <div className={`flex-1 ${!selectedEvent ? "hidden md:block" : ""}`}>
          {selectedEvent ? (
            <div className="animate-fade-in rounded-xl border-[0.5px] border-border bg-card p-6">
              <button
                className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:hidden"
                onClick={() => setSelectedEventId(null)}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border-[0.5px] px-2.5 py-1 text-[11px] font-medium ${
                    selectedEvent.status === "approved"
                      ? "border-green-100 bg-green-50 text-green-700"
                      : selectedEvent.status === "dismissed"
                        ? "border-border bg-muted text-muted-foreground"
                        : "border-scheduler/20 bg-scheduler-muted text-scheduler"
                  }`}
                >
                  {selectedEvent.status === "pending"
                    ? "Needs review"
                    : selectedEvent.status === "approved"
                      ? "Approved"
                      : "Dismissed"}
                </span>
                {selectedEvent.confidence && (
                  <ConfidenceBadge confidence={Number(selectedEvent.confidence)} />
                )}
              </div>

              <h2 className="mb-2 text-lg font-semibold text-foreground">{selectedEvent.title}</h2>

              <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {selectedEvent.start_time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {new Date(selectedEvent.start_time).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" at "}
                    {new Date(selectedEvent.start_time).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {selectedEvent.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {selectedEvent.location}
                  </span>
                )}
              </div>

              {/* Action items */}
              {selectedEvent.action_items &&
                (selectedEvent.action_items as Array<{ task: string; due_date?: string | null }>)
                  .length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Action items
                    </h3>
                    <div className="space-y-2">
                      {(
                        selectedEvent.action_items as Array<{
                          task: string;
                          due_date?: string | null;
                        }>
                      ).map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-lg bg-background-secondary p-3"
                        >
                          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-[0.5px] border-border bg-card">
                            <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm text-foreground">{item.task}</span>
                            {item.due_date && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                Due {item.due_date}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Amount due */}
              {selectedEvent.amount_due && (
                <div className="mb-6 rounded-xl border-[0.5px] border-scheduler/20 bg-scheduler-muted p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {(selectedEvent.amount_due as { what: string }).what}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due {(selectedEvent.amount_due as { dueDate: string }).dueDate}
                        {(selectedEvent.amount_due as { payee: string }).payee &&
                          ` to ${(selectedEvent.amount_due as { payee: string }).payee}`}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-scheduler">
                      ${(selectedEvent.amount_due as { amount: number }).amount}
                    </span>
                  </div>
                </div>
              )}

              {/* Reply draft */}
              {selectedEvent.reply_draft && (
                <div className="mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Send className="h-3 w-3" />
                    Suggested reply
                  </h3>
                  <div className="rounded-xl border-[0.5px] border-border bg-card p-4">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                      {selectedEvent.reply_draft}
                    </p>
                  </div>
                </div>
              )}

              {/* Raw content */}
              {selectedEvent.raw_content && (
                <div className="mb-6">
                  <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Original content
                  </h3>
                  <div className="rounded-xl border-[0.5px] border-border bg-background-secondary p-4">
                    <p className="whitespace-pre-line font-mono text-xs leading-relaxed text-muted-foreground">
                      {selectedEvent.raw_content}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedEvent.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleUpdateStatus(selectedEvent.id, "approved")}
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedEvent.id, "dismissed")}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border-[0.5px] border-dashed border-border bg-card/50">
              <p className="text-sm text-muted-foreground">
                {events.length > 0
                  ? "Select an item to view details"
                  : "Paste content or upload a document to get started"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Paste Dialog */}
      {showPasteDialog && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowPasteDialog(false)}
          />
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border-[0.5px] border-border bg-card p-6">
            <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
              <ClipboardPaste className="h-4 w-4 text-scheduler" />
              Paste content
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Paste an email, permission slip, school notice, or any text with dates and events
            </p>
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Paste your email or document text here..."
              rows={10}
              className="w-full resize-none rounded-xl border-[0.5px] border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-scheduler/30"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowPasteDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleExtract(pasteContent)}
                disabled={extracting || !pasteContent.trim()}
              >
                {extracting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Extract with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowUploadDialog(false)}
          />
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border-[0.5px] border-border bg-card p-6">
            <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
              <Upload className="h-4 w-4 text-scheduler" />
              Upload document
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload a text file — AI will extract events and action items
            </p>
            <div
              className={`flex cursor-pointer flex-col items-center gap-4 rounded-xl border-[0.5px] border-dashed py-10 transition-colors ${
                dragActive
                  ? "border-scheduler bg-scheduler-muted"
                  : "border-border hover:border-scheduler/40 hover:bg-background-secondary"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-scheduler-muted">
                  <FileText className="h-5 w-5 text-scheduler" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-scheduler-muted">
                  <ImageIcon className="h-5 w-5 text-scheduler" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {dragActive ? "Drop file here" : "Click or drag to upload"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">TXT files — up to 10MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.text,text/plain"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleFileUpload(file);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

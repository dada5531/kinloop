"use client";

import {
  Calendar,
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
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

import { useChild } from "@/components/providers/ChildProvider";

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
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Sparkles className="h-3 w-3" />
      {pct}% confidence
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colors[priority] || "bg-gray-100 text-gray-700"}`}
    >
      {priority}
    </span>
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
    <div className="flex h-screen flex-col pt-14 lg:h-screen lg:pt-0">
      {/* Page header */}
      <div className="flex-shrink-0 border-b bg-card/50 px-4 py-4 md:px-6 md:py-5 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-scheduler-muted">
                <Calendar className="h-4 w-4 text-scheduler" />
              </div>
              Scheduler
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste emails or upload documents — AI extracts events, deadlines &amp; action items
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadDialog(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent/50"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </button>
            <button
              onClick={() => setShowPasteDialog(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-scheduler px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Paste
            </button>
          </div>
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

      {/* Extracted result banner */}
      {extractedResult && (
        <div className="max-h-[40vh] flex-shrink-0 overflow-y-auto border-b border-scheduler/10 bg-scheduler-muted/30 px-4 py-4 md:px-6 lg:px-8">
          <div className="mb-3 flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-scheduler" />
            <div>
              <p className="text-sm font-medium text-foreground">AI Extraction Results</p>
              <ConfidenceBadge confidence={extractedResult.confidence} />
            </div>
            <button
              className="ml-auto rounded p-1 hover:bg-background/50"
              onClick={() => setExtractedResult(null)}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Extracted events */}
          <div className="space-y-3">
            {extractedResult.events.map((evt, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{evt.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {evt.startDate}
                      {evt.endDate && ` – ${evt.endDate}`}
                      {evt.location && ` · ${evt.location}`}
                    </p>
                    {evt.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{evt.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleApproveExtracted(evt)}
                    disabled={approving}
                    className="inline-flex items-center gap-1 rounded-lg bg-scheduler px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" />
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action items */}
          {extractedResult.actionItems.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-foreground">Action items:</p>
              <div className="space-y-1.5">
                {extractedResult.actionItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="font-medium text-scheduler">{i + 1}.</span>
                    <span className="text-foreground">{item.task}</span>
                    {item.dueDate && (
                      <span className="ml-auto whitespace-nowrap text-muted-foreground">
                        Due {item.dueDate}
                      </span>
                    )}
                    <PriorityBadge priority={item.priority} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amounts due */}
          {extractedResult.amountsDue.length > 0 && (
            <div className="mt-3 space-y-2">
              {extractedResult.amountsDue.map((amt, i) => (
                <div key={i} className="rounded-lg border border-scheduler/10 bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{amt.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {amt.dueDate && `Due ${amt.dueDate}`}
                        {amt.payableTo && ` to ${amt.payableTo}`}
                      </p>
                    </div>
                    <span className="text-base font-bold text-scheduler">
                      ${amt.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggested reply */}
          {extractedResult.suggestedReply && (
            <div className="mt-3">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-foreground">
                <Send className="h-3 w-3 text-scheduler" /> Suggested reply
              </p>
              <div className="whitespace-pre-line rounded-lg border bg-card p-3 text-xs text-foreground">
                {extractedResult.suggestedReply}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content: inbox + detail */}
      <div className="flex flex-1 overflow-hidden">
        {/* Inbox list */}
        <div
          className={`w-full overflow-y-auto border-r bg-card/30 md:w-96 lg:w-[380px] ${
            selectedEvent ? "hidden md:block" : ""
          }`}
        >
          {eventsLoading ? (
            <div className="p-6 text-center">
              <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-scheduler" />
              <p className="text-sm text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            events.map((evt) => (
              <button
                key={evt.id}
                className={`w-full border-b border-border/50 p-4 text-left transition-colors hover:bg-muted/30 ${
                  selectedEventId === evt.id ? "bg-scheduler-muted/30" : ""
                }`}
                onClick={() => setSelectedEventId(evt.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                      evt.status === "approved"
                        ? "bg-green-50 text-green-600"
                        : evt.status === "dismissed"
                          ? "bg-muted text-muted-foreground"
                          : "bg-scheduler-muted text-scheduler"
                    }`}
                  >
                    {evt.status === "approved" ? (
                      <Check className="h-4 w-4" />
                    ) : evt.status === "dismissed" ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-medium text-foreground">{evt.title}</h3>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </div>
                    {evt.source_label && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{evt.source_label}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-3">
                      {evt.start_time && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(evt.start_time).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      {evt.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="max-w-[120px] truncate">{evt.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-scheduler-muted">
                <Calendar className="h-6 w-6 text-scheduler" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">No events yet</p>
              <p className="mb-4 text-xs text-muted-foreground">
                Paste an email or upload a document to extract events
              </p>
              <button
                onClick={() => setShowPasteDialog(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-scheduler px-4 py-2 text-xs font-medium text-white hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add content
              </button>
            </div>
          )}
        </div>

        {/* Detail pane */}
        <div className={`flex-1 overflow-y-auto ${!selectedEvent ? "hidden md:block" : ""}`}>
          {selectedEvent ? (
            <div className="max-w-2xl p-4 md:p-6 lg:p-8">
              <button
                className="mb-4 flex items-center gap-1 text-sm text-muted-foreground md:hidden"
                onClick={() => setSelectedEventId(null)}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    selectedEvent.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : selectedEvent.status === "dismissed"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-scheduler-muted text-scheduler"
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

              <h2 className="mb-2 text-xl font-bold text-foreground">{selectedEvent.title}</h2>

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
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Action items</h3>
                    <div className="space-y-2">
                      {(
                        selectedEvent.action_items as Array<{
                          task: string;
                          due_date?: string | null;
                        }>
                      ).map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3"
                        >
                          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border">
                            <span className="text-xs text-muted-foreground">{i + 1}</span>
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
                <div className="mb-6 rounded-xl border border-scheduler/10 bg-scheduler-muted/30 p-4">
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
                    <span className="text-lg font-bold text-scheduler">
                      ${(selectedEvent.amount_due as { amount: number }).amount}
                    </span>
                  </div>
                </div>
              )}

              {/* Reply draft */}
              {selectedEvent.reply_draft && (
                <div className="mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Send className="h-4 w-4 text-scheduler" />
                    Suggested reply
                  </h3>
                  <div className="rounded-xl border bg-card p-4">
                    <p className="whitespace-pre-line text-sm text-foreground">
                      {selectedEvent.reply_draft}
                    </p>
                  </div>
                </div>
              )}

              {/* Raw content */}
              {selectedEvent.raw_content && (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Original content</h3>
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                    <p className="whitespace-pre-line font-mono text-xs leading-relaxed text-muted-foreground">
                      {selectedEvent.raw_content}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedEvent.status === "pending" && (
                <div className="sticky bottom-4 flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedEvent.id, "approved")}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-scheduler py-2.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedEvent.id, "dismissed")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent/50"
                  >
                    <X className="h-4 w-4" />
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {events.length > 0
                ? "Select an item to view details"
                : "Paste content or upload a document to get started"}
            </div>
          )}
        </div>
      </div>

      {/* Paste Dialog */}
      {showPasteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasteDialog(false)} />
          <div className="relative mx-4 w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
              <ClipboardPaste className="h-5 w-5 text-scheduler" />
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
              className="w-full resize-none rounded-lg border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-scheduler/50"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowPasteDialog(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent/50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExtract(pasteContent)}
                disabled={extracting || !pasteContent.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-scheduler px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {extracting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Extract with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowUploadDialog(false)}
          />
          <div className="relative mx-4 w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
              <Upload className="h-5 w-5 text-scheduler" />
              Upload document
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload a text file — AI will extract events and action items
            </p>
            <div
              className={`flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed py-8 transition-colors ${
                dragActive
                  ? "border-scheduler bg-scheduler-muted/30"
                  : "border-scheduler/20 hover:border-scheduler/40"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-scheduler-muted">
                  <FileText className="h-5 w-5 text-scheduler" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-scheduler-muted">
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

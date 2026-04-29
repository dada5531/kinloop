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
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Mail,
  CalendarPlus,
  CheckCheck,
  XCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

import { SchedulerIcon } from "@/components/icons/QuadrantIcons";
import { AchievementMicro } from "@/components/illustrations";
import { QuadrantTransition } from "@/components/illustrations";
import { SchedulerTransition } from "@/components/illustrations";
import { ActivityScheduled } from "@/components/illustrations";
import { SchedulerEmpty } from "@/components/illustrations/SchedulerEmpty";
import { useChild } from "@/components/providers/ChildProvider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { safeToISOString, safeFormatDate, safeFormatTime } from "@/lib/safe-date";
import { logError } from "@/lib/logger";
import { showErrorToast } from "@/lib/error-toasts";
import { toast } from "sonner";
import { validateExtractionResult, salvageExtractionResult } from "@/lib/extraction-schema";

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
  sourceLabel?: string;
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

interface FileUploadState {
  file: File;
  status: "pending" | "parsing" | "extracting" | "done" | "error";
  progress: string;
  result?: ExtractionResult;
  error?: string;
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

function FileStatusIcon({ status }: { status: FileUploadState["status"] }) {
  switch (status) {
    case "pending":
      return <FileText className="h-4 w-4 text-muted-foreground" />;
    case "parsing":
      return <Loader2 className="h-4 w-4 animate-spin text-scheduler" />;
    case "extracting":
      return <Sparkles className="h-4 w-4 animate-pulse text-scheduler" />;
    case "done":
      return <Check className="h-4 w-4 text-green-600" />;
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
}

const ACCEPTED_TYPES = ".txt,.text,.eml,.msg,.png,.jpg,.jpeg,.webp,.pdf";
const ACCEPTED_MIME =
  "text/plain,message/rfc822,application/vnd.ms-outlook,image/png,image/jpeg,image/webp,application/pdf";

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
  const [extractedResults, setExtractedResults] = useState<ExtractionResult[]>([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [validationFailure, setValidationFailure] = useState<{ errors: string[]; raw: unknown } | null>(null);
  const [rawContent, setRawContent] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [approving, setApproving] = useState(false);

  // Multi-file upload state
  const [fileUploads, setFileUploads] = useState<FileUploadState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Send-to-calendar state
  const [sendingCalendar, setSendingCalendar] = useState<string | null>(null);
  const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  // Batch operation state
  const [batchApproving, setBatchApproving] = useState(false);

  // Illustration animation state
  const [showTransition, setShowTransition] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);

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
    } catch (err) {
      logError(err, { route: "scheduler.fetchEvents", childId: selectedChildId || undefined });
    } finally {
      setEventsLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const pendingEvents = events.filter((e) => e.status === "pending");

  // ─── Parse Email File ──────────────────────────────────────
  const parseEmailFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse/email", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to parse email file");
    }

    const data = await res.json();
    // Combine subject, from, and body into extraction-ready text
    let text = "";
    if (data.subject) text += `Subject: ${data.subject}\n`;
    if (data.from) text += `From: ${data.from}\n`;
    if (data.date) text += `Date: ${data.date}\n`;
    text += `\n${data.body || ""}`;
    return text;
  };

  // ─── Extract Handler ────────────────────────────────────────
  const handleExtract = async (
    content: string,
    contentType: string = "text",
    sourceLabel?: string,
  ) => {
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

      const rawResult = await res.json();
      const validation = validateExtractionResult(rawResult);
      if (!validation.valid) {
        // Try to salvage what we can
        const salvaged = salvageExtractionResult(rawResult);
        if (salvaged.events.length > 0) {
          salvaged.sourceLabel = sourceLabel;
          setExtractedResults((prev) => [...prev, salvaged]);
          toast.warning("We had trouble reading parts of this email. Some fields may need manual editing.");
        } else {
          setValidationFailure({ errors: validation.errors, raw: rawResult });
          toast.error("We had trouble reading this email — try pasting it again or scheduling manually.");
        }
      } else {
        const result = validation.data!;
        result.sourceLabel = sourceLabel;
        setExtractedResults((prev) => [...prev, result]);
      }
      setShowPasteDialog(false);
      setShowUploadDialog(false);
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  // ─── Multi-File Upload Handler ─────────────────────────────
  const handleMultiFileUpload = async (files: FileList | File[]) => {
    const maxSize = 10 * 1024 * 1024;
    const fileArray = Array.from(files);

    // Initialize upload states
    const newUploads: FileUploadState[] = fileArray.map((f) => ({
      file: f,
      status: f.size > maxSize ? "error" : "pending",
      progress: f.size > maxSize ? "File too large (max 10MB)" : "Queued",
      error: f.size > maxSize ? "File too large" : undefined,
    }));

    setFileUploads(newUploads);

    // Process files sequentially (to avoid rate limits)
    for (let i = 0; i < newUploads.length; i++) {
      if (newUploads[i].status === "error") continue;

      const file = newUploads[i].file;
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      try {
        // Step 1: Parse email files
        let textContent: string;
        let contentType = "text";

        if (ext === "msg" || ext === "eml") {
          setFileUploads((prev) =>
            prev.map((u, j) =>
              j === i ? { ...u, status: "parsing", progress: "Parsing email..." } : u,
            ),
          );
          textContent = await parseEmailFile(file);
          contentType = "email";
        } else if (ext === "txt" || ext === "text") {
          textContent = await file.text();
        } else if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
          // For images, convert to base64 and send as image content
          const buffer = await file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
          );
          textContent = `data:${file.type};base64,${base64}`;
          contentType = "image";
        } else if (ext === "pdf") {
          // PDFs need server-side parsing
          setFileUploads((prev) =>
            prev.map((u, j) =>
              j === i
                ? {
                    ...u,
                    status: "error",
                    progress: "PDF parsing not yet supported — paste text content instead",
                    error: "PDF not supported",
                  }
                : u,
            ),
          );
          continue;
        } else {
          textContent = await file.text();
        }

        // Step 2: Extract with AI
        setFileUploads((prev) =>
          prev.map((u, j) =>
            j === i ? { ...u, status: "extracting", progress: "Extracting with AI..." } : u,
          ),
        );

        const res = await fetch("/api/extract/scheduler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: textContent,
            contentType,
            childId: selectedChildId,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Extraction failed");
        }

        const rawResult = await res.json();
        const validation = validateExtractionResult(rawResult);
        let result: ExtractionResult;
        if (!validation.valid) {
          const salvaged = salvageExtractionResult(rawResult);
          if (salvaged.events.length === 0) {
            throw new Error("Could not read this file — try a different format or paste the text directly.");
          }
          result = { ...salvaged, sourceLabel: file.name } as ExtractionResult;
          toast.warning(`Some fields in "${file.name}" may need manual editing.`);
        } else {
          result = { ...validation.data!, sourceLabel: file.name } as ExtractionResult;
        }

        setFileUploads((prev) =>
          prev.map((u, j) =>
            j === i
              ? {
                  ...u,
                  status: "done",
                  progress: `Found ${result.events.length} event${result.events.length !== 1 ? "s" : ""}`,
                  result,
                }
              : u,
          ),
        );

        setExtractedResults((prev) => [...prev, result]);
      } catch (err) {
        setFileUploads((prev) =>
          prev.map((u, j) =>
            j === i
              ? {
                  ...u,
                  status: "error",
                  progress: err instanceof Error ? err.message : "Failed",
                  error: err instanceof Error ? err.message : "Failed",
                }
              : u,
          ),
        );
      }
    }
  };

  // ─── Approve Extracted Event ────────────────────────────────
  const handleApproveExtracted = async (
    resultIndex: number,
    eventIndex: number,
    evt: ExtractedEvent,
  ) => {
    if (!selectedChildId) return;
    setApproving(true);

    const result = extractedResults[resultIndex];

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          title: evt.title,
          startTime: safeToISOString(evt.startDate),
          endTime: safeToISOString(evt.endDate),
          location: evt.location,
          source: "paste",
          sourceLabel: result?.sourceLabel || "AI extraction",
          actionItems:
            result?.actionItems?.map((a) => ({
              task: a.task,
              due_date: a.dueDate,
            })) || [],
          amountDue: result?.amountsDue?.[0]
            ? {
                what: result.amountsDue[0].description,
                amount: result.amountsDue[0].amount,
                dueDate: result.amountsDue[0].dueDate || "",
                payee: result.amountsDue[0].payableTo || "",
              }
            : null,
          confidence: result?.confidence,
          rawContent,
          replyDraft: result?.suggestedReply,
          status: "approved",
        }),
      });

      if (res.ok) {
        // Show achievement micro-celebration
        setShowAchievement(true);
        // Remove the approved event from the extraction result
        setExtractedResults((prev) =>
          prev
            .map((r, ri) => {
              if (ri !== resultIndex) return r;
              const remaining = r.events.filter((_, ei) => ei !== eventIndex);
              return { ...r, events: remaining };
            })
            .filter((r) => r.events.length > 0),
        );
        fetchEvents();
      }
    } catch (err) {
      logError(err, { route: "scheduler.handleApproveExtracted", childId: selectedChildId || undefined, input: evt.title });
      showErrorToast("save", { action: "approve this event" });
    } finally {
      setApproving(false);
    }
  };

  // ─── Batch Approve All Extracted ────────────────────────────
  const handleBatchApproveAll = async () => {
    if (!selectedChildId) return;
    setBatchApproving(true);

    try {
      for (let ri = 0; ri < extractedResults.length; ri++) {
        const result = extractedResults[ri];
        for (const evt of result.events) {
          await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: selectedChildId,
              title: evt.title,
              startTime: safeToISOString(evt.startDate),
              endTime: safeToISOString(evt.endDate),
              location: evt.location,
              source: "paste",
              sourceLabel: result.sourceLabel || "AI extraction",
              actionItems:
                result.actionItems?.map((a) => ({
                  task: a.task,
                  due_date: a.dueDate,
                })) || [],
              amountDue: result.amountsDue?.[0]
                ? {
                    what: result.amountsDue[0].description,
                    amount: result.amountsDue[0].amount,
                    dueDate: result.amountsDue[0].dueDate || "",
                    payee: result.amountsDue[0].payableTo || "",
                  }
                : null,
              confidence: result.confidence,
              rawContent,
              replyDraft: result.suggestedReply,
              status: "approved",
            }),
          });
        }
      }
      setExtractedResults([]);
      setShowAchievement(true);
      fetchEvents();
    } catch (err) {
      logError(err, { route: "scheduler.handleBatchApproveAll", childId: selectedChildId || undefined });
      showErrorToast("save", { action: "approve these events" });
    } finally {
      setBatchApproving(false);
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
    } catch (err) {
      logError(err, { route: "scheduler.handleUpdateStatus" });
      showErrorToast("save", { action: "update this event" });
    }
  };

  // ─── Send to Calendar ───────────────────────────────────────
  const handleSendToCalendar = async (event: SavedEvent) => {
    setSendingCalendar(event.id);
    setCalendarError(null);
    setCalendarSuccess(null);

    try {
      const res = await fetch("/api/scheduler/send-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send calendar invite");
      }

      setCalendarSuccess(event.id);
      setTimeout(() => setCalendarSuccess(null), 5000);
    } catch (err) {
      setCalendarError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSendingCalendar(null);
    }
  };

  // ─── Copy Reply Draft ───────────────────────────────────────
  const handleCopyReply = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard fallback — intentional silent catch for clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  // ─── File Drop ──────────────────────────────────────────────
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) await handleMultiFileUpload(files);
    },
    [selectedChildId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Total extracted events count
  const totalExtractedEvents = extractedResults.reduce((sum, r) => sum + r.events.length, 0);

  // ─── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* Achievement micro-celebration overlay */}
      <AchievementMicro
        illustration={<ActivityScheduled size={64} />}
        show={showAchievement}
        onDismiss={() => setShowAchievement(false)}
        label="Event scheduled!"
        position="center"
      />

      <QuadrantTransition
        illustration={<SchedulerTransition className="h-full w-full" />}
        bgClass="bg-scheduler-muted/80"
        accentClass="ring-scheduler/30"
        play={showTransition}
        onComplete={() => setShowTransition(false)}
      >
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
          <h1 className="font-serif-display text-xl font-semibold text-foreground">Events &amp; deadlines</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste emails, upload .msg/.eml files, or drag documents — AI extracts events, deadlines
            &amp; action items
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

      {/* Validation failure fallback */}
      {validationFailure && (
        <div className="animate-slide-fade-in mb-4 rounded-xl border-[0.5px] border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />
            <p className="text-sm font-medium text-amber-800">We had trouble reading this email</p>
            <button
              onClick={() => setValidationFailure(null)}
              className="ml-auto rounded-lg p-1 text-amber-400 hover:bg-amber-100 hover:text-amber-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-3 text-xs text-amber-700">
            Try pasting the email again, or schedule the event manually using the form below.
          </p>
          {validationFailure.raw != null && (
            <details className="rounded-lg bg-amber-100/50 p-3">
              <summary className="cursor-pointer text-xs font-medium text-amber-700">
                Show raw extracted data
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-[10px] text-amber-800">
                {String(typeof validationFailure.raw === "string"
                  ? validationFailure.raw
                  : JSON.stringify(validationFailure.raw, null, 2))}
              </pre>
            </details>
          )}
        </div>
      )}
      {/* Extracted results banner */}
      {extractedResults.length > 0 && (
        <div className="animate-slide-fade-in mb-6 rounded-xl border-[0.5px] border-scheduler/20 bg-scheduler-muted p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-scheduler" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-scheduler">
                AI extraction — {totalExtractedEvents} event
                {totalExtractedEvents !== 1 ? "s" : ""} found
              </span>
            </div>
            <div className="flex items-center gap-2">
              {totalExtractedEvents > 1 && (
                <Button size="sm" onClick={handleBatchApproveAll} disabled={batchApproving}>
                  {batchApproving ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                      Approve all
                    </>
                  )}
                </Button>
              )}
              <button
                className="rounded-lg p-1 text-muted-foreground hover:bg-background-secondary"
                onClick={() => setExtractedResults([])}
                title="Dismiss all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Grouped by source */}
          {extractedResults.map((result, ri) => (
            <div key={ri} className="mb-3 last:mb-0">
              {result.sourceLabel && (
                <p className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {result.sourceLabel}
                  <ConfidenceBadge confidence={result.confidence} />
                </p>
              )}
              {!result.sourceLabel && (
                <div className="mb-2">
                  <ConfidenceBadge confidence={result.confidence} />
                </div>
              )}

              <div className="space-y-2">
                {result.events.map((evt, ei) => (
                  <div key={ei} className="rounded-xl border-[0.5px] border-border bg-card p-4">
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
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setExtractedResults((prev) =>
                              prev
                                .map((r, i) =>
                                  i === ri
                                    ? { ...r, events: r.events.filter((_, j) => j !== ei) }
                                    : r,
                                )
                                .filter((r) => r.events.length > 0),
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveExtracted(ri, ei, evt)}
                          disabled={approving}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action items for this extraction */}
              {result.actionItems.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Action items
                  </p>
                  <div className="space-y-1.5">
                    {result.actionItems.map((item, i) => (
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
              {result.amountsDue.length > 0 && (
                <div className="mt-3 space-y-2">
                  {result.amountsDue.map((amt, i) => (
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
              {result.suggestedReply && (
                <div className="mt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Send className="h-3 w-3" /> Suggested reply
                  </p>
                  <div className="relative rounded-lg border-[0.5px] border-border bg-card p-3">
                    <p className="whitespace-pre-line pr-8 text-xs leading-relaxed text-foreground">
                      {result.suggestedReply}
                    </p>
                    <button
                      onClick={() => handleCopyReply(result.suggestedReply || "")}
                      className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-background-secondary hover:text-foreground"
                      title="Copy reply"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Batch actions for pending events */}
      {pendingEvents.length > 1 && extractedResults.length === 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border-[0.5px] border-border bg-card px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {pendingEvents.length} pending
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                for (const e of pendingEvents) {
                  await handleUpdateStatus(e.id, "dismissed");
                }
              }}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Dismiss all
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                for (const e of pendingEvents) {
                  await handleUpdateStatus(e.id, "approved");
                }
              }}
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Approve all
            </Button>
          </div>
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
              {events.map((evt, idx) => (
                <button
                  key={evt.id}
                  className={`animate-stagger-item w-full p-4 text-left transition-colors duration-150 hover:bg-background-secondary ${
                    selectedEventId === evt.id ? "bg-scheduler-muted/30" : ""
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onClick={() => setSelectedEventId(evt.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                        evt.status === "approved"
                          ? "bg-green-50 text-green-600 animate-accent-flush"
                          : evt.status === "dismissed"
                            ? "bg-muted text-muted-foreground"
                            : "bg-scheduler-muted text-scheduler"
                      }`}
                    >
                      {evt.status === "approved" ? (
                        <Check className="h-3.5 w-3.5 animate-success-icon" />
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
                          {evt.source === "email" && <Mail className="mr-1 inline h-3 w-3" />}
                          {evt.source_label}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-3">
                        {evt.start_time && (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {safeFormatDate(evt.start_time, { month: "short", day: "numeric" })}
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
              description="Paste an email or upload .msg/.eml files to extract events"
              actionLabel="Add content"
              onAction={() => setShowPasteDialog(true)}
              accentColor="scheduler"
              illustration={<SchedulerEmpty />}
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

              <h2 className="mb-2 font-serif-display text-lg font-semibold text-foreground">{selectedEvent.title}</h2>

              <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {selectedEvent.start_time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {safeFormatDate(selectedEvent.start_time, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    {" at "}
                    {safeFormatTime(selectedEvent.start_time, { hour: "numeric", minute: "2-digit" })}
                  </span>
                )}
                {selectedEvent.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {selectedEvent.location}
                  </span>
                )}
              </div>

              {/* Send to Calendar button */}
              {selectedEvent.status === "approved" && selectedEvent.start_time && (
                <div className="mb-6">
                  {calendarSuccess === selectedEvent.id ? (
                    <div className="flex items-center gap-2 rounded-xl border-[0.5px] border-green-200 bg-green-50 px-4 py-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        Calendar invite sent to your email
                      </span>
                    </div>
                  ) : calendarError && sendingCalendar === null ? (
                    <div className="flex items-center gap-2 rounded-xl border-[0.5px] border-red-200 bg-red-50 px-4 py-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{calendarError}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={() => {
                          setCalendarError(null);
                          handleSendToCalendar(selectedEvent);
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleSendToCalendar(selectedEvent)}
                      disabled={sendingCalendar === selectedEvent.id}
                      className="w-full justify-center"
                    >
                      {sendingCalendar === selectedEvent.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending invite...
                        </>
                      ) : (
                        <>
                          <CalendarPlus className="mr-2 h-4 w-4" />
                          Send to my calendar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

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
                  <div className="relative rounded-xl border-[0.5px] border-border bg-card p-4">
                    <p className="whitespace-pre-line pr-8 text-sm leading-relaxed text-foreground">
                      {selectedEvent.reply_draft}
                    </p>
                    <button
                      onClick={() => handleCopyReply(selectedEvent.reply_draft || "")}
                      className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-background-secondary hover:text-foreground"
                      title="Copy reply"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Raw content */}
              {selectedEvent.raw_content && (
                <div className="mb-6">
                  <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Original content
                  </h3>
                  <div className="max-h-48 overflow-y-auto rounded-xl border-[0.5px] border-border bg-background-secondary p-4">
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

      {/* Upload Dialog — Multi-file with .msg/.eml support */}
      {showUploadDialog && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setShowUploadDialog(false);
              setFileUploads([]);
            }}
          />
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border-[0.5px] border-border bg-card p-6">
            <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
              <Upload className="h-4 w-4 text-scheduler" />
              Upload documents
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload emails (.msg, .eml), text files, or images — AI will extract events and action
              items from each
            </p>

            {/* Drop zone */}
            <div
              className={`flex cursor-pointer flex-col items-center gap-4 rounded-xl border-[0.5px] border-dashed py-8 transition-colors ${
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
                  <Mail className="h-5 w-5 text-scheduler" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-scheduler-muted">
                  <FileText className="h-5 w-5 text-scheduler" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-scheduler-muted">
                  <ImageIcon className="h-5 w-5 text-scheduler" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {dragActive ? "Drop files here" : "Click or drag to upload"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  .msg, .eml, .txt, images — up to 10MB each — multiple files OK
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                if (files && files.length > 0) await handleMultiFileUpload(files);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />

            {/* File upload progress list */}
            {fileUploads.length > 0 && (
              <div className="mt-4 space-y-2">
                {fileUploads.map((upload, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border-[0.5px] border-border bg-background-secondary px-3 py-2.5"
                  >
                    <FileStatusIcon status={upload.status} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {upload.file.name}
                      </p>
                      <p
                        className={`text-[11px] ${upload.status === "error" ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        {upload.progress}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {(upload.file.size / 1024).toFixed(0)}KB
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Close button */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowUploadDialog(false);
                  setFileUploads([]);
                }}
              >
                {fileUploads.some((u) => u.status === "done") ? "Done" : "Cancel"}
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

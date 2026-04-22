/**
 * KINLOOP Scheduler (Quadrant 1) — Purple accent
 * Real AI extraction from pasted text, uploaded PDFs, and emails
 */
import AppShell from "@/components/AppShell";
import { useChild } from "@/contexts/ChildContext";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import {
  Calendar,
  Mail,
  FileText,
  Check,
  X,
  ChevronRight,
  Upload,
  ClipboardPaste,
  Clock,
  MapPin,
  DollarSign,
  Sparkles,
  ArrowLeft,
  Send,
  Edit3,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function SourceIcon({ type }: { type: string }) {
  if (type === "email") return <Mail className="h-4 w-4" />;
  if (type === "pdf") return <FileText className="h-4 w-4" />;
  return <ClipboardPaste className="h-4 w-4" />;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  return (
    <span className="inline-flex items-center gap-1 text-xs text-purple font-medium">
      <Sparkles className="h-3 w-3" />
      {pct}% confidence
    </span>
  );
}

type ExtractedResult = {
  events: Array<{
    title: string;
    date: string;
    time: string | null;
    endTime: string | null;
    location: string | null;
    notes: string | null;
  }>;
  actionItems: string[];
  amountDue: { what: string; amount: number; dueDate: string; payee: string } | null;
  replyDraft: string | null;
  confidence: number;
};

export default function Scheduler() {
  const { selectedChild } = useChild();
  const childId = selectedChild?.id ?? 0;

  const { data: events, refetch } = trpc.scheduler.events.useQuery(
    { childId },
    { enabled: !!childId, staleTime: 10_000 }
  );

  const extractMutation = trpc.scheduler.extract.useMutation();
  const approveMutation = trpc.scheduler.approve.useMutation();
  const updateStatusMutation = trpc.scheduler.updateStatus.useMutation();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pasteContent, setPasteContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedResult | null>(null);
  const [rawContent, setRawContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eventList = events ?? [];
  const selected = eventList.find((e: any) => e.id === selectedId);

  const handleExtract = async (content: string, sourceType: string, sourceLabel: string) => {
    if (!childId || !content.trim()) return;
    setExtracting(true);
    setRawContent(content);
    try {
      const result = await extractMutation.mutateAsync({
        childId,
        content,
        sourceType,
        sourceLabel,
      });
      setExtractedResult(result as ExtractedResult);
      setShowPasteDialog(false);
      setShowUploadDialog(false);
      toast.success("AI extraction complete — review the results below");
    } catch (err) {
      toast.error("Extraction failed. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as text (for PDFs we'll read as text; for images we'd need OCR)
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        await handleExtract(text, "pdf", `Uploaded: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleApproveExtracted = async (eventData: ExtractedResult["events"][0]) => {
    if (!childId) return;
    try {
      const startTime = eventData.time
        ? `${eventData.date}T${eventData.time}:00`
        : `${eventData.date}T00:00:00`;
      const endTime = eventData.endTime
        ? `${eventData.date}T${eventData.endTime}:00`
        : undefined;

      await approveMutation.mutateAsync({
        childId,
        title: eventData.title,
        startTime,
        endTime,
        location: eventData.location ?? undefined,
        sourceType: "paste",
        sourceLabel: "Pasted content",
        actionItems: extractedResult?.actionItems ?? [],
        amountDue: extractedResult?.amountDue ?? undefined,
        confidence: extractedResult?.confidence,
        rawContent,
        replyDraft: extractedResult?.replyDraft ?? undefined,
      });
      toast.success(`"${eventData.title}" approved and saved`);
      setExtractedResult(null);
      refetch();
    } catch (err) {
      toast.error("Failed to save event");
    }
  };

  const handleApproveExisting = async (eventId: number) => {
    try {
      await updateStatusMutation.mutateAsync({ eventId, status: "approved" });
      toast.success("Event approved");
      refetch();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDismissExisting = async (eventId: number) => {
    try {
      await updateStatusMutation.mutateAsync({ eventId, status: "dismissed" });
      toast("Event dismissed");
      refetch();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col">
        {/* Page header */}
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-border bg-card/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-light flex items-center justify-center">
                  <Calendar className="h-4.5 w-4.5 text-purple" />
                </div>
                Scheduler
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Paste emails or upload documents — AI extracts events, deadlines & action items
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setShowUploadDialog(true)}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setShowPasteDialog(true)}
              >
                <ClipboardPaste className="h-3.5 w-3.5 mr-1.5" />
                Paste
              </Button>
            </div>
          </div>
        </div>

        {/* Extracted result banner */}
        {extractedResult && (
          <div className="px-4 md:px-6 lg:px-8 py-4 bg-purple-light/30 border-b border-purple/10">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-purple flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">AI Extraction Results</p>
                <ConfidenceBadge confidence={extractedResult.confidence} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs"
                onClick={() => setExtractedResult(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Extracted events */}
            <div className="space-y-3">
              {extractedResult.events.map((evt, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{evt.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {evt.date} {evt.time && `at ${evt.time}`} {evt.endTime && `– ${evt.endTime}`}
                        {evt.location && ` · ${evt.location}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple hover:bg-purple/90 text-white text-xs"
                      onClick={() => handleApproveExtracted(evt)}
                      disabled={approveMutation.isPending}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action items */}
            {extractedResult.actionItems.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground mb-2">Action items:</p>
                <div className="space-y-1">
                  {extractedResult.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-purple font-medium">{i + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amount due */}
            {extractedResult.amountDue && (
              <div className="mt-3 p-3 rounded-lg bg-card border border-purple/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">{extractedResult.amountDue.what}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {extractedResult.amountDue.dueDate} to {extractedResult.amountDue.payee}
                    </p>
                  </div>
                  <span className="font-heading text-base font-bold text-purple">
                    ${extractedResult.amountDue.amount}
                  </span>
                </div>
              </div>
            )}

            {/* Reply draft */}
            {extractedResult.replyDraft && (
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                  <Send className="h-3 w-3 text-purple" /> Suggested reply
                </p>
                <div className="p-3 rounded-lg bg-card border border-border text-xs text-foreground whitespace-pre-line">
                  {extractedResult.replyDraft}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content: inbox + detail */}
        <div className="flex-1 flex overflow-hidden">
          {/* Inbox list */}
          <div className={`w-full md:w-96 lg:w-[380px] border-r border-border overflow-y-auto bg-card/30 ${selected && "hidden md:block"}`}>
            {eventList.length > 0 ? (
              eventList.map((evt: any) => (
                <button
                  key={evt.id}
                  className={`w-full text-left p-4 border-b border-border/50 hover:bg-muted/30 transition-colors ${
                    selectedId === evt.id ? "bg-purple-light/30" : ""
                  }`}
                  onClick={() => setSelectedId(evt.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        evt.status === "approved"
                          ? "bg-green-50 text-green-600"
                          : evt.status === "dismissed"
                          ? "bg-muted text-muted-foreground"
                          : "bg-purple-light text-purple"
                      }`}
                    >
                      {evt.status === "approved" ? (
                        <Check className="h-4 w-4" />
                      ) : evt.status === "dismissed" ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <SourceIcon type={evt.sourceType} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-foreground truncate">{evt.title}</h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{evt.sourceLabel}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {evt.startTime && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(evt.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-purple-light flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-purple" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No events yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Paste an email or upload a document to extract events
                </p>
                <Button
                  size="sm"
                  className="bg-purple hover:bg-purple/90 text-white text-xs"
                  onClick={() => setShowPasteDialog(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add content
                </Button>
              </div>
            )}
          </div>

          {/* Detail pane */}
          <div className={`flex-1 overflow-y-auto ${!selected && "hidden md:block"}`}>
            {selected ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 md:p-6 lg:p-8 max-w-2xl"
                >
                  <button
                    className="md:hidden flex items-center gap-1 text-sm text-muted-foreground mb-4"
                    onClick={() => setSelectedId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <Badge
                      variant={selected.status === "approved" ? "default" : selected.status === "dismissed" ? "secondary" : "outline"}
                      className={selected.status === "pending" ? "border-purple/30 text-purple" : ""}
                    >
                      {selected.status === "pending" ? "Needs review" : selected.status === "approved" ? "Approved" : "Dismissed"}
                    </Badge>
                    {selected.confidence && <ConfidenceBadge confidence={parseFloat(selected.confidence)} />}
                  </div>

                  <h2 className="font-heading text-xl font-bold text-foreground mb-2">{selected.title}</h2>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                    {selected.startTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {new Date(selected.startTime).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {selected.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {selected.location}
                      </span>
                    )}
                  </div>

                  {/* Action items */}
                  {selected.actionItems && (selected.actionItems as string[]).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Action items</h3>
                      <div className="space-y-2">
                        {(selected.actionItems as string[]).map((item: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50">
                            <div className="h-5 w-5 rounded border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs text-muted-foreground">{i + 1}</span>
                            </div>
                            <span className="text-sm text-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amount due */}
                  {selected.amountDue && (
                    <div className="mb-6 p-4 rounded-xl bg-purple-light/30 border border-purple/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{(selected.amountDue as any).what}</p>
                          <p className="text-xs text-muted-foreground">
                            Due {(selected.amountDue as any).dueDate} to {(selected.amountDue as any).payee}
                          </p>
                        </div>
                        <span className="font-heading text-lg font-bold text-purple">
                          ${(selected.amountDue as any).amount}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reply draft */}
                  {selected.replyDraft && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Send className="h-4 w-4 text-purple" />
                        Suggested reply
                      </h3>
                      <div className="p-4 rounded-xl bg-card border border-border">
                        <p className="text-sm text-foreground whitespace-pre-line">{selected.replyDraft}</p>
                      </div>
                    </div>
                  )}

                  {/* Raw content */}
                  {selected.rawContent && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Original content</h3>
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground whitespace-pre-line font-mono leading-relaxed">
                          {selected.rawContent}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {selected.status === "pending" && (
                    <div className="flex gap-3 sticky bottom-4">
                      <Button
                        className="flex-1 bg-purple hover:bg-purple/90 text-white"
                        onClick={() => handleApproveExisting(selected.id)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDismissExisting(selected.id)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {eventList.length > 0 ? "Select an item to view details" : "Paste content or upload a document to get started"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paste Dialog */}
      <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <ClipboardPaste className="h-5 w-5 text-purple" />
              Paste content
            </DialogTitle>
            <DialogDescription>
              Paste an email, permission slip, school notice, or any text with dates and events
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Paste your email or document text here..."
            rows={10}
            className="font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPasteDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-purple hover:bg-purple/90 text-white"
              onClick={() => handleExtract(pasteContent, "paste", "Pasted content")}
              disabled={extracting || !pasteContent.trim()}
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract with AI
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple" />
              Upload document
            </DialogTitle>
            <DialogDescription>
              Upload a text file, PDF, or document to extract events and action items
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <div
              className="w-full border-2 border-dashed border-purple/20 rounded-xl p-8 text-center hover:border-purple/40 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-purple mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">TXT files supported</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.text"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          {extracting && (
            <div className="flex items-center justify-center gap-2 text-sm text-purple">
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

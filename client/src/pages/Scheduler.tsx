/**
 * KINLOOP Scheduler (Quadrant 1) — Purple accent
 * Inbox-style list of AI-extracted events from emails/PDFs
 */
import AppShell from "@/components/AppShell";
import { demoSchedulerEvents, type SchedulerEvent } from "@/lib/demo-data";
import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function Scheduler() {
  const [events, setEvents] = useState(demoSchedulerEvents);
  const [selectedId, setSelectedId] = useState<string | null>(events[0]?.id ?? null);
  const selected = events.find((e) => e.id === selectedId);

  const handleApprove = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "approved" as const } : e)));
    toast.success("Event approved and synced to Google Calendar");
  };

  const handleDismiss = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "dismissed" as const } : e)));
    toast("Event dismissed");
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
                AI-extracted events from emails, PDFs, and notes
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => toast("Upload feature — paste or upload a PDF/image")}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => toast("Paste text to extract events")}
              >
                <ClipboardPaste className="h-3.5 w-3.5 mr-1.5" />
                Paste
              </Button>
            </div>
          </div>
        </div>

        {/* Content: inbox + detail */}
        <div className="flex-1 flex overflow-hidden">
          {/* Inbox list */}
          <div className={`w-full md:w-96 lg:w-[380px] border-r border-border overflow-y-auto bg-card/30 ${selected && 'hidden md:block'}`}>
            {events.map((evt) => (
              <button
                key={evt.id}
                className={`w-full text-left p-4 border-b border-border/50 hover:bg-muted/30 transition-colors ${
                  selectedId === evt.id ? "bg-purple-light/30" : ""
                }`}
                onClick={() => setSelectedId(evt.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    evt.status === 'approved' ? 'bg-green-50 text-green-600' :
                    evt.status === 'dismissed' ? 'bg-muted text-muted-foreground' :
                    'bg-purple-light text-purple'
                  }`}>
                    {evt.status === 'approved' ? <Check className="h-4 w-4" /> :
                     evt.status === 'dismissed' ? <X className="h-4 w-4" /> :
                     <SourceIcon type={evt.sourceType} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-foreground truncate">{evt.title}</h3>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{evt.sourceLabel}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(evt.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {evt.amountDue && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${evt.amountDue.amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Demo CTA */}
            <div className="p-4">
              <button
                className="w-full p-4 rounded-xl border-2 border-dashed border-purple/20 hover:border-purple/40 transition-colors text-center"
                onClick={() => toast("Demo: This would load a sample permission slip PDF for extraction")}
              >
                <Sparkles className="h-5 w-5 text-purple mx-auto mb-2" />
                <p className="text-sm font-medium text-purple">Try a sample permission slip</p>
                <p className="text-xs text-muted-foreground mt-1">See AI extraction in action</p>
              </button>
            </div>
          </div>

          {/* Detail pane */}
          <div className={`flex-1 overflow-y-auto ${!selected && 'hidden md:block'}`}>
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
                  {/* Mobile back */}
                  <button
                    className="md:hidden flex items-center gap-1 text-sm text-muted-foreground mb-4"
                    onClick={() => setSelectedId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>

                  {/* Status + confidence */}
                  <div className="flex items-center gap-3 mb-4">
                    <Badge
                      variant={selected.status === 'approved' ? 'default' : selected.status === 'dismissed' ? 'secondary' : 'outline'}
                      className={selected.status === 'pending' ? 'border-purple/30 text-purple' : ''}
                    >
                      {selected.status === 'pending' ? 'Needs review' : selected.status === 'approved' ? 'Approved' : 'Dismissed'}
                    </Badge>
                    <ConfidenceBadge confidence={selected.confidence} />
                  </div>

                  {/* Title */}
                  <h2 className="font-heading text-xl font-bold text-foreground mb-2">{selected.title}</h2>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {new Date(selected.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      {selected.endTime && `, ${new Date(selected.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${new Date(selected.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                    </span>
                    {selected.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {selected.location}
                      </span>
                    )}
                  </div>

                  {/* Action items */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Action items</h3>
                    <div className="space-y-2">
                      {selected.actionItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50">
                          <div className="h-5 w-5 rounded border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-muted-foreground">{i + 1}</span>
                          </div>
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amount due */}
                  {selected.amountDue && (
                    <div className="mb-6 p-4 rounded-xl bg-purple-light/30 border border-purple/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{selected.amountDue.what}</p>
                          <p className="text-xs text-muted-foreground">
                            Due {new Date(selected.amountDue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to {selected.amountDue.payee}
                          </p>
                        </div>
                        <span className="font-heading text-lg font-bold text-purple">${selected.amountDue.amount}</span>
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
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => toast("Edit reply")}>
                            <Edit3 className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button size="sm" className="text-xs bg-purple hover:bg-purple/90 text-white" onClick={() => toast("Reply sent!")}>
                            <Send className="h-3 w-3 mr-1" /> Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw content */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Original content</h3>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground whitespace-pre-line font-mono leading-relaxed">
                        {selected.rawContent}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {selected.status === 'pending' && (
                    <div className="flex gap-3 sticky bottom-4">
                      <Button
                        className="flex-1 bg-purple hover:bg-purple/90 text-white"
                        onClick={() => handleApprove(selected.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve & sync to calendar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDismiss(selected.id)}
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
                Select an item to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

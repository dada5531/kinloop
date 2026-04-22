/**
 * KINLOOP Development Hub (Quadrant 2) — Teal accent
 * Real AI extraction from health documents, growth tracking, and Q&A
 */
import AppShell from "@/components/AppShell";
import { useChild } from "@/contexts/ChildContext";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  TrendingUp,
  Upload,
  FileText,
  Activity,
  Ruler,
  Weight,
  ClipboardPaste,
  Sparkles,
  Loader2,
  Plus,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Streamdown } from "streamdown";

const typeIcons: Record<string, typeof Stethoscope> = {
  "well-visit": Stethoscope,
  sick: Stethoscope,
  school_report: GraduationCap,
  dental: Stethoscope,
};

const typeLabels: Record<string, string> = {
  "well-visit": "Well-child visit",
  sick: "Sick visit",
  school_report: "School report",
  dental: "Dental visit",
};

export default function Development() {
  const { selectedChild } = useChild();
  const childId = selectedChild?.id ?? 0;

  const { data: records, refetch: refetchRecords } = trpc.development.records.useQuery(
    { childId },
    { enabled: !!childId, staleTime: 10_000 }
  );
  const { data: growthData, refetch: refetchGrowth } = trpc.development.growthData.useQuery(
    { childId },
    { enabled: !!childId, staleTime: 10_000 }
  );

  const extractMutation = trpc.development.extractHealth.useMutation();
  const askMutation = trpc.development.askAboutChild.useMutation();

  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "chat">("overview");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pasteContent, setPasteContent] = useState("");
  const [docType, setDocType] = useState("well-visit");
  const [extracting, setExtracting] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const recordList = records ?? [];
  const growthList = (growthData ?? []) as any[];

  const chartData = growthList.map((g: any) => ({
    age: `${g.ageMonths}mo`,
    weight: g.weightLbs ? parseFloat(g.weightLbs) : null,
    height: g.heightIn ? parseFloat(g.heightIn) : null,
    wPct: g.weightPercentile,
    hPct: g.heightPercentile,
  }));

  const latestGrowth = growthList[growthList.length - 1];

  const handleExtract = async () => {
    if (!childId || !pasteContent.trim()) return;
    setExtracting(true);
    try {
      await extractMutation.mutateAsync({
        childId,
        content: pasteContent,
        documentType: docType,
      });
      toast.success("Health record extracted and saved");
      setShowUploadDialog(false);
      setPasteContent("");
      refetchRecords();
      refetchGrowth();
    } catch (err) {
      toast.error("Extraction failed. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  const handleAsk = async () => {
    if (!childId || !chatInput.trim()) return;
    const question = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: question }]);
    setChatLoading(true);
    try {
      const result = await askMutation.mutateAsync({ childId, question });
      setChatMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that question. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-teal-light flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5 text-teal" />
              </div>
              Development Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedChild?.name}'s growth, health records & milestones
            </p>
          </div>
          <Button
            size="sm"
            className="bg-teal hover:bg-teal/90 text-white text-xs"
            onClick={() => setShowUploadDialog(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add record
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 w-fit">
          {(["overview", "timeline", "chat"] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" ? "Overview" : tab === "timeline" ? "Timeline" : "Ask AI"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Weight className="h-4 w-4 text-teal" />
                  <span className="text-xs text-muted-foreground">Weight</span>
                </div>
                <p className="font-heading text-lg font-bold text-foreground">
                  {latestGrowth?.weightLbs ? `${latestGrowth.weightLbs} lbs` : "—"}
                </p>
                {latestGrowth?.weightPercentile != null && (
                  <p className="text-xs text-teal">{latestGrowth.weightPercentile}th percentile</p>
                )}
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="h-4 w-4 text-teal" />
                  <span className="text-xs text-muted-foreground">Height</span>
                </div>
                <p className="font-heading text-lg font-bold text-foreground">
                  {latestGrowth?.heightIn ? `${latestGrowth.heightIn} in` : "—"}
                </p>
                {latestGrowth?.heightPercentile != null && (
                  <p className="text-xs text-teal">{latestGrowth.heightPercentile}th percentile</p>
                )}
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-teal" />
                  <span className="text-xs text-muted-foreground">Records</span>
                </div>
                <p className="font-heading text-lg font-bold text-foreground">{recordList.length}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-teal" />
                  <span className="text-xs text-muted-foreground">Data points</span>
                </div>
                <p className="font-heading text-lg font-bold text-foreground">{growthList.length}</p>
              </div>
            </div>

            {/* Growth chart */}
            {chartData.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-5">
                <h3 className="font-heading text-base font-semibold text-foreground mb-4">Growth chart</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="heightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5BA5A5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#5BA5A5" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B7EC8" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#8B7EC8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" />
                      <XAxis dataKey="age" tick={{ fontSize: 11, fill: "#888" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#888" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e5e5e0", fontSize: "12px" }}
                      />
                      <Area type="monotone" dataKey="height" stroke="#5BA5A5" fill="url(#heightGrad)" strokeWidth={2} name="Height (in)" />
                      <Area type="monotone" dataKey="weight" stroke="#8B7EC8" fill="url(#weightGrad)" strokeWidth={2} name="Weight (lbs)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-3 justify-center">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-teal" /> Height (inches)
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-purple" /> Weight (lbs)
                  </span>
                </div>
              </div>
            )}

            {/* Recent records */}
            <div>
              <h3 className="font-heading text-base font-semibold text-foreground mb-3">Recent records</h3>
              {recordList.length > 0 ? (
                <div className="space-y-3">
                  {recordList.slice(0, 5).map((record: any) => {
                    const Icon = typeIcons[record.type] || FileText;
                    return (
                      <div key={record.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-teal" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-foreground">
                                  {typeLabels[record.type] ?? record.type}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {new Date(record.visitDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{record.summary}</p>
                              {record.nextAction && (
                                <p className="text-xs text-teal mt-2 flex items-center gap-1">
                                  <ChevronRight className="h-3 w-3" />
                                  {record.nextAction}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {expandedRecord === record.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {expandedRecord === record.id && record.extracted && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                            <p className="text-xs font-medium text-foreground mb-2">Extracted details</p>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(record.extracted as Record<string, any>).map(([key, val]) => (
                                <div key={key} className="text-xs">
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}:{" "}
                                  </span>
                                  <span className="text-foreground">{String(val)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-teal mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No records yet. Upload a health document to get started.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {recordList.length > 0 ? (
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-teal/20" />
                {[...recordList].reverse().map((record: any) => {
                  const Icon = typeIcons[record.type] || FileText;
                  return (
                    <div key={record.id} className="relative mb-8">
                      <div className="absolute left-[-20px] h-6 w-6 rounded-full bg-teal-light border-2 border-teal/30 flex items-center justify-center">
                        <Icon className="h-3 w-3 text-teal" />
                      </div>
                      <div className="ml-4 p-4 rounded-xl bg-card border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {new Date(record.visitDate).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Badge>
                          <span className="text-xs text-teal font-medium">
                            {typeLabels[record.type] ?? record.type}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{record.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No timeline entries yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-teal-light/20">
              <p className="text-sm font-medium text-foreground">Ask about {selectedChild?.name}'s health</p>
              <p className="text-xs text-muted-foreground">
                AI will reference all uploaded health records and growth data
              </p>
            </div>
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Sparkles className="h-6 w-6 mx-auto mb-2 text-teal" />
                  <p>Ask questions about {selectedChild?.name}'s health records</p>
                  <p className="text-xs mt-1">e.g., "What were the results of the last checkup?"</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-xl p-3 text-sm ${
                      msg.role === "user" ? "bg-teal text-white" : "bg-muted/50 text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? <Streamdown>{msg.content}</Streamdown> : msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-teal" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about health records..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAsk()}
              />
              <Button
                size="icon"
                className="bg-teal hover:bg-teal/90 text-white flex-shrink-0"
                onClick={handleAsk}
                disabled={chatLoading || !chatInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <ClipboardPaste className="h-5 w-5 text-teal" />
              Add health record
            </DialogTitle>
            <DialogDescription>
              Paste a pediatrician summary, school report, or health document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="well-visit">Well-child visit</SelectItem>
                  <SelectItem value="sick">Sick visit</SelectItem>
                  <SelectItem value="school_report">School report</SelectItem>
                  <SelectItem value="dental">Dental visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document content</Label>
              <Textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Paste the document text here..."
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-teal hover:bg-teal/90 text-white"
              onClick={handleExtract}
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
    </AppShell>
  );
}

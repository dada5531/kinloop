"use client";

import {
  BarChart3,
  ClipboardPaste,
  Sparkles,
  Loader2,
  X,
  AlertTriangle,
  Check,
  Activity,
  Ruler,
  Weight,
  Syringe,
  Brain,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { useChild } from "@/components/providers/ChildProvider";

// ─── Types ──────────────────────────────────────────────────────
interface HealthExtractionResult {
  recordType: string;
  recordDate: string;
  provider: string | null;
  summary: string;
  growthData: {
    weightLbs: number | null;
    weightPercentile: number | null;
    heightInches: number | null;
    heightPercentile: number | null;
    headCircumferenceCm: number | null;
    bmi: number | null;
  } | null;
  milestones: Array<{
    name: string;
    category: string;
    status: string;
  }>;
  immunizations: Array<{
    name: string;
    date: string | null;
  }>;
  concerns: string[];
  nextSteps: string[];
}

interface SavedHealthRecord {
  id: string;
  type: string;
  visit_date: string;
  provider: string | null;
  summary: string | null;
  extracted: HealthExtractionResult | null;
  height_cm: number | null;
  weight_kg: number | null;
  created_at: string;
}

function MilestoneStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    achieved: "bg-green-100 text-green-700",
    emerging: "bg-yellow-100 text-yellow-700",
    not_yet: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-500"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function RecordTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    well_child: "Well Child",
    sick_visit: "Sick Visit",
    specialist: "Specialist",
    dental: "Dental",
    school_report: "School Report",
    other: "Other",
  };
  return (
    <span className="inline-flex items-center rounded-full bg-development-muted px-2 py-0.5 text-xs font-medium text-development">
      {labels[type] || type}
    </span>
  );
}

export default function DevelopmentPage() {
  const { selectedChild, selectedChildId } = useChild();

  const [records, setRecords] = useState<SavedHealthRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Extraction state
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [pasteContent, setPasteContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState<HealthExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch records
  const fetchRecords = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      setRecordsLoading(true);
      const res = await fetch(`/api/health-records?childId=${selectedChildId}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch {
      // silently fail
    } finally {
      setRecordsLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Extract handler
  const handleExtract = async () => {
    if (!pasteContent.trim()) return;
    setExtracting(true);
    setExtractionError(null);

    try {
      const res = await fetch("/api/extract/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: pasteContent,
          childId: selectedChildId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Extraction failed");
      }

      const result: HealthExtractionResult = await res.json();
      setExtractedResult(result);
      setShowPasteDialog(false);
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  // Save extracted record
  const handleSaveExtracted = async () => {
    if (!extractedResult || !selectedChildId) return;
    setSaving(true);

    try {
      // Convert growth data for storage
      const heightCm = extractedResult.growthData?.heightInches
        ? extractedResult.growthData.heightInches * 2.54
        : null;
      const weightKg = extractedResult.growthData?.weightLbs
        ? extractedResult.growthData.weightLbs * 0.453592
        : null;

      const res = await fetch("/api/health-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          type: extractedResult.recordType,
          visitDate: extractedResult.recordDate,
          provider: extractedResult.provider,
          summary: extractedResult.summary,
          extracted: extractedResult,
          sourceContent: pasteContent,
          heightCm,
          weightKg,
        }),
      });

      if (res.ok) {
        setExtractedResult(null);
        setPasteContent("");
        fetchRecords();
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-development-muted">
                <BarChart3 className="h-4 w-4 text-development" />
              </div>
              Development Hub
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload pediatrician notes — AI extracts growth data, milestones &amp; immunizations
            </p>
          </div>
          <button
            onClick={() => setShowPasteDialog(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-development px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Paste notes
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
        <div className="max-h-[50vh] flex-shrink-0 overflow-y-auto border-b border-development/10 bg-development-muted/30 px-4 py-4 md:px-6 lg:px-8">
          <div className="mb-4 flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-development" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">AI Extraction Results</p>
              <div className="mt-1 flex items-center gap-2">
                <RecordTypeBadge type={extractedResult.recordType} />
                <span className="text-xs text-muted-foreground">{extractedResult.recordDate}</span>
                {extractedResult.provider && (
                  <span className="text-xs text-muted-foreground">
                    · {extractedResult.provider}
                  </span>
                )}
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
            <p className="text-sm text-foreground">{extractedResult.summary}</p>
          </div>

          {/* Growth data */}
          {extractedResult.growthData && (
            <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {extractedResult.growthData.weightLbs && (
                <div className="rounded-lg border bg-card p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Weight className="h-3 w-3" /> Weight
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {extractedResult.growthData.weightLbs} lbs
                  </p>
                  {extractedResult.growthData.weightPercentile && (
                    <p className="text-xs text-development">
                      {extractedResult.growthData.weightPercentile}th percentile
                    </p>
                  )}
                </div>
              )}
              {extractedResult.growthData.heightInches && (
                <div className="rounded-lg border bg-card p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ruler className="h-3 w-3" /> Height
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {extractedResult.growthData.heightInches} in
                  </p>
                  {extractedResult.growthData.heightPercentile && (
                    <p className="text-xs text-development">
                      {extractedResult.growthData.heightPercentile}th percentile
                    </p>
                  )}
                </div>
              )}
              {extractedResult.growthData.headCircumferenceCm && (
                <div className="rounded-lg border bg-card p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" /> Head
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {extractedResult.growthData.headCircumferenceCm} cm
                  </p>
                </div>
              )}
              {extractedResult.growthData.bmi && (
                <div className="rounded-lg border bg-card p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BarChart3 className="h-3 w-3" /> BMI
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {extractedResult.growthData.bmi.toFixed(1)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Milestones */}
          {extractedResult.milestones.length > 0 && (
            <div className="mb-3">
              <p className="mb-2 flex items-center gap-1 text-xs font-medium text-foreground">
                <Brain className="h-3 w-3 text-development" /> Milestones
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedResult.milestones.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5"
                  >
                    <span className="text-xs text-foreground">{m.name}</span>
                    <MilestoneStatusBadge status={m.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Immunizations */}
          {extractedResult.immunizations.length > 0 && (
            <div className="mb-3">
              <p className="mb-2 flex items-center gap-1 text-xs font-medium text-foreground">
                <Syringe className="h-3 w-3 text-development" /> Immunizations
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedResult.immunizations.map((imm, i) => (
                  <span
                    key={i}
                    className="rounded-lg border bg-card px-2.5 py-1.5 text-xs text-foreground"
                  >
                    {imm.name}
                    {imm.date && ` (${imm.date})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Concerns & Next Steps */}
          {(extractedResult.concerns.length > 0 || extractedResult.nextSteps.length > 0) && (
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {extractedResult.concerns.length > 0 && (
                <div className="rounded-lg border bg-card p-3">
                  <p className="mb-1.5 text-xs font-medium text-foreground">Concerns</p>
                  <ul className="space-y-1">
                    {extractedResult.concerns.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-xs text-muted-foreground"
                      >
                        <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-yellow-500" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {extractedResult.nextSteps.length > 0 && (
                <div className="rounded-lg border bg-card p-3">
                  <p className="mb-1.5 text-xs font-medium text-foreground">Next Steps</p>
                  <ul className="space-y-1">
                    {extractedResult.nextSteps.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-xs text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-development" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSaveExtracted}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-development px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save record
              </>
            )}
          </button>
        </div>
      )}

      {/* Records timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
        {recordsLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-development" />
            <p className="text-sm text-muted-foreground">Loading health records...</p>
          </div>
        ) : records.length > 0 ? (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Health Record Timeline</h2>
            {records.map((record) => {
              const isExpanded = expandedRecordId === record.id;
              const extracted = record.extracted as HealthExtractionResult | null;
              return (
                <div key={record.id} className="rounded-xl border bg-card shadow-sm">
                  <button
                    onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-development-muted">
                      <FileText className="h-4 w-4 text-development" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <RecordTypeBadge type={record.type} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(record.visit_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {record.summary && (
                        <p className="mt-1 truncate text-sm text-foreground">{record.summary}</p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && extracted && (
                    <div className="space-y-3 px-4 pb-4">
                      {/* Growth data */}
                      {extracted.growthData && (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          {extracted.growthData.weightLbs && (
                            <div className="rounded-lg bg-muted/50 p-2">
                              <p className="text-xs text-muted-foreground">Weight</p>
                              <p className="text-sm font-medium">
                                {extracted.growthData.weightLbs} lbs
                              </p>
                            </div>
                          )}
                          {extracted.growthData.heightInches && (
                            <div className="rounded-lg bg-muted/50 p-2">
                              <p className="text-xs text-muted-foreground">Height</p>
                              <p className="text-sm font-medium">
                                {extracted.growthData.heightInches} in
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Milestones */}
                      {extracted.milestones.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-foreground">Milestones</p>
                          <div className="flex flex-wrap gap-1.5">
                            {extracted.milestones.map((m, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1 rounded bg-muted/50 px-2 py-1"
                              >
                                <span className="text-xs">{m.name}</span>
                                <MilestoneStatusBadge status={m.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Concerns */}
                      {extracted.concerns.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-foreground">Concerns</p>
                          <ul className="space-y-1">
                            {extracted.concerns.map((c, i) => (
                              <li key={i} className="text-xs text-muted-foreground">
                                • {c}
                              </li>
                            ))}
                          </ul>
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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-development-muted">
              <BarChart3 className="h-6 w-6 text-development" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">No health records yet</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Paste pediatrician notes to extract growth data and milestones
            </p>
            <button
              onClick={() => setShowPasteDialog(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-development px-4 py-2 text-xs font-medium text-white hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add notes
            </button>
          </div>
        )}
      </div>

      {/* Paste Dialog */}
      {showPasteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasteDialog(false)} />
          <div className="relative mx-4 w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
              <ClipboardPaste className="h-5 w-5 text-development" />
              Paste health notes
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Paste pediatrician notes, immunization records, or school health reports
            </p>
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Paste your health notes here..."
              rows={10}
              className="w-full resize-none rounded-lg border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-development/50"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowPasteDialog(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent/50"
              >
                Cancel
              </button>
              <button
                onClick={handleExtract}
                disabled={extracting || !pasteContent.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-development px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
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

"use client";

import {
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

import { DevelopmentIcon } from "@/components/icons/QuadrantIcons";
import { useChild } from "@/components/providers/ChildProvider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

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
    achieved: "border-green-100 bg-green-50 text-green-700",
    emerging: "border-yellow-100 bg-yellow-50 text-yellow-700",
    not_yet: "border-border bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium ${colors[status] || "border-border bg-muted text-muted-foreground"}`}
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
    <span className="inline-flex items-center rounded-full border-[0.5px] border-development/20 bg-development-muted px-2 py-0.5 text-[10px] font-medium text-development">
      {labels[type] || type}
    </span>
  );
}

function TimelineSkeleton() {
  return (
    <div className="max-w-2xl space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border-[0.5px] border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
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
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <DevelopmentIcon size={16} className="text-development" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-development">
              Development Hub
            </span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Growth &amp; milestones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload pediatrician notes — AI extracts growth data, milestones &amp; immunizations
          </p>
        </div>
        <Button size="sm" onClick={() => setShowPasteDialog(true)}>
          <ClipboardPaste className="mr-1.5 h-3.5 w-3.5" />
          Paste notes
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
        <div className="animate-slide-fade-in mb-6 rounded-xl border-[0.5px] border-development/20 bg-development-muted p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-development" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-development">
                AI extraction
              </span>
              <RecordTypeBadge type={extractedResult.recordType} />
              <span className="text-[11px] text-muted-foreground">
                {extractedResult.recordDate}
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
            <p className="text-sm leading-relaxed text-foreground">{extractedResult.summary}</p>
            {extractedResult.provider && (
              <p className="mt-1 text-xs text-muted-foreground">
                Provider: {extractedResult.provider}
              </p>
            )}
          </div>

          {/* Growth data */}
          {extractedResult.growthData && (
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {extractedResult.growthData.weightLbs && (
                <div className="rounded-xl border-[0.5px] border-border bg-card p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Weight className="h-3 w-3" /> Weight
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {extractedResult.growthData.weightLbs} lbs
                  </p>
                  {extractedResult.growthData.weightPercentile && (
                    <p className="text-[11px] text-development">
                      {extractedResult.growthData.weightPercentile}th percentile
                    </p>
                  )}
                </div>
              )}
              {extractedResult.growthData.heightInches && (
                <div className="rounded-xl border-[0.5px] border-border bg-card p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Ruler className="h-3 w-3" /> Height
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {extractedResult.growthData.heightInches} in
                  </p>
                  {extractedResult.growthData.heightPercentile && (
                    <p className="text-[11px] text-development">
                      {extractedResult.growthData.heightPercentile}th percentile
                    </p>
                  )}
                </div>
              )}
              {extractedResult.growthData.headCircumferenceCm && (
                <div className="rounded-xl border-[0.5px] border-border bg-card p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Activity className="h-3 w-3" /> Head
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {extractedResult.growthData.headCircumferenceCm} cm
                  </p>
                </div>
              )}
              {extractedResult.growthData.bmi && (
                <div className="rounded-xl border-[0.5px] border-border bg-card p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <DevelopmentIcon size={12} /> BMI
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
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Brain className="h-3 w-3" /> Milestones
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedResult.milestones.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 rounded-lg border-[0.5px] border-border bg-card px-2.5 py-1.5"
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
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Syringe className="h-3 w-3" /> Immunizations
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedResult.immunizations.map((imm, i) => (
                  <span
                    key={i}
                    className="rounded-lg border-[0.5px] border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
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
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {extractedResult.concerns.length > 0 && (
                <div className="rounded-xl border-[0.5px] border-border bg-card p-3">
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Concerns
                  </p>
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
                <div className="rounded-xl border-[0.5px] border-border bg-card p-3">
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Next steps
                  </p>
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

          <Button onClick={handleSaveExtracted} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" /> Save record
              </>
            )}
          </Button>
        </div>
      )}

      {/* Records timeline */}
      <div>
        {recordsLoading ? (
          <TimelineSkeleton />
        ) : records.length > 0 ? (
          <div className="max-w-2xl space-y-3">
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Health record timeline
            </h2>
            {records.map((record) => {
              const isExpanded = expandedRecordId === record.id;
              const extracted = record.extracted as HealthExtractionResult | null;
              return (
                <div key={record.id} className="rounded-xl border-[0.5px] border-border bg-card">
                  <button
                    onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-background-secondary"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-development-muted">
                      <FileText className="h-3.5 w-3.5 text-development" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <RecordTypeBadge type={record.type} />
                        <span className="text-[11px] text-muted-foreground">
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
                    <div className="animate-slide-fade-in space-y-3 border-t-[0.5px] border-border px-4 py-4">
                      {/* Growth data */}
                      {extracted.growthData && (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          {extracted.growthData.weightLbs && (
                            <div className="rounded-lg bg-background-secondary p-2.5">
                              <p className="text-[11px] text-muted-foreground">Weight</p>
                              <p className="text-sm font-medium">
                                {extracted.growthData.weightLbs} lbs
                              </p>
                            </div>
                          )}
                          {extracted.growthData.heightInches && (
                            <div className="rounded-lg bg-background-secondary p-2.5">
                              <p className="text-[11px] text-muted-foreground">Height</p>
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
                          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Milestones
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {extracted.milestones.map((m, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1 rounded-lg bg-background-secondary px-2 py-1"
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
                          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Concerns
                          </p>
                          <ul className="space-y-1">
                            {extracted.concerns.map((c, i) => (
                              <li key={i} className="text-xs text-muted-foreground">
                                {c}
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
          <EmptyState
            icon={DevelopmentIcon}
            title="No health records yet"
            description="Paste pediatrician notes to extract growth data and milestones"
            actionLabel="Add notes"
            onAction={() => setShowPasteDialog(true)}
            accentColor="development"
          />
        )}
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
              <ClipboardPaste className="h-4 w-4 text-development" />
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
              className="w-full resize-none rounded-xl border-[0.5px] border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-development/30"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowPasteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleExtract} disabled={extracting || !pasteContent.trim()}>
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

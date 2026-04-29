"use client";

import {
  Activity,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  FileText,
  Loader2,
  MessageCircle,
  Plus,
  Ruler,
  Search,
  Sparkles,
  TrendingUp,
  Weight,
  X,
  AlertTriangle,
  Calendar,
  Filter,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

import { DevelopmentIcon } from "@/components/icons/QuadrantIcons";
import { DevelopmentEmpty } from "@/components/illustrations/DevelopmentEmpty";
import { AchievementMicro, MilestoneAchieved, MilestoneCognitive, MilestoneMotor, MilestoneLanguage, MilestoneSocial, QuadrantTransition, DevelopmentTransition } from "@/components/illustrations";
import { useChild } from "@/components/providers/ChildProvider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WHO_WEIGHT_GIRLS, WHO_HEIGHT_GIRLS, computePercentile } from "@/lib/who-growth-data";
import { safeFormatDate, safeFormatTime, safeToISOString } from "@/lib/safe-date";
import { logError } from "@/lib/logger";
import { showErrorToast } from "@/lib/error-toasts";
import { ItemActionsMenu } from "@/components/ItemActionsMenu";
import { InlineEditForm } from "@/components/InlineEditForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

// ─── Types ──────────────────────────────────────────────────────

interface Measurement {
  id: string;
  child_id: string;
  date: string;
  type: string;
  value: number;
  unit: string;
  notes: string | null;
  source: string;
  created_at: string;
}

interface Milestone {
  id: string;
  child_id: string;
  category: string;
  title: string;
  description: string | null;
  age_months_expected: number;
  status: string;
  achieved_date: string | null;
  notes: string | null;
  created_at: string;
}

interface HealthRecord {
  id: string;
  type: string;
  visit_date: string;
  provider: string | null;
  summary: string | null;
  extracted: Record<string, unknown> | null;
  height_cm: number | null;
  weight_kg: number | null;
  head_circumference_cm: number | null;
  category: string | null;
  created_at: string;
}

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
  milestones: Array<{ name: string; category: string; status: string }>;
  immunizations: Array<{ name: string; date: string | null }>;
  concerns: string[];
  nextSteps: string[];
}

type TimelineItem = {
  id: string;
  date: string;
  type: "health_record" | "milestone";
  title: string;
  subtitle: string | null;
  category: string | null;
  icon: "record" | "milestone_hit" | "milestone_upcoming";
  data: HealthRecord | Milestone;
};

type Tab = "overview" | "growth" | "milestones" | "timeline";

// ─── Helpers ────────────────────────────────────────────────────

function getAgeMonths(dob: string, atDate?: string): number {
  const ref = atDate ? new Date(atDate) : new Date();
  const d = new Date(dob);
  return (ref.getFullYear() - d.getFullYear()) * 12 + (ref.getMonth() - d.getMonth());
}

function formatDate(dateStr: string): string {
  return safeFormatDate(dateStr, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const CATEGORY_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string; size?: number }> }> = {
  cognitive: { label: "Cognitive", color: "text-blue-600 bg-blue-50 border-blue-100", icon: MilestoneCognitive },
  motor: {
    label: "Motor",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    icon: MilestoneMotor,
  },
  language: {
    label: "Language",
    color: "text-amber-600 bg-amber-50 border-amber-100",
    icon: MilestoneLanguage,
  },
  social: {
    label: "Social",
    color: "text-violet-600 bg-violet-50 border-violet-100",
    icon: MilestoneSocial,
  },
};

// ─── Sub-components ─────────────────────────────────────────────

function VitalCard({
  label,
  value,
  unit,
  percentile,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit: string;
  percentile: number | null;
  icon: typeof Ruler;
}) {
  return (
    <div className="rounded-xl border-[0.5px] border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-development" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {percentile !== null && (
        <p className="mt-1 text-[11px] text-muted-foreground">{percentile}th percentile</p>
      )}
    </div>
  );
}

const RING_COLORS: Record<string, string> = {
  cognitive: "#3b82f6",
  motor: "#10b981",
  language: "#f59e0b",
  social: "#8b5cf6",
};

function MilestoneProgressRing({
  category,
  hit,
  total,
}: {
  category: string;
  hit: number;
  total: number;
}) {
  const meta = CATEGORY_META[category] || CATEGORY_META.cognitive;
  const Icon = meta.icon;
  const pct = total > 0 ? (hit / total) * 100 : 0;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const ringColor = RING_COLORS[category] || "#10b981";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="3.5"
            opacity="0.4"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold tabular-nums" style={{ color: ringColor }}>
            {hit}/{total}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Icon className="h-3 w-3" size={12} />
          <p className="text-xs font-medium text-foreground">{meta.label}</p>
        </div>
        <p className="text-[11px] text-muted-foreground">{Math.round(pct)}%</p>
      </div>
    </div>
  );
}

function GrowthChart({
  measurements,
  dob,
  metric,
}: {
  measurements: Measurement[];
  dob: string;
  metric: "height" | "weight";
}) {
  const whoData = metric === "weight" ? WHO_WEIGHT_GIRLS : WHO_HEIGHT_GIRLS;
  const unit = metric === "weight" ? "kg" : "cm";
  const filtered = measurements.filter((m) => m.type === metric);

  if (filtered.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No {metric} data yet
      </div>
    );
  }

  // Chart dimensions
  const W = 560;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 30, left: 45 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // Determine X range (months from birth)
  const maxMonth = Math.max(
    ...filtered.map((m) => {
      const d = new Date(m.date);
      const b = new Date(dob);
      return (d.getFullYear() - b.getFullYear()) * 12 + (d.getMonth() - b.getMonth());
    }),
    12,
  );
  const xMax = Math.min(Math.ceil(maxMonth / 6) * 6 + 6, 60);

  // Determine Y range
  const allVals = [
    ...filtered.map((m) => m.value),
    ...whoData.filter((d) => d.month <= xMax).flatMap((d) => [d.p3, d.p97]),
  ];
  const yMin = Math.floor(Math.min(...allVals) * 0.9);
  const yMax = Math.ceil(Math.max(...allVals) * 1.05);

  const scaleX = (month: number) => PAD.left + (month / xMax) * plotW;
  const scaleY = (val: number) => PAD.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  // WHO percentile bands
  const whoFiltered = whoData.filter((d) => d.month <= xMax);
  const makePath = (key: keyof (typeof whoData)[0]) =>
    whoFiltered
      .map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(d.month)},${scaleY(d[key] as number)}`)
      .join(" ");

  // WHO shaded area (3rd to 97th)
  const areaPath =
    whoFiltered
      .map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(d.month)},${scaleY(d.p97)}`)
      .join(" ") +
    " " +
    [...whoFiltered]
      .reverse()
      .map((d, i) => `${i === 0 ? "L" : "L"}${scaleX(d.month)},${scaleY(d.p3)}`)
      .join(" ") +
    " Z";

  // Child data points
  const childPoints = filtered.map((m) => {
    const d = new Date(m.date);
    const b = new Date(dob);
    const month = (d.getFullYear() - b.getFullYear()) * 12 + (d.getMonth() - b.getMonth());
    return { x: scaleX(month), y: scaleY(m.value), value: m.value, date: m.date };
  });

  const childPath = childPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  // X-axis labels
  const xTicks: number[] = [];
  for (let m = 0; m <= xMax; m += 6) xTicks.push(m);

  // Y-axis labels
  const yRange = yMax - yMin;
  const yStep = yRange <= 20 ? 2 : yRange <= 50 ? 5 : 10;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTicks.map((v) => (
        <line
          key={v}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={scaleY(v)}
          y2={scaleY(v)}
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      ))}

      {/* WHO shaded band (3rd-97th) */}
      <path d={areaPath} fill="hsl(168 40% 45% / 0.08)" />

      {/* WHO percentile lines */}
      <path
        d={makePath("p50")}
        fill="none"
        stroke="hsl(168 40% 45% / 0.3)"
        strokeWidth="1"
        strokeDasharray="4,3"
      />
      <path
        d={makePath("p3")}
        fill="none"
        stroke="hsl(168 40% 45% / 0.15)"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />
      <path
        d={makePath("p97")}
        fill="none"
        stroke="hsl(168 40% 45% / 0.15)"
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />

      {/* Child data line */}
      <path
        d={childPath}
        fill="none"
        stroke="hsl(168 40% 45%)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Child data points */}
      {childPoints.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="hsl(168 40% 45%)" />
          <circle cx={p.x} cy={p.y} r="2" fill="white" />
        </g>
      ))}

      {/* X-axis labels */}
      {xTicks.map((m) => (
        <text
          key={m}
          x={scaleX(m)}
          y={H - 5}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
        >
          {m}mo
        </text>
      ))}

      {/* Y-axis labels */}
      {yTicks.map((v) => (
        <text
          key={v}
          x={PAD.left - 6}
          y={scaleY(v) + 3}
          textAnchor="end"
          className="fill-muted-foreground text-[9px]"
        >
          {v}
        </text>
      ))}

      {/* Axis unit label */}
      <text
        x={PAD.left - 6}
        y={PAD.top - 6}
        textAnchor="end"
        className="fill-muted-foreground text-[8px]"
      >
        {unit}
      </text>

      {/* Current age marker */}
      {(() => {
        const now = new Date();
        const b = new Date(dob);
        const currentMonth =
          (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
        if (currentMonth > 0 && currentMonth <= xMax) {
          const cx = scaleX(currentMonth);
          return (
            <>
              <line
                x1={cx}
                x2={cx}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.5"
                strokeDasharray="3,2"
                opacity="0.5"
              />
              <text
                x={cx}
                y={PAD.top - 4}
                textAnchor="middle"
                className="fill-muted-foreground text-[7px]"
              >
                now
              </text>
            </>
          );
        }
        return null;
      })()}

      {/* Percentile labels */}
      {whoFiltered.length > 0 && (
        <>
          <text
            x={scaleX(whoFiltered[whoFiltered.length - 1].month) + 4}
            y={scaleY(whoFiltered[whoFiltered.length - 1].p50) + 3}
            className="fill-development/40 text-[7px]"
          >
            50th
          </text>
          <text
            x={scaleX(whoFiltered[whoFiltered.length - 1].month) + 4}
            y={scaleY(whoFiltered[whoFiltered.length - 1].p97) + 3}
            className="fill-development/30 text-[7px]"
          >
            97th
          </text>
          <text
            x={scaleX(whoFiltered[whoFiltered.length - 1].month) + 4}
            y={scaleY(whoFiltered[whoFiltered.length - 1].p3) + 3}
            className="fill-development/30 text-[7px]"
          >
            3rd
          </text>
        </>
      )}
    </svg>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function DevelopmentPage() {
  const { selectedChild, selectedChildId } = useChild();

  // Data state
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [growthMetric, setGrowthMetric] = useState<"height" | "weight">("height");
  const [milestoneFilter, setMilestoneFilter] = useState<string>("all");
  const [timelineSearch, setTimelineSearch] = useState("");
  const [timelineFilter, setTimelineFilter] = useState<string>("all");
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; type: string; apiEndpoint: string } | null>(null);

  // Achievement micro state
  const [showAchievement, setShowAchievement] = useState(false);
  // Transition state
  const [showTransition, setShowTransition] = useState(true);
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<"measurement" | "milestone">("measurement");
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [pasteContent, setPasteContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState<HealthExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Manual entry form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formMeasurementType, setFormMeasurementType] = useState("height");
  const [formValue, setFormValue] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formMilestoneCategory, setFormMilestoneCategory] = useState("cognitive");
  const [formMilestoneTitle, setFormMilestoneTitle] = useState("");
  const [formMilestoneDesc, setFormMilestoneDesc] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!selectedChildId) return;
    setLoading(true);
    try {
      const [mRes, msRes, rRes] = await Promise.all([
        fetch(`/api/measurements?childId=${selectedChildId}`),
        fetch(`/api/milestones?childId=${selectedChildId}`),
        fetch(`/api/health-records?childId=${selectedChildId}`),
      ]);

      if (mRes.ok) setMeasurements(await mRes.json());
      if (msRes.ok) setMilestones(await msRes.json());
      if (rRes.ok) setRecords(await rRes.json());
    } catch (err) {
      logError(err, { route: "development" });
      showErrorToast("save");
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed data
  const ageMonths = selectedChild ? getAgeMonths(selectedChild.dob) : 0;

  const latestHeight = useMemo(
    () =>
      [...measurements]
        .filter((m) => m.type === "height")
        .sort((a, b) => b.date.localeCompare(a.date))[0],
    [measurements],
  );
  const latestWeight = useMemo(
    () =>
      [...measurements]
        .filter((m) => m.type === "weight")
        .sort((a, b) => b.date.localeCompare(a.date))[0],
    [measurements],
  );

  const heightPercentile =
    latestHeight && selectedChild
      ? computePercentile(
          WHO_HEIGHT_GIRLS,
          getAgeMonths(selectedChild.dob, latestHeight.date),
          latestHeight.value,
        )
      : null;
  const weightPercentile =
    latestWeight && selectedChild
      ? computePercentile(
          WHO_WEIGHT_GIRLS,
          getAgeMonths(selectedChild.dob, latestWeight.date),
          latestWeight.value,
        )
      : null;

  const milestonesByCategory = useMemo(() => {
    const grouped: Record<string, { hit: number; total: number; items: Milestone[] }> = {};
    for (const m of milestones) {
      if (!grouped[m.category]) grouped[m.category] = { hit: 0, total: 0, items: [] };
      grouped[m.category].total++;
      if (m.status === "hit") grouped[m.category].hit++;
      grouped[m.category].items.push(m);
    }
    return grouped;
  }, [milestones]);

  const milestonesHit = milestones.filter((m) => m.status === "hit").length;
  const milestonesTotal = milestones.length;

  // Timeline items
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    for (const r of records) {
      items.push({
        id: `record-${r.id}`,
        date: r.visit_date || r.created_at,
        type: "health_record",
        title: r.type?.replace(/_/g, " ") || "Health record",
        subtitle: r.summary,
        category: r.category || r.type,
        icon: "record",
        data: r,
      });
    }

    for (const m of milestones) {
      if (m.status === "hit" && m.achieved_date) {
        items.push({
          id: `milestone-${m.id}`,
          date: m.achieved_date,
          type: "milestone",
          title: m.title,
          subtitle: m.description,
          category: m.category,
          icon: "milestone_hit",
          data: m,
        });
      }
    }

    items.sort((a, b) => b.date.localeCompare(a.date));

    // Apply filters
    let filtered = items;
    if (timelineFilter !== "all") {
      filtered = filtered.filter((i) => i.type === timelineFilter);
    }
    if (timelineSearch) {
      const q = timelineSearch.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) || (i.subtitle && i.subtitle.toLowerCase().includes(q)),
      );
    }

    return filtered;
  }, [records, milestones, timelineFilter, timelineSearch]);

  // Next upcoming milestones
  const upcomingMilestones = useMemo(
    () =>
      milestones
        .filter((m) => m.status === "upcoming")
        .sort((a, b) => a.age_months_expected - b.age_months_expected)
        .slice(0, 3),
    [milestones],
  );

  // Handlers
  const handleExtract = async () => {
    if (!pasteContent.trim()) return;
    setExtracting(true);
    setExtractionError(null);
    try {
      const res = await fetch("/api/extract/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: pasteContent, childId: selectedChildId }),
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
          heightCm,
          weightKg,
        }),
      });

      if (res.ok) {
        // Also save measurements if growth data exists
        if (heightCm) {
          await fetch("/api/measurements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: selectedChildId,
              type: "height",
              value: Math.round(heightCm * 10) / 10,
              unit: "cm",
              date: extractedResult.recordDate,
              source: "health_record",
            }),
          });
        }
        if (weightKg) {
          await fetch("/api/measurements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: selectedChildId,
              type: "weight",
              value: Math.round(weightKg * 100) / 100,
              unit: "kg",
              date: extractedResult.recordDate,
              source: "health_record",
            }),
          });
        }

        setExtractedResult(null);
        setPasteContent("");
        fetchData();
      }
    } catch (err) {
      logError(err, { route: "development" });
      showErrorToast("save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveManualEntry = async () => {
    if (!selectedChildId) return;
    setFormSaving(true);
    try {
      if (addModalType === "measurement") {
        const res = await fetch("/api/measurements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId: selectedChildId,
            type: formMeasurementType,
            value: parseFloat(formValue),
            unit: formMeasurementType === "weight" ? "kg" : "cm",
            date: formDate,
            notes: formNotes || null,
            source: "manual",
          }),
        });
        if (res.ok) {
          setShowAddModal(false);
          setFormValue("");
          setFormNotes("");
          fetchData();
        }
      } else {
        const res = await fetch("/api/milestones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId: selectedChildId,
            category: formMilestoneCategory,
            title: formMilestoneTitle,
            description: formMilestoneDesc || null,
            ageMonthsExpected: ageMonths,
            status: "hit",
            achievedDate: formDate,
            notes: formNotes || null,
          }),
        });
        if (res.ok) {
          setShowAddModal(false);
          setFormMilestoneTitle("");
          setFormMilestoneDesc("");
          setFormNotes("");
          fetchData();
        }
      }
    } catch (err) {
      logError(err, { route: "development" });
      showErrorToast("save");
    } finally {
      setFormSaving(false);
    }
  };

  const handleMarkMilestone = async (id: string, status: string) => {
    try {
      await fetch("/api/milestones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          achievedDate: status === "hit" ? new Date().toISOString().split("T")[0] : null,
        }),
      });
      if (status === "hit") {
        setShowAchievement(true);
      }
      fetchData();
    } catch (err) {
      logError(err, { route: "development" });
      showErrorToast("save");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "growth", label: "Growth" },
    { id: "milestones", label: "Milestones" },
    { id: "timeline", label: "Timeline" },
  ];

  return (
    <>
      <AchievementMicro
        illustration={<MilestoneAchieved size={64} />}
        show={showAchievement}
        onDismiss={() => setShowAchievement(false)}
        label="Milestone achieved!"
        position="center"
      />
      <QuadrantTransition
        illustration={<DevelopmentTransition className="h-full w-full" />}
        bgClass="bg-development-muted/80"
        accentClass="ring-development/30"
        play={showTransition}
        onComplete={() => setShowTransition(false)}
      >
    <div className="animate-fade-in">
      {/* ── Page Header ── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <DevelopmentIcon size={16} className="text-development" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-development">
              Development Hub
            </span>
          </div>
          <h1 className="font-serif-display text-xl font-semibold text-foreground">
            {selectedChild?.name}&apos;s growth &amp; milestones
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {milestonesHit} of {milestonesTotal} milestones reached
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowPasteDialog(true)}>
            <ClipboardPaste className="mr-1.5 h-3.5 w-3.5" />
            Paste notes
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowAddModal(true);
              setAddModalType("measurement");
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add entry
          </Button>
        </div>
      </div>

      {/* ── Extraction error ── */}
      {extractionError && (
        <div className="animate-slide-fade-in mb-4 flex items-center gap-2 rounded-xl border-[0.5px] border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{extractionError}</p>
          <button
            onClick={() => setExtractionError(null)}
            className="ml-auto rounded-lg p-1 text-red-400 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Extracted result review ── */}
      {extractedResult && (
        <div className="animate-slide-fade-in mb-6 rounded-xl border-[0.5px] border-development/20 bg-development-muted p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-development" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-development">
                AI extraction
              </span>
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
          <p className="mb-4 text-sm leading-relaxed text-foreground">{extractedResult.summary}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveExtracted} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="mr-1.5 h-3.5 w-3.5" />
              )}
              Save record
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setExtractedResult(null)}>
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="mb-6 flex gap-1 rounded-xl border-[0.5px] border-border bg-background-secondary p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="animate-tab-crossfade space-y-6">
          {/* Vitals cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <VitalCard
              label="Height"
              value={latestHeight ? String(latestHeight.value) : "—"}
              unit="cm"
              percentile={heightPercentile}
              icon={Ruler}
            />
            <VitalCard
              label="Weight"
              value={latestWeight ? String(latestWeight.value) : "—"}
              unit="kg"
              percentile={weightPercentile}
              icon={Weight}
            />
            <div className="rounded-xl border-[0.5px] border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-development" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Milestones
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tabular-nums text-foreground">
                  {milestonesHit}
                </span>
                <span className="text-sm text-muted-foreground">/ {milestonesTotal}</span>
              </div>
              <p className="mt-1 text-[11px] text-development">
                {milestonesTotal > 0 ? Math.round((milestonesHit / milestonesTotal) * 100) : 0}%
                complete
              </p>
            </div>
            <div className="rounded-xl border-[0.5px] border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-development" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Health Visits
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tabular-nums text-foreground">
                  {records.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {records.length === 1 ? "visit" : "visits"}
                </span>
              </div>
              {records[0] && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Last: {formatDate(records[0].visit_date || records[0].created_at)}
                </p>
              )}
            </div>
          </div>

          {/* Growth chart preview */}
          <div className="rounded-xl border-[0.5px] border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Growth Chart</h2>
              <div className="flex gap-1 rounded-lg border-[0.5px] border-border bg-background-secondary p-0.5">
                {(["height", "weight"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setGrowthMetric(m)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      growthMetric === m
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "height" ? "Height" : "Weight"}
                  </button>
                ))}
              </div>
            </div>
            <GrowthChart
              measurements={measurements}
              dob={selectedChild?.dob || ""}
              metric={growthMetric}
            />
            <p className="mt-2 text-[10px] text-muted-foreground">
              WHO Child Growth Standards — shaded area shows 3rd–97th percentile range
            </p>
          </div>

          {/* Milestone progress rings */}
          <div className="rounded-xl border-[0.5px] border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Milestone Progress</h2>
            <div className="flex justify-around">
              {["cognitive", "motor", "language", "social"].map((cat) => (
                <MilestoneProgressRing
                  key={cat}
                  category={cat}
                  hit={milestonesByCategory[cat]?.hit || 0}
                  total={milestonesByCategory[cat]?.total || 0}
                />
              ))}
            </div>
          </div>

          {/* Upcoming milestones */}
          {upcomingMilestones.length > 0 && (
            <div className="rounded-xl border-[0.5px] border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Coming Up Next</h2>
              <div className="space-y-2">
                {upcomingMilestones.map((m) => {
                  const meta = CATEGORY_META[m.category] || CATEGORY_META.cognitive;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border-[0.5px] border-border bg-background p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium leading-tight ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.title}</p>
                          {m.description && (
                            <p className="text-xs text-muted-foreground">{m.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-development hover:text-development"
                        onClick={() => handleMarkMilestone(m.id, "hit")}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Mark done
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Growth Tab ── */}
      {activeTab === "growth" && (
        <div className="animate-tab-crossfade space-y-6">
          <div className="rounded-xl border-[0.5px] border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                {growthMetric === "height" ? "Height" : "Weight"} over time
              </h2>
              <div className="flex gap-1 rounded-lg border-[0.5px] border-border bg-background-secondary p-0.5">
                {(["height", "weight"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setGrowthMetric(m)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      growthMetric === m
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "height" ? "Height" : "Weight"}
                  </button>
                ))}
              </div>
            </div>
            <GrowthChart
              measurements={measurements}
              dob={selectedChild?.dob || ""}
              metric={growthMetric}
            />
            <p className="mt-2 text-[10px] text-muted-foreground">
              WHO Child Growth Standards — shaded area shows 3rd–97th percentile range. Dashed line
              is 50th percentile.
            </p>
          </div>

          {/* Measurement history table */}
          <div className="rounded-xl border-[0.5px] border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Measurement History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4 text-right">Value</th>
                    <th className="pb-2 pr-4 text-right">Percentile</th>
                    <th className="pb-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {[...measurements]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((m) => {
                      const measAgeMonths = getAgeMonths(selectedChild?.dob || "", m.date);
                      const pct =
                        m.type === "height"
                          ? computePercentile(WHO_HEIGHT_GIRLS, measAgeMonths, m.value)
                          : m.type === "weight"
                            ? computePercentile(WHO_WEIGHT_GIRLS, measAgeMonths, m.value)
                            : null;
                      return (
                        <tr key={m.id} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 pr-4 text-foreground">{formatDate(m.date)}</td>
                          <td className="py-2.5 pr-4 capitalize text-muted-foreground">
                            {m.type.replace(/_/g, " ")}
                          </td>
                          <td className="py-2.5 pr-4 text-right font-medium tabular-nums text-foreground">
                            {m.value} {m.unit}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-development">
                            {pct !== null ? `${pct}th` : "—"}
                          </td>
                          <td className="py-2.5 text-xs text-muted-foreground">{m.source}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Milestones Tab ── */}
      {activeTab === "milestones" && (
        <div className="animate-tab-crossfade space-y-6">
          {/* Filter pills */}
          <div className="flex gap-2">
            {["all", "cognitive", "motor", "language", "social"].map((cat) => (
              <button
                key={cat}
                onClick={() => setMilestoneFilter(cat)}
                className={`rounded-full border-[0.5px] px-3 py-1.5 text-xs font-medium transition-colors ${
                  milestoneFilter === cat
                    ? "border-development bg-development text-white"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "all" ? "All" : CATEGORY_META[cat]?.label || cat}
              </button>
            ))}
          </div>

          {/* Milestone list */}
          <div className="space-y-2">
            {milestones
              .filter((m) => milestoneFilter === "all" || m.category === milestoneFilter)
              .map((m) => {
                const meta = CATEGORY_META[m.category] || CATEGORY_META.cognitive;
                const isHit = m.status === "hit";
                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between rounded-xl border-[0.5px] p-4 transition-colors ${
                      isHit ? "border-border bg-card" : "border-development/20 bg-development-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isHit ? "bg-development/10" : "bg-development/5"
                        }`}
                      >
                        {isHit ? (
                          <Check className="h-4 w-4 text-development" />
                        ) : (
                          <meta.icon className="text-development/50" size={16} />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${isHit ? "text-foreground" : "text-foreground/70"}`}
                        >
                          {m.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium leading-tight ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Expected: {m.age_months_expected}mo
                          </span>
                          {isHit && m.achieved_date && (
                            <span className="text-[11px] text-muted-foreground">
                              Achieved: {formatDate(m.achieved_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isHit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-development hover:text-development"
                        onClick={() => handleMarkMilestone(m.id, "hit")}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Done
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Add milestone button */}
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => {
              setShowAddModal(true);
              setAddModalType("milestone");
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add milestone
          </Button>
        </div>
      )}

      {/* ── Timeline Tab ── */}
      {activeTab === "timeline" && (
        <div className="animate-tab-crossfade space-y-4">
          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search timeline..."
                value={timelineSearch}
                onChange={(e) => setTimelineSearch(e.target.value)}
                className="w-full rounded-xl border-[0.5px] border-border bg-card py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-development/30"
              />
            </div>
            <div className="flex gap-1 rounded-xl border-[0.5px] border-border bg-card p-1">
              {[
                { id: "all", label: "All" },
                { id: "health_record", label: "Records" },
                { id: "milestone", label: "Milestones" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTimelineFilter(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    timelineFilter === f.id
                      ? "bg-background-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline items */}
          {timelineItems.length > 0 ? (
            <div className="relative space-y-3">
              {/* Vertical line */}
              <div className="absolute bottom-2 left-[18px] top-2 w-[1px] bg-border" />

              {timelineItems.map((item) => {
                const isExpanded = expandedTimelineId === item.id;
                return (
                  <div key={item.id} className="relative pl-10">
                    {/* Dot */}
                    <div
                      className={`absolute left-[14px] top-4 h-[9px] w-[9px] rounded-full border-2 ${
                        item.icon === "milestone_hit"
                          ? "border-development bg-development"
                          : "border-border bg-card"
                      }`}
                    />

                    <div
                      className="cursor-pointer rounded-xl border-[0.5px] border-border bg-card p-4 transition-colors hover:border-development/20"
                      onClick={() => setExpandedTimelineId(isExpanded ? null : item.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium capitalize text-foreground">
                            {item.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(item.date)}
                            </span>
                            {item.category && (
                              <span className="text-[11px] capitalize text-muted-foreground">
                                {item.category.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <ItemActionsMenu
                            onDelete={() => setDeleteTarget({
                              id: item.id,
                              title: item.title,
                              type: item.type === "health_record" ? "health record" : "milestone",
                              apiEndpoint: item.type === "health_record" ? "/api/health-records" : "/api/milestones",
                            })}
                          />
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {isExpanded && item.subtitle && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {item.subtitle}
                        </p>
                      )}

                      {isExpanded && item.type === "health_record" && (
                        <div className="mt-3">
                          {(() => {
                            const r = item.data as HealthRecord;
                            return (
                              <div className="flex gap-3">
                                {r.height_cm && (
                                  <div className="rounded-lg bg-background-secondary px-3 py-2">
                                    <p className="text-[10px] text-muted-foreground">Height</p>
                                    <p className="text-sm font-medium">{r.height_cm} cm</p>
                                  </div>
                                )}
                                {r.weight_kg && (
                                  <div className="rounded-lg bg-background-secondary px-3 py-2">
                                    <p className="text-[10px] text-muted-foreground">Weight</p>
                                    <p className="text-sm font-medium">{r.weight_kg} kg</p>
                                  </div>
                                )}
                                {r.provider && (
                                  <div className="rounded-lg bg-background-secondary px-3 py-2">
                                    <p className="text-[10px] text-muted-foreground">Provider</p>
                                    <p className="text-sm font-medium">{r.provider}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      {/* Inline edit for timeline items */}
                      {isExpanded && (
                        <div className="mt-3">
                          <InlineEditForm
                            fields={
                              item.type === "health_record"
                                ? [
                                    { key: "notes", label: "Notes", type: "textarea", value: (item.data as unknown as Record<string, string>)?.notes || "", placeholder: "Add notes about this visit" },
                                  ]
                                : [
                                    { key: "notes", label: "Notes", type: "textarea", value: (item.data as unknown as Record<string, string>)?.notes || "", placeholder: "Add notes" },
                                  ]
                            }
                            apiEndpoint={item.type === "health_record" ? "/api/health-records" : "/api/milestones"}
                            itemId={item.id}
                            onSaved={fetchData}
                            logRoute={`development.edit.${item.type}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={DevelopmentIcon}
              title="No timeline entries"
              description={
                timelineSearch
                  ? "No results match your search"
                  : "Add health records or milestones to build your timeline"
              }
              accentColor="development"
              illustration={!timelineSearch ? <DevelopmentEmpty /> : undefined}
            />
          )}
        </div>
      )}

      {/* ── Paste Dialog ── */}
      {showPasteDialog && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowPasteDialog(false)}
          />
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border-[0.5px] border-border bg-card p-6">
            <h2 className="mb-1 flex items-center gap-2 font-serif-display text-base font-semibold">
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

      {/* ── Add Entry Modal ── */}
      {showAddModal && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative mx-4 w-full max-w-md rounded-2xl border-[0.5px] border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Plus className="h-4 w-4 text-development" />
                Add {addModalType === "measurement" ? "measurement" : "milestone"}
              </h2>
              <button
                className="rounded-lg p-1 text-muted-foreground hover:bg-background-secondary"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Type toggle */}
            <div className="mb-4 flex gap-1 rounded-lg border-[0.5px] border-border bg-background-secondary p-0.5">
              {(["measurement", "milestone"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setAddModalType(t)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    addModalType === t
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "measurement" ? "Measurement" : "Milestone"}
                </button>
              ))}
            </div>

            {/* Date */}
            <div className="mb-3">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-xl border-[0.5px] border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-development/30"
              />
            </div>

            {addModalType === "measurement" ? (
              <>
                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Type
                  </label>
                  <div className="flex gap-1">
                    {["height", "weight", "head_circumference"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFormMeasurementType(t)}
                        className={`flex-1 rounded-lg border-[0.5px] px-3 py-2 text-xs font-medium transition-colors ${
                          formMeasurementType === t
                            ? "border-development bg-development/10 text-development"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t === "head_circumference"
                          ? "Head"
                          : t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Value ({formMeasurementType === "weight" ? "kg" : "cm"})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={formMeasurementType === "weight" ? "e.g. 18.5" : "e.g. 108.5"}
                    className="w-full rounded-xl border-[0.5px] border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-development/30"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Category
                  </label>
                  <div className="flex gap-1">
                    {["cognitive", "motor", "language", "social"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setFormMilestoneCategory(c)}
                        className={`flex-1 rounded-lg border-[0.5px] px-2 py-2 text-xs font-medium transition-colors ${
                          formMilestoneCategory === c
                            ? "border-development bg-development/10 text-development"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {CATEGORY_META[c]?.label || c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Milestone
                  </label>
                  <input
                    type="text"
                    value={formMilestoneTitle}
                    onChange={(e) => setFormMilestoneTitle(e.target.value)}
                    placeholder="e.g. Rides a bicycle"
                    className="w-full rounded-xl border-[0.5px] border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-development/30"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={formMilestoneDesc}
                    onChange={(e) => setFormMilestoneDesc(e.target.value)}
                    placeholder="Brief description"
                    className="w-full rounded-xl border-[0.5px] border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-development/30"
                  />
                </div>
              </>
            )}

            {/* Notes */}
            <div className="mb-4">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Notes (optional)
              </label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Any additional notes"
                className="w-full rounded-xl border-[0.5px] border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-development/30"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveManualEntry}
                disabled={
                  formSaving || (addModalType === "measurement" ? !formValue : !formMilestoneTitle)
                }
              >
                {formSaving ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
      </QuadrantTransition>
      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        itemTitle={deleteTarget?.title || ""}
        itemType={deleteTarget?.type || "item"}
        apiEndpoint={deleteTarget?.apiEndpoint || ""}
        itemId={deleteTarget?.id || ""}
        onDeleted={() => {
          setDeleteTarget(null);
          fetchData();
        }}
      />
    </>
  );
}

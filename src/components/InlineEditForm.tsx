"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { showErrorToast } from "@/lib/error-toasts";
import { logError } from "@/lib/logger";
import { toast } from "sonner";

interface EditField {
  key: string;
  label: string;
  type: "text" | "date" | "time" | "datetime-local" | "number" | "textarea";
  value: string;
  required?: boolean;
  placeholder?: string;
}

interface InlineEditFormProps {
  fields: EditField[];
  apiEndpoint: string;
  itemId: string;
  onSaved: () => void;
  /** Additional body fields to include in the PATCH request */
  extraBody?: Record<string, unknown>;
  /** Route name for structured logging */
  logRoute?: string;
}

export function InlineEditForm({
  fields,
  apiEndpoint,
  itemId,
  onSaved,
  extraBody,
  logRoute = "inlineEdit",
}: InlineEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) {
      initial[f.key] = f.value;
    }
    return initial;
  });

  const handleSave = async () => {
    // Validate required fields
    for (const f of fields) {
      if (f.required && !values[f.key]?.trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        ...extraBody,
      };

      // Build update payload — only include changed fields
      for (const f of fields) {
        if (values[f.key] !== f.value) {
          if (f.type === "datetime-local" || f.type === "date") {
            // Convert to ISO string for the API
            const d = new Date(values[f.key]);
            body[f.key] = isNaN(d.getTime()) ? values[f.key] : d.toISOString();
          } else if (f.type === "number") {
            body[f.key] = parseFloat(values[f.key]) || 0;
          } else {
            body[f.key] = values[f.key];
          }
        }
      }

      // Only send if something changed
      if (Object.keys(body).length === (extraBody ? Object.keys(extraBody).length : 0)) {
        setIsEditing(false);
        return;
      }

      const res = await fetch(`${apiEndpoint}?itemId=${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to save (${res.status})`);
      }

      toast.success("Changes saved");
      setIsEditing(false);
      onSaved();
    } catch (err) {
      logError(err, { route: logRoute, itemId });
      showErrorToast("save", { action: "save your changes" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    const original: Record<string, string> = {};
    for (const f of fields) {
      original[f.key] = f.value;
    }
    setValues(original);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background-secondary hover:text-foreground"
        title="Edit"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
    );
  }

  return (
    <div className="animate-fade-in space-y-3 rounded-xl border-[0.5px] border-border bg-background-secondary p-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {f.label}
          </label>
          {f.type === "textarea" ? (
            <textarea
              value={values[f.key] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              rows={3}
              className="w-full rounded-lg border-[0.5px] border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-scheduler/50 focus:outline-none focus:ring-1 focus:ring-scheduler/30"
            />
          ) : (
            <input
              type={f.type}
              value={values[f.key] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full rounded-lg border-[0.5px] border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-scheduler/50 focus:outline-none focus:ring-1 focus:ring-scheduler/30"
            />
          )}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="bg-scheduler text-white hover:bg-scheduler/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-1 h-3 w-3" />
              Save
            </>
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
          <X className="mr-1 h-3 w-3" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

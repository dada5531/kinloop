"use client";

import { Camera, Upload, Trash2, Loader2, Check } from "lucide-react";
import { useState, useRef, useCallback } from "react";

import { Button } from "@/components/ui/button";

interface WelcomePhotoUploaderProps {
  childId: string;
  childName: string;
  currentPhotoUrl: string | null;
  onPhotoUpdated: () => void;
}

export function WelcomePhotoUploader({
  childId,
  childName,
  currentPhotoUrl,
  onPhotoUpdated,
}: WelcomePhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a JPEG, PNG, or WebP image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be under 5MB.");
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/children/${childId}/photo`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        onPhotoUpdated();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Upload failed");
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [childId, onPhotoUpdated],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDelete = async () => {
    if (!confirm("Remove the welcome photo?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/children/${childId}/photo`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setPreview(null);
      onPhotoUpdated();
    } catch {
      alert("Failed to remove photo");
    } finally {
      setDeleting(false);
    }
  };

  const displayUrl = preview || currentPhotoUrl;

  return (
    <div className="space-y-4">
      {/* Photo preview / upload zone */}
      {displayUrl ? (
        <div className="relative">
          <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-2xl border-[0.5px] border-border shadow-sm">
            <img
              src={displayUrl}
              alt={`${childName}'s welcome photo`}
              className="h-full w-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
            {success && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="rounded-full bg-white p-2">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs"
            >
              <Camera className="mr-1.5 h-3 w-3" />
              Change photo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting || uploading}
              className="text-xs text-destructive hover:text-destructive"
            >
              {deleting ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-3 w-3" />
              )}
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mx-auto flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed transition-colors ${
            dragOver
              ? "border-scheduler bg-scheduler/5"
              : "border-border bg-background hover:border-muted-foreground/30"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Drop photo here</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/70">or click to browse</p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so the same file can be re-selected
          e.target.value = "";
        }}
      />

      <p className="text-center text-[11px] text-muted-foreground">
        JPEG, PNG, or WebP · Max 5MB · Shown on the welcome screen
      </p>
    </div>
  );
}

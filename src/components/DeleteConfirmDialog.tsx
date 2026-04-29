"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { logError } from "@/lib/logger";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle: string;
  itemType: string; // "event", "activity", "health record", "measurement", "milestone"
  apiEndpoint: string; // e.g., "/api/events"
  itemId: string;
  onDeleted: () => void;
  /** Optional quadrant color for the icon */
  accentColor?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemTitle,
  itemType,
  apiEndpoint,
  itemId,
  onDeleted,
  accentColor,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${apiEndpoint}?id=${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Failed to delete ${itemType}`);
      }
      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted`);
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      logError(err, { route: `${itemType}.delete`, itemId });
      toast.error(
        err instanceof Error
          ? err.message
          : `Couldn't delete this ${itemType}. Please try again.`,
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <AlertDialogTitle className="text-center">
            Delete {itemType}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            <span className="font-medium text-foreground">&ldquo;{itemTitle}&rdquo;</span>
            {" "}will be removed from your view. You can recover it later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 gap-2 sm:gap-2">
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

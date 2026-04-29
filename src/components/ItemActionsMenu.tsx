"use client";

import { MoreHorizontal, Pencil, Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ItemActionsMenuProps {
  onEdit?: () => void;
  onDelete: () => void;
  onMarkDone?: () => void;
  onUndone?: () => void;
  isDone?: boolean;
  /** Additional custom actions to render before the separator */
  customActions?: React.ReactNode;
}

export function ItemActionsMenu({
  onEdit,
  onDelete,
  onMarkDone,
  onUndone,
  isDone = false,
  customActions,
}: ItemActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(e) => e.stopPropagation()}
          aria-label="Actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {onEdit && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
        )}
        {onMarkDone && !isDone && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkDone(); }}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark done
          </DropdownMenuItem>
        )}
        {onUndone && isDone && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUndone(); }}>
            <RotateCcw className="h-3.5 w-3.5" />
            Undo done
          </DropdownMenuItem>
        )}
        {customActions}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

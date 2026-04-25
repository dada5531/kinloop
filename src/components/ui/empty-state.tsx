import React from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

interface EmptyStateProps {
  /** Accepts both Lucide icons and custom SVG icons (any component with size/className) */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: "scheduler" | "development" | "play" | "coach";
  className?: string;
}

const bgClasses: Record<string, string> = {
  scheduler: "bg-scheduler-muted",
  development: "bg-development-muted",
  play: "bg-play-muted",
  coach: "bg-coach-muted",
};

const textClasses: Record<string, string> = {
  scheduler: "text-scheduler",
  development: "text-development",
  play: "text-play",
  coach: "text-coach",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "animate-fade-in flex flex-col items-center justify-center py-12 text-center",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
          accentColor ? bgClasses[accentColor] : "bg-muted",
        )}
      >
        <Icon
          size={20}
          className={cn(
            "h-5 w-5",
            accentColor ? textClasses[accentColor] : "text-muted-foreground",
          )}
        />
      </div>
      <h3 className="mb-1 text-sm font-medium text-foreground">{title}</h3>
      <p className="mb-5 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="default" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

interface QuadrantCardProps {
  href: string;
  label: string;
  headline: string;
  accentColor: "scheduler" | "development" | "play" | "coach";
  /** Custom SVG icon component — receives { size, className } */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  className?: string;
}

const accentBarClasses = {
  scheduler: "bg-scheduler",
  development: "bg-development",
  play: "bg-play",
  coach: "bg-coach",
} as const;

const labelClasses = {
  scheduler: "text-scheduler",
  development: "text-development",
  play: "text-play",
  coach: "text-coach",
} as const;

/* 4% accent wash per quadrant — subtle background tint */
const washClasses = {
  scheduler: "bg-scheduler/[0.04] hover:bg-scheduler/[0.08]",
  development: "bg-development/[0.04] hover:bg-development/[0.08]",
  play: "bg-play/[0.04] hover:bg-play/[0.08]",
  coach: "bg-coach/[0.04] hover:bg-coach/[0.08]",
} as const;

export function QuadrantCard({
  href,
  label,
  headline,
  accentColor,
  icon: Icon,
  children,
  className,
}: QuadrantCardProps) {
  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-[#E8E2D5] p-6",
          "transition-all duration-200 ease-out",
          "hover:scale-[1.005] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
          washClasses[accentColor],
          className,
        )}
      >
        {/* Colored left-edge bar */}
        <div className={cn("absolute bottom-0 left-0 top-0 w-1", accentBarClasses[accentColor])} />

        {/* Header row */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon size={16} className={labelClasses[accentColor]} />
            <span
              className={cn(
                "text-[11px] font-medium uppercase tracking-wider",
                labelClasses[accentColor],
              )}
            >
              {label}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
        </div>

        {/* Headline */}
        <h3 className="mb-3 text-base font-medium leading-snug text-foreground">{headline}</h3>

        {/* Preview content */}
        <div className="space-y-2">{children}</div>
      </div>
    </Link>
  );
}

/**
 * A single preview row inside a QuadrantCard.
 */
export function PreviewRow({
  dot,
  label,
  meta,
  className,
}: {
  dot?: string;
  label: string;
  meta?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      {dot && <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", dot)} />}
      <span className="flex-1 truncate text-foreground/80">{label}</span>
      {meta && (
        <span className="flex-shrink-0 whitespace-nowrap text-muted-foreground">{meta}</span>
      )}
    </div>
  );
}

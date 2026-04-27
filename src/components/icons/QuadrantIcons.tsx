"use client";

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Custom quadrant identity icons — soft Japanese minimalism.
 *
 * Design principles:
 * - 1.5px strokes at 18px, 1.75px at 24px+
 * - Rounded geometry, stroke-linecap="round", stroke-linejoin="round"
 * - No fill — stroke only, generous negative space
 * - Intentional asymmetries for hand-drawn warmth
 * - Muted palette matching quadrant accent colors
 *
 * These are used in 3 places:
 * - Dashboard tile headers (16–18px, alongside ALL-CAPS label)
 * - In-quadrant page headers (24px, paired with page title)
 * - Navigation bar (14–16px)
 *
 * For utility icons (search, close, arrow, menu), continue using Lucide.
 */

function getStrokeWidth(size: number, base: number = 1.5): number {
  return size >= 24 ? base + 0.25 : base;
}

function getDetailStroke(size: number, base: number = 0.8): number {
  return size >= 24 ? base + 0.1 : base;
}

/** Soft rounded calendar with folded corner — Scheduler quadrant */
export function SchedulerIcon({ size = 18, className }: IconProps) {
  const sw = getStrokeWidth(size);
  const dsw = getDetailStroke(size);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body — top edge slightly off-parallel for hand-drawn feel */}
      <path
        d="M3.5 5.2 Q3 5.5 3 6 L3 18 Q3 21 6 21 L18 21 Q21 21 21 18 L21 6 Q21 5.5 20.5 5.2"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Top bar — slightly curved */}
      <path
        d="M3.5 5.2 Q12 4.5 20.5 5.2"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Divider line — not perfectly straight */}
      <path
        d="M3 10.2 Q12 9.8 21 10.2"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Hooks — slightly different heights */}
      <path d="M8.5 3 L8.5 7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <path d="M15.5 3.2 L15.5 6.8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      {/* Folded corner */}
      <path
        d="M21 15.5 Q18 15.5 17 16.5 Q16.5 17 16.5 21"
        stroke="currentColor"
        strokeWidth={sw - 0.3}
        strokeLinecap="round"
        fill="none"
        opacity={0.45}
      />
      {/* Soft horizontal lines — varying length and opacity */}
      <path
        d="M6.5 13.5 L10 13.5"
        stroke="currentColor"
        strokeWidth={dsw + 0.2}
        strokeLinecap="round"
        opacity={0.35}
      />
      <path
        d="M6.5 16.5 L9 16.5"
        stroke="currentColor"
        strokeWidth={dsw + 0.2}
        strokeLinecap="round"
        opacity={0.25}
      />
    </svg>
  );
}

/** Seedling with two asymmetric leaves — Development quadrant */
export function DevelopmentIcon({ size = 18, className }: IconProps) {
  const sw = getStrokeWidth(size);
  const dsw = getDetailStroke(size);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stem — slightly curved, not straight */}
      <path
        d="M12 22 Q12.3 17 12 12"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Left leaf — fuller, rounder */}
      <path
        d="M12 15 Q7 14.5 5 9.5 Q6.5 7 9 7.5 Q12 8.5 12 12"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right leaf — taller, more reaching, thinner */}
      <path
        d="M12 10.5 Q15 7 19 3 Q18 2 15 3 Q12.5 4.5 12 8"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Left vein — subtle */}
      <path
        d="M12 14 Q8.5 12 6.5 9.5"
        stroke="currentColor"
        strokeWidth={dsw}
        strokeLinecap="round"
        opacity={0.25}
      />
      {/* Right vein — subtle, different curve */}
      <path
        d="M12 9.5 Q14.5 6 17.5 4"
        stroke="currentColor"
        strokeWidth={dsw}
        strokeLinecap="round"
        opacity={0.25}
      />
      {/* Ground — gentle asymmetric arc */}
      <path
        d="M7.5 22 Q11 20 16.5 22"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
        opacity={0.35}
      />
    </svg>
  );
}

/** Origami crane in flight — Play Lab quadrant */
export function PlayLabIcon({ size = 18, className }: IconProps) {
  const sw = getStrokeWidth(size);
  const dsw = getDetailStroke(size);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Neck — elegant S-curve rising to head */}
      <path
        d="M10 14 Q9 10 7 7 Q6 5.5 5 5"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Head — small beak */}
      <path
        d="M5 5 L3.5 4"
        stroke="currentColor"
        strokeWidth={sw - 0.2}
        strokeLinecap="round"
        opacity={0.7}
      />
      {/* Body — diamond shape, slightly tilted */}
      <path
        d="M10 14 L16 10 L20 14 L16 17 Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Upper wing fold */}
      <path
        d="M10 14 Q13 11 16 10"
        stroke="currentColor"
        strokeWidth={dsw}
        strokeLinecap="round"
        opacity={0.3}
      />
      {/* Lower wing fold */}
      <path
        d="M10 14 Q13 16 16 17"
        stroke="currentColor"
        strokeWidth={dsw}
        strokeLinecap="round"
        opacity={0.2}
      />
      {/* Tail — trailing behind, slightly curved up */}
      <path
        d="M20 14 Q21.5 14.5 22 13"
        stroke="currentColor"
        strokeWidth={sw - 0.2}
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
      />
      {/* Wing tips — asymmetric, one higher */}
      <path
        d="M16 10 Q17 7 15 5"
        stroke="currentColor"
        strokeWidth={sw - 0.2}
        strokeLinecap="round"
        fill="none"
        opacity={0.4}
      />
      <path
        d="M16 17 Q17.5 19 16 21"
        stroke="currentColor"
        strokeWidth={sw - 0.2}
        strokeLinecap="round"
        fill="none"
        opacity={0.35}
      />
    </svg>
  );
}

/** Open book with ribbon bookmark — Coach quadrant */
export function CoachIcon({ size = 18, className }: IconProps) {
  const sw = getStrokeWidth(size);
  const dsw = getDetailStroke(size);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Open book — pages curve slightly differently for asymmetry */}
      <path
        d="M12 6.5 Q7.5 5.5 3 6.5 L3 19 Q7.5 17.5 12 19"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 6.5 Q16 5 21 6 L21 19 Q16.5 18 12 19"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Spine — slight curve */}
      <path
        d="M12 6.5 Q12.2 12.5 12 19"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Bookmark ribbon — at a slight angle */}
      <path
        d="M16.5 6 L16.5 10.5 L18 9 L19.5 10.5 L19.5 6"
        stroke="currentColor"
        strokeWidth={sw - 0.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.45}
      />
      {/* Page lines — irregular lengths and slight angles */}
      <path
        d="M5.5 10.5 L9.5 10"
        stroke="currentColor"
        strokeWidth={dsw}
        strokeLinecap="round"
        opacity={0.2}
      />
      <path
        d="M5.5 13.5 L9 13"
        stroke="currentColor"
        strokeWidth={dsw}
        strokeLinecap="round"
        opacity={0.18}
      />
      <path
        d="M6 16.5 L9.5 16"
        stroke="currentColor"
        strokeWidth={dsw}
        strokeLinecap="round"
        opacity={0.14}
      />
    </svg>
  );
}

/** Map of quadrant key to icon component — for programmatic use */
export const QUADRANT_ICONS = {
  scheduler: SchedulerIcon,
  development: DevelopmentIcon,
  play: PlayLabIcon,
  coach: CoachIcon,
} as const;

export type QuadrantKey = keyof typeof QUADRANT_ICONS;

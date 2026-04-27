import React from "react";

interface CoachEmptyProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/** Coach empty state — open journal and steaming mug */
export function CoachEmpty({ className, width = "100%", height = "auto" }: CoachEmptyProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 680 280"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Coach empty state — open journal and steaming mug"
      className={className}
    >
<title>Coach empty state</title>
<desc>An open book with delicate text lines and a folded paper note as a bookmark, beside a small steaming teacup with curling steam, all in soft rose and warm tones.</desc>

<g transform="translate(220, 80)">
  <path d="M 0 30 Q 0 20 12 18 L 110 8 L 110 130 L 12 138 Q 0 138 0 128 Z" fill="#F8E0E8" stroke="#9A3D55" strokeWidth="1.7" strokeLinejoin="round"/>
  <path d="M 110 8 L 220 18 Q 232 20 232 30 L 232 128 Q 232 138 220 138 L 110 130 Z" fill="#F8E0E8" stroke="#9A3D55" strokeWidth="1.7" strokeLinejoin="round"/>
  <path d="M 110 8 L 110 130" fill="none" stroke="#9A3D55" strokeWidth="1.5" opacity="0.5"/>
  <path d="M 12 38 Q 60 36 96 36" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.55"/>
  <path d="M 12 50 Q 60 48 102 48" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.55"/>
  <path d="M 12 62 Q 50 60 86 60" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.55"/>
  <path d="M 12 74 Q 60 72 100 72" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.45"/>
  <path d="M 12 86 Q 50 84 80 84" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.45"/>
  <path d="M 12 98 Q 60 96 96 96" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.4"/>
  <path d="M 12 110 Q 50 108 76 108" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.4"/>
  <path d="M 124 36 Q 170 36 218 38" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.55"/>
  <path d="M 124 48 Q 170 48 220 50" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.55"/>
  <path d="M 124 60 Q 170 60 210 62" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.55"/>
  <path d="M 124 72 Q 170 72 220 74" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.45"/>
  <path d="M 124 84 Q 170 84 200 86" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.45"/>
  <path d="M 124 96 Q 170 96 216 98" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.4"/>
  <path d="M 124 108 Q 170 108 196 110" fill="none" stroke="#9A3D55" strokeWidth="1.1" strokeLinecap="round" opacity="0.4"/>
  <g transform="translate(160, 0) rotate(6)">
    <path d="M 0 0 L 24 0 L 24 70 L 12 60 L 0 70 Z" fill="#F2A4B6" stroke="#9A3D55" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M 6 16 L 18 16" stroke="#9A3D55" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    <path d="M 6 26 L 14 26" stroke="#9A3D55" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
  </g>
</g>

<g transform="translate(490, 100)">
  <path d="M 0 0 Q -2 -10 8 -10 L 56 -10 Q 66 -10 64 0 L 60 50 Q 58 60 48 60 L 16 60 Q 6 60 4 50 Z" fill="#FFF6EC" stroke="#9A4530" strokeWidth="1.7" strokeLinejoin="round"/>
  <path d="M 64 5 Q 78 5 80 18 Q 80 30 64 30" fill="none" stroke="#9A4530" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
  <path d="M 4 8 Q 50 12 60 8" fill="none" stroke="#9A4530" strokeWidth="1.2" opacity="0.4"/>
  <ellipse cx="32" cy="60" rx="34" ry="3" fill="none" stroke="#9A4530" strokeWidth="1.2" opacity="0.35"/>
  <path d="M 18 -16 Q 14 -22 18 -28 Q 22 -34 18 -40" fill="none" stroke="#9A4530" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
  <path d="M 32 -16 Q 28 -24 32 -32 Q 36 -40 32 -48" fill="none" stroke="#9A4530" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
  <path d="M 46 -16 Q 42 -22 46 -28 Q 50 -34 46 -40" fill="none" stroke="#9A4530" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
</g>

<g transform="translate(180, 230)" opacity="0.4">
  <circle cx="0" cy="0" r="1.4" fill="#9A3D55"/>
  <circle cx="8" cy="4" r="1.1" fill="#9A3D55"/>
</g>
<g transform="translate(560, 220)" opacity="0.35">
  <path d="M 0 0 Q 4 -6 10 -4 Q 6 0 0 0 Z" fill="#A8C8A8" stroke="#5D8A5D" strokeWidth="1"/>
</g>

    </svg>
  );
}

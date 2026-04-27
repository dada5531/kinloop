import React from "react";

interface DevelopmentEmptyProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/** Development empty state — growth chart and potted sprout */
export function DevelopmentEmpty({ className, width = "100%", height = "auto" }: DevelopmentEmptyProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 680 300"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Development empty state — growth chart and potted sprout"
      className={className}
    >
<title>Development empty state</title>
<desc>A small sprouting plant in a clay pot beside a vertical wooden ruler showing growth measurement marks, all in soft sage and warm earth tones.</desc>

<g transform="translate(280, 60)">
  <path d="M 12 0 Q 12 -10 18 -14 Q 24 -10 24 0" fill="#A8C8A8" stroke="#5D8A5D" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
  <path d="M 18 -14 Q 24 -22 22 -32" fill="none" stroke="#5D8A5D" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M 26 -8 Q 38 -14 44 -8 Q 38 -2 26 -8 Z" fill="#C2D8B8" stroke="#5D8A5D" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M 34 -7 L 38 -7" fill="none" stroke="#5D8A5D" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
  <path d="M 12 -2 Q 0 -6 -8 0 Q 0 4 12 -2 Z" fill="#A8C8A8" stroke="#5D8A5D" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M 4 0 L 0 0" fill="none" stroke="#5D8A5D" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
  <path d="M 18 -22 Q 14 -28 8 -28" fill="none" stroke="#5D8A5D" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M 18 -22 Q 22 -30 28 -30" fill="none" stroke="#5D8A5D" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M 0 4 Q -4 8 6 14 L 36 14 Q 44 8 38 4 Q 32 8 18 8 Q 4 8 0 4 Z" fill="#E8C09A" stroke="#9A6A40" strokeWidth="1.6" strokeLinejoin="round"/>
  <path d="M -2 14 L 0 76 Q 0 82 6 82 L 38 82 Q 44 82 44 76 L 42 14" fill="#D9A876" stroke="#9A6A40" strokeWidth="1.7" strokeLinejoin="round"/>
  <path d="M 10 30 Q 12 50 14 76" fill="none" stroke="#9A6A40" strokeWidth="0.8" opacity="0.5"/>
  <path d="M 24 30 Q 24 54 26 76" fill="none" stroke="#9A6A40" strokeWidth="0.8" opacity="0.5"/>
  <ellipse cx="20" cy="84" rx="22" ry="3" fill="none" stroke="#9A6A40" strokeWidth="1.2" opacity="0.4"/>
</g>

<g transform="translate(420, 50)">
  <rect x="0" y="0" width="22" height="180" rx="2" fill="#F0DCBA" stroke="#9A6A40" strokeWidth="1.7" strokeLinejoin="round"/>
  <path d="M 0 18 L 22 18" stroke="#9A6A40" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M 0 36 L 14 36" stroke="#9A6A40" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M 0 54 L 14 54" stroke="#9A6A40" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M 0 72 L 22 72" stroke="#9A6A40" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M 0 90 L 14 90" stroke="#9A6A40" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M 0 108 L 14 108" stroke="#9A6A40" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M 0 126 L 22 126" stroke="#9A6A40" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M 0 144 L 14 144" stroke="#9A6A40" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M 0 162 L 14 162" stroke="#9A6A40" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M 22 50 Q 36 48 38 54 Q 32 56 22 54 Z" fill="#A8C8A8" stroke="#5D8A5D" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M 30 51 L 30 56" stroke="#5D8A5D" strokeWidth="1" opacity="0.6"/>
  <circle cx="-6" cy="74" r="3" fill="#E8B4A0" stroke="#9A4530" strokeWidth="1.4"/>
  <path d="M -6 78 L -6 90" stroke="#9A4530" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M -6 90 L -10 96" stroke="#9A4530" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M -6 90 L -2 96" stroke="#9A4530" strokeWidth="1.2" strokeLinecap="round"/>
</g>

<g transform="translate(360, 250)" opacity="0.45">
  <circle cx="0" cy="0" r="1.6" fill="#5D8A5D"/>
  <circle cx="10" cy="4" r="1.2" fill="#5D8A5D"/>
  <circle cx="-8" cy="2" r="1.4" fill="#5D8A5D"/>
</g>

    </svg>
  );
}

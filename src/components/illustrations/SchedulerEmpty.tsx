import React from "react";

interface SchedulerEmptyProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/** Scheduler empty state — envelopes and letters */
export function SchedulerEmpty({ className, width = "100%", height = "auto" }: SchedulerEmptyProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 680 280"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Scheduler empty state — envelopes and letters"
      className={className}
    >
<title>Scheduler empty state</title>
<desc>A small stack of folded letter papers tied with twine, beside an envelope sealed with a tiny circle, all in soft peach tones with hand-drawn line work.</desc>

<g transform="translate(260, 70)">
  <path d="M -8 90 Q -10 84 -4 82 L 95 70 Q 102 70 100 76 L 92 130 Q 91 134 86 134 L -2 142 Q -10 142 -8 134 Z" fill="#FAEAD8" stroke="#B85A3F" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" opacity="0.92"/>
  <path d="M -2 88 Q -4 82 2 80 L 100 64 Q 107 64 105 70 L 95 124 Q 94 128 89 128 L 2 138 Q -6 138 -4 130 Z" fill="#F5D3B6" stroke="#B85A3F" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" opacity="0.95"/>
  <path d="M 4 82 Q 1 76 8 74 L 106 56 Q 113 56 111 62 L 100 116 Q 99 120 94 120 L 8 132 Q 0 132 2 124 Z" fill="#F0BC93" stroke="#B85A3F" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
  <path d="M 12 90 Q 32 88 56 86" fill="none" stroke="#B85A3F" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
  <path d="M 14 100 Q 38 98 70 95" fill="none" stroke="#B85A3F" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
  <path d="M 16 110 Q 36 108 50 107" fill="none" stroke="#B85A3F" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
  <path d="M -4 76 Q 50 60 110 56 Q 118 70 110 88 Q 50 98 -4 100 Q -10 88 -4 76 Z" fill="none" stroke="#9A4530" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
  <ellipse cx="38" cy="78" rx="12" ry="3" fill="none" stroke="#9A4530" strokeWidth="1.4" opacity="0.7"/>
  <path d="M 30 76 Q 32 70 38 70 Q 44 70 46 76" fill="none" stroke="#9A4530" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
  <path d="M 26 80 Q 22 74 16 74" fill="none" stroke="#9A4530" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
  <path d="M 50 80 Q 56 76 62 78" fill="none" stroke="#9A4530" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
</g>

<g transform="translate(380, 110)">
  <path d="M 0 0 L 130 -8 Q 138 -8 138 0 L 142 60 Q 142 68 134 68 L 4 76 Q -4 76 -4 68 L 0 0 Z" fill="#FFF6EC" stroke="#B85A3F" strokeWidth="1.7" strokeLinejoin="round"/>
  <path d="M 0 0 L 70 38 L 138 0" fill="none" stroke="#B85A3F" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
  <circle cx="69" cy="42" r="9" fill="#E8B4A0" stroke="#9A4530" strokeWidth="1.4"/>
  <path d="M 64 40 Q 69 44 74 40" fill="none" stroke="#9A4530" strokeWidth="1.2" strokeLinecap="round"/>
</g>

<g transform="translate(245, 200)" opacity="0.4">
  <circle cx="0" cy="0" r="2" fill="#B85A3F"/>
  <circle cx="14" cy="6" r="1.5" fill="#B85A3F"/>
  <circle cx="-10" cy="8" r="1.3" fill="#B85A3F"/>
</g>
<g transform="translate(490, 60)" opacity="0.35">
  <path d="M 0 0 Q 4 -6 10 -4 Q 6 0 0 0 Z" fill="#A8C8A8" stroke="#5D8A5D" strokeWidth="1"/>
  <path d="M 4 0 L 4 12" fill="none" stroke="#5D8A5D" strokeWidth="1" strokeLinecap="round"/>
</g>

    </svg>
  );
}

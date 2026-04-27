import React from "react";

interface PlayLabEmptyProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/** Play Lab empty state — paper airplane and blocks */
export function PlayLabEmpty({ className, width = "100%", height = "auto" }: PlayLabEmptyProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 680 280"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Play Lab empty state — paper airplane and blocks"
      className={className}
    >
<title>Play Lab empty state</title>
<desc>An origami paper crane in flight with subtle wing texture, alongside scattered colored paper squares and a small pair of craft scissors, in butter yellow and warm tones.</desc>

<g transform="translate(310, 130) rotate(-8)">
  <path d="M 0 0 L 50 -22 L 90 0 L 50 12 Z" fill="#F8DD93" stroke="#9A7820" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
  <path d="M 50 -22 L 50 12" fill="none" stroke="#9A7820" strokeWidth="1.4" opacity="0.65"/>
  <path d="M 24 -10 L 50 -22" fill="none" stroke="#9A7820" strokeWidth="1.2" opacity="0.55"/>
  <path d="M 24 -10 L 50 0" fill="none" stroke="#9A7820" strokeWidth="1.2" opacity="0.55"/>
  <path d="M 50 -22 L 30 -42 L 22 -36 L 40 -16" fill="#FCE7B1" stroke="#9A7820" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
  <path d="M 28 -34 L 36 -22" fill="none" stroke="#9A7820" strokeWidth="1.1" opacity="0.55"/>
  <path d="M 50 -22 L 70 -42 L 78 -36 L 60 -16" fill="#F8DD93" stroke="#9A7820" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
  <path d="M 72 -34 L 64 -22" fill="none" stroke="#9A7820" strokeWidth="1.1" opacity="0.55"/>
  <path d="M 90 0 L 110 6 L 116 -2 L 102 -8 Z" fill="#FCE7B1" stroke="#9A7820" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
  <path d="M 102 -2 L 108 0" fill="none" stroke="#9A7820" strokeWidth="1.1" opacity="0.55"/>
  <path d="M 0 0 L -16 -10 L -22 -4 L -10 4 Z" fill="#F8DD93" stroke="#9A7820" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/>
  <circle cx="-18" cy="-7" r="1.4" fill="#9A7820"/>
</g>

<path d="M 290 60 Q 240 70 210 100" fill="none" stroke="#9A7820" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 4" opacity="0.45"/>

<g transform="translate(180, 200) rotate(-12)">
  <rect x="0" y="0" width="36" height="36" rx="2" fill="#E8B4A0" stroke="#9A4530" strokeWidth="1.5" strokeLinejoin="round" opacity="0.85"/>
  <path d="M 0 18 L 36 18" fill="none" stroke="#9A4530" strokeWidth="1" opacity="0.4"/>
</g>
<g transform="translate(220, 210) rotate(8)">
  <rect x="0" y="0" width="32" height="32" rx="2" fill="#A8C8A8" stroke="#5D8A5D" strokeWidth="1.5" strokeLinejoin="round" opacity="0.85"/>
</g>
<g transform="translate(440, 195) rotate(-4)">
  <rect x="0" y="0" width="34" height="34" rx="2" fill="#F2A4B6" stroke="#9A3D55" strokeWidth="1.5" strokeLinejoin="round" opacity="0.8"/>
  <path d="M 8 8 L 24 24" stroke="#9A3D55" strokeWidth="0.8" opacity="0.4"/>
  <path d="M 24 8 L 8 24" stroke="#9A3D55" strokeWidth="0.8" opacity="0.4"/>
</g>

<g transform="translate(490, 220) rotate(28)">
  <ellipse cx="0" cy="0" rx="6" ry="9" fill="none" stroke="#9A6A40" strokeWidth="1.6"/>
  <ellipse cx="14" cy="0" rx="6" ry="9" fill="none" stroke="#9A6A40" strokeWidth="1.6"/>
  <path d="M 4 -2 L 30 -16" fill="none" stroke="#9A6A40" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M 10 -2 L 30 -10" fill="none" stroke="#9A6A40" strokeWidth="1.6" strokeLinecap="round"/>
  <circle cx="0" cy="0" r="1.4" fill="#9A6A40"/>
  <circle cx="14" cy="0" r="1.4" fill="#9A6A40"/>
</g>

<g transform="translate(150, 80)" opacity="0.4">
  <circle cx="0" cy="0" r="1.4" fill="#9A7820"/>
  <circle cx="6" cy="6" r="1" fill="#9A7820"/>
  <circle cx="-6" cy="4" r="1.2" fill="#9A7820"/>
</g>

    </svg>
  );
}

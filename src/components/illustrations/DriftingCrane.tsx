import React from "react";

interface DriftingCraneProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function DriftingCrane({ className, size, "aria-hidden": ariaHidden = true, ...props }: DriftingCraneProps & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaHidden}
      {...props}
    >
      <g transform="translate(40, 40)">

  <g transform="rotate(-22)">
    <path d="M 0 0 L 30 -14 L 54 0 L 30 8 Z" fill="#FCE7B1" stroke="#9A7820" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M 30 -14 L 30 8" fill="none" stroke="#9A7820" stroke-width="1.2" opacity="0.6"/>
    <path d="M 30 -14 L 16 -28 L 12 -22 L 24 -10" fill="#F8DD93" stroke="#9A7820" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M 30 -14 L 44 -28 L 48 -22 L 36 -10" fill="#FCE7B1" stroke="#9A7820" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M 54 0 L 66 4 L 70 -2 L 60 -6" fill="#F8DD93" stroke="#9A7820" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M 0 0 L -10 -6 L -14 -2 L -6 2" fill="#FCE7B1" stroke="#9A7820" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="-12" cy="-4" r="1.2" fill="#9A7820"/>
  </g>
  <path d="M -32 22 Q -50 28 -64 38" fill="none" stroke="#9A7820" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="2 4" opacity="0.45"/>
  <path d="M -38 32 Q -54 40 -66 50" fill="none" stroke="#9A7820" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="2 4" opacity="0.3"/>
  

      </g>
    </svg>
  );
}

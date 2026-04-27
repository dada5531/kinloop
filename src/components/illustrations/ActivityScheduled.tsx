import React from "react";

interface ActivityScheduledProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function ActivityScheduled({ className, size, "aria-hidden": ariaHidden = true, ...props }: ActivityScheduledProps & React.SVGProps<SVGSVGElement>) {
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

  <g transform="rotate(-15)">
    <path d="M 0 0 L 32 -14 L 56 0 L 32 8 Z" fill="#F8DD93" stroke="#9A7820" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M 32 -14 L 32 8" fill="none" stroke="#9A7820" stroke-width="1.3" opacity="0.6"/>
    <path d="M 32 -14 L 18 -28 L 14 -22 L 26 -10" fill="#FCE7B1" stroke="#9A7820" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M 32 -14 L 46 -28 L 50 -22 L 38 -10" fill="#F8DD93" stroke="#9A7820" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M 56 0 L 70 4 L 74 -2 L 64 -6 Z" fill="#FCE7B1" stroke="#9A7820" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M 0 0 L -10 -6 L -14 -2 L -6 2 Z" fill="#F8DD93" stroke="#9A7820" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="-12" cy="-4" r="1.2" fill="#9A7820"/>
  </g>
  <path d="M -36 18 Q -50 22 -64 26" fill="none" stroke="#9A7820" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="2 4" opacity="0.55"/>
  

      </g>
    </svg>
  );
}

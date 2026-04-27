import React from "react";

interface BalloonSprigProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function BalloonSprig({ className, size, "aria-hidden": ariaHidden = true, ...props }: BalloonSprigProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M 0 38 Q 2 20 -2 0 Q -6 -20 0 -34" fill="none" stroke="#9A4530" stroke-width="1.4" stroke-linecap="round"/>
  <ellipse cx="0" cy="-42" rx="12" ry="14" fill="#E8B4A0" stroke="#9A4530" stroke-width="1.7"/>
  <path d="M -3 -50 Q -2 -45 0 -44" fill="none" stroke="#9A4530" stroke-width="1" opacity="0.55"/>
  <path d="M -2 -28 L 2 -28 L 2 -32 L -2 -32 Z" fill="#9A4530" stroke="#9A4530" stroke-width="1"/>
  
      </g>
    </svg>
  );
}

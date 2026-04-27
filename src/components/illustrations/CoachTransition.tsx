import React from "react";

interface CoachTransitionProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function CoachTransition({ className, size, "aria-hidden": ariaHidden = true, ...props }: CoachTransitionProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M 0 16 Q 0 8 6 6 L 32 -2 L 32 32 L 6 38 Q 0 38 0 30 Z" fill="#F8E0E8" stroke="#9A3D55" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M 32 -2 L 58 6 Q 64 8 64 16 L 64 30 Q 64 38 58 38 L 32 32 Z" fill="#F8E0E8" stroke="#9A3D55" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M 32 -2 L 32 32" fill="none" stroke="#9A3D55" stroke-width="1.4" opacity="0.55"/>
  <path d="M 6 12 Q 18 12 28 12" stroke="#9A3D55" stroke-width="1" opacity="0.55"/>
  <path d="M 6 20 Q 18 20 26 20" stroke="#9A3D55" stroke-width="1" opacity="0.45"/>
  <path d="M 36 12 Q 48 12 60 12" stroke="#9A3D55" stroke-width="1" opacity="0.55"/>
  <path d="M 36 20 Q 48 20 58 20" stroke="#9A3D55" stroke-width="1" opacity="0.45"/>
  <path d="M 32 -2 Q 26 -10 14 -10" fill="none" stroke="#9A3D55" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
  <path d="M 14 -10 Q 14 -2 18 0" fill="none" stroke="#9A3D55" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  

      </g>
    </svg>
  );
}

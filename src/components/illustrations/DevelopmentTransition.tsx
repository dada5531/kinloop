import React from "react";

interface DevelopmentTransitionProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function DevelopmentTransition({ className, size, "aria-hidden": ariaHidden = true, ...props }: DevelopmentTransitionProps & React.SVGProps<SVGSVGElement>) {
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

  <path d="M -2 30 Q -12 32 -16 24 L -22 14 Q -22 8 -16 8 Q -10 8 -8 14 L -2 24 Z" fill="#A8C8A8" stroke="#5D8A5D" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M -10 18 L -10 24" stroke="#5D8A5D" stroke-width="1" opacity="0.55"/>
  <path d="M 2 30 Q 12 32 16 24 L 22 14 Q 22 8 16 8 Q 10 8 8 14 L 2 24 Z" fill="#C2D8B8" stroke="#5D8A5D" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M 10 18 L 10 24" stroke="#5D8A5D" stroke-width="1" opacity="0.55"/>
  <path d="M 0 32 Q -2 14 0 -8 Q 2 -22 0 -36" fill="none" stroke="#5D8A5D" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M 0 -36 Q -6 -42 -2 -48" fill="none" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
  <path d="M 0 -36 Q 6 -42 2 -48" fill="none" stroke="#5D8A5D" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
  <ellipse cx="0" cy="36" rx="22" ry="3" fill="none" stroke="#9A6A40" stroke-width="1.2" opacity="0.4"/>
  <path d="M -22 36 Q 0 38 22 36" fill="none" stroke="#9A6A40" stroke-width="1.2" opacity="0.4" stroke-dasharray="2 3"/>
  

      </g>
    </svg>
  );
}

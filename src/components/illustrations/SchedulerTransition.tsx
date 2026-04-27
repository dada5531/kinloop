import React from "react";

interface SchedulerTransitionProps {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
}

export default function SchedulerTransition({ className, size, "aria-hidden": ariaHidden = true, ...props }: SchedulerTransitionProps & React.SVGProps<SVGSVGElement>) {
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

  <g transform="rotate(-12)">
    <path d="M 0 0 L 60 -4 Q 64 -4 64 0 L 64 28 Q 64 32 60 32 L 0 36 Q -4 36 -4 32 L -4 4 Q -4 0 0 0 Z" fill="#FFF6EC" stroke="#B85A3F" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M 0 0 L 30 18 L 64 0" fill="none" stroke="#B85A3F" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="30" cy="20" r="6" fill="#E8B4A0" stroke="#9A4530" stroke-width="1.3"/>
  </g>
  <path d="M -34 28 Q -50 32 -64 38" fill="none" stroke="#B85A3F" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="3 4" opacity="0.5"/>
  <path d="M -28 38 Q -44 42 -58 48" fill="none" stroke="#B85A3F" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="3 4" opacity="0.35"/>
  

      </g>
    </svg>
  );
}
